import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { file_id } = req.query;
      let query = supabase.from('share_links').select('*').order('created_at', { ascending: false });
      if (file_id) query = query.eq('file_id', file_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { file_id, slug, access_mode, expires_at, password_hint, max_downloads, enabled } = req.body;
      const { data, error } = await supabase
        .from('share_links')
        .insert({ file_id, slug, access_mode, expires_at, password_hint, max_downloads, enabled })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, access_mode, expires_at, password_hint, max_downloads, enabled } = req.body;
      const { data, error } = await supabase
        .from('share_links')
        .update({ access_mode, expires_at, password_hint, max_downloads, enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('share_links').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
