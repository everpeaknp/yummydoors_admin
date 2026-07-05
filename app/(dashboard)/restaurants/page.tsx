"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { ImageUpload } from "@/components/admin/image-upload";
import type { ApiResponse, Category, Restaurant } from "@/lib/types";

const defaultForm = {
  name: "",
  slug: "",
  integration_mode: "external",
  status: "active",
  primary_cuisine_label: "",
  city: "",
  area: "",
  short_description: "",
  cover_image_url: "",
  logo_url: "",
  sort_rank: 0,
  is_featured: false,
  supports_delivery: true,
  has_free_delivery: false,
  category_ids: [] as number[]
};

export default function RestaurantsPage() {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    const [restaurantsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/proxy/admin/restaurants", { cache: "no-store" }),
      fetch("/api/proxy/admin/categories", { cache: "no-store" })
    ]);

    const restaurantsPayload: ApiResponse<Restaurant[]> = await restaurantsResponse.json();
    const categoriesPayload: ApiResponse<Category[]> = await categoriesResponse.json();

    setItems(restaurantsPayload.data ?? []);
    setCategories(categoriesPayload.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function toggleCategory(categoryId: number) {
    setForm((current) => ({
      ...current,
      category_ids: current.category_ids.includes(categoryId)
        ? current.category_ids.filter((id) => id !== categoryId)
        : [...current.category_ids, categoryId]
    }));
  }

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/proxy/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cover_image_url: form.cover_image_url || null,
          logo_url: form.logo_url || null,
          primary_cuisine_label: form.primary_cuisine_label || null,
          city: form.city || null,
          area: form.area || null,
          short_description: form.short_description || null
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.detail ?? "Unable to create restaurant.");
        return;
      }
      setForm(defaultForm);
      setMessage("Restaurant created.");
      await load();
    });
  }

  return (
    <main className="space-y-5">
      <div className="rounded-panel border border-line bg-panel p-8 shadow-panel">
        <SectionHeader
          eyebrow="Restaurants"
          title="External Restaurant Ingestion"
          description="Create restaurant records directly in Doors while merchant onboarding and POS import are still being expanded."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Restaurant name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Slug (auto-generated)" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload 
              value={form.cover_image_url} 
              onChange={(url) => setForm(current => ({ ...current, cover_image_url: url }))} 
              folder="restaurants" 
              placeholder="Upload Cover Image"
              helperText="Recommended: 16:9 ratio (e.g., 1200x675px)"
            />
            <ImageUpload 
              value={form.logo_url} 
              onChange={(url) => setForm(current => ({ ...current, logo_url: url }))} 
              folder="restaurants" 
              placeholder="Upload Logo (Optional)"
              helperText="Recommended: 1:1 ratio (e.g., 400x400px)"
            />
          </div>
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Primary cuisine (e.g. Italian)" value={form.primary_cuisine_label} onChange={(event) => setForm((current) => ({ ...current, primary_cuisine_label: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Area" value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Sort rank" type="number" value={form.sort_rank} onChange={(event) => setForm((current) => ({ ...current, sort_rank: Number(event.target.value) }))} />
          <textarea className="rounded-2xl border border-line px-4 py-3 md:col-span-3" placeholder="Short description" value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} />
        </div>
        <div className="mt-5 rounded-3xl border border-line p-4">
          <p className="mb-3 text-sm font-medium text-ink">Attach categories</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm">
                <input type="checkbox" checked={form.category_ids.includes(category.id)} onChange={() => toggleCategory(category.id)} />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button onClick={submit} disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving..." : "Create restaurant"}
          </button>
          {message ? <p className="text-sm text-mute">{message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ResourceCard
            key={item.id}
            title={item.name}
            meta={`${item.primary_cuisine_label ?? "Restaurant"} · ${item.city ?? "Unknown city"}`}
          >
            <div className="space-y-2 text-sm text-mute">
              <p>Slug: {item.slug}</p>
              <p>Status: {item.status}</p>
              <p>Mode: {item.integration_mode}</p>
              <p>Categories: {item.categories.map((category) => category.name).join(", ") || "None"}</p>
            </div>
          </ResourceCard>
        ))}
      </div>
    </main>
  );
}
