"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Building2,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Phone,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site-config";

interface CardItem {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  shortDesc: string;
  bullets: string[];
  metaLabel: string;
  metaValue: string;
  href: string;
  ctaText: string;
  icon: any;
  ambientGlow: string;
}

const ACCENTURE_CARDS: CardItem[] = [
  {
    id: "card-advocate",
    tag: "ADVOCATE PROFILE & CREDENTIALS",
    tagColor: "#cba758",
    tagBg: "rgba(203, 167, 88, 0.12)",
    title: "High Court & District Court Legal Advocacy",
    shortDesc:
      "Adv. Shareen Hussain (B.Com, M.Com, LL.B) — Registered Trade Mark Attorney and High Court Advocate delivering ethical, strategic, and transparent counsel.",
    bullets: [
      "Bar Council of Maharashtra & Goa registered",
      "Bombay High Court (Nagpur Bench) & District Courts",
      "Chamber: Trisharan Square, Nagpur - 440027",
      "Direct Helpline: +91 83296 31199",
    ],
    metaLabel: "PRACTICE JURISDICTION",
    metaValue: "Nagpur High Court & District Courts",
    href: "/about",
    ctaText: "View Full Profile",
    icon: Scale,
    ambientGlow: "radial-gradient(circle at 50% 100%, rgba(203, 167, 88, 0.22), transparent 70%)",
  },
  {
    id: "card-marriage",
    tag: "COURT & LOVE MARRIAGE",
    tagColor: "#38bdf8",
    tagBg: "rgba(56, 189, 248, 0.12)",
    title: "Court Marriage & Legal Registration",
    shortDesc:
      "Step-by-step lawful registration under the Special Marriage Act 1954 and Hindu Marriage Act 1955 with complete privacy and witness guidance.",
    bullets: [
      "Special Marriage Act 1954 (No religion change needed)",
      "Hindu Marriage Act & Nikahnama registration",
      "Article 21 legal security & police protection advisory",
      "Official government marriage certificate issued",
    ],
    metaLabel: "LEGAL PATHWAYS",
    metaValue: "Special Marriage & Personal Law",
    href: "/court-marriage",
    ctaText: "Court Marriage Guide",
    icon: Heart,
    ambientGlow: "radial-gradient(circle at 50% 100%, rgba(56, 189, 248, 0.22), transparent 70%)",
  },
  {
    id: "card-startup",
    tag: "TRADEMARK & CORPORATE IP",
    tagColor: "#a78bfa",
    tagBg: "rgba(167, 139, 250, 0.12)",
    title: "Trademark & Intellectual Property Rights",
    shortDesc:
      "Certified Trade Mark Attorney services for brand protection, logo trademarks (Class 1-45), copyright, company incorporation, and business compliance.",
    bullets: [
      "Trademark (™/®) Search, Filing & Objections",
      "Copyright Registration for logos & creative assets",
      "Pvt Ltd, LLP & One Person Company Setup",
      "MSME (Udyam) & GUMASTA / Shop Act License",
    ],
    metaLabel: "FOUNDER MANDATE",
    metaValue: "True Legal Advice · securemybrand.in",
    href: "/trademark-registration",
    ctaText: "Explore IP Services",
    icon: Sparkles,
    ambientGlow: "radial-gradient(circle at 50% 100%, rgba(167, 139, 250, 0.22), transparent 70%)",
  },
  {
    id: "card-chamber",
    tag: "CHAMBER PRACTICE & SCHEDULE",
    tagColor: "#34d399",
    tagBg: "rgba(52, 211, 153, 0.12)",
    title: "Daily Walk-In Desk & Court Documentation",
    shortDesc:
      "Structured walk-in desk for property due diligence, sale deeds, wills, bail matters, consumer disputes, and active litigation.",
    bullets: [
      "Morning Walk-in Desk: 9:30 AM – 11:00 AM",
      "Evening Walk-in Desk: 5:30 PM – 8:30 PM",
      "Property Title Search, Sale Deeds & Wills",
      "Civil, Criminal, MACT & Family Court Litigation",
    ],
    metaLabel: "DAILY TIMINGS",
    metaValue: "9:30–11:00 AM & 5:30–8:30 PM",
    href: "/contact",
    ctaText: "Chamber Directions",
    icon: Building2,
    ambientGlow: "radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.22), transparent 70%)",
  },
];

function AccentureCompactCard({ card, index }: { card: CardItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -4;
    const tiltY = ((x - centerX) / centerX) * 4;
    setTilt({ x: tiltX, y: tiltY });
  };

  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="relative flex flex-col h-[440px]"
      style={{ perspective: 1000 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTilt({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
            : "rotateX(0deg) rotateY(0deg) translateY(0px)",
          transition: isHovered
            ? "transform 0.12s ease-out, box-shadow 0.25s ease, border-color 0.25s ease"
            : "transform 0.4s ease-out, box-shadow 0.4s ease, border-color 0.4s ease",
          boxShadow: isHovered
            ? "0 22px 50px -10px rgba(0, 0, 0, 0.75), 0 0 25px rgba(203, 167, 88, 0.2)"
            : "0 8px 25px -5px rgba(0, 0, 0, 0.35)",
          borderColor: isHovered
            ? "rgba(203, 167, 88, 0.65)"
            : "rgba(255, 255, 255, 0.12)",
        }}
        className="group relative h-full flex flex-col justify-between rounded-xl overflow-hidden p-6 border bg-[#09090b] text-white transition-all select-text"
      >
        {/* Dynamic Cursor Spotlight Effect */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.14), transparent 75%)`,
            }}
          />
        )}

        {/* Ambient bottom glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-75"
          style={{ background: card.ambientGlow }}
        />

        {/* Top Tag & Icon */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <span
            className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border border-white/10"
            style={{ color: card.tagColor, background: card.tagBg }}
          >
            {card.tag}
          </span>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/10 border border-white/15 text-white group-hover:scale-110 group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
            <Icon size={16} />
          </div>
        </div>

        {/* Card Title & Dynamic Expandable Content */}
        <div className="relative z-10 my-auto">
          <h3
            style={{ color: "#ffffff" }}
            className="text-lg sm:text-xl font-serif font-bold text-white leading-snug tracking-tight group-hover:text-[var(--gold-light)] transition-colors"
          >
            {card.title}
          </h3>

          {/* Animate between default short summary and hover-revealed details */}
          <div className="relative mt-3 min-h-[140px] overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {!isHovered ? (
                <motion.div
                  key="default-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-4">
                    {card.shortDesc}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--gold-light)]">
                    <span>Hover to expand details</span>
                    <ChevronRight size={13} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="hover-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-2 pt-1"
                >
                  {card.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-200">
                      <span className="text-[var(--gold-light)] mt-0.5 shrink-0 font-bold">•</span>
                      <span className="leading-snug">{b}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Clean Action CTA Link */}
        <div className="relative z-10 pt-3 border-t border-white/10 mt-auto">
          <Link
            href={card.href}
            className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md group/btn hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: "#cba758",
              color: "#000000",
            }}
          >
            <span className="font-semibold tracking-wide" style={{ color: "#000000" }}>
              {card.ctaText}
            </span>
            <div className="h-6 w-6 rounded-lg bg-black/10 flex items-center justify-center transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5">
              <ArrowUpRight size={14} style={{ color: "#000000" }} />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OfficialCredentialsGallery() {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-[var(--border)] relative overflow-hidden">
      <div className="container relative z-10">
        {/* Section Header matching OneAim / Accenture layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#cba758] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#cba758]" />
              <span>LEGAL PRACTICE & DIRECTIVES</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] tracking-tight leading-tight">
              Strategic legal counsel, decisive execution
            </h2>

            <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)] leading-relaxed">
              Official chamber notices, authorized mandates, and strategic legal advisory across Nagpur High Court and District Courts.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)] hover:text-black transition-colors no-underline"
            >
              <span>VIEW ALL PRACTICE AREAS & CREDENTIALS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid - Compact, Fixed Height, Accenture Hover Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACCENTURE_CARDS.map((card, idx) => (
            <AccentureCompactCard key={card.id} card={card} index={idx} />
          ))}
        </div>

        {/* Bottom Chamber Direct Helpline Strip */}
        <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-[var(--gold)] font-bold">
                DIRECT CHAMBER HELPLINE & WHATSAPP
              </p>
              <h4 className="text-lg font-bold text-[var(--ink)] mt-0.5">
                +91 83296 31199 · Trisharan Square, Nagpur
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to schedule a private consultation.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-md flex items-center gap-2"
            >
              <Phone size={14} />
              <span>WhatsApp Legal Desk</span>
            </a>

            <Link
              href="/book"
              className="btn-primary shimmer-badge !py-2.5 !px-6 text-xs whitespace-nowrap"
            >
              <span>Book Appointment Slot</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
