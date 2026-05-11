import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { initTicketsTable, insertTicket, markEmbedded } from '@/lib/agent-it/sql-client';
import { embedAndUpsertTicket } from '@/lib/agent-it/embedder';
import { downloadTicketBlob } from '@/lib/agent-it/blob-client';
import { getActiveITNamespace } from '@/lib/agent-it/it-config';
import type { ITTicket } from '@/lib/agent-it/types';
import { Pinecone } from '@pinecone-database/pinecone';
import JSZip from 'jszip';

async function parseXlsx(buffer: Buffer): Promise<ITTicket[]> {
  const zip = await JSZip.loadAsync(buffer);
  const tickets: ITTicket[] = [];

  const sheetFiles = Object.keys(zip.files).filter(
    f => f.startsWith('xl/worksheets/sheet') && f.endsWith('.xml')
  );

  for (const sheetFile of sheetFiles) {
    const xmlContent = await zip.files[sheetFile].async('string');
    const rowRegex = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(xmlContent)) !== null) {
      const rowNum = parseInt(rowMatch[1]);
      if (rowNum === 1) continue;

      const rowXml = rowMatch[2];
      const cells: string[] = [];
      const cellRegex = /<c r="([A-Z]+)\d+"[^>]*t="inlineStr"[^>]*><is><t>([^<]*)<\/t><\/is><\/c>/g;
      let cm;

      while ((cm = cellRegex.exec(rowXml)) !== null) {
        const colIdx = cm[1].charCodeAt(0) - 65;
        cells[colIdx] = cm[2];
      }

      const [ticketId, title, description, category, resolution, priority] = cells;
      if (!ticketId || !title || !category) continue;

      tickets.push({
        ticketId: ticketId.trim(),
        title: title.trim(),
        description: (description ?? '').trim(),
        category: category.trim() as ITTicket['category'],
        resolution: (resolution ?? '').trim(),
        priority: (priority ?? 'Medium').trim() as ITTicket['priority'],
      });
    }
  }

  return tickets;
}

export async function POST(request: NextRequest) {
  try {
    await initTicketsTable();

    const body = await request.json().catch(() => ({}));
    const blobName: string = body.blobName ?? 'IT_Tickets_v1.xlsx';
    const blobVersionId: string | undefined = body.blobVersionId;
    const documentVersion: string = body.documentVersion ?? 'v1';
    const namespace: string = body.namespace ?? getActiveITNamespace();
    const mode: 'full' | 'incremental' = body.mode === 'full' ? 'full' : 'incremental';

    let fileBuffer: Buffer;
    let source: string;

    // Try to load from Azure Blob first, fall back to local file
    const hasBlob = process.env.AZURE_STORAGE_ACCOUNT_NAME && process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (hasBlob) {
      try {
        fileBuffer = await downloadTicketBlob(blobName, blobVersionId);
        source = blobVersionId ? `${blobName}@${blobVersionId}` : blobName;
      } catch {
        // Blob not found — fall back to local
        const localPath = path.join(process.cwd(), 'docs', blobName);
        if (!fs.existsSync(localPath)) {
          return NextResponse.json({ error: `File not found in Blob or locally: ${blobName}` }, { status: 404 });
        }
        fileBuffer = fs.readFileSync(localPath);
        source = blobName;
      }
    } else {
      const localPath = path.join(process.cwd(), 'docs', blobName);
      if (!fs.existsSync(localPath)) {
        return NextResponse.json({ error: `docs/${blobName} not found` }, { status: 404 });
      }
      fileBuffer = fs.readFileSync(localPath);
      source = blobName;
    }

    const allTickets = await parseXlsx(fileBuffer);

    if (allTickets.length === 0) {
      return NextResponse.json({ error: 'No tickets parsed from file' }, { status: 400 });
    }

    // Deduplicate by ticketId
    const seen = new Set<string>();
    const unique = allTickets.filter(t => {
      if (seen.has(t.ticketId)) return false;
      seen.add(t.ticketId);
      return true;
    });

    // Pre-ingest cleanup based on mode
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(namespace);

    let deletedVectors = 0;

    if (mode === 'full') {
      await index.deleteAll();
      deletedVectors = -1; // unknown count after deleteAll
    } else {
      // Incremental: delete only vectors whose source matches this file
      let paginationToken: string | undefined;
      const toDelete: string[] = [];
      do {
        const page = await index.listPaginated({ limit: 100, paginationToken });
        for (const v of page.vectors ?? []) {
          if (v.id) toDelete.push(v.id);
        }
        paginationToken = page.pagination?.next;
      } while (paginationToken);

      // Fetch in batches of 100 to read metadata.source
      for (let i = 0; i < toDelete.length; i += 100) {
        const batch = toDelete.slice(i, i + 100);
        const fetched = await index.fetch(batch);
        const staleIds = Object.entries(fetched.records ?? {})
          .filter(([, rec]) => (rec.metadata as Record<string, unknown>)?.source === blobName)
          .map(([id]) => id);
        if (staleIds.length > 0) {
          await index.deleteMany(staleIds);
          deletedVectors += staleIds.length;
        }
      }
    }

    let inserted = 0;
    let embedded = 0;
    const errors: string[] = [];

    for (const ticket of unique) {
      try {
        await insertTicket({
          ticket_id: ticket.ticketId,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          resolution: ticket.resolution,
          priority: ticket.priority,
          source_file: blobName,
          blob_version_id: blobVersionId ?? undefined,
          document_version: documentVersion,
        });
        inserted++;

        const vectorId = await embedAndUpsertTicket(ticket, source, documentVersion, namespace, blobVersionId);
        await markEmbedded(ticket.ticketId, vectorId);
        embedded++;
      } catch (err) {
        errors.push(`${ticket.ticketId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({
      message: 'Seed complete',
      total: unique.length,
      inserted,
      embedded,
      deletedVectors,
      mode,
      source,
      namespace,
      blobVersionId: blobVersionId ?? null,
      documentVersion,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Seed error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
