import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const bucketId = req.nextUrl.searchParams.get('bucket_id');
  let query = supabaseAdmin.from('storage_folders').select('*').order('path', { ascending: true });
  if (bucketId) query = query.eq('bucket_id', Number(bucketId));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
