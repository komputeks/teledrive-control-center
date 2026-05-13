import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { file_id } = await req.json();
  const slug = `dl-${file_id}-${Date.now().toString().slice(-7)}`;
  const { data, error } = await supabaseAdmin
    .from('share_links')
    .insert({ file_id, slug, access_mode: 'signed', expires_at: new Date(Date.now() + 7 * 86400000).toISOString(), max_downloads: 25, enabled: true })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
