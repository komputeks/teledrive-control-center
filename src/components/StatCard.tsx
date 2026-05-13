import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_-40px_rgba(59,130,246,0.5)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">{icon}</div>
      </div>
      <div className="text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </div>
  );
}
