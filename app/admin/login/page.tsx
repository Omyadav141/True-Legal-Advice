"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Loader2, Lock, Mail } from "lucide-react";
import { site } from "@/lib/site-config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid email or password.");
        setStatus("error");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMsg("Could not connect. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-5 py-16">
      <div className="fade-up w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_rgba(18,53,38,0.16)] md:grid md:grid-cols-5">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-[var(--green-deep)] p-10 md:col-span-2 md:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, var(--gold-light) 0, transparent 45%), radial-gradient(circle at 85% 80%, var(--gold-light) 0, transparent 40%)",
            }}
          />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(203,167,88,0.45)]">
              <Scale size={22} color="var(--gold-light)" aria-hidden="true" />
            </div>
            <p className="eyebrow eyebrow-light mt-8">Staff area</p>
            <h1 className="mt-3 text-2xl leading-snug text-[var(--paper)]">
              {site.businessName}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(250,247,240,0.65)]">
              Manage consultation bookings, confirm appointments, and keep the
              practice calendar in order.
            </p>
          </div>
          <p className="relative text-xs text-[rgba(250,247,240,0.45)]">
            Adv. {site.lawyerName} &middot; {site.city}
          </p>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10 md:col-span-3 md:p-12">
          <div className="mb-8 md:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--green)]">
              <Scale size={20} color="var(--gold-light)" aria-hidden="true" />
            </div>
            <h1 className="text-2xl">Staff login</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {site.businessName} admin dashboard
            </p>
          </div>

          <div className="mb-8 hidden md:block">
            <h2 className="text-2xl">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to view and manage booking requests.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email">Email</label>
              <div className="relative">
                <Mail
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="input"
                  style={{ paddingLeft: 44 }}
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="input"
                  style={{ paddingLeft: 44 }}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[var(--danger)]"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary mt-1 w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="spin" aria-hidden="true" />
                  Signing in&hellip;
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
