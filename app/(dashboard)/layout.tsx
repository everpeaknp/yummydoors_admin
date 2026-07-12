import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getUserName, isAuthenticated } from "@/lib/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-wash">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userName={getUserName()} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
