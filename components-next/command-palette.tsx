'use client';

import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { Route } from 'next';

const commands = [
  { label: 'Open dashboard', href: '/app' as Route },
  { label: 'View pricing', href: '/pricing' as Route },
  { label: 'Open team page', href: '/team' as Route },
  { label: 'Open settings', href: '/settings' as Route },
  { label: 'Open activity timeline', href: '/activity' as Route },
  { label: 'Open billing', href: '/billing' as Route },
  { label: 'Read FAQ', href: '/faq' as Route },
];

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white p-4 shadow-[0_35px_120px_-35px_rgba(15,23,42,0.55)] dark:bg-slate-950">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Search pages, actions, and workspace tools…" />
          <button onClick={() => setOpen(false)} className="rounded-xl p-1 text-slate-500 dark:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 space-y-2">
          {commands.map((command) => (
            <Link key={command.href} href={command.href} onClick={() => setOpen(false)} className="block rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
              {command.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
