"use client";

import { useEffect, useState, useTransition } from "react";

import { ResourceCard } from "@/components/admin/resource-card";
import { SectionHeader } from "@/components/admin/section-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { extractErrorMessage } from "@/lib/errors";
import { readJsonPayload } from "@/lib/http";
import type { ApiResponse, Category, MenuItem, Restaurant } from "@/lib/types";

type MenuItemForm = {
  restaurant_id: number;
  category_id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  currency_code: string;
  food_type: MenuItem["food_type"];
  is_available: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  is_popular: boolean;
};

const defaultForm: MenuItemForm = {
  restaurant_id: 0,
  category_id: 0,
  slug: "",
  name: "",
  description: "",
  image_url: "",
  price: 0,
  currency_code: "NPR",
  food_type: "veg",
  is_available: true,
  is_spicy: false,
  is_featured: false,
  is_popular: false
};

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<MenuItemForm>(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    try {
      const [itemsResponse, restaurantsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/proxy/admin/menu-items", { cache: "no-store" }),
        fetch("/api/proxy/admin/restaurants", { cache: "no-store" }),
        fetch("/api/proxy/admin/categories", { cache: "no-store" })
      ]);

      const itemsPayload = await readJsonPayload<ApiResponse<MenuItem[]>>(itemsResponse);
      const restaurantsPayload = await readJsonPayload<ApiResponse<Restaurant[]>>(restaurantsResponse);
      const categoriesPayload = await readJsonPayload<ApiResponse<Category[]>>(categoriesResponse);

      if (!itemsResponse.ok) {
        throw new Error(extractErrorMessage(itemsPayload, "Failed to load menu items."));
      }
      if (!restaurantsResponse.ok) {
        throw new Error(extractErrorMessage(restaurantsPayload, "Failed to load restaurants."));
      }
      if (!categoriesResponse.ok) {
        throw new Error(extractErrorMessage(categoriesPayload, "Failed to load categories."));
      }

      setItems(itemsPayload?.data ?? []);
      setRestaurants(restaurantsPayload?.data ?? []);
      setCategories(categoriesPayload?.data ?? []);
    } catch {
      setItems([]);
      setRestaurants([]);
      setCategories([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function submit() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/proxy/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id || null,
          image_url: form.image_url || null,
          description: form.description || null
        })
      });
      const payload = await readJsonPayload(response);
      if (!response.ok) {
        setMessage(extractErrorMessage(payload, "Unable to create menu item."));
        return;
      }
      setForm(defaultForm);
      setMessage("Menu item created.");
      await load();
    });
  }

  return (
    <main className="space-y-5">
      <div className="">
        <SectionHeader
          eyebrow="Menu"
          title="Menu Item Ingestion"
          description="Seed or correct menu inventory while merchant self-serve tools and POS pulls are still unfinished."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select className="rounded-2xl border border-line px-4 py-3" value={form.restaurant_id} onChange={(event) => setForm((current) => ({ ...current, restaurant_id: Number(event.target.value) }))}>
            <option value={0}>Select restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-line px-4 py-3" value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: Number(event.target.value) }))}>
            <option value={0}>Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Menu item name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Slug (auto-generated)" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <input className="rounded-2xl border border-line px-4 py-3" placeholder="Price (NPR)" type="number" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
          <div className="md:col-span-2 xl:col-span-3">
            <ImageUpload 
              value={form.image_url} 
              onChange={(url) => setForm(current => ({ ...current, image_url: url }))} 
              folder="menu-items" 
              placeholder="Upload Menu Item Image"
              helperText="Recommended: 1:1 ratio (e.g., 600x600px)"
            />
          </div>
          <select
            className="rounded-2xl border border-line px-4 py-3"
            value={form.food_type ?? "veg"}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                food_type: event.target.value as MenuItem["food_type"]
              }))
            }
          >
            <option value="veg">Veg</option>
            <option value="non_veg">Non veg</option>
            <option value="vegan">Vegan</option>
          </select>
          <textarea className="rounded-2xl border border-line px-4 py-3 md:col-span-3" placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["is_available", "Available"],
            ["is_spicy", "Spicy"],
            ["is_featured", "Featured"],
            ["is_popular", "Popular"]
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof typeof form])}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.checked
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button onClick={submit} disabled={pending} className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving..." : "Create menu item"}
          </button>
          {message ? <p className="text-sm text-mute">{message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <ResourceCard key={item.id} title={item.name} meta={`${item.currency_code} ${item.price}`}>
            <div className="space-y-2 text-sm text-mute">
              <p>Slug: {item.slug}</p>
              <p>Restaurant ID: {item.restaurant_id}</p>
              <p>Category ID: {item.category_id ?? "None"}</p>
            </div>
          </ResourceCard>
        ))}
      </div>
    </main>
  );
}
