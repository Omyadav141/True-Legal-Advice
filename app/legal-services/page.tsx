import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Scale,
  Shield,
  Building2,
  FileCheck2,
  HeartHandshake,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Phone,
  Clock,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { site, otherLegalServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Legal Services in Nagpur | High Court & District Court Advocate ${site.lawyerName}`,
  description: `Comprehensive legal consultation, litigation, property documentation, Family Law & Matrimonial matters, MACT accident claims, consumer disputes, and corporate contracts with Adv. ${site.lawyerName} in Nagpur.`,
};

const practiceHighlights = [
  {
    title: "Property & Real Estate Advisory",
    subtitle: "Title Search, Due Diligence & Deeds",
    timeline: "2 to 5 Working Days",
    icon: Building2,
    badge: "High Demand",
    badgeColor: "bg-black text-[#cba758] border-[#cba758]/30",
    desc: "Rigorous 30-year title verification, search reports, encumbrance verification, drafting Sale Deeds, Gift Deeds, Wills, Lease Deeds, and Sub-Registrar execution.",
    deliverables: [
      "30-Year Title Search & Non-Encumbrance Report",
      "Drafting & Registration of Sale, Gift & Release Deeds",
      "Will Drafting, Codicils & Probate Guidance",
      "Partition, Tenancy Agreements & Power of Attorney",
    ],
  },
  {
    title: "Family Law & Matrimonial Advisory",
    subtitle: "Divorce, Maintenance, Custody & Settlement",
    timeline: "Strictly Confidential",
    icon: HeartHandshake,
    badge: "Confidential",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    desc: "Compassionate and confidential advisory for Family Court matters, mutual consent divorce (Section 13B), child custody, alimony & maintenance, and matrimonial dispute settlements.",
    deliverables: [
      "Mutual Consent Divorce & Section 13B Petitions",
      "Maintenance (125 CrPC & D.V. Act) Defence & Filing",
      "Child Custody, Guardianship & Settlement Agreements",
      "Mediation & Restitution of Conjugal Rights (RCR)",
    ],
  },
  {
    title: "Litigation & Court Representation",
    subtitle: "Bombay High Court & District Court, Nagpur",
    timeline: "Fast-Track Drafting",
    icon: Scale,
    badge: "Court Practice",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    desc: "Active courtroom advocacy before the High Court of Judicature at Bombay (Nagpur Bench) and District & Sessions Court for civil suits, cheque bounce (138 NI Act), and criminal bail matters.",
    deliverables: [
      "Civil Suits, Injunctions & Property Declarations",
      "Cheque Bounce Prosecutions (Section 138 NI Act)",
      "Anticipatory & Regular Bail Petitions",
      "Writ Petitions & High Court Revision Appeals",
    ],
  },
  {
    title: "Consumer Court & MACT Claims",
    subtitle: "Consumer Redressal & Accident Claims",
    timeline: "Results Focused",
    icon: AlertCircle,
    badge: "Rights Protection",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    desc: "Aggressive consumer protection filing against builder delays, deficient insurance companies, medical negligence, and Motor Accident Claims Tribunal (MACT) compensation recovery.",
    deliverables: [
      "District & State Consumer Commission Complaints",
      "Legal Notices for Deficiency of Service & Fraud",
      "MACT Claim Petitions for Accident Victims & Kin",
      "Insurance Rejection Appeals & Settlement Negotiations",
    ],
  },
  {
    title: "Commercial Contracts & Corporate Compliance",
    subtitle: "Agreements, NDAs, GST & Registrations",
    timeline: "1 to 3 Working Days",
    icon: FileCheck2,
    badge: "Corporate IP",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    desc: "Bulletproof commercial agreements, partnership deeds, NDAs, employment contracts, and statutory corporate registrations for Nagpur businesses and startups.",
    deliverables: [
      "Commercial Contracts, Vendor Agreements & NDAs",
      "Partnership Deeds & Founder Agreements",
      "Shop Act (Gumasta), Udyam (MSME) & GST Advisory",
      "Legal Notices, Rejoinders & Cease & Desist Notices",
    ],
  },
  {
    title: "Legal Scrutiny & Strategic Consultation",
    subtitle: "Online Video or In-Chamber Meeting",
    timeline: "Dedicated Slot",
    icon: Briefcase,
    badge: "Strategic Counsel",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    desc: "Unrushed, strategic legal evaluation of your case documents, dispute posture, and statutory remedies with Adv. Shareen Hussain.",
    deliverables: [
      "Thorough Case Document Scrutiny & Risk Assessment",
      "Actionable Step-by-Step Legal Roadmap",
      "Advising on Pre-Litigation Mediation & Settlement",
      "Follow-up Documentation Checklist & Cost Estimates",
    ],
  },
];

export default function LegalServicesPage() {
  return (
    <>
      {/* ============ Grand Cinematic Hero (Matching Court Marriage) ============ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="hero-media">
          <Image
            src="/images/hero-legal.png"
            alt="Advocate Legal Services in Nagpur"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="hero-overlay" />
        <div className="container relative z-10 pb-16 pt-32">
          <div className="max-w-4xl">
            {/* Live Security & Privilege Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-black/50 px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--gold-light)] backdrop-blur-md mb-6">
              <Lock size={13} />
              <span>100% CONFIDENTIAL & ADVOCATE-CLIENT PRIVILEGED COUNSEL</span>
            </div>

            <h1
              style={{ color: "#ffffff" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight"
            >
              Comprehensive Legal Services & Court Representation in Nagpur
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-100 leading-relaxed max-w-3xl">
              Ethical, strategic, and result-oriented legal counsel guided by <strong>Adv. {site.lawyerName}</strong> (B.Com, M.Com, LL.B). Representing clients across the <strong>Bombay High Court (Nagpur Bench)</strong> and <strong>District & Sessions Court</strong> in property due diligence, family disputes, consumer forum claims, criminal bail, and commercial contracts.
            </p>

            {/* Quick Guarantees Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs max-w-3xl">
              {[
                { title: "High Court Practice", desc: "Nagpur Bench & District Court" },
                { title: "30-Yr Title Search", desc: "Airtight Property Due Diligence" },
                { title: "Advocate Privilege", desc: "100% Confidential Chamber" },
                { title: "Transparent Pricing", desc: "No Hidden Legal Surprises" },
              ].map((g, i) => (
                <div key={i} className="rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur-md">
                  <p className="font-bold text-[var(--gold-light)]">{g.title}</p>
                  <p className="text-[11px] text-slate-200 mt-0.5">{g.desc}</p>
                </div>
              ))}
            </div>

            {/* Hero CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/book?service=other" className="btn-primary shimmer-badge !py-3.5 !px-8 text-sm">
                <span>Book Legal Consultation</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I require legal consultation regarding a matter in Nagpur.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-3.5 !px-8 text-sm"
              >
                <Phone size={16} />
                <span>WhatsApp Chamber Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Practice Pathways Grid ============ */}
      <section className="py-20 bg-[var(--paper-light)] border-b border-[var(--border)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">PRACTICE SPECTRUM</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2">
              Areas of Specialized Legal Representation
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)]">
              Select your matter below to review key chamber deliverables and schedule a dedicated case consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {practiceHighlights.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="card flex flex-col justify-between p-7 rounded-2xl bg-white border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--gold)] transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                      <span className="text-xs font-semibold text-[var(--ink-muted)] flex items-center gap-1">
                        <Clock size={12} /> {p.timeline}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center shrink-0 text-[var(--gold)]">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-lg font-bold font-serif text-[var(--ink)] leading-snug">
                        {p.title}
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-[var(--gold)] mb-3">
                      {p.subtitle}
                    </p>

                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                      {p.desc}
                    </p>

                    <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-4">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--ink)] mb-2">
                        Chamber Scope of Work:
                      </p>
                      {p.deliverables.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink-soft)]">
                          <CheckCircle2 size={13} className="text-[#cba758] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[var(--border)] space-y-2">
                    <Link
                      href={`/book?service=other&matter=${encodeURIComponent(p.title)}`}
                      className="btn-pathway w-full !text-white text-center justify-center"
                    >
                      <span style={{ color: "#ffffff", fontWeight: 700 }}>Schedule Case Review</span>
                      <ArrowRight size={13} style={{ color: "#cba758" }} />
                    </Link>

                    <a
                      href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(`Hello Adv. Shareen, I would like to consult on: ${p.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-black transition-colors"
                    >
                      <span>Quick WhatsApp Desk</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Chamber Walk-in & Direct Consultation Banner ============ */}
      <section className="py-16 bg-black text-white border-y border-[var(--gold)]/20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--gold-light)] block mb-2">
                DAILY CHAMBER PRACTICE · TRISHARAN SQUARE, NAGPUR
              </span>
              <h2
                style={{ color: "#ffffff" }}
                className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight"
              >
                In-Chamber Walk-in Desk & Document Verification Hours
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                Adv. Shareen Hussain conducts daily morning and evening walk-in consultations at Trisharan Square, Nagpur. Bring your original documents, previous court orders, or notices for prompt legal evaluation.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
                  <Clock size={14} className="text-[var(--gold-light)]" />
                  Morning: 9:30 AM – 11:00 AM
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
                  <Clock size={14} className="text-[var(--gold-light)]" />
                  Evening: 5:30 PM – 8:30 PM
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/book?service=other"
                className="btn-primary shimmer-badge !py-3 !px-6 text-center text-xs whitespace-nowrap"
              >
                <span>Book Confirmed Appointment</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={`tel:${site.phone}`}
                className="btn-whatsapp !py-3 !px-6 text-xs text-center"
              >
                <Phone size={14} />
                <span>Call Chamber: {site.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Ready to Discuss CTA ============ */}
      <section className="section text-center bg-white">
        <div className="container max-w-2xl">
          <h2 className="mb-3 text-2xl md:text-3xl font-serif font-bold text-[var(--ink)]">
            Not sure which legal category fits your situation?
          </h2>
          <p className="mb-7 text-sm text-[var(--ink-soft)] leading-relaxed">
            Schedule an exploratory consultation — either via Online Google Meet or at the Trisharan Square chamber in {site.city}. Our team will review your situation and advise on the most effective legal path forward.
          </p>
          <Link href="/book?service=other" className="btn-primary">
            Book an appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
