"use client";

import { useState } from "react";
import { Star, ShieldCheck, MapPin, ExternalLink, MessageSquare, CheckCircle2, Award, Heart, ThumbsUp } from "lucide-react";
import { site } from "@/lib/site-config";
import { googleReviewsData, GoogleReviewItem } from "@/data/google-reviews";

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
  showPillars?: boolean;
}

const CATEGORIES: Array<GoogleReviewItem["serviceCategory"]> = [
  "All",
  "Trademark & IP",
  "Court Marriage & Family",
  "Property & Wills",
  "Corporate & Drafting",
];

export default function GoogleReviewsSection({
  title = "Real People. Real Legal Outcomes.",
  subtitle = "5.0 ★★★★★ FROM 179+ CLIENT REVIEWS ON GOOGLE BUSINESS PROFILE",
  className = "",
  showPillars = true,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredReviews =
    selectedCategory === "All"
      ? googleReviewsData
      : googleReviewsData.filter((r) => r.serviceCategory === selectedCategory);

  return (
    <section className={`py-20 lg:py-28 bg-[#09090b] text-white relative overflow-hidden ${className}`}>
      {/* Background radial gold glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, rgba(203, 167, 88, 0.25), transparent 50%), radial-gradient(circle at 85% 70%, rgba(203, 167, 88, 0.18), transparent 50%)",
        }}
      />

      <div className="container relative z-10 max-w-6xl">
        {/* Top Header Card — Matches the Official Flyer Badge */}
        <div className="rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-b from-[#18181b] to-[#09090b] p-6 sm:p-10 shadow-2xl relative mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Headline & Google Logo */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/90 font-mono tracking-wide mb-3">
                {/* Official Google G SVG */}
                <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Google Business Profile Verified</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-mono text-[var(--gold-light)] uppercase tracking-wider">
                {subtitle}
              </p>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Read direct, unfiltered experiences from individual citizens, entrepreneurs, families, and NRIs who trust Adv. Shareen Hussain.
              </p>
            </div>

            {/* Right: Big 5.0 Rating Badge (Directly from flyer design) */}
            <div className="flex flex-col items-center justify-center shrink-0 rounded-2xl bg-black/70 border-2 border-[var(--gold)]/50 px-8 py-6 text-center shadow-xl">
              <span className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-[var(--gold-light)] leading-none">
                5.0
              </span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={20} fill="#cba758" color="#cba758" />
                ))}
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-300">
                179+ REVIEWS ON GOOGLE
              </span>

              <a
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[var(--gold)] hover:bg-[var(--gold-light)] px-4 py-2 rounded-full transition-colors shadow"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Metric Chips Row (from flyer) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-light)] flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-lg font-bold font-serif text-white">179+ Happy Clients</p>
                <p className="text-xs text-slate-400">Cases, filings & legal closures</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-light)] flex items-center justify-center shrink-0">
                <Star size={20} className="fill-[var(--gold-light)] text-[var(--gold-light)]" />
              </div>
              <div>
                <p className="text-lg font-bold font-serif text-white">5.0 ★ Rating</p>
                <p className="text-xs text-slate-400">Unanimous 5-star client satisfaction</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-[var(--gold)]/10 text-[var(--gold-light)] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-lg font-bold font-serif text-white">Trusted Legal Partner</p>
                <p className="text-xs text-slate-400">High Court & District Court advocacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--gold)] text-black font-bold shadow-md shadow-[var(--gold)]/20"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-[var(--gold)]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Stars */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[var(--gold)] to-[#e5c77e] text-black font-bold font-mono text-sm flex items-center justify-center shadow-md">
                      {rev.avatarText}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        {rev.isLocalGuide && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            Local Guide
                          </span>
                        )}
                        {rev.isNri && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            NRI (USA)
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        {rev.location && <span>{rev.location} · </span>}
                        <span>{rev.timeAgo}</span>
                        {rev.reviewCount && <span>· {rev.reviewCount} reviews</span>}
                      </div>
                    </div>
                  </div>

                  {/* Google Icon Badge */}
                  <div className="shrink-0 p-1 rounded-full bg-white/5 border border-white/10">
                    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="#cba758" color="#cba758" />
                  ))}
                  <span className="text-[11px] text-[var(--gold-light)] font-mono ml-1">5.0</span>
                </div>

                {/* Highlight snippet */}
                {rev.highlight && (
                  <p className="text-xs font-semibold text-[var(--gold-light)] mb-2 italic">
                    "{rev.highlight}"
                  </p>
                )}

                {/* Main Content */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  "{rev.content}"
                </p>
              </div>

              {/* Owner Reply (if present) */}
              {rev.ownerReply && (
                <div className="mt-4 pt-4 border-t border-white/10 bg-white/[0.02] -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <div className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold-light)] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={12} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Adv. Shareen Hussain</span>
                        <span className="text-[10px] text-slate-400 font-mono">Owner &bull; {rev.ownerReply.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                        {rev.ownerReply.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Four Core Practice Pillars Banner (from flyer 2) */}
        {showPillars && (
          <div className="mt-14 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-r from-black via-[#18181b] to-black p-6 text-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3">
                <span className="text-2xl block mb-1">⚖️</span>
                <h5 className="font-serif font-bold text-sm text-white">Professional Advice</h5>
                <p className="text-xs text-slate-400 mt-0.5">Statutory clarity without ambiguity</p>
              </div>
              <div className="p-3">
                <span className="text-2xl block mb-1">💡</span>
                <h5 className="font-serif font-bold text-sm text-white">Practical Solutions</h5>
                <p className="text-xs text-slate-400 mt-0.5">Time-bound legal outcomes</p>
              </div>
              <div className="p-3">
                <span className="text-2xl block mb-1">👥</span>
                <h5 className="font-serif font-bold text-sm text-white">Client-Focused Approach</h5>
                <p className="text-xs text-slate-400 mt-0.5">Patient hearing & empathy</p>
              </div>
              <div className="p-3">
                <span className="text-2xl block mb-1">🛡️</span>
                <h5 className="font-serif font-bold text-sm text-white">Trusted & Confidential</h5>
                <p className="text-xs text-slate-400 mt-0.5">Absolute advocate-client privilege</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA to Google Maps */}
        <div className="mt-10 text-center">
          <a
            href={site.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[var(--gold)] transition-all"
          >
            <span>Read All 179+ Google Reviews on Maps</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
