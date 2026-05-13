import { Footer } from '@/components-next/footer';
import { SidebarShell } from '@/components-next/sidebar-shell';
import { TopNavbar } from '@/components-next/top-navbar';

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.2),transparent_26%),linear-gradient(180deg,#f8fbff,#eef6ff_38%,#e7f0ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#020617,#081225_36%,#0f172a_100%)]">
      <TopNavbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <SidebarShell />
        <section className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Activity timeline</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A digestible timeline for uploads, integrations, retries, and link activity.</p>
          <div className="mt-8 space-y-4">
            {[
              ['09:42', 'Remote import queued', 'launch-video.mp4 was imported from a direct URL into /campaigns/spring'],
              ['09:18', 'Signed link created', 'A secure link was generated for annual-report-2024.pdf'],
              ['08:55', 'Telegram integration connected', 'Primary Relay is healthy and ready for worker jobs'],
              ['08:21', 'Folder selected', 'Operations moved active uploads into /design/source'],
            ].map(([time, title, body]) => (
              <div key={`${time}-${title}`} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">{time}</div>
                <div className="mt-2 font-semibold text-slate-950 dark:text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
