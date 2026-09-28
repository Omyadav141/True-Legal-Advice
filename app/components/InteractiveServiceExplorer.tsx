"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake,
  Stamp,
  Scale,
  Building2,
  Users2,
  FileCheck,
  ShieldAlert,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { site } from "@/lib/site-config";

type Category = "all" | "core" | "property" | "corporate" | "dispute";

interface ServiceItem {
  id: string;
  title: string;
  category: "core" | "property" | "corporate" | "dispute";
  tagline: string;
  description: string;
  href: string;
  icon: typeof Scale;
  image: string;
  features: string[];
}

const serviceCatalog: ServiceItem[] = [
  {
    id: "court-marriage",
    title: "Court Marriage & Registration",
    category: "core",
    tagline: "Special Marriage Act & Personal Laws",
    description: "Complete legal assistance for marriage registration, solemnization, documentation, notice submission, and legal certificates.",
    href: "/court-marriage",
    icon: HeartHandshake,
    image: "/images/hero-marriage.png",
    features: [
      "Eligibility & documentation verification",
      "Notice of intended marriage guidance",
      "Witness & registrar appointment coordination",
      "Urgent & inter-faith consultation",
    ],
  },
  {
    id: "trademark-registration",
    title: "Trademark & IP Protection",
    category: "core",
    tagline: "Your Brand, Your Identity, Our Protection",
    description: "End-to-end trademark search, classification, brand filing, response to examination reports, and opposition management.",
    href: "/trademark-registration",
    icon: Stamp,
    image: "/images/hero-trademark.png",
    features: [
      "Prior comprehensive trademark search",
      "Class classification (Nice Classification)",
      "Filing with Controller General of Patents",
      "Replying to TM examination objections",
    ],
  },
  {
    id: "property-law",
    title: "Property & Real Estate Advisory",
    category: "property",
    tagline: "Due Diligence & Title Verification",
    description: "Thorough legal scrutiny of title deeds, ownership history, sale agreements, lease deeds, registry assistance, and property settlements.",
    href: "/legal-services",
    icon: Building2,
    image: "/images/hero-legal.png",
    features: [
      "Title search report & encumbrance checks",
      "Drafting Sale Deed, Gift Deed, Will",
      "Power of Attorney & tenancy agreements",
      "Mutation & municipal record guidance",
    ],
  },
  {
    id: "family-muslim-law",
    title: "Family & Muslim Law Advisory",
    category: "dispute",
    tagline: "Dignified & Confidential Legal Counsel",
    description: "Personalised legal consultation on marriage, maintenance, custody, settlement, succession, and Muslim Law personal matters.",
    href: "/legal-services",
    icon: Users2,
    image: "/images/hero-legal.png",
    features: [
      "Muslim Personal Law consultation",
      "Mutual settlement & mediation",
      "Succession & inheritance distribution",
      "Confidential 1-on-1 legal counsel",
    ],
  },
  {
    id: "drafting-agreements",
    title: "Legal Drafting & Business Compliance",
    category: "corporate",
    tagline: "A-Z Contracts, GST & Registrations",
    description: "Drafting bulletproof contracts, partnership deeds, NDAs, and assistance with Udyam, Gumasta, GST, and corporate setups.",
    href: "/legal-services",
    icon: FileCheck,
    image: "/images/hero-trademark.png",
    features: [
      "Commercial agreements, NDAs, MoUs",
      "Partnership & founder contracts",
      "GST, Udyam & Gumasta assistance",
      "Legal notices & rejoinders",
    ],
  },
  {
    id: "consumer-accident",
    title: "Consumer & Motor Accident Matters",
    category: "dispute",
    tagline: "Rights & Claim Representation",
    description: "Legal representation in Consumer Disputes Redressal Commissions and assistance with motor accident claims and insurance matters.",
    href: "/legal-services",
    icon: ShieldAlert,
    image: "/images/hero-home.png",
    features: [
      "Deficiency in service notices",
      "Consumer forum complaint drafting",
      "MACT claim advisory & guidance",
      "Representation before authorities",
    ],
  },
];

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All Practice Areas" },
  { id: "core", label: "Court Marriage & TM" },
  { id: "property", label: "Property & Deeds" },
  { id: "corporate", label: "Contracts & Startup" },
  { id: "dispute", label: "Family & Court Matters" },
];

export default function InteractiveServiceExplorer() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredServices = serviceCatalog.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  );

  return (
    <section className="section bg-[var(--paper)]" aria-labelledby="services-heading">
      <div className="container">
        
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end mb-10">
          <div>
            <span className="eyebrow">Comprehensive Legal Practice</span>
            <h2 id="services-heading" className="mt-2 text-3xl font-serif md:text-5xl">
              Specialized legal services
            </h2>
            <p className="mt-3 max-w-xl text-base text-[var(--ink-soft)]">
              Focused advisory and representation across Nagpur District Court, the Bombay High Court (Nagpur Bench), and IP Registry offices.
            </p>
          </div>

          <Link href="/book" className="btn-primary shimmer-badge !py-3 !px-6">
            <span>Book a Consultation</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Category Filter Tabs with Animated Pill */}
        <div className="no-scrollbar mb-10 flex overflow-x-auto pb-2 gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative whitespace-nowrap rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-[var(--paper)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--green)] bg-[var(--paper-dark)]/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 rounded-full bg-[var(--green)] shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Cards Grid */}
        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-card group flex flex-col justify-between overflow-hidden rounded-3xl"
                >
                  <div>
                    {/* Media Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-[var(--green-deep)]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-108"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--green-deep)] via-[var(--green-deep)]/40 to-transparent" />

                      {/* Floating Icon badge */}
                      <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)] text-[var(--green-deep)] shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={22} />
                      </div>

                      <div className="absolute top-4 right-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-[var(--gold-light)] backdrop-blur-md border border-white/10">
                        {service.tagline}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-bold text-[var(--green)]">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                        {service.description}
                      </p>

                      {/* Feature Checklist */}
                      <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-4">
                        {service.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink-soft)]">
                            <CheckCircle2 size={13} className="text-[var(--gold)] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="border-t border-[var(--line)] bg-[var(--paper-dark)]/30 p-5 flex items-center justify-between">
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--green)] hover:text-[var(--gold)] transition-colors no-underline"
                    >
                      <span>Service details</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href={`/book?service=${service.id === "court-marriage" ? "court-marriage" : service.id === "trademark-registration" ? "trademark" : "other"}&matter=${encodeURIComponent(service.title)}`}
                      className="rounded-full bg-[var(--gold)] px-3.5 py-1.5 text-xs font-semibold text-[var(--green-deep)] hover:bg-[var(--gold-light)] transition-colors no-underline shadow-sm"
                    >
                      Book Slot
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
