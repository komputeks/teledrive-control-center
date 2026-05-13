import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const bucketId = req.nextUrl.searchParams.get('bucket_id');
  let query = supabaseAdmin
    .from('storage_files')
    .select('*, share_links(slug, enabled)')
    .order('updated_at', { ascending: false });
  if (bucketId) query = query.eq('bucket_id', Number(bucketId));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const normalized = (data || []).map((item: any) => ({ ...item, download_slug: item.share_links?.find?.((link: any) => link.enabled)?.slug || null }));
  return NextResponse.json(normalized);
}
