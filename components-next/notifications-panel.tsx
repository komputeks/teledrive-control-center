'use client';

import { Dispatch, SetStateAction } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

export function NotificationsPanel({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  if (!open) return null;

  return (
    <div className="fixed right-4 top-24 z-50 w-full max-w-sm rounded-[28px] border border-white/10 bg-white p-4 shadow-[0_35px_120px_-35px_rgba(15,23,42,0.45)] dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><Bell className="h-4 w-4" /> Notifications</div>
        <button onClick={() => setOpen(false)} className="rounded-xl p-1 text-slate-500 dark:text-slate-300"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 space-y-3">
        {[
          'Primary Relay is healthy and ready for uploads.',
          'A signed link was created for annual-report-2024.pdf.',
          'A remote import was queued successfully.',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" /><span>{item}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
