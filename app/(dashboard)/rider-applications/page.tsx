"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { extractErrorMessage } from "@/lib/errors";
import { readJsonPayload } from "@/lib/http";
import type { ApiResponse } from "@/lib/types";

type RiderApplication = {
  id: number;
  user_id: number;
  status: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city_area: string;
  address: string | null;
  vehicle_type: string;
  availability: string;
  notes: string | null;
  admin_notes: string | null;
  reviewed_by_user_id: number | null;
  reviewed_by_user_name: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RiderApplicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RiderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/proxy/admin/rider-applications", { cache: "no-store" });
      const payload = await readJsonPayload<ApiResponse<RiderApplication[]>>(response);
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      if (!response.ok) {
        throw new Error(extractErrorMessage(payload, "Failed to load rider applications."));
      }
      setItems(payload?.data ?? []);
    } catch (caught) {
      setItems([]);
      setMessage({
        text: caught instanceof Error ? caught.message : "Failed to load rider applications.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleAction(applicationId: number, type: "approve" | "reject") {
    startTransition(async () => {
      setMessage(null);
      setActioningId(applicationId);
      try {
        const response = await fetch(`/api/proxy/admin/rider-applications/${applicationId}/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_notes: adminNotes || null }),
        });
        const payload = await readJsonPayload(response);

        if (!response.ok) {
          setMessage({ text: extractErrorMessage(payload, `Unable to ${type} rider application.`), isError: true });
          return;
        }

        setMessage({ text: `Rider application ${type}d successfully.`, isError: false });
        setAdminNotes("");
        setActionType(null);
        await load();
      } catch (caught) {
        setMessage({
          text: caught instanceof Error ? caught.message : `Failed to ${type} rider application.`,
          isError: true,
        });
      } finally {
        setActioningId(null);
      }
    });
  }

  return (
    <main className="space-y-5">
      <div className="">
        <SectionHeader
          eyebrow="Approvals"
          title="Rider Applications"
          description="Review rider onboarding requests and approve them so the user receives rider access in the same account."
        />

        {message ? (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              message.isError ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {loading ? (
          <div className="py-12 text-center text-sm text-mute">Loading rider applications...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-mute">No rider applications found.</div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-line p-6 flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-ink">{item.full_name}</h3>
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-mute border border-line">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-mute">
                    <div>
                      <p className="font-semibold text-ink mb-1">Contact Details</p>
                      {item.email && <p>{item.email}</p>}
                      {item.phone && <p>{item.phone}</p>}
                      <p className="mt-2 text-xs">User ID: {item.user_id} • Applied {formatDate(item.created_at)}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-ink mb-1">Ride Details</p>
                      <p>City / Area: {item.city_area}</p>
                      <p>Address: {item.address || "Not provided"}</p>
                      <p>Vehicle: {item.vehicle_type}</p>
                      <p>Availability: {item.availability}</p>
                    </div>
                  </div>

                  {(item.notes || item.admin_notes) && (
                    <div className="mt-4 pt-4 border-t border-line space-y-3">
                      {item.notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-mute">Applicant Notes</p>
                          <p className="text-sm mt-1 whitespace-pre-line">{item.notes}</p>
                        </div>
                      )}
                      {item.admin_notes && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-mute">Admin Notes</p>
                          <p className="text-sm mt-1 whitespace-pre-line">{item.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-mute">
                    {item.reviewed_by_user_name ? (
                      <p>
                        Reviewed by {item.reviewed_by_user_name}
                        {item.reviewed_at ? ` • ${formatDate(item.reviewed_at)}` : ""}
                      </p>
                    ) : (
                      <p>Not reviewed yet.</p>
                    )}
                  </div>
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
                      onFocus={() => {
                        if (!actionType) setActionType("approve");
                      }}
                      disabled={pending}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setActionType("reject");
                          handleAction(item.id, "reject");
                        }}
                        disabled={pending}
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actioningId === item.id && actionType === "reject" ? "Wait..." : "Reject"}
                      </button>
                      <button
                        onClick={() => {
                          setActionType("approve");
                          handleAction(item.id, "approve");
                        }}
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
