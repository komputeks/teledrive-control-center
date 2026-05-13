import { Footer } from '@/components-next/footer';
import { SidebarShell } from '@/components-next/sidebar-shell';
import { TopNavbar } from '@/components-next/top-navbar';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.2),transparent_26%),linear-gradient(180deg,#f8fbff,#eef6ff_38%,#e7f0ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#020617,#081225_36%,#0f172a_100%)]">
      <TopNavbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <SidebarShell />
        <section className="rounded-[32px] border border-slate-200/60 bg-white/80 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Team members</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A SaaS-style team surface for the future multi-user version of TeleDrive.</p>
          <div className="mt-8 grid gap-4">
            {[
              ['Alex Rivera', 'Owner', 'alex@teledrive.app'],
              ['Sam Chen', 'Operations', 'sam@teledrive.app'],
              ['Priya Nair', 'Storage Admin', 'priya@teledrive.app'],
            ].map(([name, role, email]) => (
              <div key={email} className="flex flex-col gap-3 rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-950 dark:text-white">{name}</div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{email}</div>
                </div>
                <div className="rounded-full border border-slate-300/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:text-slate-300">{role}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
