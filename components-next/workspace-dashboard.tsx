'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, Cloud, Download, FolderTree, Link2, PauseCircle, PlayCircle, RefreshCw, ShieldCheck, Share2, UploadCloud, Zap } from 'lucide-react';

type Bucket = { id: number; name: string; slug: string; region: string; visibility: string; };
type FileRecord = { id: number; bucket_id: number; name: string; folder_path: string; size_bytes: number; status: string; mime_type: string; download_slug?: string | null; };
type Transfer = { id: number; file_name: string; source_type: string; status: string; progress: number; bytes_total: number; bytes_transferred: number; destination_path: string; };
type Folder = { id: number; name: string; path: string; item_count: number; };
type Integration = { id: number; workspace_name: string; bot_username: string; target_chat_id: string; status: string; };

const formatBytes = (value: number) => {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const scaled = value / 1024 ** index;
  return `${scaled.toFixed(scaled >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

export function WorkspaceDashboard() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [selectedPath, setSelectedPath] = useState('/');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [loading, setLoading] = useState(true);

  const hydrate = async (bucketId?: number | null) => {
    setLoading(true);
    try {
      const [bucketRes, fileRes, transferRes, folderRes, integrationRes] = await Promise.all([
        fetch('/api/next/storage/buckets'),
        fetch(`/api/next/storage/files${bucketId ? `?bucket_id=${bucketId}` : ''}`),
        fetch('/api/next/storage/transfers'),
        fetch(`/api/next/storage/folders${bucketId ? `?bucket_id=${bucketId}` : ''}`),
        fetch('/api/next/telegram/integrations'),
      ]);
      const [bucketData, fileData, transferData, folderData, integrationData] = await Promise.all([
        bucketRes.json(), fileRes.json(), transferRes.json(), folderRes.json(), integrationRes.json(),
      ]);
      setBuckets(bucketData);
      setFiles(fileData);
      setTransfers(transferData);
      setFolders(folderData);
      setIntegrations(integrationData);
      if (!selectedBucket && bucketData.length) setSelectedBucket(bucketData[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { hydrate(); }, []);
  useEffect(() => { if (selectedBucket) hydrate(selectedBucket); }, [selectedBucket]);

  const scopedFiles = useMemo(() => files.filter((file) => selectedPath === '/' ? true : file.folder_path === selectedPath), [files, selectedPath]);
  const totalStorage = useMemo(() => files.reduce((sum, file) => sum + file.size_bytes, 0), [files]);

  const createRemoteUpload = async () => {
    if (!selectedBucket || !uploadUrl) return;
    await fetch('/api/next/workers/url-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket_id: selectedBucket, source_url: uploadUrl, file_name: uploadName, destination_path: selectedPath }),
    });
    setUploadUrl('');
    setUploadName('');
    await hydrate(selectedBucket);
  };

  const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files;
    if (!picked?.length || !selectedBucket) return;
    const formData = new FormData();
    for (const file of Array.from(picked)) formData.append('files', file);
    formData.append('bucket_id', String(selectedBucket));
    formData.append('destination_path', selectedPath);
    await fetch('/api/next/workers/browser-upload', { method: 'POST', body: formData });
    await hydrate(selectedBucket);
  };

  const updateTransfer = async (id: number, status: string) => {
    await fetch('/api/next/storage/transfers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    await hydrate(selectedBucket);
  };

  const createSignedLink = async (fileId: number) => {
    await fetch('/api/next/storage/share-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_id: fileId }) });
    await hydrate(selectedBucket);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-300"><Zap className="h-3.5 w-3.5" /> Next.js phase 3 migration</div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">TeleDrive Next Control Center</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">A true App Router buildout with route handlers, worker-style endpoints, encrypted Telegram token storage design, signed downloads, and production-oriented project structure.</p>
          </div>
          <button onClick={() => hydrate(selectedBucket)} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Buckets</span><ShieldCheck className="h-5 w-5 text-cyan-300" /></div><div className="text-3xl font-semibold text-white">{buckets.length}</div><p className="mt-2 text-sm text-slate-400">Ready for App Router operations</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Scoped files</span><FolderTree className="h-5 w-5 text-cyan-300" /></div><div className="text-3xl font-semibold text-white">{scopedFiles.length}</div><p className="mt-2 text-sm text-slate-400">Current path {selectedPath}</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Tracked storage</span><Cloud className="h-5 w-5 text-cyan-300" /></div><div className="text-3xl font-semibold text-white">{formatBytes(totalStorage)}</div><p className="mt-2 text-sm text-slate-400">Based on persisted metadata</p></div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Telegram integrations</span><Bot className="h-5 w-5 text-cyan-300" /></div><div className="text-3xl font-semibold text-white">{integrations.length}</div><p className="mt-2 text-sm text-slate-400">Bot relay workspaces connected</p></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Folders & buckets</h2>
          <p className="mt-1 text-sm text-slate-400">Target a path before creating uploads or signed links.</p>
          <div className="mt-5 space-y-3">
            {buckets.map((bucket) => (
              <button key={bucket.id} onClick={() => setSelectedBucket(bucket.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedBucket === bucket.id ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                <div className="font-medium text-white">{bucket.name}</div>
                <div className="mt-1 text-sm text-slate-400">/{bucket.slug} · {bucket.region} · {bucket.visibility}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => setSelectedPath(folder.path)} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${selectedPath === folder.path ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                <span><span className="font-medium text-white">{folder.name}</span><span className="ml-2 text-xs text-slate-500">{folder.path}</span></span>
                <span className="text-xs text-slate-400">{folder.item_count} items</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Upload workers</h2>
          <p className="mt-1 text-sm text-slate-400">Real browser upload worker flow now posts multipart form data to Next.js route handlers.</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <label className="rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-8 text-center cursor-pointer">
              <UploadCloud className="mx-auto h-8 w-8 text-cyan-300" />
              <div className="mt-3 text-lg font-semibold text-white">Choose files</div>
              <p className="mt-2 text-sm text-slate-400">Uploads are persisted as worker jobs and chunk plans.</p>
              <input type="file" multiple className="hidden" onChange={handleFilePick} />
            </label>
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="Direct file URL" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none" />
              <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Optional file name" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none" />
              <button onClick={createRemoteUpload} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"><Link2 className="h-4 w-4" /> Import from URL</button>
              <p className="text-xs text-slate-500">Worker route creates file, transfer, manifest plan, and pending message map rows.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Files & signed downloads</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-4 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-400">
              <div>Name</div><div>Path</div><div>Size</div><div>Status</div><div>Access</div>
            </div>
            <div className="divide-y divide-white/10 bg-slate-950/40">
              {loading ? <div className="px-4 py-6 text-sm text-slate-400">Loading…</div> : scopedFiles.map((file) => (
                <div key={file.id} className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr] items-center gap-4 px-4 py-4 text-sm">
                  <div><div className="font-medium text-white">{file.name}</div><div className="mt-1 text-xs text-slate-500">{file.mime_type}</div></div>
                  <div className="truncate text-slate-300">{file.folder_path}</div>
                  <div className="text-slate-300">{formatBytes(file.size_bytes)}</div>
                  <div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{file.status}</span></div>
                  <div className="flex gap-2">{file.download_slug ? <a className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300" href={`/api/next/download/${file.download_slug}`}><Download className="h-3.5 w-3.5" /> Download</a> : <button onClick={() => createSignedLink(file.id)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300"><Share2 className="h-3.5 w-3.5" /> Sign</button>}</div>
                </div>
              ))}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-white">Transfers</h2>
          <div className="mt-5 grid gap-4">
            {transfers.map((transfer) => (
              <article key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="font-medium text-white">{transfer.file_name}</div><div className="mt-1 text-sm text-slate-400">{transfer.source_type.toUpperCase()} → {transfer.destination_path}</div></div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{transfer.status}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.max(8, transfer.progress)}%` }} /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{formatBytes(transfer.bytes_transferred)} / {formatBytes(transfer.bytes_total)}</span><span>{transfer.progress}%</span></div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => updateTransfer(transfer.id, transfer.status === 'paused' ? 'uploading' : 'paused')} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-300">{transfer.status === 'paused' ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}{transfer.status === 'paused' ? 'Resume' : 'Pause'}</button>
                  <button onClick={() => updateTransfer(transfer.id, 'queued')} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
