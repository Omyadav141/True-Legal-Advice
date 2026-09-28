import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Shield, Scale, Award, Landmark, Phone, Sparkles } from "lucide-react";
import NewGenHero from "./components/NewGenHero";
import AnimatedMarquee from "./components/AnimatedMarquee";
import RoleModelAdvocateShowcase from "./components/RoleModelAdvocateShowcase";
import InteractiveServiceExplorer from "./components/InteractiveServiceExplorer";
import OfficialCredentialsGallery from "./components/OfficialCredentialsGallery";
import LegalProcessRoadmap from "./components/LegalProcessRoadmap";
import PracticeApproach from "./components/PracticeApproach";
import InteractiveFaq from "./components/InteractiveFaq";
import InstagramReelStrip from "./components/InstagramReelStrip";
import { site, testimonials } from "@/lib/site-config";

function InstagramIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      {/* ============ New-Gen Animated Hero ============ */}
      <NewGenHero />

      {/* ============ Infinite Animated Practice Marquee ============ */}
      <AnimatedMarquee />

      {/* ============ Modern Trust Band ============ */}
      <section className="border-b border-[var(--gold)]/20 bg-black py-6 text-white">
        <div className="container grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "High Court & District Court", desc: "Nagpur Bench & District Court" },
            { label: "Trade Mark Attorney", desc: "Certified brand & IP protection" },
            { label: "Court & Love Marriage", desc: "Confidential lawful guidance" },
            { label: "Dedicated consultation slots", desc: "Focused legal strategy session" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/20 text-[var(--gold-light)]">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold leading-tight text-[var(--paper)]">
                  {item.label}
                </p>
                <p className="text-[11px] text-[var(--paper)]/65 mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Advocate Role Model Profile & Practice Showcase ============ */}
      <RoleModelAdvocateShowcase />

      {/* ============ Interactive Service Explorer ============ */}
      <InteractiveServiceExplorer />

      {/* ============ Strategic Practice Directives & Credentials (Accenture-Style Compact Cards) ============ */}
      <OfficialCredentialsGallery />

      {/* ============ Instagram Reels Strip (like SuperYou.in) ============ */}
      <InstagramReelStrip />

      {/* ============ Practice Approach Story ============ */}
      <PracticeApproach />

      {/* ============ 3-Step Modern Consultation Roadmap ============ */}
      <LegalProcessRoadmap />

      {/* ============ Frequently Asked Questions ============ */}
      <InteractiveFaq />

      {/* ============ Client Reviews Section ============ */}
      <section className="section bg-[var(--paper)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">Client Experiences</span>
            <h2 className="mt-2 text-3xl font-serif md:text-4xl">What clients say</h2>
            {testimonials.length === 0 && (
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                Client reviews will be shared here once approved for publication. No sample testimonials or unverified ratings are displayed.
              </p>
            )}
          </div>

          {testimonials.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.name} className="card m-0 flex flex-col justify-between p-6">
                  <div className="mb-4 text-3xl leading-none text-[var(--gold-light)] font-serif" aria-hidden="true">
                    &ldquo;
                  </div>
                  <blockquote className="m-0 flex-1 text-sm italic leading-relaxed text-[var(--ink-soft)]">
                    {t.text}
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-bold text-black border-t border-[var(--line)] pt-3">
                    — {t.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ Brand Tagline ============ */}
      <section className="py-14 bg-black text-center border-t border-[var(--gold)]/20">
        <div className="container">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold-light)] mb-3">True Legal Advice</p>
          <h2 className="text-2xl md:text-4xl font-serif" style={{ color: "var(--paper)" }}>
            Your Brand, Your Identity, Our Protection.
          </h2>
        </div>
      </section>
    </>
  );
}
