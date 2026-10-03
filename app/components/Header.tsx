"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ArrowRight,
  Scale,
  ShieldCheck,
  Briefcase,
  HeartHandshake,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { site } from "@/lib/site-config";
import Logo from "./Logo";

const desktopNavLinks = [
  { href: "/", label: "Home" },
  { href: "/trademark-registration", label: "Trademark" },
  { href: "/legal-services", label: "Legal services" },
  { href: "/court-marriage", label: "Court marriage" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const mobileGridLinks = [
  { href: "/", label: "Home", icon: Scale },
  { href: "/about", label: "About Adv.", icon: User },
  { href: "/trademark-registration", label: "Trademark", icon: ShieldCheck },
  { href: "/legal-services", label: "Legal services", icon: Briefcase },
  { href: "/court-marriage", label: "Court marriage", icon: HeartHandshake },
  { href: "/contact", label: "Contact desk", icon: MessageSquare },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ================= DESKTOP STICKY NAVBAR (lg:flex) ================= */}
      <header
        className="sticky top-0 z-40 hidden lg:block border-b"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--line)",
        }}
      >
        <div className="container flex h-[72px] items-center justify-between gap-3">
          <Link href="/" className="no-underline flex-shrink-0" aria-label={`${site.businessName} — home`}>
            <Logo />
          </Link>

          <nav className="flex items-center gap-2 xl:gap-4 flex-nowrap" aria-label="Main navigation">
            {desktopNavLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1.5 text-[14px] font-medium no-underline transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{
                    color: active ? "var(--ink)" : "var(--ink-soft)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full bg-[var(--paper-dark)] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="whitespace-nowrap">{link.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--gold)] rounded-full" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/book"
              className="btn-primary shimmer-badge !py-2.5 !px-5 text-[13.5px] whitespace-nowrap flex-shrink-0"
            >
              <span>Book appointment</span>
              <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ================= MOBILE DYNAMIC ISLAND FLOATING CAPSULE (lg:hidden) ================= */}
      <div className="lg:hidden">
        {/* Floating Capsule Bar */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0a0d14]/90 backdrop-blur-xl border border-[#cba758]/40 shadow-[0_10px_35px_rgba(0,0,0,0.65)] text-white select-none">
          {/* 1. TLA Logo / Monogram */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 active:scale-95 transition-transform no-underline"
            aria-label="True Legal Advice Home"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#cba758] to-amber-200 text-black flex items-center justify-center font-bold shadow-xs">
              <Scale size={12} strokeWidth={2.5} />
            </div>
            <span className="font-serif font-extrabold text-[13px] tracking-tight text-white flex items-center">
              TLA<span className="text-[#cba758] font-mono text-base leading-none">.</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="h-3.5 w-[1px] bg-white/20" />

          {/* 2. Direct Chamber Call Button */}
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            aria-label={`Call Chambers at ${site.phone}`}
            className="h-7 w-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center active:scale-90 hover:bg-emerald-900 transition-all shadow-xs"
            title="Call Chambers Desk"
          >
            <Phone size={12} className="animate-pulse" />
          </a>

          {/* Divider */}
          <div className="h-3.5 w-[1px] bg-white/20" />

          {/* 3. 3-Lines Menu / Close Toggle Icon */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`h-7 w-7 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
              open
                ? "bg-[#cba758] text-black shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {open ? <X size={15} strokeWidth={2.5} /> : <Menu size={15} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Mobile Menu Backdrop Overlay */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs"
            />
          )}
        </AnimatePresence>

        {/* Floating 2-Column Grid Card Menu (anchored under Dynamic Island) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[360px] bg-[#0c1017]/95 backdrop-blur-2xl border border-[#cba758]/35 shadow-[0_24px_64px_rgba(0,0,0,0.85)] rounded-3xl p-4 sm:p-5 text-white overflow-hidden"
            >
              {/* Card Header Strip */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-black text-[#cba758] border border-[#cba758]/40 flex items-center justify-center font-bold">
                    <Scale size={14} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-white leading-none">
                      {site.businessName}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                      Adv. {site.lawyerName} · {site.city}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Chamber Open</span>
                </span>
              </div>

              {/* 2-Column Grid Navigation (Matches portfolio layout) */}
              <div className="grid grid-cols-2 gap-2 my-3.5">
                {mobileGridLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all active:scale-95 no-underline text-xs ${
                        active
                          ? "bg-[#cba758]/20 text-[#cba758] font-bold border border-[#cba758]/40 shadow-xs"
                          : "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-transparent font-medium"
                      }`}
                    >
                      <item.icon
                        size={14}
                        className={active ? "text-[#cba758]" : "text-zinc-400"}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Primary Action Button */}
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all no-underline mb-2.5"
              >
                <span>Book Consultation</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>

              {/* Quick Contact Bar */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 text-[11px] font-semibold">
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 no-underline transition-colors"
                >
                  <Phone size={12} className="text-[#cba758]" />
                  <span>Call Chambers</span>
                </a>
                <a
                  href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
                    "Hello Adv. Shareen, I would like to inquire about a legal consultation."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-emerald-300 flex items-center justify-center gap-1.5 no-underline transition-colors border border-emerald-500/20"
                >
                  <MessageSquare size={12} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
