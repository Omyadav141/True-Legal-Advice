"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Video, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Pick your 30-minute slot",
    subtitle: "Transparent schedule",
    description: "Choose online video call or in-person office consultation in Nagpur. Select an open slot from our live calendar in under a minute.",
    icon: Calendar,
    highlights: ["Live slot availability", "Instant booking request", "Zero confusing forms"],
  },
  {
    step: "02",
    title: "Staff confirmation & Meet link",
    subtitle: "Prompt verification",
    description: "Our legal secretary confirms your slot and automatically shares your Google Meet room link or office coordinates via WhatsApp.",
    icon: CheckCircle2,
    highlights: ["Direct WhatsApp link delivery", "Flexible rescheduling", "Document pre-check"],
  },
  {
    step: "03",
    title: "1-on-1 Advocate consultation",
    subtitle: "Clear legal strategy",
    description: "Meet Adv. Shareen Hussain directly. Review documents, analyze legal risks, and get actionable next steps for court or registration.",
    icon: Video,
    highlights: ["100% confidential discussion", "Practical roadmap", "No unnecessary litigation"],
  },
];

export default function LegalProcessRoadmap() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="section bg-[var(--green-deep)] text-[var(--paper)] overflow-hidden relative" aria-labelledby="roadmap-heading">
      {/* Decorative luxury accents */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--gold)]/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[var(--green-light)]/20 blur-[100px]" />

      <div className="container relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow eyebrow-light inline-flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--gold-light)]" />
            <span>The Modern Consultation Flow</span>
          </span>
          <h2 id="roadmap-heading" className="mt-3 text-3xl font-serif md:text-5xl text-balance" style={{ color: "var(--paper)" }}>
            How your legal advice unfolds
          </h2>
          <p className="mt-4 text-base text-[var(--paper)]/75">
            A transparent, dignified experience designed to eliminate anxiety, paperwork confusion, and delayed court visits.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = activeStep === idx;
            return (
              <motion.div
                key={item.step}
                onMouseEnter={() => setActiveStep(idx)}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl p-7 transition-all duration-300 border ${
                  isHovered
                    ? "bg-[var(--green)]/90 border-[var(--gold-light)] shadow-2xl shadow-[var(--gold)]/10"
                    : "bg-white/[0.04] border-white/10 hover:border-white/20"
                }`}
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-bold text-[var(--gold-light)]">
                    {item.step}
                  </span>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isHovered ? "bg-[var(--gold)] text-[var(--green-deep)]" : "bg-white/10 text-[var(--gold-light)]"
                  } transition-colors duration-300`}>
                    <Icon size={22} />
                  </div>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-light)]">
                  {item.subtitle}
                </span>
                <h3 className="mt-2 text-xl font-serif font-bold !text-[var(--paper)]" style={{ color: "var(--paper)" }}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--paper)]/75">
                  {item.description}
                </p>

                {/* Highlights */}
                <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--paper)]/85">
                      <ShieldCheck size={13} className="text-[var(--gold-light)] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-r from-[var(--gold)]/15 via-white/[0.03] to-[var(--gold)]/15 p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-serif !text-[var(--paper)]" style={{ color: "var(--paper)" }}>
              Have an urgent legal concern?
            </h4>
            <p className="mt-1 text-sm text-[var(--paper)]/70">
              Check availability for today or tomorrow in Nagpur.
            </p>
          </div>
          <Link href="/book" className="btn-primary shimmer-badge !py-3.5 !px-8 whitespace-nowrap">
            <span>Book Your 30-Min Slot</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
