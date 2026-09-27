"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { site } from "@/lib/site-config";

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
// Instagram reel embed URLs — replace with actual reel shortcodes from @true_legal_advice
const REEL_IDS = [
  "DBI_example1",
  "DBI_example2",
  "DBI_example3",
  "DBI_example4",
  "DBI_example5",
  "DBI_example6",
];

// Placeholder reel cards when no real reels are configured
const PLACEHOLDER_REELS = [
  {
    title: "Court Marriage Guide",
    subtitle: "Step-by-step legal process",
    gradient: "linear-gradient(135deg, #0d281d 0%, #1e5038 50%, #b08a3e 100%)",
    icon: "💍",
  },
  {
    title: "Trademark Filing Tips",
    subtitle: "Protect your brand identity",
    gradient: "linear-gradient(135deg, #1a1f1c 0%, #123526 50%, #cba758 100%)",
    icon: "™️",
  },
  {
    title: "Property Due Diligence",
    subtitle: "What to check before buying",
    gradient: "linear-gradient(135deg, #0a2217 0%, #2f7a4f 50%, #b08a3e 100%)",
    icon: "🏠",
  },
  {
    title: "Legal Drafting 101",
    subtitle: "Agreements made simple",
    gradient: "linear-gradient(135deg, #123526 0%, #0d281d 50%, #efe6cd 100%)",
    icon: "📄",
  },
  {
    title: "Consumer Rights",
    subtitle: "Know your legal protection",
    gradient: "linear-gradient(135deg, #1e5038 0%, #0a2217 50%, #b08a3e 100%)",
    icon: "⚖️",
  },
  {
    title: "Business Registration",
    subtitle: "GST, Udyam & more",
    gradient: "linear-gradient(135deg, #0d281d 0%, #123526 50%, #cba758 100%)",
    icon: "🏢",
  },
];

export default function InstagramReelStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const hasRealReels = site.instagramReels && site.instagramReels.length > 0;

  useEffect(() => {
    checkScroll();
  }, []);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  }

  return (
    <section className="py-16 md:py-20 bg-[var(--paper)] border-t border-[var(--line)] overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3"
              style={{
                background: "linear-gradient(135deg, rgba(240,148,51,0.12), rgba(188,24,136,0.12))",
                color: "#bc1888",
              }}
            >
              <InstagramIcon size={14} />
              <span>Legal Awareness Reels</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-[var(--ink)]">
              Follow @{site.instagramHandle}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)] max-w-lg">
              Legal awareness reels, trademark tips, court updates, and client guidance in plain language.
            </p>
          </div>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white no-underline transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
          >
            <InstagramIcon size={14} />
            Follow on Instagram
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Scrollable Reel Strip */}
        <div className="relative">
          {/* Navigation arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 border border-[var(--line)] shadow-lg flex items-center justify-center hover:bg-white transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} className="text-[var(--ink)]" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/90 border border-[var(--line)] shadow-lg flex items-center justify-center hover:bg-white transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} className="text-[var(--ink)]" />
            </button>
          )}

          {/* Gradient edge masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--paper)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--paper)] to-transparent" />

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1"
          >
            {hasRealReels
              ? site.instagramReels.map((reelId, idx) => (
                  <motion.div
                    key={reelId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex-shrink-0 w-[200px] sm:w-[220px] group"
                  >
                    <a
                      href={`https://www.instagram.com/reel/${reelId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border border-[var(--line)] bg-black hover:shadow-xl transition-all hover:-translate-y-1 no-underline"
                    >
                      <iframe
                        src={`https://www.instagram.com/reel/${reelId}/embed/`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        frameBorder="0"
                        scrolling="no"
                        allowTransparency
                        loading="lazy"
                        title={`Instagram Reel ${idx + 1}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
                        <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play size={10} className="text-white ml-0.5" fill="white" />
                        </div>
                        <span className="text-[10px] font-semibold text-white/90">Watch Reel</span>
                      </div>
                    </a>
                  </motion.div>
                ))
              : PLACEHOLDER_REELS.map((reel, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex-shrink-0 w-[200px] sm:w-[220px] group"
                  >
                    <a
                      href={site.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border border-[var(--line)] hover:shadow-xl transition-all hover:-translate-y-1 no-underline"
                      style={{ background: reel.gradient }}
                    >
                      {/* Decorative dot pattern */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "12px 12px",
                      }} />

                      {/* Reel content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                        <span className="text-4xl mb-4">{reel.icon}</span>
                        <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform">
                          <Play size={18} className="text-white ml-0.5" fill="white" />
                        </div>
                        <h4 className="text-sm font-bold text-white">{reel.title}</h4>
                        <p className="text-[10px] text-white/70 mt-1">{reel.subtitle}</p>
                      </div>

                      {/* Bottom bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(45deg, #f09433, #dc2743, #bc1888)" }}
                          >
                            <InstagramIcon size={11} className="text-white" />
                          </div>
                          <span className="text-[10px] font-semibold text-white/90">@{site.instagramHandle}</span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
