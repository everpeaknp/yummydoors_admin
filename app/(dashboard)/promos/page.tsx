"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { ImageUpload } from "@/components/admin/image-upload";
import type { ApiResponse, Promo } from "@/lib/types";

const defaultForm = {
  id: undefined as number | undefined,
  title: "",
  subtitle: "",
  image_url: "",
  image_url_mobile: "",
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
      const url = form.id ? `/api/proxy/admin/promos/${form.id}` : "/api/proxy/admin/promos";
      const method = form.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtitle: form.subtitle || null,
          image_url_mobile: form.image_url_mobile || null,
          target_id: form.target_id || null,
          target_url: form.target_url || null,
          cta_text: form.cta_text || null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.detail ?? "Unable to save promo.");
        return;
      }
      setForm(defaultForm);
      setMessage(form.id ? "Promo updated." : "Promo created.");
      await load();
    });
  }

  function deletePromo(id: number) {
    if (!confirm("Are you sure you want to delete this promo?")) return;
    startTransition(async () => {
      const response = await fetch(`/api/proxy/admin/promos/${id}`, { method: "DELETE" });
      if (response.ok) {
        await load();
      }
    });
  }

  function editPromo(item: Promo) {
    setForm({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || "",
      image_url: item.image_url,
      image_url_mobile: item.image_url_mobile || "",
      placement: item.placement,
      target_type: item.target_type,
      target_id: item.target_id || 0,
      target_url: item.target_url || "",
      cta_text: item.cta_text || "",
      sort_order: item.sort_order,
      is_active: item.is_active
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload 
              value={form.image_url} 
              onChange={(url) => setForm(current => ({ ...current, image_url: url }))} 
              folder="promos" 
              placeholder="Upload Desktop Banner"
              helperText="Recommended: 16:9 ratio (e.g., 1200x675px)"
            />
            <ImageUpload 
              value={form.image_url_mobile} 
              onChange={(url) => setForm(current => ({ ...current, image_url_mobile: url }))} 
              folder="promos" 
              placeholder="Upload Mobile Banner (Optional)"
              helperText="Recommended: 1:1 or 4:5 ratio (e.g., 800x800px)"
            />
          </div>
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
          <button onClick={() => setForm(defaultForm)} disabled={pending} className="rounded-2xl px-5 py-3 text-sm font-semibold text-mute hover:bg-wash">
            Clear
          </button>
          <button onClick={submit} disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving..." : form.id ? "Update promo" : "Create promo"}
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
              <div className="mt-4 flex gap-3 pt-2">
                <button onClick={() => editPromo(item)} className="text-ink hover:underline">Edit</button>
                <button onClick={() => deletePromo(item.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </ResourceCard>
        ))}
      </div>
    </main>
  );
}
