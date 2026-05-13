import { NextRequest, NextResponse } from 'next/server';
import { queueTelegramUploadJob } from '@/lib/telegram-worker';

export async function POST(req: NextRequest) {
  const { bucket_id, source_url, file_name, destination_path } = await req.json();
  const derivedName = file_name || new URL(source_url).pathname.split('/').pop() || 'remote-object.bin';
  const queued = await queueTelegramUploadJob({
    bucket_id,
    file_name: derivedName,
    destination_path: destination_path || '/',
    source_type: 'url',
    source_url,
    size_bytes: 0,
    mime_type: 'application/octet-stream',
  });
  return NextResponse.json({ ok: true, queued });
}
