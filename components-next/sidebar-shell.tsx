'use client';

import Link from 'next/link';
import { Activity, CreditCard, DollarSign, Home, Settings, Shield, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

const links = [
  { href: '/app' as Route, label: 'Dashboard', icon: Home },
  { href: '/pricing' as Route, label: 'Plans & usage', icon: CreditCard },
  { href: '/billing' as Route, label: 'Billing', icon: DollarSign },
  { href: '/team' as Route, label: 'Team members', icon: Users },
  { href: '/activity' as Route, label: 'Activity', icon: Activity },
  { href: '/settings' as Route, label: 'Settings', icon: Settings },
];

export function SidebarShell() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[32px] border border-slate-200/60 bg-white/80 p-4 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="mb-5 rounded-[28px] bg-slate-950 p-4 text-white dark:bg-sky-400 dark:text-slate-950">
        <div className="text-sm font-semibold">Workspace shell</div>
        <p className="mt-2 text-xs leading-5 text-slate-300 dark:text-slate-900/80">Everything important is one click away. No hunting through admin menus.</p>
      </div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}>
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><Shield className="h-4 w-4" /> Pro tip</div>
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Set up a Telegram integration first, then uploads and share links become much easier to reason about.</p>
      </div>
    </aside>
  );
}
