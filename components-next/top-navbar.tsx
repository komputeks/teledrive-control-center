'use client';

import Link from 'next/link';
import { Bell, Cloud, Menu, Search, Sparkles } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

const marketingLinks = [
  { href: '/#features' as Route, label: 'Features' },
  { href: '/#how-it-works' as Route, label: 'How it works' },
  { href: '/pricing' as Route, label: 'Pricing' },
  { href: '/faq' as Route, label: 'FAQ' },
  { href: '/team' as Route, label: 'Team' },
];

export function TopNavbar({ onOpenPalette, onOpenNotifications }: { onOpenPalette?: () => void; onOpenNotifications?: () => void } = {}) {
  const router = useRouter();

  const startFree = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('teledrive-demo-auth', 'true');
    }
    router.push('/app');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/25"><Cloud className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">TeleDrive</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Telegram storage SaaS</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          {marketingLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          {onOpenPalette ? <button onClick={onOpenPalette} className="hidden rounded-2xl border border-slate-300/70 bg-white p-2 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white md:inline-flex"><Search className="h-4 w-4" /></button> : null}
          {onOpenNotifications ? <button onClick={onOpenNotifications} className="hidden rounded-2xl border border-slate-300/70 bg-white p-2 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white md:inline-flex"><Bell className="h-4 w-4" /></button> : null}
          <Link href={'/app' as Route} className="hidden rounded-2xl border border-slate-300/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white md:inline-flex">Open app</Link>
          <button onClick={startFree} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-sky-400 dark:text-slate-950"><Sparkles className="h-4 w-4" /> Start free</button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300/70 text-slate-700 dark:border-white/10 dark:text-white md:hidden"><Menu className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
}
