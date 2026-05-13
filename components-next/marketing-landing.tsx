import Link from 'next/link';
import { ArrowRight, Bot, Cloud, ShieldCheck, Sparkles, UploadCloud, Users } from 'lucide-react';
import { Footer } from './footer';
import { TopNavbar } from './top-navbar';

export function MarketingLanding() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.24),transparent_28%),linear-gradient(180deg,#f8fbff,#eef6ff_38%,#e7f0ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#020617,#081225_36%,#0f172a_100%)]">
      <TopNavbar />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-sky-200"><Sparkles className="h-3.5 w-3.5" /> Telegram storage, now human-friendly</div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">A polished storage SaaS for nerds who want power without chaos.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">TeleDrive makes Telegram-backed storage actually approachable: clean onboarding, browser uploads, remote imports, signed links, transfer tracking, and a workspace UX that feels like real software instead of a weekend admin panel.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">Open the app <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/70 bg-white px-5 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white">See pricing</Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[36px] border border-white/40 bg-white/80 p-6 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            {[
              ['Easy onboarding', 'Get to your first upload fast with a guided setup flow.'],
              ['Worker-based uploads', 'Use browser uploads and URL imports without thinking about queue internals.'],
              ['Team-friendly UX', 'Workspaces, folders, links, plans, settings, and timelines in one clean shell.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                <div className="font-semibold text-slate-950 dark:text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Browser uploads', 'Drag files in and let workers take over.', <UploadCloud className="h-5 w-5" />],
              ['Telegram routing', 'Keep integrations visible and understandable.', <Bot className="h-5 w-5" />],
              ['Signed links', 'Share safely with expiring access plans.', <ShieldCheck className="h-5 w-5" />],
              ['Team workflows', 'Bring teammates into a clearer storage UX.', <Users className="h-5 w-5" />],
            ].map(([title, body, icon]) => (
              <div key={title as string} className="rounded-[28px] border border-slate-200/60 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 rounded-2xl bg-sky-400/10 p-3 text-sky-600 dark:text-sky-300 w-fit">{icon as React.ReactNode}</div>
                <div className="text-lg font-semibold text-slate-950 dark:text-white">{title as string}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body as string}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-[36px] border border-slate-200/60 bg-white/80 p-8 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">How it works</div>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">From first click to transfer visibility in a few calm steps.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['Connect a workspace', 'Choose where files should live.'],
                ['Upload or import', 'Send files from your device or by URL.'],
                ['Monitor and share', 'Track progress, generate links, and manage outcomes.'],
              ].map(([title, body], index) => (
                <div key={title} className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950">{index + 1}</div>
                  <div className="font-semibold text-slate-950 dark:text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
