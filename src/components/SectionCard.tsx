import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}

export function SectionCard({ title, subtitle, children, action }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_80px_-50px_rgba(14,165,233,0.7)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
