'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const isAuthed = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('teledrive-demo-auth') === 'true';
};

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authed = isAuthed();
    if (pathname.startsWith('/app') || pathname.startsWith('/settings') || pathname.startsWith('/team') || pathname.startsWith('/activity') || pathname.startsWith('/billing')) {
      if (!authed) {
        router.replace('/');
        return;
      }
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready && (pathname.startsWith('/app') || pathname.startsWith('/settings') || pathname.startsWith('/team') || pathname.startsWith('/activity') || pathname.startsWith('/billing'))) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-300">Checking access…</div>;
  }

  return <>{children}</>;
}
