import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Scale,
  FileCheck2,
  Building2,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Phone,
  Award,
  Lock,
  ArrowUpRight,
  Zap,
  FileText,
  Layers,
  ChevronRight,
} from "lucide-react";
import { site } from "@/lib/site-config";
import GoogleRating from "../components/GoogleRating";
import GoogleReviewsSection from "../components/GoogleReviewsSection";
import TrademarkFaqInteractive from "./TrademarkFaqInteractive";

export const metadata: Metadata = {
  title: `Trademark Lawyer in Nagpur | Registered Trade Mark Attorney | True Legal Advice`,
  description: `Official Trademark & Intellectual Property legal registration in Nagpur by certified Trade Mark Attorney Adv. ${site.lawyerName} (B.Com, M.Com, LL.B). Brand search, Class 1-45 filing, Section 9 & 11 objection replies, copyright, company setup, and MSME registration.`,
};

export default function TrademarkPage() {
  const tracks = [
    {
      title: "Trademark Search, Filing & Registration",
      subtitle: "Classes 1 to 45 (Goods & Services)",
      timeline: "Filing within 24-48 Hours · ™ Immediate",
      desc: "Complete statutory brand protection for brand names, logos, taglines, labels, and packaging. Verified clearance on IP India database and immediate entitlement to use the ™ symbol.",
      highlights: [
        "Comprehensive phonetic, visual & semantic clearance search",
        "Form TM-A drafting with precise goods & services classification",
        "Immediate TM Application Number & filing acknowledgement",
        "Official Registered (®) Certificate issued by Govt of India",
        "Statutory 10-year nationwide protection, perpetually renewable",
      ],
      badge: "Core IP Practice · All 45 Classes",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      title: "Examination Report & Objection Management",
      subtitle: "Section 9 & Section 11 Legal Defence",
      timeline: "Formal Reply within 30 Statutory Days",
      desc: "Legal drafting and representation against objections raised by the Trademark Examiner. Authoritative evidence submissions and virtual show-cause hearing advocacy before the Registrar.",
      highlights: [
        "Section 9 objection defence (Distinctiveness & acquired reputation)",
        "Section 11 objection reply (Distinguishing conflicting marks)",
        "Affidavit of Prior Commercial Use with documentary evidence",
        "Representation at virtual / in-person Show-Cause Hearings",
        "Notice of Opposition (TM-O) drafting and counter-statement defense",
      ],
      badge: "Litigation & Registry Advocacy",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      title: "Copyright & Creative Intellectual Property",
      subtitle: "Artistic, Literary & Software Asset Protection",
      timeline: "Statutory Copyright Diary Number in 48 Hours",
      desc: "Irrefutable legal protection for logos, brand graphics, software code, website UI/UX, product labels, and marketing literature under the Copyright Act 1957.",
      highlights: [
        "Logo & Artistic Label Copyright Registration (TM-60 NOC)",
        "Source code, algorithms & mobile application protection",
        "Authorship rights valid for Author's Lifetime + 60 Years",
        "Civil remedies & injunctions against counterfeiters and copycats",
        "Admissible prima facie evidence in civil and cyber litigation",
      ],
      badge: "Copyright Act 1957",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      title: "Corporate Setup & Startup Legal Compliance",
      subtitle: "Pvt Ltd, LLP, MSME (Udyam) & Licensing",
      timeline: "3 to 7 Working Days",
      desc: "End-to-end legal infrastructure for entrepreneurs. Adv. Shareen Hussain facilitates company formation, MSME subsidies (saving 50% on TM fees), and commercial licensing.",
      highlights: [
        "Private Limited Company, LLP & One Person Company (OPC) Setup",
        "MSME (Udyam) Registration (50% Government fee discount on TM)",
        "GUMASTA / Maharashtra Shop & Establishment Act Registration",
        "Non-Disclosure Agreements (NDAs), Founder Deeds & Franchise Agreements",
        "GST Registration, Returns & FSSAI Central/State Food Licensing",
      ],
      badge: "Startup India & MSME Facilitation",
      badgeColor: "bg-black text-[#cba758] border-[#cba758]/30",
    },
  ];

  const documents = [
    {
      category: "Individual & Sole Proprietorship",
      subtitle: "For Freelancers, Consultants & Solo Business Owners",
      items: [
        "Identity Proof: Aadhaar Card / Voter ID / Passport of applicant",
        "PAN Card copy of the individual proprietor",
        "High-Resolution Brand Name, Logo, Tagline, or Device Mark in PNG/JPG format",
        "Business address proof (Electricity bill, Shop Act / GUMASTA, or rent agreement)",
        "Affidavit of Prior Commercial Use & date of first use (if claiming usage prior to filing date)",
        "Signed Power of Attorney / Form TM-48 authorizing Adv. Shareen Hussain",
      ],
    },
    {
      category: "Startups & MSME Enterprises",
      subtitle: "Eligible for 50% Government Fee Subsidy",
      items: [
        "MSME (Udyam) Certificate / Startup India DPIIT Certificate (saves ₹4,500 govt fee per class!)",
        "Aadhaar & PAN Card of Proprietor or Managing Partner",
        "High-Resolution Logo artwork and specimen of usage on packaging / website",
        "Prior commercial invoices, website domain invoices, or social media launch evidence",
        "Signed Form TM-48 Power of Attorney",
        "Proof of business place address in Maharashtra / India",
      ],
    },
    {
      category: "Pvt Ltd, LLP & Partnerships",
      subtitle: "For Registered Corporate Entities",
      items: [
        "Certificate of Incorporation (COI) / LLP Agreement / Partnership Deed",
        "Company PAN Card & GST Registration Certificate",
        "Board Resolution or Letter of Authorization for designated Director / Partner",
        "Identity Proof (Aadhaar & PAN) of authorized signatory",
        "High-Resolution Brand Logo and precise list of products/services under Nice Classification",
        "Signed Form TM-48 executed under corporate seal / company stamp",
      ],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Comprehensive Trademark Clearance Search",
      desc: "Our chamber conducts rigorous multi-tier searches across the official IP India registry database. We analyze identical marks, phonetic similarities, cross-class overlaps, and well-known brand records to determine statutory registrability.",
    },
    {
      num: "02",
      title: "Application Drafting & Form TM-A Submission",
      desc: "We formulate the exact specification of goods/services across Nice Classification (Classes 1–45), draft user affidavits, and file Form TM-A online. An official application number is issued within 24–48 hours, legally authorizing the use of the ™ symbol.",
    },
    {
      num: "03",
      title: "Registry Examination & Objection Reply",
      desc: "The Trademark Registry conducts statutory examination and issues an Examination Report within 1 to 3 months. If objections under Section 9 (distinctiveness) or Section 11 (similarity) are raised, Adv. Shareen drafts an authoritative legal reply supported by legal precedents.",
    },
    {
      num: "04",
      title: "Journal Publication & 4-Month Public Window",
      desc: "Once objections are resolved, your mark is published in the official Government Trademark Journal. A 4-month statutory opposition window opens. If any third party raises an opposition, our chamber files formal counter-statements and argues your priority.",
    },
    {
      num: "05",
      title: "Official Registration Certificate Handover",
      desc: "Upon clearance of the 4-month journal window, the Controller General of Patents, Designs & Trademarks issues the official Government Registration Certificate with digital gold seal. You are now legally entitled to use the prestigious ® symbol for 10 years.",
    },
  ];

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* ============ Cinematic Hero ============ */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#07090e]">
        {/* Background Visual Media */}
        <div className="hero-media relative">
          <Image
            src="/images/hero-trademark.png"
            alt="Trademark Registration and Corporate IP in Nagpur"
            fill
            priority
            className="object-cover opacity-85 scale-105 transition-transform duration-1000 ease-out"
            sizes="100vw"
          />
          {/* Subtle Ambient Video / Motion Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-transparent to-amber-500/20 mix-blend-screen pointer-events-none animate-pulse duration-[4000ms]" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#cba758]/20 blur-3xl pointer-events-none" />
        </div>
        <div className="hero-overlay !bg-gradient-to-r !from-black/90 !via-black/75 !to-black/45" />

        <div className="container relative z-10 pb-16 pt-32 lg:pt-36">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#cba758]/20 text-[#f5dfa8] border border-[#cba758]/40 shadow-sm backdrop-blur-md">
              <Sparkles size={12} className="text-[#cba758] animate-spin" style={{ animationDuration: '6s' }} />
              TRADEMARK & CORPORATE IP CHAMBER · NAGPUR
            </span>
          </div>

          <h1
            className="fade-up max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.12]"
            style={{ color: "#ffffff" }}
          >
            Legal Armour for Your Brand & Intellectual Property
          </h1>

          <p
            className="fade-up fade-up-delay-1 mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-200"
            style={{ color: "rgba(250,247,240,0.92)" }}
          >
            Adv. {site.lawyerName} (B.Com, M.Com, LL.B) — Certified Trade Mark Attorney and founder of True Legal Advice (securemybrand.in). Delivering comprehensive brand clearance, Class 1–45 filings, Section 9 & 11 objection replies, copyright registrations, and corporate legal compliance across India.
          </p>

          {/* Quick Trust Pillars */}
          <div className="fade-up fade-up-delay-2 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white hover:bg-white/15 transition-all hover:scale-[1.02]">
              <ShieldCheck size={16} className="text-[var(--gold-light)] shrink-0" />
              <span>Certified Trade Mark Attorney (CGPDTM)</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white hover:bg-white/15 transition-all hover:scale-[1.02]">
              <Zap size={16} className="text-[var(--gold-light)] shrink-0" />
              <span>™ Application Filing in 24–48 Hours</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white hover:bg-white/15 transition-all hover:scale-[1.02]">
              <Scale size={16} className="text-[var(--gold-light)] shrink-0" />
              <span>Section 9 & 11 Objection Defense</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="fade-up fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link href="/book?service=trademark" className="btn-primary shimmer-badge !py-3.5 !px-7 text-sm shadow-xl hover:shadow-amber-500/20">
              <span>Book IP Consultation</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need brand clearance and trademark registration guidance for my business.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp !py-3.5 !px-7 text-sm shadow-xl"
            >
              <Phone size={16} />
              <span>WhatsApp Brand Clearance</span>
            </a>

            <GoogleRating />
          </div>
        </div>
      </section>

      {/* ============ 4 Comprehensive Practice Tracks ============ */}
      <section className="py-20 bg-gradient-to-b from-white via-zinc-50/50 to-white border-b border-[var(--border)]">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">PRACTICE PATHWAYS</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--ink)] mt-2">
              Comprehensive Intellectual Property & Corporate Solutions
            </h2>
            <p className="mt-3 text-[var(--ink-soft)] text-sm sm:text-base leading-relaxed">
              From nascent startup brand names to multinational portfolio defense, our chamber provides airtight legal protection across all four dimensions of corporate IP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tracks.map((track, idx) => {
              // Custom luxurious styling per track
              const cardAccents = [
                {
                  border: "hover:border-[#cba758]/60 hover:shadow-amber-500/10",
                  topBar: "from-amber-400 to-[#cba758]",
                  badge: "bg-amber-50 text-amber-900 border-amber-300",
                },
                {
                  border: "hover:border-purple-400/60 hover:shadow-purple-500/10",
                  topBar: "from-purple-500 to-indigo-600",
                  badge: "bg-purple-50 text-purple-900 border-purple-300",
                },
                {
                  border: "hover:border-blue-400/60 hover:shadow-blue-500/10",
                  topBar: "from-blue-500 to-cyan-600",
                  badge: "bg-blue-50 text-blue-900 border-blue-300",
                },
                {
                  border: "hover:border-emerald-400/60 hover:shadow-emerald-500/10",
                  topBar: "from-emerald-500 to-teal-600",
                  badge: "bg-emerald-50 text-emerald-900 border-emerald-300",
                },
              ][idx % 4];

              return (
                <div
                  key={track.title}
                  className={`group relative rounded-3xl border border-zinc-200/90 bg-white p-7 sm:p-9 flex flex-col justify-between shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${cardAccents.border}`}
                >
                  {/* Top glowing gradient stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cardAccents.topBar} opacity-90 group-hover:h-2 transition-all duration-300`} />

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border shadow-2xs ${cardAccents.badge}`}
                      >
                        {track.badge}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--ink-muted)]">
                        {track.timeline}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-[var(--ink)] tracking-tight group-hover:text-[#9f7d32] transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)] mt-1.5 font-mono">
                      {track.subtitle}
                    </p>

                    <p className="mt-4 text-sm text-[var(--ink-soft)] leading-relaxed">
                      {track.desc}
                    </p>

                    <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2.5">
                      <p className="text-xs font-mono uppercase tracking-wider text-[var(--ink)] font-bold mb-2">
                        Key Chamber Deliverables:
                      </p>
                      {track.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink-soft)]">
                          <CheckCircle2 size={16} className="text-[#9f7d32] mt-0.5 shrink-0" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/book?service=trademark&matter=${encodeURIComponent(track.title)}`}
                      className="btn-pathway !text-xs !py-2.5 !px-5 !text-white shadow-md group-hover:shadow-lg"
                    >
                      <span style={{ color: "#ffffff", fontWeight: 700 }}>Schedule Case Review</span>
                      <ArrowRight size={13} style={{ color: "#cba758" }} />
                    </Link>

                    <a
                      href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(`Hello Adv. Shareen, I would like to inquire about ${track.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-black transition-colors"
                    >
                      <span>Quick WhatsApp Desk</span>
                      <ArrowUpRight size={13} className="text-[#9f7d32]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Document Checklist By Entity ============ */}
      <section className="py-20 bg-[var(--paper-dark)] border-b border-[var(--border)]">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="eyebrow justify-center">STATUTORY PREPARATION</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--ink)] mt-2">
              Required Documents for Trademark Application
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--ink-soft)]">
              Accurate documentation ensures immediate TM-A acceptance without administrative objections. Please gather the following according to your business constitution:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documents.map((doc, idx) => (
              <div
                key={doc.category}
                className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-black text-[var(--gold-light)] flex items-center justify-center mb-4">
                    {idx === 0 ? <FileCheck2 size={20} /> : idx === 1 ? <Zap size={20} /> : <Building2 size={20} />}
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                    {doc.category}
                  </h3>
                  <p className="text-xs text-[var(--gold)] font-medium mt-0.5 mb-4">
                    {doc.subtitle}
                  </p>

                  <ul className="space-y-3 pt-3 border-t border-[var(--border)]">
                    {doc.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--ink-soft)] leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <a
                    href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(`Hello Adv. Shareen, I need help preparing documents for ${doc.category} trademark registration.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-[var(--gold)] transition-colors"
                  >
                    <span>Verify My Documents on WhatsApp</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5-Step Trademark Lifecycle Roadmap ============ */}
      <section className="py-20 lg:py-28 bg-[#09090b] text-white relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(203, 167, 88, 0.25), transparent 60%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.15), transparent 60%)",
          }}
        />

        <div className="container relative z-10">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--gold-light)] mb-2 block">
              LIFECYCLE ROADMAP
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight"
              style={{ color: "#ffffff" }}
            >
              From Search to Registered Certificate
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Step-by-step statutory lifecycle managed end-to-end under the direct stewardship of Adv. Shareen Hussain.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((st, i) => (
              <div
                key={st.num}
                className="group relative rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 sm:p-8 hover:bg-white/[0.08] hover:border-[var(--gold-light)]/50 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  <div className="shrink-0 h-12 w-12 rounded-lg bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center font-mono font-bold text-base text-[var(--gold-light)] group-hover:scale-105 group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                    {st.num}
                  </div>

                  <div className="flex-1">
                    <h3
                      className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-[var(--gold-light)] transition-colors"
                      style={{ color: "#ffffff" }}
                    >
                      {st.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {st.desc}
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center text-xs font-mono text-slate-400 group-hover:text-[var(--gold-light)] transition-colors shrink-0">
                    <span>Phase 0{i + 1}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Verified Client Reviews on Google ============ */}
      <GoogleReviewsSection
        title="Trusted by 179+ Brand Owners & Startups"
        subtitle="5.0 ★★★★★ RATED TRADEMARK ATTORNEY ON GOOGLE BUSINESS PROFILE"
        showPillars={false}
      />

      {/* ============ Comprehensive Interactive FAQ Section ============ */}
      <TrademarkFaqInteractive />

      {/* ============ Chamber Helpline & Final Action Strip ============ */}
      <section className="py-16 bg-black text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--gold-light)] block mb-2">
                AUTHORITATIVE IP COUNSEL
              </span>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight"
                style={{ color: "#ffffff" }}
              >
                Protect Your Brand Identity Before Someone Else Does
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Schedule a private strategic review at Trisharan Square, Nagpur or via Google Meet. Receive complete clarity on availability, classes, and registration procedure.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to schedule a private Trademark consultation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-md flex items-center gap-2"
              >
                <Phone size={15} />
                <span>WhatsApp Brand Clearance</span>
              </a>

              <Link
                href="/book"
                className="btn-primary shimmer-badge !py-3.5 !px-7 text-xs sm:text-sm whitespace-nowrap"
              >
                <span>Book Appointment Slot</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
