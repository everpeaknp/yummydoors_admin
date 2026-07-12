import { LogOut } from "lucide-react";

type Props = {
  userName: string;
};

export function Topbar({ userName }: Props) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-line bg-panel px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Control Surface</h2>
        <p className="text-xs text-mute">Operate discovery data, menu visibility, and launch content.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-mute">Signed in as</p>
          <p className="text-sm font-semibold text-ink">{userName}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent hover:bg-wash">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
