import { NextResponse } from 'next/server';
import { buildDownloadPayload } from '@/lib/telegram-worker';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const payload = await buildDownloadPayload(slug);
    return NextResponse.json({
      mode: 'download-plan',
      message: 'Phase 3 reconstruct endpoint prepared. Next implementation step is Telegram fetch + binary streaming.',
      file: {
        id: payload.file.id,
        name: payload.file.name,
        mime_type: payload.file.mime_type,
        size_bytes: payload.file.size_bytes,
      },
      chunk_count: payload.chunks.length,
      chunk_manifest: payload.chunks,
      telegram_message_map: payload.messageMap,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
