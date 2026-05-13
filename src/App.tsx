import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, Cloud, Database, FolderOpen, Globe, HardDriveUpload, Link2, PauseCircle, PlayCircle, RefreshCw, Server, Share2, ShieldCheck, Trash2, Upload, Zap } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { SectionCard } from './components/SectionCard';
import { AuthPanel } from './components/AuthPanel';
import { FolderTree } from './components/FolderTree';
import { UploadDropzone } from './components/UploadDropzone';
import { TelegramIntegrationCard } from './components/TelegramIntegrationCard';
import supabase from './lib/supabase';

type Bucket = { id: number; name: string; slug: string; region: string; visibility: string; created_at: string; };
type StorageFile = { id: number; bucket_id: number; name: string; folder_path: string; size_bytes: number; status: string; progress: number; source_url: string | null; mime_type: string; telegram_message_ids: string | null; updated_at: string; };
type Transfer = { id: number; bucket_id: number; file_name: string; source_type: string; source_url: string | null; status: string; progress: number; bytes_total: number; bytes_transferred: number; destination_path: string; error_message: string | null; created_at: string; };
type Folder = { id: number; bucket_id: number; name: string; path: string; parent_path: string; item_count: number; };
type ShareLink = { id: number; file_id: number; slug: string; access_mode: string; expires_at: string | null; password_hint: string | null; max_downloads: number | null; enabled: boolean; };
type TelegramIntegration = { id: number; workspace_name: string; bot_username: string; target_chat_id: string; bot_token_masked: string; status: string; webhook_mode: string; notes: string | null; };

type SessionUser = { id: string; email?: string; } | null;

const formatBytes = (value: number) => {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const scaled = value / 1024 ** index;
  return `${scaled.toFixed(scaled >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const badgeClasses: Record<string, string> = {
  synced: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  indexing: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  queued: 'bg-blue-400/15 text-blue-300 border-blue-400/20',
  uploading: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/20',
  paused: 'bg-violet-400/15 text-violet-300 border-violet-400/20',
  failed: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
};

export default function App() {
  const [user, setUser] = useState<SessionUser>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [integrations, setIntegrations] = useState<TelegramIntegration[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [bucketForm, setBucketForm] = useState({ name: '', slug: '', region: 'global', visibility: 'private' });
  const [folderForm, setFolderForm] = useState({ name: '', path: '', parent_path: '/' });
  const [uploadForm, setUploadForm] = useState({ bucket_id: '', file_name: '', source_url: '', destination_path: '/' });
  const [telegramForm, setTelegramForm] = useState({ workspace_name: '', bot_username: '', target_chat_id: '', bot_token_masked: '', status: 'draft', webhook_mode: 'webhook', notes: '' });

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = await getAccessToken();
    return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init?.headers || {}) } });
  };

  const loadSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    setAuthLoading(false);
  };

  const fetchBuckets = async () => {
    const res = await fetch('/api/storage-buckets');
    const data = await res.json();
    setBuckets(data);
    if (!selectedBucket && data.length) setSelectedBucket(data[0].id);
  };

  const fetchFiles = async (bucketId?: number | null) => {
    const query = bucketId ? `?bucket_id=${bucketId}` : '';
    const res = await fetch(`/api/storage-files${query}`);
    const data = await res.json();
    setFiles(data);
  };

  const fetchTransfers = async () => {
    const res = await fetch('/api/storage-transfers');
    const data = await res.json();
    setTransfers(data);
  };

  const fetchFolders = async (bucketId?: number | null) => {
    const query = bucketId ? `?bucket_id=${bucketId}` : '';
    const res = await fetch(`/api/folders${query}`);
    const data = await res.json();
    setFolders(data);
  };

  const fetchShareLinks = async () => {
    const res = await fetch('/api/share-links');
    const data = await res.json();
    setShareLinks(data);
  };

  const fetchIntegrations = async () => {
    if (!user) return;
    const res = await authFetch('/api/integrations-telegram');
    const data = await res.json();
    setIntegrations(Array.isArray(data) ? data : []);
  };

  const hydrate = async (bucketId?: number | null) => {
    try {
      setLoading(true);
      await Promise.all([fetchBuckets(), fetchFiles(bucketId ?? selectedBucket), fetchTransfers(), fetchFolders(bucketId ?? selectedBucket), fetchShareLinks(), fetchIntegrations()]);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && user) hydrate();
  }, [authLoading, user]);

  useEffect(() => {
    if (selectedBucket) {
      fetchFiles(selectedBucket);
      fetchFolders(selectedBucket);
    }
  }, [selectedBucket]);

  const totals = useMemo(() => {
    const storage = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
    const activeTransfers = transfers.filter((item) => ['queued', 'uploading', 'indexing', 'paused'].includes(item.status)).length;
    const pausedTransfers = transfers.filter((item) => item.status === 'paused').length;
    return { storage, activeTransfers, pausedTransfers };
  }, [files, transfers]);

  const createBucket = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/storage-buckets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bucketForm) });
      if (res.ok) {
        setBucketForm({ name: '', slug: '', region: 'global', visibility: 'private' });
        await hydrate();
      }
    } finally { setBusy(false); }
  };

  const createFolder = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedBucket) return;
    setBusy(true);
    try {
      const res = await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...folderForm, bucket_id: selectedBucket, item_count: 0 }) });
      if (res.ok) {
        setFolderForm({ name: '', path: '', parent_path: '/' });
        await hydrate(selectedBucket);
      }
    } finally { setBusy(false); }
  };

  const queueUrlUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!uploadForm.bucket_id) return;
    setBusy(true);
    try {
      const fileName = uploadForm.file_name || new URL(uploadForm.source_url).pathname.split('/').pop() || 'remote-object.bin';
      const transferPayload = { bucket_id: Number(uploadForm.bucket_id), file_name: fileName, source_type: 'url', source_url: uploadForm.source_url, status: 'queued', progress: 0, bytes_total: 0, bytes_transferred: 0, destination_path: uploadForm.destination_path || selectedPath || '/' };
      const transferRes = await fetch('/api/storage-transfers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transferPayload) });
      if (transferRes.ok) {
        await fetch('/api/storage-files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket_id: Number(uploadForm.bucket_id), name: fileName, folder_path: transferPayload.destination_path, size_bytes: 0, status: 'queued', progress: 0, source_url: transferPayload.source_url, mime_type: 'application/octet-stream', telegram_message_ids: null, notes: 'Queued from URL import' }) });
        setUploadForm({ bucket_id: String(selectedBucket || ''), file_name: '', source_url: '', destination_path: selectedPath || '/' });
        await hydrate(Number(uploadForm.bucket_id));
      }
    } catch (err) { console.error(err); } finally { setBusy(false); }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || !selectedBucket) return;
    setBusy(true);
    try {
      for (const file of Array.from(fileList)) {
        await fetch('/api/storage-files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket_id: selectedBucket, name: file.name, folder_path: selectedPath, size_bytes: file.size, status: 'uploading', progress: 15, source_url: null, mime_type: file.type || 'application/octet-stream', telegram_message_ids: null, notes: 'Browser staged upload for Telegram worker handoff' }) });
        await fetch('/api/storage-transfers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket_id: selectedBucket, file_name: file.name, source_type: 'browser', source_url: null, status: 'uploading', progress: 15, bytes_total: file.size, bytes_transferred: Math.round(file.size * 0.15), destination_path: selectedPath }) });
      }
      await hydrate(selectedBucket);
    } finally { setBusy(false); }
  };

  const removeFile = async (id: number) => {
    await fetch('/api/storage-files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await hydrate(selectedBucket);
  };

  const updateTransferStatus = async (id: number, status: string) => {
    const transfer = transfers.find((item) => item.id === id);
    if (!transfer) return;
    await fetch('/api/storage-transfers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, progress: status === 'paused' ? transfer.progress : Math.max(transfer.progress, 25), bytes_total: transfer.bytes_total, bytes_transferred: transfer.bytes_transferred }) });
    await hydrate(selectedBucket);
  };

  const createShareLink = async (fileId: number) => {
    const slug = `share-${fileId}-${Date.now().toString().slice(-6)}`;
    await fetch('/api/share-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_id: fileId, slug, access_mode: 'signed', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), password_hint: 'Optional passphrase', max_downloads: 25, enabled: true }) });
    await fetchShareLinks();
  };

  const createTelegramIntegration = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await authFetch('/api/integrations-telegram', { method: 'POST', body: JSON.stringify(telegramForm) });
      if (res.ok) {
        setTelegramForm({ workspace_name: '', bot_username: '', target_chat_id: '', bot_token_masked: '', status: 'draft', webhook_mode: 'webhook', notes: '' });
        await fetchIntegrations();
      }
    } finally { setBusy(false); }
  };

  const removeTelegramIntegration = async (id: number) => {
    await authFetch('/api/integrations-telegram', { method: 'DELETE', body: JSON.stringify({ id }) });
    await fetchIntegrations();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const selectedBucketLabel = buckets.find((bucket) => bucket.id === selectedBucket)?.name ?? 'No bucket selected';
  const filteredFiles = files.filter((file) => selectedPath === '/' ? true : file.folder_path === selectedPath);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Loading session…</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,#020617,#020617_40%,#0f172a)] px-4 py-10 text-slate-100 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><AuthPanel onAuthenticated={loadSession} /></div></div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,#020617,#020617_40%,#0f172a)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_120px_-60px_rgba(6,182,212,0.75)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300"><Zap className="h-3.5 w-3.5" /> Phase 2 · Next architecture migration planner + Telegram ops</div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">TeleDrive Control Center</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Authenticated control plane for Telegram-backed storage with browser uploads, drag-and-drop staging, folder tree navigation, signed links, and transfer state controls.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => hydrate(selectedBucket)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"><RefreshCw className="h-4 w-4" /> Refresh</button>
              <button onClick={signOut} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"><ShieldCheck className="h-4 w-4" /> Sign out</button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 px-3 py-1">User: {user.email}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Bucket: {selectedBucketLabel}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Path: {selectedPath}</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Buckets" value={String(buckets.length)} hint="Namespaces for remotes and Telegram mappings" icon={<Database className="h-5 w-5" />} />
          <StatCard label="Current path files" value={String(filteredFiles.length)} hint={`Folder focus: ${selectedPath}`} icon={<FolderOpen className="h-5 w-5" />} />
          <StatCard label="Capacity tracked" value={formatBytes(totals.storage)} hint="Observed total size from object records" icon={<Cloud className="h-5 w-5" />} />
          <StatCard label="Active transfers" value={String(totals.activeTransfers)} hint={`${totals.pausedTransfers} paused jobs awaiting resume`} icon={<Globe className="h-5 w-5" />} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Telegram bot integrations" subtitle="Store integration metadata per authenticated user for future worker and webhook orchestration.">
            <form onSubmit={createTelegramIntegration} className="grid gap-3 md:grid-cols-2">
              <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Workspace name" value={telegramForm.workspace_name} onChange={(e) => setTelegramForm({ ...telegramForm, workspace_name: e.target.value })} />
              <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Bot username" value={telegramForm.bot_username} onChange={(e) => setTelegramForm({ ...telegramForm, bot_username: e.target.value })} />
              <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Target chat ID" value={telegramForm.target_chat_id} onChange={(e) => setTelegramForm({ ...telegramForm, target_chat_id: e.target.value })} />
              <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Masked bot token" value={telegramForm.bot_token_masked} onChange={(e) => setTelegramForm({ ...telegramForm, bot_token_masked: e.target.value })} />
              <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={telegramForm.status} onChange={(e) => setTelegramForm({ ...telegramForm, status: e.target.value })}><option value="draft">Draft</option><option value="connected">Connected</option><option value="degraded">Degraded</option></select>
              <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={telegramForm.webhook_mode} onChange={(e) => setTelegramForm({ ...telegramForm, webhook_mode: e.target.value })}><option value="webhook">Webhook</option><option value="polling">Polling</option></select>
              <input className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Notes" value={telegramForm.notes} onChange={(e) => setTelegramForm({ ...telegramForm, notes: e.target.value })} />
              <button disabled={busy} className="md:col-span-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"><Bot className="mr-2 inline h-4 w-4" /> Save Telegram integration</button>
            </form>
            <div className="mt-6 grid gap-3">
              {integrations.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">No integrations yet.</div> : integrations.map((integration) => <TelegramIntegrationCard key={integration.id} integration={integration} onRemove={removeTelegramIntegration} />)}
            </div>
          </SectionCard>

          <SectionCard title="Upload center" subtitle="Stage browser uploads and remote imports like a web-native rclone workflow.">
            <div className="grid gap-6 lg:grid-cols-2">
              <UploadDropzone onFilesSelected={handleFilesSelected} />
              <form onSubmit={queueUrlUpload} className="space-y-3 rounded-3xl border border-white/10 bg-black/20 p-4">
                <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={uploadForm.bucket_id} onChange={(e) => setUploadForm({ ...uploadForm, bucket_id: e.target.value })}>
                  <option value="">Choose bucket</option>
                  {buckets.map((bucket) => <option key={bucket.id} value={bucket.id}>{bucket.name}</option>)}
                </select>
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Direct file URL" value={uploadForm.source_url} onChange={(e) => setUploadForm({ ...uploadForm, source_url: e.target.value })} />
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Optional file name override" value={uploadForm.file_name} onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })} />
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Destination path" value={uploadForm.destination_path} onChange={(e) => setUploadForm({ ...uploadForm, destination_path: e.target.value })} />
                <button disabled={busy || !uploadForm.source_url || !uploadForm.bucket_id} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"><Link2 className="h-4 w-4" /> Queue remote upload</button>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"><Upload className="mr-2 inline h-4 w-4 text-cyan-300" /> Direct browser upload is currently staged in metadata for worker handoff. Next backend step is binary chunk upload to Telegram Bot API.</div>
              </form>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <SectionCard title="Folder tree" subtitle="Organize paths like a remote filesystem and target uploads precisely.">
            <div className="space-y-4">
              <FolderTree folders={folders} selectedPath={selectedPath} onSelect={setSelectedPath} />
              <form onSubmit={createFolder} className="grid gap-3">
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Folder name" value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} />
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Folder path e.g. /media/raw" value={folderForm.path} onChange={(e) => setFolderForm({ ...folderForm, path: e.target.value })} />
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Parent path" value={folderForm.parent_path} onChange={(e) => setFolderForm({ ...folderForm, parent_path: e.target.value })} />
                <button disabled={busy || !selectedBucket} className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"><FolderOpen className="mr-2 inline h-4 w-4" /> Create folder</button>
              </form>
            </div>
          </SectionCard>

          <SectionCard title="Tracked objects & signed links" subtitle="Create expiring share links and inspect staged Telegram object metadata.">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1.3fr_0.85fr_0.7fr_0.6fr_0.7fr_0.55fr] gap-4 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <div>Name</div><div>Path</div><div>Size</div><div>Status</div><div>Share</div><div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-white/10 bg-slate-950/40">
                {loading ? <div className="px-4 py-6 text-sm text-slate-400">Loading files…</div> : filteredFiles.length === 0 ? <div className="px-4 py-6 text-sm text-slate-400">No files in this path yet.</div> : filteredFiles.map((file) => {
                  const link = shareLinks.find((item) => item.file_id === file.id && item.enabled);
                  return (
                    <div key={file.id} className="grid grid-cols-[1.3fr_0.85fr_0.7fr_0.6fr_0.7fr_0.55fr] items-center gap-4 px-4 py-4 text-sm">
                      <div><div className="font-medium text-white">{file.name}</div><div className="mt-1 text-xs text-slate-500">{file.mime_type}</div></div>
                      <div className="truncate text-slate-300">{file.folder_path}</div>
                      <div className="text-slate-300">{formatBytes(file.size_bytes)}</div>
                      <div><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses[file.status] || 'border-white/10 bg-white/5 text-slate-300'}`}>{file.status}</span></div>
                      <div>{link ? <div className="text-xs text-cyan-300">/{link.slug}<div className="text-slate-500">{link.access_mode}</div></div> : <button onClick={() => createShareLink(file.id)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-400/20"><Share2 className="h-3.5 w-3.5" /> Create</button>}</div>
                      <div className="flex justify-end"><button onClick={() => removeFile(file.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/20"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="Buckets & namespaces" subtitle="Create isolated storage spaces for future Telegram channel mappings and remote policies.">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {loading ? <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">Loading buckets…</div> : buckets.map((bucket) => (
                  <button key={bucket.id} onClick={() => { setSelectedBucket(bucket.id); setUploadForm((prev) => ({ ...prev, bucket_id: String(bucket.id) })); }} className={`w-full rounded-2xl border p-4 text-left transition ${selectedBucket === bucket.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between gap-3"><div><div className="font-medium text-white">{bucket.name}</div><div className="mt-1 text-sm text-slate-400">/{bucket.slug} · {bucket.region}</div></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{bucket.visibility}</span></div>
                  </button>
                ))}
              </div>
              <form onSubmit={createBucket} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">New bucket</h3>
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Bucket name" value={bucketForm.name} onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value })} />
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Slug" value={bucketForm.slug} onChange={(e) => setBucketForm({ ...bucketForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={bucketForm.region} onChange={(e) => setBucketForm({ ...bucketForm, region: e.target.value })}><option value="global">Global</option><option value="eu-west">EU West</option><option value="us-east">US East</option><option value="ap-south">AP South</option></select>
                  <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={bucketForm.visibility} onChange={(e) => setBucketForm({ ...bucketForm, visibility: e.target.value })}><option value="private">Private</option><option value="shared">Shared</option><option value="public">Public</option></select>
                </div>
                <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"><Server className="h-4 w-4" /> Create bucket</button>
              </form>
            </div>
          </SectionCard>

          <SectionCard title="Transfer activity" subtitle="Pause, resume, and retry jobs before wiring in real Telegram background workers.">
            <div className="grid gap-4 lg:grid-cols-2">
              {loading ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400">Loading transfers…</div> : transfers.map((transfer) => (
                <article key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="font-medium text-white">{transfer.file_name}</div><div className="mt-1 text-sm text-slate-400">{transfer.source_type.toUpperCase()} → {transfer.destination_path}</div></div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses[transfer.status] || 'border-white/10 bg-white/5 text-slate-300'}`}>{transfer.status}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max(8, transfer.progress)}%` }} /></div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{formatBytes(transfer.bytes_transferred)} / {formatBytes(transfer.bytes_total)}</span><span>{transfer.progress}%</span></div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => updateTransferStatus(transfer.id, transfer.status === 'paused' ? 'uploading' : 'paused')} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-400/20">{transfer.status === 'paused' ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}{transfer.status === 'paused' ? 'Resume' : 'Pause'}</button>
                    <button onClick={() => updateTransferStatus(transfer.id, 'queued')} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-400/20"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
                  </div>
                  {transfer.source_url ? <p className="mt-3 truncate text-xs text-slate-500">{transfer.source_url}</p> : null}
                  {transfer.error_message ? <p className="mt-3 text-xs text-rose-300">{transfer.error_message}</p> : null}
                </article>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Production roadmap" subtitle="Phase 2 architecture notes for Next.js migration and GitHub/Vercel workflows.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="font-semibold text-white">Next.js migration</h3><p className="mt-2">Move UI into App Router, server actions, route handlers, and edge-safe auth/session boundaries.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="font-semibold text-white">Telegram workers</h3><p className="mt-2">Split upload orchestration into queue processor, bot API sender, chunk manifest writer, and downloader service.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="font-semibold text-white">GitHub Actions</h3><p className="mt-2">Add CI for lint, typecheck, build, secret scanning, and deploy previews across PRs.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><h3 className="font-semibold text-white">Signed access</h3><p className="mt-2">Replace placeholder share metadata with signed download handlers, expiry enforcement, and password checks.</p></div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
