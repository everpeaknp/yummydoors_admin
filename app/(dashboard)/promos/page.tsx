"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import type { ApiResponse, Promo } from "@/lib/types";

const defaultForm = {
  title: "",
  subtitle: "",
  image_url: "",
  placement: "home_carousel",
  target_type: "none",
  target_id: 0,
  target_url: "",
  cta_text: "",
  sort_order: 0,
  is_active: true
};

export default function PromosPage() {
  const [items, setItems] = useState<Promo[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    const response = await fetch("/api/proxy/admin/promos", { cache: "no-store" });
    const payload: ApiResponse<Promo[]> = await response.json();
    setItems(payload.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/proxy/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtitle: form.subtitle || null,
          target_id: form.target_id || null,
          target_url: form.target_url || null,
          cta_text: form.cta_text || null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.detail ?? "Unable to create promo.");
        return;
      }
      setForm(defaultForm);
      setMessage("Promo created.");
      await load();
    });
  }

  return (
    <main className="space-y-5">
      <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
        <SectionHeader
          eyebrow="Promos"
          title="Homepage Merchandising"
          description="Launch and order promo cards without waiting for the future super-admin UI rewrite."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Subtitle" value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Image URL" value={form.image_url} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} />
          <select className="rounded-2xl border border-line px-4 py-3" value={form.placement} onChange={(event) => setForm((current) => ({ ...current, placement: event.target.value as Promo["placement"] }))}>
            <option value="home_carousel">Home carousel</option>
            <option value="home_banner">Home banner</option>
          </select>
          <select className="rounded-2xl border border-line px-4 py-3" value={form.target_type} onChange={(event) => setForm((current) => ({ ...current, target_type: event.target.value as Promo["target_type"] }))}>
            <option value="none">None</option>
            <option value="restaurant">Restaurant</option>
            <option value="category">Category</option>
            <option value="menu_item">Menu item</option>
            <option value="url">URL</option>
          </select>
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Target ID" type="number" value={form.target_id} onChange={(event) => setForm((current) => ({ ...current, target_id: Number(event.target.value) }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Target URL" value={form.target_url} onChange={(event) => setForm((current) => ({ ...current, target_url: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="CTA text" value={form.cta_text} onChange={(event) => setForm((current) => ({ ...current, cta_text: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Sort order" type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <label className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />
            Active
          </label>
          <button onClick={submit} disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving..." : "Create promo"}
          </button>
          {message ? <p className="text-sm text-mute">{message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ResourceCard key={item.id} title={item.title} meta={`${item.placement} · ${item.target_type}`}>
            <div className="space-y-2 text-sm text-mute">
              <p>CTA: {item.cta_text || "None"}</p>
              <p>Active: {item.is_active ? "Yes" : "No"}</p>
              <p>Target: {item.target_id ?? item.target_url ?? "None"}</p>
            </div>
          </ResourceCard>
        ))}
      </div>
    </main>
  );
}
