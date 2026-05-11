import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import type { BlobTicketVersion } from './types';

function getContainerClient(): ContainerClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'it-tickets';

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );
  return blobServiceClient.getContainerClient(containerName);
}

/**
 * Download a ticket file by blob name and return raw text content.
 * Pass null to download the latest version.
 */
export async function downloadTicketBlob(
  blobName: string,
  versionId?: string
): Promise<Buffer> {
  const containerClient = getContainerClient();
  const blobClient = versionId
    ? containerClient.getBlobClient(blobName).withVersion(versionId)
    : containerClient.getBlobClient(blobName);

  const downloadResponse = await blobClient.download();
  const chunks: Buffer[] = [];

  for await (const chunk of downloadResponse.readableStreamBody as AsyncIterable<Buffer>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Upload a ticket CSV/JSON file to Azure Blob Storage.
 * Blob versioning must be enabled on the container — Azure auto-creates a new version ID.
 */
export async function uploadTicketBlob(
  blobName: string,
  content: string | Buffer,
  contentType = 'text/csv'
): Promise<{ versionId: string; etag: string }> {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, 'base64');

  const uploadResponse = await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return {
    versionId: uploadResponse.versionId ?? '',
    etag: uploadResponse.etag ?? '',
  };
}

/**
 * List all ticket blob versions for a given blob name, newest first.
 * Requires blob versioning to be enabled on the storage account.
 */
export async function listTicketVersions(blobName: string): Promise<BlobTicketVersion[]> {
  const containerClient = getContainerClient();
  const versions: BlobTicketVersion[] = [];

  for await (const item of containerClient.listBlobsFlat({
    prefix: blobName,
    includeVersions: true,
  })) {
    if (item.name !== blobName) continue;
    versions.push({
      name: item.name,
      versionId: item.versionId ?? '',
      lastModified: item.properties.lastModified,
      size: item.properties.contentLength ?? 0,
      etag: item.properties.etag ?? '',
    });
  }

  // newest first
  return versions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

/**
 * List all ticket blob names in the container (one entry per unique file name,
 * ignoring versions). Useful for discovering available ticket datasets.
 */
export async function listTicketBlobs(): Promise<string[]> {
  const containerClient = getContainerClient();
  const seen = new Set<string>();

  for await (const item of containerClient.listBlobsFlat()) {
    seen.add(item.name);
  }

  return [...seen].sort();
}
