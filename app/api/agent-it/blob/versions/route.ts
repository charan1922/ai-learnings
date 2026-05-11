import { NextRequest, NextResponse } from 'next/server';
import { listTicketVersions, listTicketBlobs } from '@/lib/agent-it/blob-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blobName = searchParams.get('blob');

    if (blobName) {
      const versions = await listTicketVersions(blobName);
      return NextResponse.json({ blobName, versions });
    }

    // List all blob names in container
    const blobs = await listTicketBlobs();
    return NextResponse.json({ blobs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
