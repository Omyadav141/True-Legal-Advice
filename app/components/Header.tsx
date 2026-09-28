"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { site } from "@/lib/site-config";
import Logo from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/trademark-registration", label: "Trademark" },
  { href: "/legal-services", label: "Legal services" },
  { href: "/court-marriage", label: "Court marriage" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderColor: "var(--line)" }}>
      <div className="container flex h-[72px] items-center justify-between gap-3">
        <Link href="/" className="no-underline flex-shrink-0" aria-label={`${site.businessName} — home`}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 xl:gap-4 lg:flex flex-nowrap" aria-label="Main navigation">
          {navLinks.map((link) => {
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
          <Link href="/book" className="btn-primary shimmer-badge !py-2.5 !px-5 text-[13.5px] whitespace-nowrap flex-shrink-0">
            <span>Book appointment</span>
            <ArrowRight size={14} />
          </Link>
        </nav>

        {/* Mobile: call + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            aria-label={`Call ${site.phone}`}
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "#f4f4f5", color: "#09090b" }}
          >
            <Phone size={18} />
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none"
            style={{ background: "#09090b", color: "#ffffff" }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t lg:hidden"
            style={{ background: "var(--paper)", borderColor: "var(--line)" }}
          >
            <nav className="container flex flex-col py-4" aria-label="Mobile navigation">
              {navLinks.map((link, i) => {
                const active = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b py-4 text-base no-underline"
                      style={{
                        color: active ? "var(--ink)" : "var(--ink-soft)",
                        fontWeight: active ? 700 : 500,
                        borderColor: "var(--paper-dark)",
                      }}
                    >
                      {link.label}
                      <ArrowRight size={16} style={{ color: "var(--gold)" }} />
                    </Link>
                  </motion.div>
                );
              })}
              <div className="flex flex-col gap-3 pb-2 pt-5">
                <Link href="/book" className="btn-primary w-full">
                  Book appointment <ArrowRight size={16} />
                </Link>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn-secondary w-full">
                  <Phone size={16} /> Call {site.phone}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
