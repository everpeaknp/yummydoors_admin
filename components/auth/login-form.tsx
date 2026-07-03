"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.detail ?? payload?.message ?? "Unable to sign in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Email or phone</label>
        <input
          name="identifier"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          placeholder="admin@yummydoors.com"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Password</label>
        <input
          name="password"
          type="password"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          placeholder="Enter your password"
          required
        />
      </div>
      {error ? (
        <div className="rounded-2xl border border-[#ffd7ce] bg-[#fff4f1] px-4 py-3 text-sm text-accentDark">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d2230] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
