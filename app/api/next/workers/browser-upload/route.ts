import { NextRequest, NextResponse } from 'next/server';
import { queueTelegramUploadJob } from '@/lib/telegram-worker';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const bucketId = Number(formData.get('bucket_id'));
  const destinationPath = String(formData.get('destination_path') || '/');
  const files = formData.getAll('files') as File[];
  const created = [];

  for (const file of files) {
    const queued = await queueTelegramUploadJob({
      bucket_id: bucketId,
      file_name: file.name,
      destination_path: destinationPath,
      source_type: 'browser',
      source_url: null,
      size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
    });
    created.push(queued);
  }

  return NextResponse.json({ ok: true, created });
}
