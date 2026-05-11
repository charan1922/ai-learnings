import { NextRequest, NextResponse } from 'next/server';
import { initTicketsTable, insertTicket, getTickets, markEmbedded } from '@/lib/agent-it/sql-client';
import { embedAndUpsertTicket } from '@/lib/agent-it/embedder';
import { randomUUID } from 'node:crypto';

export async function GET(request: NextRequest) {
  try {
    await initTicketsTable();
    const { searchParams } = new URL(request.url);

    const { rows, total } = await getTickets({
      category: searchParams.get('category') ?? undefined,
      priority: searchParams.get('priority') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      limit: Number(searchParams.get('limit') ?? 50),
      offset: Number(searchParams.get('offset') ?? 0),
    });

    return NextResponse.json({ tickets: rows, total });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initTicketsTable();
    const body = await request.json();
    const { title, description, category, resolution = '', priority } = body;

    if (!title?.trim() || !description?.trim() || !category?.trim() || !priority?.trim()) {
      return NextResponse.json({ error: 'title, description, category and priority are required' }, { status: 400 });
    }

    const ticketId = `TKT-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const ticket = { ticketId, title, description, category, resolution, priority };

    // Save to PostgreSQL
    const dbId = await insertTicket({
      ticket_id: ticketId,
      title,
      description,
      category,
      resolution,
      priority,
    });

    // Embed and upsert to Pinecone
    const vectorId = await embedAndUpsertTicket(ticket, 'manual', 'v1');
    await markEmbedded(ticketId, vectorId);

    return NextResponse.json({ ticketId, dbId, vectorId, message: 'Ticket created and embedded' }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
