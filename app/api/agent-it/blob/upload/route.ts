import { NextRequest, NextResponse } from 'next/server';
import { uploadTicketBlob, listTicketVersions } from '@/lib/agent-it/blob-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|csv)$/i)) {
      return NextResponse.json({ error: 'Only .xlsx or .csv files are allowed' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer).toString('base64');
    const blobName = file.name;

    const { versionId, etag } = await uploadTicketBlob(blobName, content, file.type || 'application/octet-stream');

    // Fetch updated version list
    const versions = await listTicketVersions(blobName);

    return NextResponse.json({
      blobName,
      versionId,
      etag,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      totalVersions: versions.length,
      versions,
    }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Blob upload error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
