import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('storage_transfers').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body;
  const patch: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (status === 'uploading') patch.progress = 25;
  if (status === 'queued') patch.progress = 0;
  const { data, error } = await supabaseAdmin.from('storage_transfers').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
