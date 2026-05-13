import { supabaseAdmin } from './supabase-admin';
import { encryptValue } from './crypto';

export async function queueTelegramUploadJob(params: {
  bucket_id: number;
  file_name: string;
  destination_path: string;
  source_type: 'browser' | 'url';
  source_url?: string | null;
  size_bytes: number;
  mime_type: string;
}) {
  const { data: fileRow, error: fileError } = await supabaseAdmin
    .from('storage_files')
    .insert({
      bucket_id: params.bucket_id,
      name: params.file_name,
      folder_path: params.destination_path,
      size_bytes: params.size_bytes,
      status: 'queued',
      progress: 0,
      source_url: params.source_url || null,
      mime_type: params.mime_type,
      telegram_message_ids: null,
      notes: 'Queued via Next.js worker flow',
    })
    .select()
    .single();
  if (fileError) throw fileError;

  const { data: transferRow, error: transferError } = await supabaseAdmin
    .from('storage_transfers')
    .insert({
      bucket_id: params.bucket_id,
      file_name: params.file_name,
      source_type: params.source_type,
      source_url: params.source_url || null,
      status: 'queued',
      progress: 0,
      bytes_total: params.size_bytes,
      bytes_transferred: 0,
      destination_path: params.destination_path,
    })
    .select()
    .single();
  if (transferError) throw transferError;

  const chunkSize = 19 * 1024 * 1024;
  const chunkCount = Math.max(1, Math.ceil(Math.max(params.size_bytes, 1) / chunkSize));
  const manifestRows = Array.from({ length: chunkCount }, (_, index) => ({
    file_id: fileRow.id,
    part_number: index + 1,
    byte_offset_start: index * chunkSize,
    byte_offset_end: Math.min(params.size_bytes, (index + 1) * chunkSize) - 1,
    chunk_size: index === chunkCount - 1 ? Math.max(params.size_bytes - index * chunkSize, params.size_bytes === 0 ? 0 : 1) : chunkSize,
    status: 'planned',
    checksum_sha256: null,
  }));

  const { data: manifestData, error: manifestError } = await supabaseAdmin.from('file_chunk_manifest').insert(manifestRows).select('*');
  if (manifestError) throw manifestError;

  const mappingRows = manifestData.map((chunk: any) => ({
    file_id: fileRow.id,
    chunk_manifest_id: chunk.id,
    telegram_chat_id: null,
    telegram_message_id: null,
    telegram_file_id: null,
    encrypted_bot_token_ref: encryptValue(`pending-token-ref-${fileRow.id}-${chunk.part_number}`),
    status: 'pending',
  }));
  const { error: mappingError } = await supabaseAdmin.from('telegram_message_map').insert(mappingRows);
  if (mappingError) throw mappingError;

  return { file: fileRow, transfer: transferRow, chunkCount };
}

export async function buildDownloadPayload(slug: string) {
  const { data: share, error: shareError } = await supabaseAdmin
    .from('share_links')
    .select('*, storage_files(*)')
    .eq('slug', slug)
    .eq('enabled', true)
    .single();
  if (shareError || !share) throw new Error('Share link not found');
  if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) throw new Error('Share link expired');

  const file = Array.isArray(share.storage_files) ? share.storage_files[0] : share.storage_files;

  const { data: chunks, error: chunkError } = await supabaseAdmin
    .from('file_chunk_manifest')
    .select('*')
    .eq('file_id', file.id)
    .order('part_number', { ascending: true });
  if (chunkError) throw chunkError;

  const { data: messageMap, error: mapError } = await supabaseAdmin
    .from('telegram_message_map')
    .select('*')
    .eq('file_id', file.id)
    .order('chunk_manifest_id', { ascending: true });
  if (mapError) throw mapError;

  return { share, file, chunks, messageMap };
}
