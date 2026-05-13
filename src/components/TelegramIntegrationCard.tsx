import { Bot, Trash2 } from 'lucide-react';

interface TelegramIntegration {
  id: number;
  workspace_name: string;
  bot_username: string;
  target_chat_id: string;
  bot_token_masked: string;
  status: string;
  webhook_mode: string;
  notes: string | null;
}

interface TelegramIntegrationCardProps {
  integration: TelegramIntegration;
  onRemove: (id: number) => void;
}

export function TelegramIntegrationCard({ integration, onRemove }: TelegramIntegrationCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300"><Bot className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-white">{integration.workspace_name}</h3>
            <p className="mt-1 text-sm text-slate-400">@{integration.bot_username} · {integration.target_chat_id}</p>
            <p className="mt-2 text-xs text-slate-500">{integration.bot_token_masked} · {integration.webhook_mode}</p>
          </div>
        </div>
        <button onClick={() => onRemove(integration.id)} className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-2 text-rose-300 transition hover:bg-rose-400/20"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{integration.status}</span>
        <span className="text-slate-400">{integration.notes || 'Ready for chunk relay pipeline'}</span>
      </div>
    </article>
  );
}
