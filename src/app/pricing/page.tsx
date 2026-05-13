import { Footer } from '@/components-next/footer';
import { TopNavbar } from '@/components-next/top-navbar';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.2),transparent_26%),linear-gradient(180deg,#f8fbff,#eef6ff_38%,#e7f0ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#020617,#081225_36%,#0f172a_100%)]">
      <TopNavbar />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Pricing & usage</div>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Simple plans for experimentation, solo operators, and storage-heavy teams.</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">This page frames the product like a real SaaS while still supporting your Telegram-backed object storage roadmap.</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            ['Starter', '$0', 'For testing the flow', ['1 workspace', 'Basic uploads', 'Transfer monitoring']],
            ['Pro', '$19', 'For serious builders', ['10 workspaces', 'Signed links', 'URL imports', 'Priority worker controls']],
            ['Scale', '$79', 'For teams and operations', ['Unlimited workspaces', 'Advanced sharing', 'Team controls', 'Activity analytics']],
          ].map(([name, price, note, features]) => (
            <div key={name as string} className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{name as string}</div>
              <div className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">{price as string}<span className="text-base text-slate-500 dark:text-slate-400">/mo</span></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note as string}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">{(features as string[]).map((feature) => <li key={feature}>• {feature}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Usage analytics preview</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {[
              ['Uploads this month', '148'],
              ['Storage tracked', '1.2 TB'],
              ['Signed links created', '42'],
              ['Active team members', '3'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 h-48 rounded-[24px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(14,165,233,0.08),transparent),linear-gradient(90deg,transparent_0%,transparent_10%,rgba(148,163,184,0.15)_10%,rgba(148,163,184,0.15)_11%,transparent_11%,transparent_20%,rgba(148,163,184,0.15)_20%,rgba(148,163,184,0.15)_21%,transparent_21%)] dark:border-white/10">
            <div className="flex h-full items-end gap-4 px-6 pb-6">
              {[35, 55, 48, 72, 64, 84, 92].map((height, index) => <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-sky-500 to-cyan-300" style={{ height: `${height}%` }} />)}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
