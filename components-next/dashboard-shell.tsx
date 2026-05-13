'use client';

import { Suspense, useState } from 'react';
import { AuthGuard } from './auth-guard';
import { CommandPalette } from './command-palette';
import { Footer } from './footer';
import { NotificationsPanel } from './notifications-panel';
import { OnboardingModal } from './onboarding-modal';
import { SidebarShell } from './sidebar-shell';
import { TopNavbar } from './top-navbar';
import { WorkspaceDashboard } from './workspace-dashboard';

export function DashboardShell() {
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <AuthGuard>
      <TopNavbar onOpenPalette={() => setPaletteOpen(true)} onOpenNotifications={() => setNotificationsOpen((value) => !value)} />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <SidebarShell />
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center rounded-[32px] border border-slate-200/60 bg-white/80 text-slate-500 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">Loading TeleDrive…</div>}>
          <WorkspaceDashboard onOpenOnboarding={() => setOnboardingOpen(true)} />
        </Suspense>
      </main>
      <Footer />
      <OnboardingModal open={onboardingOpen} setOpen={setOnboardingOpen} />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <NotificationsPanel open={notificationsOpen} setOpen={setNotificationsOpen} />
    </AuthGuard>
  );
}
