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
    href: "/reservations",
    title: "Reservations",
    description: "Oversee booking queues and table inventory before merchant tooling is fully rolled out."
  },
  {
    href: "/promos",
    title: "Promos",
    description: "Control homepage banners and destination routing from the same console."
  },
  {
    href: "/merchant-applications",
    title: "Merchant Approvals",
    description: "Review merchant onboarding requests and approve workspace creation."
  },
  {
    href: "/rider-applications",
    title: "Rider Approvals",
    description: "Review rider applications and grant rider access on the same user account."
  }
];

export default function DashboardPage() {
  return (
    <main className="">
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
            className="rounded-lg border border-line bg-panel p-6 shadow-sm transition hover:border-accent"
          >
            <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-mute">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
