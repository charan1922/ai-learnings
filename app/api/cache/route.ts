import { NextResponse } from 'next/server';
import { getCacheStats, clearCache } from '@/lib/semantic-cache';

// GET /api/cache — list all cache entries with stats
export async function GET() {
  try {
    const stats = await getCacheStats();
    return NextResponse.json(stats);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/cache — flush all semantic cache entries
export async function DELETE() {
  try {
    const deleted = await clearCache();
    return NextResponse.json({ deleted, message: `Cleared ${deleted} cache entries` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
