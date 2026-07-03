import { LogOut } from "lucide-react";

type Props = {
  userName: string;
};

export function Topbar({ userName }: Props) {
  return (
    <div className="flex items-center justify-between rounded-panel border border-line bg-panel px-6 py-4 shadow-panel">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accentDark">Control Surface</p>
        <p className="mt-2 text-sm text-mute">Operate discovery data, menu visibility, and launch content.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-mute">Signed in as</p>
          <p className="text-sm font-semibold text-ink">{userName}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
