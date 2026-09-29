"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site-config";
import {
  Scale,
  Award,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  HeartHandshake,
  ArrowRight,
  Phone,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function RoleModelAdvocateShowcase() {
  return (
    <section id="advocate-profile" className="relative py-20 lg:py-28 overflow-hidden bg-[var(--paper-light)] border-t border-[var(--border)]">
      {/* Decorative background grid and soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(203, 167, 88, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(18, 53, 38, 0.08) 0%, transparent 40%)",
        }}
      />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold)] text-xs font-semibold tracking-wider uppercase mb-4 hover:bg-[var(--gold)]/25 transition-all no-underline shadow-xs hover:scale-105"
          >
            <Award size={14} />
            <span>Advocate Profile & Credentials →</span>
          </Link>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif font-bold text-[var(--ink)] leading-tight tracking-tight"
          >
            Legal Representation with Absolute Clarity, Empathy & Command
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base md:text-lg text-[var(--ink-soft)] leading-relaxed"
          >
            Adv. Shareen Hussain brings high-court discipline, intellectual property expertise,
            and dedicated personal consultation to every client across Nagpur and pan-India.
          </motion.p>
        </div>

        {/* 2-Column Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Real Advocate Chamber Image with interactive frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[430px] rounded-3xl p-3 bg-gradient-to-b from-[var(--gold)]/40 via-[var(--gold)]/10 to-[var(--border)] shadow-2xl">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-inner border border-[var(--gold)]/40 bg-black">
                <Image
                  src={site.advocateDeskPhoto}
                  alt="Adv. Shareen Hussain at Chamber Office desk"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  priority
                />

                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                {/* Overlaid Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-black/90 backdrop-blur-md border border-[var(--gold)]/40 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[var(--paper)]">
                        Adv. Shareen Hussain
                      </h4>
                      <p className="text-[11px] text-[var(--gold-light)] font-medium">
                        B.Com, M.Com, LL.B
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--gold)] text-black">
                        Bar Enrolled
                      </span>
                      <p className="text-[10px] text-[var(--paper)]/70 mt-0.5">High Court & District Court</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating verified badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-black text-white px-4 py-2 rounded-2xl shadow-xl border border-[var(--gold)] flex items-center gap-2"
              >
                <ShieldCheck size={18} className="text-[var(--gold)]" />
                <div>
                  <div className="text-[11px] font-bold tracking-wide">12+ Years</div>
                  <div className="text-[9px] text-white/70 uppercase">Trusted Practice</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Key Practice Pillars & Real Notices */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* The "TIME IS MONEY" Policy Badge directly from the user's poster */}
            <div className="p-5 rounded-2xl bg-black text-white border-2 border-[var(--gold)] shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <Clock size={160} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 border border-[var(--gold)] flex items-center justify-center text-[var(--gold)] flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-[var(--gold-light)] uppercase">
                      Transparent Professional Policy
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white">
                      Time is Money · Professional Advisory Policy
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">
                      Please proceed only if you value both. Dedicated, undisturbed legal strategy.
                    </p>
                  </div>
                </div>

                <Link
                  href="/book"
                  className="btn-primary !py-2.5 !px-5 text-xs font-bold shimmer-badge flex-shrink-0"
                >
                  <span>Book Slot</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Comprehensive practice areas grid matching real banner image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[var(--border)] shadow-xs hover:border-[var(--gold)] transition-colors">
                <div className="flex items-center gap-2.5 text-[var(--ink)] mb-1.5 font-bold text-sm">
                  <HeartHandshake size={18} className="text-[var(--gold)]" />
                  <span>Court Marriage & Love Marriage</span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  Confidential legal procedures under Special Marriage Act and Hindu Marriage Act. Protection and certified registration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[var(--border)] shadow-xs hover:border-[var(--gold)] transition-colors">
                <div className="flex items-center gap-2.5 text-[var(--ink)] mb-1.5 font-bold text-sm">
                  <Building2 size={18} className="text-[var(--gold)]" />
                  <span>Trademark & Startup Legal</span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  Certified Trade Mark Attorney. Brand name & logo registration, Pvt Ltd/LLP incorporation, GST, Gumasta & FSSAI licenses.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[var(--border)] shadow-xs hover:border-[var(--gold)] transition-colors">
                <div className="flex items-center gap-2.5 text-[var(--ink)] mb-1.5 font-bold text-sm">
                  <FileCheck2 size={18} className="text-[var(--gold)]" />
                  <span>Property Deeds & Verification</span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  Title search reports, Sale Deed, Gift Deed, Will drafting, lease agreements, and stamp paper documentation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[var(--border)] shadow-xs hover:border-[var(--gold)] transition-colors">
                <div className="flex items-center gap-2.5 text-[var(--ink)] mb-1.5 font-bold text-sm">
                  <Scale size={18} className="text-[var(--gold)]" />
                  <span>Litigation & Court Practice</span>
                </div>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  Bombay High Court (Nagpur Bench) & District Court. Civil suits, Cheque bounce (138 NI), MACT accident claims, FIR drafting.
                </p>
              </div>
            </div>

            {/* Chamber Walk-in Timings Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--paper-dark)] to-white border border-[var(--gold)]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-3 text-[var(--ink)]">
                <div className="h-9 w-9 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center shrink-0 text-[var(--gold)]">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--ink)]">Walk-in Consultation Desk</span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">Open Daily</span>
                  </div>
                  <span className="text-[var(--ink-soft)] text-xs block mt-0.5">
                    Morning: 9:30 AM – 11:00 AM &bull; Evening: 5:30 PM – 8:30 PM
                  </span>
                  <span className="block text-[11px] text-[var(--ink-muted)]">
                    Trisharan Square, Nagpur - 440027
                  </span>
                </div>
              </div>

              <a
                href={`tel:${site.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shrink-0 cursor-pointer hover:bg-zinc-800"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  border: "1px solid rgba(203, 167, 88, 0.4)",
                }}
              >
                <Phone size={14} style={{ color: "#cba758" }} />
                <span style={{ color: "#ffffff", fontWeight: 700 }}>Call: {site.phone}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
