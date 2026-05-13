'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, Cloud, Compass, FolderKanban, Globe, PlayCircle, PlusCircle, RefreshCw, Rocket, ShieldCheck, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { EmptyStateCard } from './empty-state-card';

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

const statusTone: Record<string, string> = {
  queued: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
  uploading: 'bg-sky-500/15 text-sky-200 border-sky-400/20',
  paused: 'bg-violet-500/15 text-violet-200 border-violet-400/20',
  synced: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
  mapped: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
  connected: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
  draft: 'bg-slate-500/20 text-slate-200 border-slate-400/20',
};

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200/8 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.55)] backdrop-blur dark:bg-white/5">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}

function StepCard({ index, title, description, active }: { index: number; title: string; description: string; active?: boolean }) {
  return (
    <div className={`rounded-[28px] border p-5 transition ${active ? 'border-sky-300/40 bg-sky-500/10 shadow-[0_18px_50px_-32px_rgba(56,189,248,0.8)]' : 'border-slate-200/10 bg-white/70 dark:bg-white/5'}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${active ? 'bg-sky-400 text-slate-950' : 'bg-slate-900 text-white dark:bg-white/10 dark:text-white'}`}>{index}</div>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

export function WorkspaceDashboard({ onOpenOnboarding }: { onOpenOnboarding: () => void }) {
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
  const activeTransfers = useMemo(() => transfers.filter((item) => ['queued', 'uploading', 'paused'].includes(item.status)).length, [transfers]);
  const onboardingProgress = useMemo(() => {
    let count = 0;
    if (buckets.length) count += 1;
    if (integrations.length) count += 1;
    if (folders.length) count += 1;
    if (files.length || transfers.length) count += 1;
    return count;
  }, [buckets, integrations, folders, files, transfers]);

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
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/50 bg-white/80 p-6 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:p-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.35),transparent_45%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200"><Sparkles className="h-3.5 w-3.5" /> Easy onboarding for technical people</div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">All your Telegram storage operations, finally shaped like a real product.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">Pick a workspace, connect Telegram, choose a folder, and upload files with confidence. TeleDrive now feels like a polished SaaS instead of a rough admin tool.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => hydrate(selectedBucket)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 dark:bg-sky-400 dark:text-slate-950"><RefreshCw className="h-4 w-4" /> Refresh workspace</button>
              <button onClick={onOpenOnboarding} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/60 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"><Compass className="h-4 w-4" /> Open onboarding wizard</button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[32px] border border-slate-200/60 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Getting started</div>
                <div className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{onboardingProgress}/4 complete</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Fast onboarding</div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" style={{ width: `${(onboardingProgress / 4) * 100}%` }} /></div>
            <div className="grid gap-3">
              <StepCard index={1} title="Choose a workspace" description="Buckets give technical users a strong namespace model without making the UI feel intimidating." active={buckets.length > 0} />
              <StepCard index={2} title="Connect Telegram" description="Your integration status is visible immediately, so you know whether the backend is ready." active={integrations.length > 0} />
              <StepCard index={3} title="Organize folders" description="Folders feel like a familiar file manager instead of a database admin panel." active={folders.length > 0} />
              <StepCard index={4} title="Upload something" description="Use browser uploads or remote URL imports and let workers handle the rest." active={files.length > 0 || transfers.length > 0} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Workspaces" value={String(buckets.length)} hint="Cleanly grouped storage environments for channels, bots, or teams." />
        <MetricCard label="Files in focus" value={String(scopedFiles.length)} hint={`Current folder: ${selectedPath}`} />
        <MetricCard label="Tracked capacity" value={formatBytes(totalStorage)} hint="Object metadata your team can reason about instantly." />
        <MetricCard label="Active jobs" value={String(activeTransfers)} hint="Queued, uploading, or paused transfer jobs with visible state." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Where do you want to work?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Pick a workspace and folder once. Everything else in the app follows that context automatically.</p>
            </div>
            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-300"><FolderKanban className="h-5 w-5" /></div>
          </div>

          <div className="mt-6 space-y-3">
            {buckets.length === 0 ? <EmptyStateCard title="No workspaces yet" description="Create or seed a first workspace to help users feel immediate momentum." icon={<PlusCircle className="h-6 w-6" />} action={<button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">Create first workspace</button>} /> : buckets.map((bucket) => (
              <button key={bucket.id} onClick={() => setSelectedBucket(bucket.id)} className={`w-full rounded-[24px] border p-4 text-left transition ${selectedBucket === bucket.id ? 'border-sky-300 bg-sky-50 shadow-[0_18px_45px_-28px_rgba(56,189,248,0.55)] dark:border-sky-400/30 dark:bg-sky-400/10' : 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/5'}`}>
                <div className="flex items-center justify-between gap-3"><div><div className="font-semibold text-slate-950 dark:text-white">{bucket.name}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">/{bucket.slug} · {bucket.region}</div></div><span className="rounded-full border border-slate-300/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:text-slate-300">{bucket.visibility}</span></div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Compass className="h-4 w-4" /> Folder navigator</div>
            <div className="space-y-2">
              {folders.length === 0 ? <EmptyStateCard title="No folders yet" description="Add a folder structure so uploads feel organized from the start." icon={<FolderKanban className="h-6 w-6" />} action={<button className="rounded-2xl border border-slate-300/70 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white">Create starter folders</button>} /> : folders.map((folder) => (
                <button key={folder.id} onClick={() => setSelectedPath(folder.path)} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${selectedPath === folder.path ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10' : 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/5'}`}>
                  <div><div className="font-medium text-slate-900 dark:text-white">{folder.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">{folder.path}</div></div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{folder.item_count} items</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Upload center</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">No weird jargon. Just two clear ways to add files: drag them in from your device or paste a direct URL.</p>
              </div>
              <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300"><Wand2 className="h-5 w-5" /></div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="group cursor-pointer rounded-[28px] border border-dashed border-sky-300 bg-sky-50/80 p-8 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-400/10 dark:hover:bg-sky-400/15">
                <UploadCloud className="h-8 w-8 text-sky-600 dark:text-sky-300" />
                <div className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Upload from your computer</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Perfect for quick testing, real usage, or onboarding your team. Files are handed straight to worker endpoints.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Choose files <ArrowRight className="h-4 w-4" /></div>
                <input type="file" multiple className="hidden" onChange={handleFilePick} />
              </label>

              <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Import by URL</div>
                <input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="Paste a direct file URL" className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5" />
                <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Optional file name" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5" />
                <button onClick={createRemoteUpload} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950"><Globe className="h-4 w-4" /> Start remote import</button>
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Best for moving assets from remote servers, mirrors, backups, or existing download endpoints.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Telegram readiness</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">The scary backend bits are translated into clear workspace health.</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300"><Bot className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 space-y-3">
                {integrations.length === 0 ? <EmptyStateCard title="No Telegram integration yet" description="Set up a relay bot workspace so uploads feel like they are going somewhere real." icon={<Bot className="h-6 w-6" />} action={<button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">Add Telegram workspace</button>} /> : integrations.map((integration) => (
                  <div key={integration.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-950 dark:text-white">{integration.workspace_name}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{integration.bot_username} · {integration.target_chat_id}</div></div><span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone[integration.status] || 'border-slate-300 text-slate-600 dark:border-white/10 dark:text-slate-300'}`}>{integration.status}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Live transfer queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Every job is visible. Pause, resume, retry, and understand what the system is doing.</p>
                </div>
                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300"><Rocket className="h-5 w-5" /></div>
              </div>
              <div className="mt-5 grid gap-3">
                {transfers.length === 0 ? <EmptyStateCard title="No transfer jobs yet" description="Kick off a browser upload or URL import and this queue will become your command center." icon={<Rocket className="h-6 w-6" />} action={<button onClick={onOpenOnboarding} className="rounded-2xl border border-slate-300/70 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white">Show me how</button>} /> : transfers.map((transfer) => (
                  <article key={transfer.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-950 dark:text-white">{transfer.file_name}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{transfer.source_type.toUpperCase()} → {transfer.destination_path}</div></div><span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone[transfer.status] || 'border-slate-300 text-slate-600 dark:border-white/10 dark:text-slate-300'}`}>{transfer.status}</span></div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" style={{ width: `${Math.max(8, transfer.progress)}%` }} /></div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>{formatBytes(transfer.bytes_transferred)} / {formatBytes(transfer.bytes_total)}</span><span>{transfer.progress}%</span></div>
                    <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => updateTransfer(transfer.id, transfer.status === 'paused' ? 'uploading' : 'paused')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"><PlayCircle className="h-3.5 w-3.5" />{transfer.status === 'paused' ? 'Resume' : 'Pause'}</button><button onClick={() => updateTransfer(transfer.id, 'queued')} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-sky-400 dark:text-slate-950"><RefreshCw className="h-3.5 w-3.5" /> Retry</button></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Files in this folder</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">A friendlier file table with simple access actions. No need to decode internal metadata to get useful work done.</p>
            </div>
            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-300"><Cloud className="h-5 w-5" /></div>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">Loading files…</div> : scopedFiles.length === 0 ? <EmptyStateCard title="This folder is empty" description="Upload a file or import one by URL to bring this view to life." icon={<Cloud className="h-6 w-6" />} action={<button onClick={onOpenOnboarding} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">Start with onboarding</button>} /> : scopedFiles.map((file) => (
              <div key={file.id} className="flex flex-col gap-4 rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40 lg:flex-row lg:items-center lg:justify-between">
                <div><div className="flex items-center gap-3"><div className="rounded-2xl bg-slate-900 p-2 text-white dark:bg-white/10"><CheckCircle2 className="h-4 w-4" /></div><div><div className="font-semibold text-slate-950 dark:text-white">{file.name}</div><div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{file.folder_path} · {file.mime_type}</div></div></div></div>
                <div className="flex flex-wrap items-center gap-3"><div className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatBytes(file.size_bytes)}</div><span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone[file.status] || 'border-slate-300 text-slate-600 dark:border-white/10 dark:text-slate-300'}`}>{file.status}</span>{file.download_slug ? <a className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-sky-400 dark:text-slate-950" href={`/api/next/download/${file.download_slug}`}>Open download plan <ArrowRight className="h-3.5 w-3.5" /></a> : <button onClick={() => createSignedLink(file.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"><ShieldCheck className="h-3.5 w-3.5" /> Create link</button>}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Why this feels easier</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">The interface is optimized for technical users who want clarity and speed without losing control.</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-300"><Sparkles className="h-5 w-5" /></div>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ['One clear path', 'Choose a workspace, pick a folder, upload. The app keeps context for you.'],
              ['Less hidden state', 'You always see job status, file location, and integration readiness.'],
              ['Friendly language', 'Storage concepts are explained like a product, not a backend diagram.'],
              ['SaaS-style hierarchy', 'Hero, onboarding checklist, action cards, and operational views work together naturally.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"><div className="font-semibold text-slate-950 dark:text-white">{title}</div><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
