"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone, ShieldCheck, Scale, Clock, CheckCircle2 } from "lucide-react";
import { site } from "@/lib/site-config";
import GoogleRating from "./GoogleRating";
import OrganicParticleCanvas from "./OrganicParticleCanvas";

export default function NewGenHero() {
  return (
    <section className="relative min-h-[92svh] flex items-center overflow-hidden bg-[var(--green-deep)] text-[var(--paper)]">
      {/* Organic particle animation background (Accenture-style) */}
      <OrganicParticleCanvas />

      {/* Modern gradient aurora overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--green-deep)]/40 via-transparent to-[var(--green-deep)]/60" style={{ zIndex: 2 }} />
      <div className="pointer-events-none absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-[var(--gold)]/10 blur-[120px]" style={{ zIndex: 2 }} />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-[450px] w-[450px] rounded-full bg-[var(--green-light)]/20 blur-[100px]" style={{ zIndex: 2 }} />

      <div className="container relative py-16 md:py-24" style={{ zIndex: 10 }}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7">
            {/* Live Status Chip */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-[var(--gold)]/30 bg-[var(--green)]/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--paper)] backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>Advocate & Trade Mark Attorney</span>
              <span className="text-[var(--gold-light)] font-mono">· Trisharan Sq., Nagpur</span>
              <span className="rounded bg-[var(--gold)]/20 px-2 py-0.5 text-[10px] text-[var(--gold-light)] font-bold">
                Private legal guidance
              </span>
            </motion.div>

            {/* Main Headline with Staggered Entrance */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mt-6 text-4xl font-serif leading-[1.08] sm:text-5xl md:text-6xl text-balance"
              style={{ color: "var(--paper)" }}
            >
              Trusted legal help,
              <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-light)] via-[var(--gold)] to-[var(--gold-light)]">
                made simple & clear.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mt-5 max-w-xl text-base leading-relaxed md:text-lg text-[var(--paper)]/85"
            >
              Founded by <Link href="/about" className="font-semibold text-[var(--gold-light)] hover:text-white underline decoration-[var(--gold)] underline-offset-4 transition-colors">Adv. {site.lawyerName}</Link>, True Legal Advice provides structured legal consultation, documentation, and court representation across the District Court and Bombay High Court, Nagpur Bench.
            </motion.p>

            {/* CTAs with interactive hover & shimmer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/book"
                className="btn-primary shimmer-badge group !py-3.5 !px-7 shadow-lg shadow-[var(--gold)]/20"
              >
                <span>Book a Consultation</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="btn-light group !py-3.5 !px-6"
              >
                <Phone size={16} className="text-[var(--gold-light)] group-hover:scale-110 transition-transform" />
                <span>Call {site.phone}</span>
              </a>
            </motion.div>

            {/* Quick Guarantees / Micro Trust Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-3 text-xs text-[var(--paper)]/75"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                <ShieldCheck size={14} className="text-[var(--gold-light)]" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                <Scale size={14} className="text-[var(--gold-light)]" />
                <span>High Court & District Court</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                <Clock size={14} className="text-[var(--gold-light)]" />
                <span>30-Min Fast Track Slots</span>
              </div>
            </motion.div>

            <div className="mt-8">
              <GoogleRating />
            </div>
          </div>

          {/* Right Column: Floating Interactive Glass Card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="animate-float relative w-full max-w-md rounded-3xl glass-dark p-6 sm:p-8"
            >
              {/* Card Header with Advocate Badge */}
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-[var(--gold)]/40 shadow-inner">
                    <Image
                      src={site.advocateDeskPhoto}
                      alt={`Adv. ${site.lawyerName}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-bold !text-[var(--paper)]" style={{ color: "var(--paper)" }}>
                      Adv. {site.lawyerName}
                    </h2>
                    <p className="text-xs text-[var(--gold-light)] font-medium">
                      Founder, True Legal Advice
                    </p>
                    <span className="text-[11px] text-[var(--paper)]/60">
                      Nagpur, Maharashtra
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Card Body: Interactive Practice Areas List */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-light)]">
                  Primary Practice Pillars
                </p>

                <div className="space-y-2 text-xs">
                  {[
                    { label: "Court Marriage & Registration", badge: "Same-Day Advice" },
                    { label: "Trademark & Brand IP Filing", badge: "All India" },
                    { label: "Property Title Verification & Deeds", badge: "Nagpur & Suburbs" },
                    { label: "Family & Muslim Law Consultation", badge: "Confidential" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors px-3 py-2 border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-[var(--gold-light)] shrink-0" />
                        <span className="text-[var(--paper)]/90">{item.label}</span>
                      </div>
                      <span className="rounded bg-[var(--gold)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--gold-light)]">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Booking Strip in the card */}
              <div className="mt-6 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--gold)]/15 to-transparent p-4 text-center">
                <p className="text-xs text-[var(--paper)]/80">
                  Online Video Call or In-Person Office Session
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/book"
                    className="flex-1 rounded-full bg-[var(--gold)] py-2.5 text-xs font-bold text-[var(--green-deep)] transition-all hover:bg-[var(--gold-light)] text-center no-underline"
                  >
                    Select Slot Now
                  </Link>
                  <a
                    href={`https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Adv. Shareen Hussain, I would like to enquire about a legal consultation.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-[var(--paper)] hover:bg-white/20 transition-all no-underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
