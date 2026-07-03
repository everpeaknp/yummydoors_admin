import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUserName, isAuthenticated } from "@/lib/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>
        <div className="space-y-5">
          <Topbar userName={getUserName()} />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
