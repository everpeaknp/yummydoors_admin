import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { isAuthenticated } from "@/lib/session";

export default function LoginPage() {
  if (isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-panel border border-line bg-white/75 p-10 shadow-panel backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-accentDark">YummyDoors Admin</p>
          <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-tight text-ink">
            Operate restaurants, menus, and homepage merchandising from one clean control plane.
          </h1>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "External restaurant ingestion",
              "Discovery catalog control",
              "Promo launch and routing"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-line bg-wash p-5 text-sm text-mute">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-panel border border-line bg-panel p-8 shadow-panel">
          <div className="mx-auto max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-accentDark">Super Admin Access</p>
            <h2 className="mt-5 text-4xl font-semibold text-ink">Sign in</h2>
            <p className="mt-3 text-sm leading-7 text-mute">
              Only accounts carrying the <span className="font-semibold text-ink">super_admin</span> role can enter this console.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
