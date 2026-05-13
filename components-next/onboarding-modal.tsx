'use client';

import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, FolderTree, Globe, X } from 'lucide-react';

export function OnboardingModal({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white p-6 shadow-[0_35px_120px_-35px_rgba(15,23,42,0.55)] dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Quick start wizard</div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Get from zero to first upload in four easy steps</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">This is designed for technical users who want speed and clarity, not a week of setup docs.</p>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-2xl border border-slate-300/70 p-2 text-slate-600 dark:border-white/10 dark:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ['1', 'Pick a workspace', 'Choose the bucket you want to work in right now.'],
            ['2', 'Connect Telegram', 'Verify the bot + chat destination used by your worker flow.'],
            ['3', 'Choose a folder', 'Keep uploads organized with a familiar folder structure.'],
            ['4', 'Upload or import', 'Drag files in or paste a direct URL and let the worker pipeline do the rest.'],
          ].map(([step, title, copy], index) => (
            <div key={title} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400 text-sm font-semibold text-slate-950">{step}</div>
                <div className="font-semibold text-slate-950 dark:text-white">{title}</div>
              </div>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{copy}</p>
              <div className="mt-3 text-sky-600 dark:text-sky-300">{index === 0 ? <CheckCircle2 className="h-4 w-4" /> : index === 1 ? <Globe className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setOpen(false)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">Got it — take me to the app</button>
        </div>
      </div>
    </div>
  );
}
