import { Footer } from '@/components-next/footer';
import { TopNavbar } from '@/components-next/top-navbar';

export default function FaqPage() {
  const items = [
    ['Is this real object storage?', 'It is a real control plane with real persistent metadata, worker endpoints, share-link models, and Telegram integration planning. The final binary Telegram chunk transport is the next backend stage.'],
    ['Can I upload from my browser?', 'Yes. Browser file uploads go to worker-style Next.js endpoints that create transfer jobs, file records, and chunk planning data.'],
    ['Can I import from URL?', 'Yes. Paste a direct file URL and TeleDrive creates a worker job for remote ingestion.'],
    ['Who is this for?', 'Technical solo builders, operators, and teams who want Telegram-backed storage without a painful UI.'],
    ['Will teams and billing be supported?', 'Yes. This SaaS shell now includes team, pricing, billing, notifications, and settings surfaces designed for expansion.'],
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.2),transparent_26%),linear-gradient(180deg,#f8fbff,#eef6ff_38%,#e7f0ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_24%),linear-gradient(180deg,#020617,#081225_36%,#0f172a_100%)]">
      <TopNavbar />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">FAQ</div>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Frequently asked questions</h1>
        </div>
        <div className="mt-10 space-y-4">
          {items.map(([question, answer]) => (
            <div key={question} className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{question}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{answer}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
