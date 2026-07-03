import Link from "next/link";

import { SectionHeader } from "@/components/admin/section-header";

const cards = [
  {
    href: "/restaurants",
    title: "Restaurants",
    description: "Create external restaurant records, set discovery state, and attach categories."
  },
  {
    href: "/categories",
    title: "Categories",
    description: "Shape homepage discovery rails before merchant tools exist."
  },
  {
    href: "/menu-items",
    title: "Menu Items",
    description: "Seed or correct restaurant menus while POS ingestion is still being built."
  },
  {
    href: "/promos",
    title: "Promos",
    description: "Control homepage banners and destination routing from the same console."
  }
];

export default function DashboardPage() {
  return (
    <main className="rounded-panel border border-line bg-panel p-8 shadow-panel">
      <SectionHeader
        eyebrow="Overview"
        title="Admin Surface Ready"
        description="This console is wired for the first super-admin ingestion phase. You can now manage core discovery objects directly against the backend while POS import and merchant-facing tools are still being built."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-3xl border border-line bg-wash p-6 transition hover:border-accent"
          >
            <h3 className="text-xl font-semibold text-ink">{card.title}</h3>
            <p className="mt-3 text-sm leading-7 text-mute">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
