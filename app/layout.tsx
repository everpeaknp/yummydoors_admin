import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";

import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "YummyDoors Admin",
  description: "Super-admin control center for YummyDoors"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
