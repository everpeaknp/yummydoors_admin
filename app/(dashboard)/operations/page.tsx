"use client";

import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "@/components/admin/section-header";
import { extractErrorMessage } from "@/lib/errors";
import { readJsonPayload } from "@/lib/http";
import type { ApiResponse } from "@/lib/types";

type Operator = { id: number; full_name: string; email: string | null; phone: string | null; status: string; roles: string[]; restaurant_ids: number[]; workspace_ids: number[] };
type Workspace = { id: number; name: string; workspace_type: string; status: string; primary_restaurant_id: number | null };

export default function OperationsPage() {
  const [domain, setDomain] = useState<"rider" | "merchant">("rider");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const requests = [fetch(`/api/proxy/admin/operators?domain=${domain}`, { cache: "no-store" })];
    if (domain === "merchant") requests.push(fetch("/api/proxy/admin/workspaces", { cache: "no-store" }));
    const responses = await Promise.all(requests);
    const operatorPayload = await readJsonPayload<ApiResponse<Operator[]>>(responses[0]);
    if (!responses[0].ok) throw new Error(extractErrorMessage(operatorPayload, "Failed to load operators."));
    setOperators(operatorPayload.data ?? []);
    if (responses[1]) {
      const workspacePayload = await readJsonPayload<ApiResponse<Workspace[]>>(responses[1]);
      if (!responses[1].ok) throw new Error(extractErrorMessage(workspacePayload, "Failed to load merchant workspaces."));
      setWorkspaces(workspacePayload.data ?? []);
    } else setWorkspaces([]);
  }, [domain]);

  useEffect(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : "Failed to load operations.")); }, [load]);

  async function updateUser(userId: number, status: "active" | "suspended") {
    const response = await fetch(`/api/proxy/admin/operators/${userId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const payload = await readJsonPayload(response);
    if (!response.ok) { setMessage(extractErrorMessage(payload, "Unable to update operator.")); return; }
    setMessage("Operator status updated.");
    await load();
  }

  async function updateWorkspace(workspaceId: number, status: "active" | "suspended") {
    const response = await fetch(`/api/proxy/admin/workspaces/${workspaceId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const payload = await readJsonPayload(response);
    if (!response.ok) { setMessage(extractErrorMessage(payload, "Unable to update merchant workspace.")); return; }
    setMessage("Merchant workspace status updated.");
    await load();
  }

  return <main className="space-y-6">
    <SectionHeader eyebrow="Operations" title="Rider & merchant controls" description="Manage approved operator access and merchant workspaces without changing application history." />
    {message ? <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-ink">{message}</div> : null}
    <div className="flex gap-2"><button className={`rounded-xl px-4 py-2 text-sm font-semibold ${domain === "rider" ? "bg-ink text-white" : "border border-line"}`} onClick={() => setDomain("rider")}>Riders</button><button className={`rounded-xl px-4 py-2 text-sm font-semibold ${domain === "merchant" ? "bg-ink text-white" : "border border-line"}`} onClick={() => setDomain("merchant")}>Merchants</button></div>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Approved {domain}s</h2>{operators.length === 0 ? <p className="text-sm text-mute">No approved {domain}s found.</p> : operators.map((operator) => <div key={operator.id} className="flex flex-col gap-3 rounded-2xl border border-line p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{operator.full_name}</p><p className="text-sm text-mute">{operator.email || operator.phone || "No contact"} · {operator.status}</p><p className="text-xs text-mute">{domain === "rider" ? `Restaurants: ${operator.restaurant_ids.join(", ") || "none"}` : `Workspaces: ${operator.workspace_ids.join(", ") || "none"}`}</p></div><button className={`rounded-xl px-4 py-2 text-sm font-semibold ${operator.status === "suspended" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`} onClick={() => void updateUser(operator.id, operator.status === "suspended" ? "active" : "suspended")}>{operator.status === "suspended" ? "Reactivate" : "Suspend"}</button></div>)}</section>
    {domain === "merchant" ? <section className="space-y-3"><h2 className="text-lg font-semibold">Merchant workspaces</h2>{workspaces.map((workspace) => <div key={workspace.id} className="flex items-center justify-between rounded-2xl border border-line p-5"><div><p className="font-semibold">{workspace.name}</p><p className="text-sm text-mute">Workspace #{workspace.id} · {workspace.status}</p></div><button className={`rounded-xl px-4 py-2 text-sm font-semibold ${workspace.status === "suspended" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`} onClick={() => void updateWorkspace(workspace.id, workspace.status === "suspended" ? "active" : "suspended")}>{workspace.status === "suspended" ? "Reactivate" : "Suspend"}</button></div>)}</section> : null}
  </main>;
}
