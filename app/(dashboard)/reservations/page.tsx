"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import type { ApiResponse, Reservation, ReservationStatus, Restaurant, RestaurantTableSummary } from "@/lib/types";

const STATUS_OPTIONS: Array<{ value: ReservationStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

const FINAL_STATUSES = new Set<ReservationStatus>(["completed", "cancelled", "no_show"]);

const defaultTableForm = {
  code: "",
  label: "",
  zone: "",
  min_guest_count: 1,
  max_guest_count: 4,
  status: "active",
  sort_order: 0,
};

function extractError(payload: any) {
  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  return "Something went wrong.";
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: ReservationStatus) {
  if (status === "completed") return "border-green-200 bg-green-50 text-green-700";
  if (status === "confirmed" || status === "seated") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "cancelled" || status === "no_show") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ReservationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number>(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTableSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [tableId, setTableId] = useState("");
  const [tableForm, setTableForm] = useState(defaultTableForm);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const [statusPending, setStatusPending] = useState<ReservationStatus | null>(null);

  const selectedReservation =
    reservations.find((reservation) => reservation.id === selectedReservationId) ?? reservations[0] ?? null;

  const eligibleTables = useMemo(() => {
    if (!selectedReservation) {
      return tables;
    }
    return tables.filter(
      (table) =>
        table.min_guest_count <= selectedReservation.guest_count &&
        selectedReservation.guest_count <= table.max_guest_count,
    );
  }, [selectedReservation, tables]);

  const summary = useMemo(
    () => ({
      total: reservations.length,
      pending: reservations.filter((item) => item.status === "pending").length,
      live: reservations.filter((item) => item.status === "confirmed" || item.status === "seated").length,
      tables: tables.length,
    }),
    [reservations, tables],
  );

  const loadRestaurants = useCallback(async () => {
    const response = await fetch("/api/proxy/admin/restaurants", { cache: "no-store" });
    const payload: ApiResponse<Restaurant[]> = await response.json();
    if (!response.ok) {
      throw new Error(extractError(payload));
    }
    const items = payload.data ?? [];
    setRestaurants(items);
    setSelectedRestaurantId((current) => current || items[0]?.id || 0);
  }, []);

  const loadReservationData = useCallback(
    async (restaurantId: number) => {
      if (!restaurantId) {
        setReservations([]);
        setTables([]);
        return;
      }

      const params = new URLSearchParams();
      if (dateFilter) {
        params.set("reservation_date", dateFilter);
      }
      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const [reservationsResponse, tablesResponse] = await Promise.all([
        fetch(
          `/api/proxy/admin/restaurants/${restaurantId}/reservations${params.size ? `?${params.toString()}` : ""}`,
          { cache: "no-store" },
        ),
        fetch(`/api/proxy/admin/restaurants/${restaurantId}/reservation-tables`, { cache: "no-store" }),
      ]);

      const reservationsPayload: ApiResponse<Reservation[]> = await reservationsResponse.json();
      const tablesPayload: ApiResponse<RestaurantTableSummary[]> = await tablesResponse.json();

      if (!reservationsResponse.ok) {
        throw new Error(extractError(reservationsPayload));
      }
      if (!tablesResponse.ok) {
        throw new Error(extractError(tablesPayload));
      }

      const nextReservations = reservationsPayload.data ?? [];
      const nextTables = tablesPayload.data ?? [];
      setReservations(nextReservations);
      setTables(nextTables);
      setSelectedReservationId((current) =>
        current && nextReservations.some((item) => item.id === current) ? current : nextReservations[0]?.id ?? null,
      );
    },
    [dateFilter, statusFilter],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        await loadRestaurants();
      } catch (caught) {
        if (!cancelled) {
          setMessage({
            text: caught instanceof Error ? caught.message : "Failed to load reservation management.",
            isError: true,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadRestaurants]);

  useEffect(() => {
    if (!selectedRestaurantId) {
      return;
    }

    let cancelled = false;

    async function loadCurrentRestaurant() {
      setLoading(true);
      setMessage(null);
      try {
        await loadReservationData(selectedRestaurantId);
      } catch (caught) {
        if (!cancelled) {
          setMessage({
            text: caught instanceof Error ? caught.message : "Failed to load reservation data.",
            isError: true,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCurrentRestaurant();

    return () => {
      cancelled = true;
    };
  }, [loadReservationData, selectedRestaurantId]);

  useEffect(() => {
    if (!selectedReservation) {
      setNote("");
      setTableId("");
      return;
    }

    setNote("");
    setTableId(selectedReservation.selected_table?.id ? String(selectedReservation.selected_table.id) : "");
  }, [selectedReservation]);

  function openCreateTable() {
    setEditingTableId(null);
    setTableForm(defaultTableForm);
    setTableModalOpen(true);
  }

  function openEditTable(table: RestaurantTableSummary) {
    setEditingTableId(table.id);
    setTableForm({
      code: table.code,
      label: table.label,
      zone: table.zone ?? "",
      min_guest_count: table.min_guest_count,
      max_guest_count: table.max_guest_count,
      status: table.status,
      sort_order: table.sort_order,
    });
    setTableModalOpen(true);
  }

  function submitStatus(status: ReservationStatus) {
    if (!selectedReservation || !selectedRestaurantId) {
      return;
    }

    setStatusPending(status);
    startTransition(async () => {
      setMessage(null);
      try {
        const response = await fetch(
          `/api/proxy/admin/restaurants/${selectedRestaurantId}/reservations/${selectedReservation.id}/status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status,
              note: note.trim() || null,
              table_id: tableId ? Number(tableId) : null,
            }),
          },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(extractError(payload));
        }
        setMessage({ text: `Reservation moved to ${formatStatus(status)}.`, isError: false });
        await loadReservationData(selectedRestaurantId);
      } catch (caught) {
        setMessage({
          text: caught instanceof Error ? caught.message : "Failed to update reservation.",
          isError: true,
        });
      } finally {
        setStatusPending(null);
      }
    });
  }

  function submitTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRestaurantId) {
      return;
    }

    startTransition(async () => {
      setMessage(null);
      try {
        const response = await fetch(
          editingTableId
            ? `/api/proxy/admin/restaurants/${selectedRestaurantId}/reservation-tables/${editingTableId}`
            : `/api/proxy/admin/restaurants/${selectedRestaurantId}/reservation-tables`,
          {
            method: editingTableId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: tableForm.code.trim(),
              label: tableForm.label.trim(),
              zone: tableForm.zone.trim() || null,
              min_guest_count: Number(tableForm.min_guest_count),
              max_guest_count: Number(tableForm.max_guest_count),
              status: tableForm.status,
              sort_order: Number(tableForm.sort_order),
            }),
          },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(extractError(payload));
        }
        setTableModalOpen(false);
        setMessage({ text: editingTableId ? "Table updated." : "Table created.", isError: false });
        await loadReservationData(selectedRestaurantId);
      } catch (caught) {
        setMessage({
          text: caught instanceof Error ? caught.message : "Failed to save reservation table.",
          isError: true,
        });
      }
    });
  }

  function deleteTable(table: RestaurantTableSummary) {
    if (!selectedRestaurantId || !window.confirm(`Delete ${table.label} from the reservation inventory?`)) {
      return;
    }

    startTransition(async () => {
      setMessage(null);
      try {
        const response = await fetch(
          `/api/proxy/admin/restaurants/${selectedRestaurantId}/reservation-tables/${table.id}`,
          { method: "DELETE" },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(extractError(payload));
        }
        setMessage({ text: "Table deleted.", isError: false });
        await loadReservationData(selectedRestaurantId);
      } catch (caught) {
        setMessage({
          text: caught instanceof Error ? caught.message : "Failed to delete table.",
          isError: true,
        });
      }
    });
  }

  return (
    <main className="space-y-5">
      <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
        <SectionHeader
          eyebrow="Reservations"
          title="Reservation Operations"
          description="Admin-level oversight for table inventory and restaurant booking queues. This is the parity bridge between today’s backend contract and the mock mobile booking flow."
        />

        {message ? (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              message.isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Reservations", value: summary.total },
            { label: "Pending", value: summary.pending },
            { label: "Live floor queue", value: summary.live },
            { label: "Tracked tables", value: summary.tables },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-line bg-wash p-5">
              <p className="text-sm text-mute">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_180px_180px_auto] xl:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Restaurant</label>
            <select
              className="w-full rounded-2xl border border-line px-4 py-3"
              value={selectedRestaurantId}
              onChange={(event) => setSelectedRestaurantId(Number(event.target.value))}
            >
              <option value={0}>Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Date</label>
            <input
              type="date"
              className="w-full rounded-2xl border border-line px-4 py-3"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Status</label>
            <select
              className="w-full rounded-2xl border border-line px-4 py-3"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDateFilter("");
                setStatusFilter("");
              }}
              className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-mute"
            >
              Reset
            </button>
            <button
              onClick={openCreateTable}
              className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Add table
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
            <h3 className="text-xl font-semibold text-ink">Reservation Queue</h3>
            <p className="mt-2 text-sm text-mute">
              This is what the merchant desktop should see at restaurant level, now available here for super-admin fallback too.
            </p>
            <div className="mt-5 space-y-4">
              {loading ? (
                <div className="text-sm text-mute">Loading reservations...</div>
              ) : reservations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line px-5 py-5 text-sm text-mute">
                  No reservations found for the current slice.
                </div>
              ) : (
                reservations.map((reservation) => (
                  <button
                    key={reservation.id}
                    onClick={() => setSelectedReservationId(reservation.id)}
                    className={`w-full rounded-3xl border p-5 text-left transition ${
                      selectedReservation?.id === reservation.id
                        ? "border-accent bg-accentSoft/40"
                        : "border-line bg-wash hover:border-accent"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-ink">{reservation.contact_name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-mute">{reservation.reservation_code}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(reservation.status)}`}>
                        {formatStatus(reservation.status)}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-mute md:grid-cols-2">
                      <p>{formatDate(reservation.reservation_date)} at {reservation.reservation_time}</p>
                      <p>{reservation.guest_count} guests</p>
                      <p>Table: {reservation.selected_table_label ?? "Not assigned"}</p>
                      <p>Occasion: {reservation.occasion ?? "Standard booking"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-ink">Reservation Tables</h3>
                <p className="mt-2 text-sm text-mute">Admin backup control for the same table inventory that merchant mode uses.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {tables.map((table) => (
                <ResourceCard
                  key={table.id}
                  title={table.label}
                  meta={`${table.code} • ${table.zone ?? "Indoor"} • ${table.min_guest_count}-${table.max_guest_count} guests`}
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-mute">
                    <span>{table.status}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditTable(table)} className="rounded-xl border border-line px-3 py-2 text-xs font-semibold hover:border-accent hover:text-ink">
                        Edit
                      </button>
                      <button onClick={() => deleteTable(table)} className="rounded-xl border border-line px-3 py-2 text-xs font-semibold hover:border-red-300 hover:text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </ResourceCard>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
          {selectedReservation ? (
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-accentDark">Selected reservation</p>
                <h3 className="mt-3 text-3xl font-semibold text-ink">{selectedReservation.contact_name}</h3>
                <p className="mt-2 text-sm text-mute">
                  {selectedReservation.restaurant_name} • {formatDate(selectedReservation.reservation_date)} at {selectedReservation.reservation_time}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["Phone", selectedReservation.contact_phone],
                  ["Email", selectedReservation.contact_email ?? "Not provided"],
                  ["Guests", String(selectedReservation.guest_count)],
                  ["Assigned table", selectedReservation.selected_table_label ?? "Not assigned"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-line bg-wash px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-mute">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">Operational note</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full rounded-2xl border border-line px-4 py-3 text-sm"
                  placeholder="Add a note for confirmation, seating, completion, or cancellation."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">Assign table</label>
                <select
                  className="w-full rounded-2xl border border-line px-4 py-3"
                  value={tableId}
                  onChange={(event) => setTableId(event.target.value)}
                >
                  <option value="">No assignment</option>
                  {eligibleTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.label} • {table.zone ?? "Indoor"} • {table.min_guest_count}-{table.max_guest_count}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">Status actions</p>
                <div className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      disabled={
                        Boolean(statusPending) ||
                        selectedReservation.status === option.value ||
                        FINAL_STATUSES.has(selectedReservation.status)
                      }
                      onClick={() => submitStatus(option.value)}
                      className="rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {statusPending === option.value ? "Updating..." : option.label}
                    </button>
                  ))}
                </div>
                {FINAL_STATUSES.has(selectedReservation.status) ? (
                  <p className="text-xs text-mute">This reservation is already in a final state.</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">Timeline</p>
                <div className="space-y-3">
                  {selectedReservation.status_events.map((event, index) => (
                    <div key={`${event.created_at}-${index}`} className="rounded-2xl border border-line bg-wash px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-ink">{formatStatus(event.status)}</p>
                        <p className="text-xs text-mute">{new Date(event.created_at).toLocaleString()}</p>
                      </div>
                      <p className="mt-2 text-sm text-mute">{event.note ?? "No note attached."}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-mute">Select a reservation to review operational details.</div>
          )}
        </div>
      </div>

      {tableModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-8">
          <div className="w-full max-w-2xl rounded-panel border border-line bg-panel p-8 shadow-panel">
            <SectionHeader
              eyebrow={editingTableId ? "Update Table" : "Create Table"}
              title={editingTableId ? "Refine this reservation table" : "Add a reservation table"}
              description="This inventory should stay aligned with the table-selection expectations already visible in the Flutter mock flow."
            />

            <form className="space-y-4" onSubmit={submitTable}>
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-line px-4 py-3" placeholder="Code" value={tableForm.code} onChange={(event) => setTableForm((current) => ({ ...current, code: event.target.value }))} />
                <input className="rounded-2xl border border-line px-4 py-3" placeholder="Label" value={tableForm.label} onChange={(event) => setTableForm((current) => ({ ...current, label: event.target.value }))} />
                <input className="rounded-2xl border border-line px-4 py-3" placeholder="Zone" value={tableForm.zone} onChange={(event) => setTableForm((current) => ({ ...current, zone: event.target.value }))} />
                <select className="rounded-2xl border border-line px-4 py-3" value={tableForm.status} onChange={(event) => setTableForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <input className="rounded-2xl border border-line px-4 py-3" type="number" min={1} value={tableForm.min_guest_count} onChange={(event) => setTableForm((current) => ({ ...current, min_guest_count: Number(event.target.value) }))} />
                <input className="rounded-2xl border border-line px-4 py-3" type="number" min={1} value={tableForm.max_guest_count} onChange={(event) => setTableForm((current) => ({ ...current, max_guest_count: Number(event.target.value) }))} />
                <input className="rounded-2xl border border-line px-4 py-3 md:col-span-2" type="number" min={0} value={tableForm.sort_order} onChange={(event) => setTableForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setTableModalOpen(false)} className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-mute">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {pending ? "Saving..." : editingTableId ? "Save changes" : "Create table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
