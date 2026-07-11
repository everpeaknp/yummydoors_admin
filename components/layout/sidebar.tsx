"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, Blocks, CalendarDays, LayoutDashboard, Shapes, Store, Tag } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: Shapes },
  { href: "/restaurants", label: "Restaurants", icon: Store },
  { href: "/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/merchant-applications", label: "Merchant Approvals", icon: Store },
  { href: "/rider-applications", label: "Rider Approvals", icon: Bike },
  { href: "/menu-items", label: "Menu Items", icon: Blocks },
  { href: "/promos", label: "Promos", icon: Tag }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col rounded-panel border border-line bg-panel p-4 shadow-panel">
      <div className="mb-8 rounded-3xl bg-accentSoft p-4">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-accentDark">YummyDoors</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Admin Console</h1>
        <p className="mt-2 text-sm leading-6 text-mute">
          Super-admin control for restaurant ingestion, menu publishing, and homepage merchandising.
        </p>
      </div>
      <nav className="space-y-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-ink text-white"
                  : "text-mute hover:bg-wash hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
