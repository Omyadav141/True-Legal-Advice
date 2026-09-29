import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Landmark,
  BriefcaseBusiness,
  Users,
  Scale,
  Stamp,
  FileCheck,
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Star,
  ExternalLink,
  Phone,
  FileText,
} from "lucide-react";
import GoogleRating from "../components/GoogleRating";
import GoogleReviewsSection from "../components/GoogleReviewsSection";
import PracticeApproach from "../components/PracticeApproach";
import { site, otherLegalServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `About Advocate ${site.lawyerName} | 5.0★ Rated Lawyer in Nagpur | ${site.businessName}`,
  description: `Learn about Advocate ${site.lawyerName} (B.Com, M.Com, LL.B), High Court & District Court Advocate in Nagpur. 179+ 5.0-star reviews on Google Business Profile. Trademark Attorney, Family Law, Property Due Diligence, and Corporate Consultancy.`,
};

export default function AboutPage() {
  const officialServices = [
    { name: "Trademark Registration", desc: "Classes 1-45, brand search, objection replies, hearing representation" },
    { name: "Udyam Registration", desc: "MSME certification for startups & 50% government fee subsidy" },
    { name: "GST Registration & Filing", desc: "GST advisory, monthly returns, and tax compliance" },
    { name: "Legal Drafting", desc: "Legal notices, civil petitions, commercial contracts, and NDAs" },
    { name: "Company Registration", desc: "Pvt Ltd, LLP, Partnership firms, and OPC incorporation" },
    { name: "Property Due Diligence", desc: "30-year search report, title verification, and encumbrance checks" },
    { name: "Rent & Lease Agreements", desc: "Legally enforceable commercial & residential lease deeds" },
    { name: "Sale Deeds & Gift Deeds", desc: "Drafting, stamp duty calculations, and SRO Nagpur registration" },
    { name: "FSSAI License & Renewal", desc: "Basic, State & Central food business compliance" },
    { name: "Legal Advisory for Startups", desc: "Founder equity agreements, trademark protection & vendor contracts" },
  ];

  return (
    <>
      {/* 1. Hero Section */}
      <section className="section" style={{ background: "var(--paper-dark)" }}>
        <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border-2 border-[var(--gold)]/50 group">
            <Image
              src={site.advocateDeskPhoto}
              alt={`Advocate ${site.lawyerName}`}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/80 backdrop-blur-md p-3 border border-[var(--gold)]/40 text-center">
              <p className="font-serif text-white font-bold text-sm">Adv. {site.lawyerName}</p>
              <p className="text-[11px] text-[var(--gold-light)] font-mono">{site.designation}</p>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-xs font-mono text-[var(--gold)] mb-3">
              <Star size={12} fill="currentColor" />
              <span>179+ Verified Google Reviews (5.0★)</span>
            </div>
            <h1 className="fade-up mt-2 text-balance font-serif text-3xl leading-tight md:text-5xl text-[var(--ink)]">
              Advocate {site.lawyerName}
            </h1>
            <p className="mt-2 text-xs font-mono uppercase tracking-wider text-[var(--gold)]">
              {site.qualifications} &bull; {site.barRegistration}
            </p>
            <p className="fade-up fade-up-delay-1 mt-4 text-base leading-relaxed md:text-lg" style={{ color: "var(--ink-soft)" }}>
              Adv. Shareen Hussain is a practicing Advocate based in Nagpur, Maharashtra, and the founder of <strong>True Legal Advice</strong> — an authoritative legal consultancy providing practical, high-integrity legal assistance to individuals, startups, NRIs, and established corporations.
            </p>
            <p className="fade-up fade-up-delay-2 mt-3 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              With a practice extending across the <strong>District & Sessions Court, Nagpur</strong> and the <strong>Bombay High Court (Nagpur Bench)</strong>, she specializes in Intellectual Property Rights (Trademark Attorney), Court Marriages under Special Marriage Act, Property Title Due Diligence, and Corporate Drafting.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <GoogleRating />
              <Link href="/book" className="btn-primary !py-2.5 !px-5 text-xs">
                <span>Book Legal Consultation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Credentials Cards */}
      <section className="py-12 bg-white border-b border-[var(--line)]">
        <div className="container grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              icon: <Landmark size={24} aria-hidden="true" />,
              title: "Court Practice",
              detail: "District Court, Nagpur & Bombay High Court (Nagpur Bench)",
            },
            {
              icon: <BriefcaseBusiness size={24} aria-hidden="true" />,
              title: "True Legal Advice",
              detail: "Statutory trademark prosecution, legal documentation & representation",
            },
            {
              icon: <Users size={24} aria-hidden="true" />,
              title: "Who She Assists",
              detail: "Individuals, entrepreneurs, startups, families, NRIs & corporations",
            },
          ].map((c) => (
            <div key={c.title} className="card card-hover flex flex-col items-center gap-3 text-center p-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                {c.icon}
              </div>
              <h3 className="text-lg font-serif font-bold text-[var(--ink)]">{c.title}</h3>
              <p className="text-xs sm:text-sm" style={{ color: "var(--ink-soft)" }}>
                {c.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FULL PRACTICE RANGE — MOVED TO TOP RIGHT AFTER CREDENTIALS (As Requested) */}
      <section className="py-16 bg-[#09090b] text-white border-y border-[var(--gold)]/30 overflow-hidden relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(203, 167, 88, 0.25), transparent 70%)",
          }}
        />

        <div className="container relative z-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold-light)] block mb-1">
                FULL PRACTICE RANGE
              </span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">
                All Legal Service Areas
              </h2>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                Continuous practice overview &bull; Hover any card to pause &bull; Click to book matter
              </p>
            </div>
            <Link
              href="/book"
              className="btn-primary shimmer-badge !py-2.5 !px-5 text-xs shrink-0 self-start md:self-auto"
            >
              <span>Consultation Desk</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Marquee Track Moving from Left to Right */}
        <div className="relative overflow-hidden py-3 select-none">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#09090b] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#09090b] to-transparent" />

          <div className="animate-marquee-reverse flex items-center gap-4">
            {[...otherLegalServices, ...otherLegalServices, ...otherLegalServices].map((s, idx) => (
              <Link
                key={idx}
                href={s.href || `/book?service=other&matter=${encodeURIComponent(s.title)}`}
                className="group flex items-center gap-3 whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-5 py-3.5 shadow-sm transition-all duration-300 hover:border-[var(--gold)] hover:bg-white/[0.08] hover:-translate-y-1 no-underline"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/20 text-[var(--gold-light)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors">
                  <Scale size={16} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white group-hover:text-[var(--gold-light)] transition-colors">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Nagpur District Court & High Court
                  </p>
                </div>
                <ArrowRight size={12} className="text-[var(--gold-light)] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Clickable Practice Badges Cloud */}
        <div className="container relative z-10 mt-8 pt-6 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold-light)] mb-3 flex items-center gap-1.5">
            <span>Quick Practice Navigation</span>
            <span>&bull;</span>
            <span className="text-slate-400 font-normal">Click to open practice details or book direct slot</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {otherLegalServices.map((service) => (
              <Link
                key={service.title}
                href={service.href || `/book?service=other&matter=${encodeURIComponent(service.title)}`}
                className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-black flex items-center gap-1.5"
              >
                <span>{service.title}</span>
                <ArrowRight size={11} className="text-[var(--gold-light)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Areas of Practice — Detailed Breakdown & 10 Core Services */}
      <section className="section bg-[var(--paper)]">
        <div className="container">
          <span className="eyebrow">PRACTICE AREAS & CONSULTANCY</span>
          <h2 className="mb-4 mt-2 text-2xl md:text-4xl font-serif font-bold text-[var(--ink)]">
            What She Handles
          </h2>
          <p className="mb-10 max-w-3xl text-sm sm:text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Advocate Shareen Hussain combines courtroom advocacy with corporate compliance and private legal drafting. Below are the primary legal sectors handled under True Legal Advice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {[
              { icon: Stamp, title: "Trademark & IP Prosecution", desc: "Classes 1-45 brand clearance, filing, Section 9 & 11 objection replies, and Registrar hearings." },
              { icon: Building2, title: "Property Due Diligence & Deeds", desc: "30-year title verification, search reports, Sale Deeds, Gift Deeds, and Sub-Registrar registration." },
              { icon: HeartHandshake, title: "Family & Matrimonial Law", desc: "Special Marriage Act court marriages, mutual consent divorce, maintenance, and child custody matters." },
              { icon: Scale, title: "Consumer Disputes & MACT Claims", desc: "Notice drafting, District Consumer Forum filings, and Motor Accident Claims Tribunal representation." },
              { icon: FileCheck, title: "Commercial Drafting & Agreements", desc: "Power of Attorney, Employment contracts, Commercial Leases, NDAs, and Will registration." },
              { icon: ShieldCheck, title: "Business Setup & Compliance", desc: "Pvt Ltd, LLP, Udyam MSME (50% TM fee discount), GST filing, Gumasta, and FSSAI licenses." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card card-hover flex flex-col gap-3 p-6 rounded-2xl bg-white border border-[var(--line)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-serif font-bold text-[var(--ink)]">{item.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)]">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 10 Core Services Grid from Client's Official Flyer */}
          <div className="rounded-3xl border border-[var(--gold)]/40 bg-white p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--line)]">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--gold)] block">
                  OFFICIAL SERVICES MATRIX
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--ink)] mt-1">
                  10 Comprehensive Legal & Compliance Services
                </h3>
              </div>
              <span className="text-xs text-[var(--ink-soft)] font-mono">
                True Legal Advice &bull; Nagpur
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {officialServices.map((srv, idx) => (
                <div
                  key={srv.name}
                  className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4 flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-sm transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[var(--gold)] block mb-1">
                      0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--ink)] leading-snug">{srv.name}</h4>
                    <p className="text-[11px] text-[var(--ink-soft)] mt-1 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-[var(--ink-soft)] italic text-center">
              "Your Brand, Your Identity, Our Protection." &bull; Transparent statutory fee structuring with zero hidden charges.
            </p>
          </div>
        </div>
      </section>

      {/* 5. GOOGLE REVIEWS SECTION (Embedded in About Page as Requested) */}
      <GoogleReviewsSection
        title="Verified Client Reviews on Google"
        subtitle="5.0 ★★★★★ FROM 179+ CLIENT REVIEWS ON GOOGLE BUSINESS PROFILE"
        showPillars={true}
      />

      {/* 6. Practice Approach & Philosophy */}
      <PracticeApproach />

      {/* 7. Brand Tagline Strip */}
      <section className="py-16 bg-black text-center border-y border-[var(--gold)]/40">
        <div className="container">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--gold-light)] mb-2 font-mono">
            TRUE LEGAL ADVICE &bull; NAGPUR
          </p>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-wide">
            Your Brand, Your Identity, Our Protection.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Practical legal counsel for when it matters most. Serving Nagpur District Court, Bombay High Court, and clients across India & abroad.
          </p>
        </div>
      </section>

      {/* 8. Final Consultation CTA */}
      <section className="section text-center bg-white">
        <div className="container max-w-2xl">
          <span className="eyebrow justify-center">SCHEDULE A CONSULTATION</span>
          <h2 className="mb-3 mt-2 text-2xl md:text-3xl font-serif font-bold text-[var(--ink)]">
            Ready to Discuss Your Legal Matter?
          </h2>
          <p className="mb-8 text-sm sm:text-base text-[var(--ink-soft)]">
            Request an in-person chamber consultation at Trisharan Square, Nagpur or an online video consultation via Google Meet.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/book" className="btn-primary !py-3.5 !px-7 text-xs sm:text-sm">
              <span>Book Appointment Slot</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to schedule a consultation regarding a legal matter.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-sm flex items-center gap-2"
            >
              <Phone size={15} />
              <span>WhatsApp Chamber Desk</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
