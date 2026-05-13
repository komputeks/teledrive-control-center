import { NextResponse } from 'next/server';
import { hasSupabaseEnv, supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ valid: false, reason: 'supabase_not_configured' }, { status: 200 });
  }

  const { slug } = await params;
  const { data, error } = await supabaseAdmin.from('share_links').select('*').eq('slug', slug).eq('enabled', true).single();
  if (error || !data) return NextResponse.json({ valid: false }, { status: 404 });
  const expired = data.expires_at ? new Date(data.expires_at).getTime() < Date.now() : false;
  return NextResponse.json({ valid: !expired, expired, access_mode: data.access_mode, expires_at: data.expires_at, max_downloads: data.max_downloads });
}
