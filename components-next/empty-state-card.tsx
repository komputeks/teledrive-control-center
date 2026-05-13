import { ReactNode } from 'react';

export function EmptyStateCard({ title, description, action, icon }: { title: string; description: string; action: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-slate-50/80 p-6 text-center dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-600 dark:text-sky-300">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  );
}
