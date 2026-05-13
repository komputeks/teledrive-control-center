import { Suspense } from 'react';
import { WorkspaceDashboard } from './workspace-dashboard';

export function DashboardShell() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-300">Loading TeleDrive Next…</div>}>
      <WorkspaceDashboard />
    </Suspense>
  );
}
