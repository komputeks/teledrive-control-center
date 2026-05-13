'use client';

import { Dispatch, SetStateAction } from 'react';
import { Mail, UserPlus, X } from 'lucide-react';

export function InviteModal({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white p-6 shadow-[0_35px_120px_-35px_rgba(15,23,42,0.55)] dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Invite teammate</div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Bring someone into your workspace</h2>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-2xl border border-slate-300/70 p-2 text-slate-600 dark:border-white/10 dark:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input placeholder="teammate@example.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm dark:border-white/10 dark:bg-white/5" />
          </div>
          <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
            <option>Member</option>
            <option>Admin</option>
            <option>Viewer</option>
          </select>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950"><UserPlus className="h-4 w-4" /> Send invite</button>
        </div>
      </div>
    </div>
  );
}
