"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { extractErrorMessage } from "@/lib/errors";
import { readJsonPayload } from "@/lib/http";
import type { ApiResponse, Category } from "@/lib/types";

const defaultForm = {
  id: undefined as number | undefined,
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
    try {
      const response = await fetch("/api/proxy/admin/categories", { cache: "no-store" });
      const payload = await readJsonPayload<ApiResponse<Category[]>>(response);
      if (!response.ok) {
        throw new Error(extractErrorMessage(payload, "Failed to load categories."));
      }
      setItems(payload?.data ?? []);
    } catch (caught) {
      setItems([]);
      setMessage(caught instanceof Error ? caught.message : "Failed to load categories.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const url = form.id ? `/api/proxy/admin/categories/${form.id}` : "/api/proxy/admin/categories";
      const method = form.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          sort_order: form.sort_order,
          is_featured: form.is_featured,
          is_active: form.is_active,
          icon_url: form.icon_url || null
        })
      });
      const payload = await readJsonPayload(response);
      if (!response.ok) {
        setMessage(
          extractErrorMessage(payload, form.id ? "Unable to update category." : "Unable to create category.")
        );
        return;
      }
      setForm(defaultForm);
      setMessage(form.id ? "Category updated." : "Category created.");
      await load();
    });
  }

  function edit(item: Category) {
    setForm({
      id: item.id,
      slug: item.slug,
      name: item.name,
      icon_url: item.icon_url || "",
      sort_order: item.sort_order,
      is_featured: item.is_featured,
      is_active: Boolean(item.is_active)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Category name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Slug (auto-generated)" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Sort order" type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} />
          <div className="md:col-span-2 xl:col-span-3">
            <ImageUpload 
              value={form.icon_url} 
              onChange={(url) => setForm(current => ({ ...current, icon_url: url }))} 
              folder="categories" 
              placeholder="Upload Category Icon"
              helperText="Recommended: Transparent PNG, 1:1 ratio (e.g., 200x200px)"
            />
          </div>
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
          <ResourceCard 
            key={item.id} 
            title={item.name} 
            meta={item.slug}
            action={
              <button 
                onClick={() => edit(item)} 
                className="rounded bg-ink/10 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink/20"
              >
                Edit
              </button>
            }
          >
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
