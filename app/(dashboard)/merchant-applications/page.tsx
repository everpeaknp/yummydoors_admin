"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { extractErrorMessage } from "@/lib/errors";
import type { ApiResponse } from "@/lib/types";

// Types matching the backend schema
type RequestType = "create_external" | "claim_existing" | "pos_link";

type MerchantRestaurantRequest = {
  id: number;
  request_type: RequestType;
  status: string;
  restaurant_id: number | null;
  requested_name: string;
  requested_slug: string | null;
  city: string | null;
  area: string | null;
  source_system: string;
  pos_restaurant_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type MerchantApplication = {
  id: number;
  user_id: number;
  status: string;
  business_name: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  admin_notes: string | null;
  restaurant_requests: MerchantRestaurantRequest[];
  created_at: string;
  updated_at: string;
};

export default function MerchantApplicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MerchantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/proxy/admin/merchant-applications", { cache: "no-store" });
      const payload: ApiResponse<MerchantApplication[]> & { detail?: unknown; message?: unknown } = await response.json();
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      if (!response.ok) {
        throw new Error(extractErrorMessage(payload, "Failed to load merchant applications."));
      }
      setItems(payload.data ?? []);
    } catch (e) {
      console.error(e);
      setItems([]);
      setMessage({
        text: e instanceof Error ? e.message : "Failed to load merchant applications.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function handleAction(applicationId: number, type: "approve" | "reject") {
    startTransition(async () => {
      setMessage(null);
      setActioningId(applicationId);
      try {
        const response = await fetch(`/api/proxy/admin/merchant-applications/${applicationId}/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_notes: adminNotes || null }),
        });
        const payload = await response.json();
        
        if (!response.ok) {
          setMessage({ text: extractErrorMessage(payload, `Unable to ${type} application.`), isError: true });
          return;
        }
        
        setMessage({ text: `Application ${type}d successfully.`, isError: false });
        setAdminNotes("");
        setActionType(null);
        await load();
      } catch (e) {
        console.error(e);
        setMessage({ text: `Failed to ${type} application.`, isError: true });
      } finally {
        setActioningId(null);
      }
    });
  }

  return (
    <main className="space-y-5">
      <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
        <SectionHeader
          eyebrow="Approvals"
          title="Merchant Applications"
          description="Review incoming merchant requests, verify their business details, and approve them to create their workspaces and restaurant contexts."
        />

        {message ? (
          <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${message.isError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
            {message.text}
          </div>
        ) : null}

        {loading ? (
          <div className="py-12 text-center text-sm text-mute">Loading applications...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-mute">No merchant applications found.</div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line p-6 flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-ink">{item.business_name}</h3>
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-mute border border-line">
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-mute">
                    <div>
                      <p className="font-semibold text-ink mb-1">Contact Details</p>
                      <p>{item.contact_name}</p>
                      {item.contact_email && <p>{item.contact_email}</p>}
                      {item.contact_phone && <p>{item.contact_phone}</p>}
                      <p className="mt-2 text-xs">ID: {item.id} • Applied {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-ink mb-1">Requests ({item.restaurant_requests.length})</p>
                      <ul className="space-y-2">
                        {item.restaurant_requests.map(req => (
                          <li key={req.id} className="bg-surface rounded-xl p-3 border border-line">
                            <p className="font-medium text-ink">{req.requested_name}</p>
                            <p className="text-xs">{req.request_type} • {[req.city, req.area].filter(Boolean).join(", ")}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {(item.notes || item.admin_notes) && (
                    <div className="mt-4 pt-4 border-t border-line space-y-3">
                      {item.notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-mute">Applicant Notes</p>
                          <p className="text-sm mt-1">{item.notes}</p>
                        </div>
                      )}
                      {item.admin_notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-mute">Admin Notes</p>
                          <p className="text-sm mt-1">{item.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {item.status === "submitted" && (
                  <div className="xl:w-72 p-5 bg-surface rounded-2xl border border-line flex flex-col justify-center">
                    <p className="text-sm font-semibold text-ink mb-3">Review Action</p>
                    <input 
                      type="text" 
                      placeholder="Admin notes (optional)"
                      className="w-full rounded-xl border border-line px-4 py-2.5 text-sm mb-3"
                      value={actionType ? adminNotes : ""}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      onFocus={() => { if (!actionType) setActionType("approve"); }}
                      disabled={pending}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setActionType("reject"); handleAction(item.id, "reject"); }}
                        disabled={pending}
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actioningId === item.id && actionType === "reject" ? "Wait..." : "Reject"}
                      </button>
                      <button 
                        onClick={() => { setActionType("approve"); handleAction(item.id, "approve"); }}
                        disabled={pending}
                        className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
                      >
                        {actioningId === item.id && actionType === "approve" ? "Wait..." : "Approve"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
