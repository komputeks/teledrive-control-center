import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';

interface AuthPanelProps {
  onAuthenticated: () => Promise<void> | void;
}

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleEmailAuth = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const action = isSignUp
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
      const { error } = await action;
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage(isSignUp ? 'Account created. Check your email if confirmation is enabled.' : 'Signed in successfully.');
      await onAuthenticated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">Secure workspace</div>
        <h2 className="text-3xl font-semibold text-white">Sign in to manage Telegram storage workflows</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">Use email/password or Google sign-in to access transfer orchestration, share links, folder planning, and Telegram bot settings.</p>
        <div className="mt-6 space-y-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Demo account: <span className="font-medium text-white">demo@example.com / password123</span></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Phase 2 includes auth-aware Telegram integration records stored per user.</div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_25px_120px_-70px_rgba(34,211,238,0.9)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300"><LockKeyhole className="h-5 w-5" /></div>
          <div>
            <h3 className="text-xl font-semibold text-white">{isSignUp ? 'Create account' : 'Welcome back'}</h3>
            <p className="text-sm text-slate-400">Protected access for your storage control plane.</p>
          </div>
        </div>
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
            <input className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={busy} className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        </form>
        <div className="my-4 text-center text-sm text-slate-500">or</div>
        <button onClick={() => signInWithGoogle('TeleDrive Control Center')} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">Sign in with Google</button>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 w-full text-sm text-cyan-300">{isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}</button>
        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </div>
    </div>
  );
}
