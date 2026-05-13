import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Cloud, Database, FolderOpen, Globe, HardDriveUpload, Link2, RefreshCw, Server, Trash2, Zap } from 'lucide-react';
import { StatCard } from './components/StatCard';
import { SectionCard } from './components/SectionCard';

type Bucket = {
  id: number;
  name: string;
  slug: string;
  region: string;
  visibility: string;
  created_at: string;
};

type StorageFile = {
  id: number;
  bucket_id: number;
  name: string;
  folder_path: string;
  size_bytes: number;
  status: string;
  progress: number;
  source_url: string | null;
  mime_type: string;
  telegram_message_ids: string | null;
  updated_at: string;
};

type Transfer = {
  id: number;
  bucket_id: number;
  file_name: string;
  source_type: string;
  source_url: string | null;
  status: string;
  progress: number;
  bytes_total: number;
  bytes_transferred: number;
  destination_path: string;
  error_message: string | null;
  created_at: string;
};

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
  failed: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
};

export default function App() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [bucketForm, setBucketForm] = useState({ name: '', slug: '', region: 'global', visibility: 'private' });
  const [uploadForm, setUploadForm] = useState({ bucket_id: '', file_name: '', source_url: '', destination_path: '/' });

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

  const hydrate = async (bucketId?: number | null) => {
    try {
      setLoading(true);
      await Promise.all([fetchBuckets(), fetchFiles(bucketId ?? selectedBucket), fetchTransfers()]);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (selectedBucket) fetchFiles(selectedBucket);
  }, [selectedBucket]);

  const totals = useMemo(() => {
    const storage = files.reduce((sum, file) => sum + (file.size_bytes || 0), 0);
    const activeTransfers = transfers.filter((item) => ['queued', 'uploading', 'indexing'].includes(item.status)).length;
    const remoteImports = transfers.filter((item) => item.source_type === 'url').length;
    return {
      storage,
      activeTransfers,
      remoteImports,
    };
  }, [files, transfers]);

  const createBucket = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/storage-buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bucketForm),
      });
      if (res.ok) {
        setBucketForm({ name: '', slug: '', region: 'global', visibility: 'private' });
        await hydrate();
      }
    } finally {
      setBusy(false);
    }
  };

  const queueUrlUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!uploadForm.bucket_id) return;
    setBusy(true);
    try {
      const transferPayload = {
        bucket_id: Number(uploadForm.bucket_id),
        file_name: uploadForm.file_name || new URL(uploadForm.source_url).pathname.split('/').pop() || 'remote-object.bin',
        source_type: 'url',
        source_url: uploadForm.source_url,
        status: 'queued',
        progress: 0,
        bytes_total: 0,
        bytes_transferred: 0,
        destination_path: uploadForm.destination_path || '/',
      };
      const transferRes = await fetch('/api/storage-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferPayload),
      });
      if (transferRes.ok) {
        await fetch('/api/storage-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket_id: Number(uploadForm.bucket_id),
            name: transferPayload.file_name,
            folder_path: transferPayload.destination_path,
            size_bytes: 0,
            status: 'queued',
            progress: 0,
            source_url: transferPayload.source_url,
            mime_type: 'application/octet-stream',
            telegram_message_ids: null,
            notes: 'Queued from URL import',
          }),
        });
        setUploadForm({ bucket_id: String(selectedBucket || ''), file_name: '', source_url: '', destination_path: '/' });
        await hydrate(Number(uploadForm.bucket_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const removeFile = async (id: number) => {
    await fetch('/api/storage-files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await hydrate(selectedBucket);
  };

  const selectedBucketLabel = buckets.find((bucket) => bucket.id === selectedBucket)?.name ?? 'No bucket selected';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,#020617,#020617_40%,#0f172a)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_120px_-60px_rgba(6,182,212,0.75)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300">
                <Zap className="h-3.5 w-3.5" /> Telegram-backed object storage control plane
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">TeleDrive Control Center</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                A modern web dashboard inspired by tg-s3 and MultCloud. Manage buckets, queue remote URL uploads, audit file states, and track transfers through a clean Vercel-ready interface.
              </p>
            </div>
            <button
              onClick={() => hydrate(selectedBucket)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
            >
              <RefreshCw className="h-4 w-4" /> Refresh workspace
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Buckets" value={String(buckets.length)} hint="Logical namespaces for channels and storage policies" icon={<Database className="h-5 w-5" />} />
          <StatCard label="Tracked files" value={String(files.length)} hint={`Focused on ${selectedBucketLabel}`} icon={<FolderOpen className="h-5 w-5" />} />
          <StatCard label="Managed capacity" value={formatBytes(totals.storage)} hint="Observed file footprint from sync metadata" icon={<Cloud className="h-5 w-5" />} />
          <StatCard label="Remote imports" value={String(totals.remoteImports)} hint={`${totals.activeTransfers} active or queued transfers`} icon={<Globe className="h-5 w-5" />} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Buckets & namespaces" subtitle="Create isolated storage spaces that can later map to Telegram chats, bots, or encryption policies.">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">Loading buckets…</div>
                ) : buckets.map((bucket) => (
                  <button
                    key={bucket.id}
                    onClick={() => setSelectedBucket(bucket.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedBucket === bucket.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-white">{bucket.name}</div>
                        <div className="mt-1 text-sm text-slate-400">/{bucket.slug} · {bucket.region}</div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{bucket.visibility}</span>
                    </div>
                  </button>
                ))}
              </div>

              <form onSubmit={createBucket} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">New bucket</h3>
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Bucket name" value={bucketForm.name} onChange={(e) => setBucketForm({ ...bucketForm, name: e.target.value })} />
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Slug" value={bucketForm.slug} onChange={(e) => setBucketForm({ ...bucketForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={bucketForm.region} onChange={(e) => setBucketForm({ ...bucketForm, region: e.target.value })}>
                    <option value="global">Global</option>
                    <option value="eu-west">EU West</option>
                    <option value="us-east">US East</option>
                    <option value="ap-south">AP South</option>
                  </select>
                  <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={bucketForm.visibility} onChange={(e) => setBucketForm({ ...bucketForm, visibility: e.target.value })}>
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">
                  <Server className="h-4 w-4" /> Create bucket
                </button>
              </form>
            </div>
          </SectionCard>

          <SectionCard title="URL upload queue" subtitle="Stage remote imports like a web-native rclone workflow. Paste any direct file URL and assign the destination path.">
            <form onSubmit={queueUrlUpload} className="space-y-3">
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" value={uploadForm.bucket_id} onChange={(e) => setUploadForm({ ...uploadForm, bucket_id: e.target.value })}>
                <option value="">Choose bucket</option>
                {buckets.map((bucket) => <option key={bucket.id} value={bucket.id}>{bucket.name}</option>)}
              </select>
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Direct file URL" value={uploadForm.source_url} onChange={(e) => setUploadForm({ ...uploadForm, source_url: e.target.value })} />
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Optional file name override" value={uploadForm.file_name} onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })} />
              <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" placeholder="Destination path" value={uploadForm.destination_path} onChange={(e) => setUploadForm({ ...uploadForm, destination_path: e.target.value })} />
              <button disabled={busy || !uploadForm.source_url || !uploadForm.bucket_id} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50">
                <Link2 className="h-4 w-4" /> Queue remote upload
              </button>
            </form>

            <div className="mt-6 grid gap-3 text-sm text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><HardDriveUpload className="mt-0.5 h-4 w-4 text-cyan-300" /><p>Designed for future worker integration: Telegram chunking, resumable uploads, signed share links, and background jobs can plug into this control plane.</p></div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><Globe className="mt-0.5 h-4 w-4 text-cyan-300" /><p>Import by URL today, then extend to HTTP headers, multi-part copy, cloud-to-cloud transfers, and scheduled syncs like MultCloud.</p></div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Tracked objects" subtitle="Live metadata for objects already synced or staged for transfer." action={<span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{selectedBucketLabel}</span>}>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1.3fr_0.9fr_0.7fr_0.6fr_0.6fr] gap-4 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <div>Name</div>
              <div>Path</div>
              <div>Size</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-white/10 bg-slate-950/40">
              {loading ? (
                <div className="px-4 py-6 text-sm text-slate-400">Loading files…</div>
              ) : files.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-400">No files in this bucket yet.</div>
              ) : files.map((file) => (
                <div key={file.id} className="grid grid-cols-[1.3fr_0.9fr_0.7fr_0.6fr_0.6fr] items-center gap-4 px-4 py-4 text-sm">
                  <div>
                    <div className="font-medium text-white">{file.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{file.mime_type}</div>
                  </div>
                  <div className="truncate text-slate-300">{file.folder_path}</div>
                  <div className="text-slate-300">{formatBytes(file.size_bytes)}</div>
                  <div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses[file.status] || 'border-white/10 bg-white/5 text-slate-300'}`}>{file.status}</span>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => removeFile(file.id)} className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/20"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Transfer activity" subtitle="Observe upload pipelines, URL imports, and future sync engines from one command center.">
          <div className="grid gap-4 lg:grid-cols-2">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400">Loading transfers…</div>
            ) : transfers.map((transfer) => (
              <article key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{transfer.file_name}</div>
                    <div className="mt-1 text-sm text-slate-400">{transfer.source_type.toUpperCase()} → {transfer.destination_path}</div>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses[transfer.status] || 'border-white/10 bg-white/5 text-slate-300'}`}>{transfer.status}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max(8, transfer.progress)}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatBytes(transfer.bytes_transferred)} / {formatBytes(transfer.bytes_total)}</span>
                  <span>{transfer.progress}%</span>
                </div>
                {transfer.source_url ? <p className="mt-3 truncate text-xs text-slate-500">{transfer.source_url}</p> : null}
                {transfer.error_message ? <p className="mt-3 text-xs text-rose-300">{transfer.error_message}</p> : null}
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
