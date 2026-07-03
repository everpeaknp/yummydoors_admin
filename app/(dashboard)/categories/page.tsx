"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import type { ApiResponse, Category } from "@/lib/types";

const defaultForm = {
  slug: "",
  name: "",
  icon_url: "",
  sort_order: 0,
  is_featured: true,
  is_active: true
};

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    const response = await fetch("/api/proxy/admin/categories", { cache: "no-store" });
    const payload: ApiResponse<Category[]> = await response.json();
    setItems(payload.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/proxy/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          icon_url: form.icon_url || null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.detail ?? "Unable to create category.");
        return;
      }
      setForm(defaultForm);
      setMessage("Category created.");
      await load();
    });
  }

  return (
    <main className="space-y-5">
      <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
        <SectionHeader
          eyebrow="Categories"
          title="Discovery Categories"
          description="Use this first before merchant tooling exists. These categories drive homepage grouping and restaurant organization."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Icon URL" value={form.icon_url} onChange={(event) => setForm((current) => ({ ...current, icon_url: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Sort order" type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} />
          <label className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3"><input type="checkbox" checked={form.is_featured} onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))} />Featured</label>
          <label className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />Active</label>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button onClick={submit} disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving..." : "Create category"}
          </button>
          {message ? <p className="text-sm text-mute">{message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ResourceCard key={item.id} title={item.name} meta={item.slug}>
            <div className="space-y-2 text-sm text-mute">
              <p>Sort order: {item.sort_order}</p>
              <p>Featured: {item.is_featured ? "Yes" : "No"}</p>
              <p>Active: {item.is_active ? "Yes" : "No"}</p>
            </div>
          </ResourceCard>
        ))}
      </div>
    </main>
  );
}
