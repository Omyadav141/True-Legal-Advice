import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShieldCheck,
  Scale,
  FileCheck2,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Phone,
  AlertCircle,
  Award,
  Sparkles,
  Lock,
} from "lucide-react";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Court Marriage Lawyer in Nagpur | Adv. ${site.lawyerName} | True Legal Advice`,
  description: `Complete, confidential, and 100% lawful Court Marriage & Love Marriage legal registration in Nagpur under the Special Marriage Act 1954 and Hindu Marriage Act. Expert guidance, document checklist, police protection, and certificate issuance with Adv. ${site.lawyerName}.`,
};

export default function CourtMarriagePage() {
  const pathways = [
    {
      title: "Special Marriage Act, 1954",
      subtitle: "Civil / Inter-Caste / Inter-Faith Marriage",
      timeline: "30-Day Statutory Notice Period",
      desc: "Ideal for inter-religion, inter-caste, or secular couples who wish to marry without converting their religion. Completely civil, secular, and recognized globally.",
      highlights: [
        "Zero religious conversion required",
        "Applicable to any Indian citizen or NRI",
        "Mandatory 30-day notice filed at Registrar Office",
        "3 witnesses required on registration day",
        "Statutory marriage certificate issued by Govt of Maharashtra",
      ],
      badge: "Most Popular for Inter-Faith",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      title: "Hindu Marriage Act, 1955",
      subtitle: "Customary / Arya Samaj Court Registration",
      timeline: "1 to 3 Working Days",
      desc: "For Hindu, Buddhist, Jain, or Sikh couples who have solemnized their marriage through Vedic or customary rites (such as Arya Samaj) and require immediate legal court registration.",
      highlights: [
        "Immediate legal registration post-ceremony",
        "Same-day or 48-hour certificate issuance",
        "Proof of ceremony & 3 adult witnesses needed",
        "Irrefutable legal proof for passport, visa, and banking",
        "High Court recognized valid legal status",
      ],
      badge: "Fast-Track Registration",
      badgeColor: "bg-black text-[#cba758] border-[#cba758]/30",
    },
    {
      title: "Urgent Marriage Registration & SRO Certificate",
      subtitle: "Government Civil Marriage Certificate",
      timeline: "Same-Day to 48 Hours",
      desc: "Formal civil court registration for married couples requiring expedited statutory marriage certificates for passport renewal, international visa filing, joint banking, and High Court recognized legal protection.",
      highlights: [
        "Expedited Sub-Registrar Office (SRO) registration",
        "Certified Govt. of Maharashtra Marriage Certificate",
        "Complete witness verification & affidavit documentation",
        "High Court recognized legal protection & status",
        "Irrefutable documentation for domestic and foreign use",
      ],
      badge: "Certified SRO Issuance",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    },
  ];

  const documents = [
    {
      party: "Groom Requirements (Age 21+)",
      items: [
        "Age Proof: 10th Class Passing Certificate, Birth Certificate, or Passport",
        "Identity Proof: Aadhaar Card, Voter ID, or PAN Card",
        "Address Proof: Aadhaar Card, Passport, or Electricity / Bank statement",
        "Recent Passport-Size Photographs (6 copies, light background)",
        "Affidavit of Marital Status (Single / Divorced / Widower) & Age",
      ],
    },
    {
      party: "Bride Requirements (Age 18+)",
      items: [
        "Age Proof: 10th Class Passing Certificate, Birth Certificate, or Passport",
        "Identity Proof: Aadhaar Card, Voter ID, or PAN Card",
        "Address Proof: Aadhaar Card, Passport, or Electricity / Bank statement",
        "Recent Passport-Size Photographs (6 copies, light background)",
        "Affidavit of Marital Status (Single / Divorced / Widow) & Age",
      ],
    },
    {
      party: "Witness Requirements (3 Adult Witnesses)",
      items: [
        "3 Adult Witnesses of sound mind (can be friends, relatives, or colleagues)",
        "Original Aadhaar Card and PAN Card / Voter ID for each witness",
        "2 Passport-size photographs of each witness",
        "Physical presence before the Marriage Registrar on registration date",
      ],
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Confidential Legal Consultation",
      desc: "Private discussion at our Trisharan Square chamber or via Google Meet. Adv. Shareen reviews age eligibility, identity documents, and personal circumstances.",
    },
    {
      num: "02",
      title: "Affidavit Drafting & Legal File Preparation",
      desc: "Drafting of mandatory legal affidavits, verification of non-prohibited relationship degrees, and compilation of the formal application file.",
    },
    {
      num: "03",
      title: "Filing Notice of Intended Marriage",
      desc: "Formal submission to the Competent Marriage Officer/Registrar in Nagpur jurisdiction as required by statutory law.",
    },
    {
      num: "04",
      title: "Solemnization & Registrar Appearance",
      desc: "Couple and 3 adult witnesses appear before the Marriage Registrar. Verification and signing of the marriage register under advocate supervision.",
    },
    {
      num: "05",
      title: "Marriage Certificate Handover",
      desc: "Issuance of the official Government Marriage Certificate with QR verification, valid across all legal, immigration, and passport authorities.",
    },
  ];

  const faqs = [
    {
      q: "Can two consenting adults marry without parental consent in India?",
      a: "Yes. Under Indian law (Special Marriage Act 1954 and Hindu Marriage Act 1955), any adult male (21+) and adult female (18+) of sound mind have the fundamental legal right to marry anyone of their choice. Parental presence or consent is NOT legally required. The Supreme Court of India in multiple landmark rulings (Shafin Jahan, Shakti Vahini, Lata Singh) has firmly upheld that adult choice in marriage is a fundamental right under Article 21 of the Constitution.",
    },
    {
      q: "Can our friends or colleagues act as the 3 witnesses?",
      a: "Yes. The law requires 3 adult witnesses (above 18 years of age) with valid government identity proof (Aadhaar, Voter ID, or Passport). They do not have to be parents or blood relatives; trusted friends, colleagues, or acquaintances can lawfully act as witnesses.",
    },
    {
      q: "What if one or both partners face threats or harassment from families?",
      a: "Adv. Shareen Hussain provides proactive legal security advisory. We draft and submit formal Police Protection intimations to the Commissioner of Police / Superintendent of Police (SP) and local police stations under Supreme Court directives. If necessary, a Writ Petition for Police Protection can be filed before the High Court Nagpur Bench.",
    },
    {
      q: "Do we need to convert our religion for Court Marriage?",
      a: "No! Under the Special Marriage Act 1954, neither the bride nor the groom needs to change or renounce their religion. You retain your respective faiths, names, and cultural identities while being lawfully married in the eyes of the law.",
    },
    {
      q: "What is the difference between an Arya Samaj Certificate and Court Marriage Certificate?",
      a: "An Arya Samaj certificate is a religious solemnization certificate. While valid, government agencies, passport offices, and foreign embassies require an official Government Marriage Certificate issued by the Registrar of Marriages (Sub-Registrar). We handle the Arya Samaj ceremony followed immediately by statutory court registration to secure your government-issued certificate.",
    },
    {
      q: "How does the private court marriage consultation work?",
      a: "Our private legal consultation provides a thorough strategic review (either in-chamber at Trisharan Square, Nagpur or online via Google Meet). Consultation booking details and scheduled slot options are provided on our booking portal, and all subsequent government fees and procedure charges are explained transparently during the consultation with zero hidden costs.",
    },
  ];

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* ============ Cinematic Hero ============ */}
      <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-[#0d0a07]">
        <div className="hero-media relative">
          <Image
            src="/images/hero-marriage.png"
            alt="Court Marriage Solemnization and Registration in Nagpur"
            fill
            priority
            className="object-cover scale-105 transition-transform duration-1000"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/35 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
        <div className="hero-overlay !opacity-0" />
        <div className="container relative z-10 pb-16 pt-32">
          <div className="max-w-4xl">
            {/* Live Security Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-black/50 px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--gold-light)] backdrop-blur-md mb-6">
              <Lock size={13} />
              <span>100% CONFIDENTIAL & LAWFUL MARRIAGE ADVISORY</span>
            </div>

            <h1
              style={{ color: "#ffffff" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight"
            >
              Court Marriage & Love Marriage Legal Registration in Nagpur
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-100 leading-relaxed max-w-3xl">
              Step-by-step lawful registration under the <strong>Special Marriage Act 1954</strong> and <strong>Hindu Marriage Act 1955</strong> guided by <strong>Adv. {site.lawyerName}</strong>. Complete documentation, affidavit drafting, witness guidance, police protection advisory, and official government marriage certificate issuance.
            </p>

            {/* Quick Guarantees Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs max-w-3xl">
              {[
                { title: "No Religion Change", desc: "Special Marriage Act" },
                { title: "Strict Confidentiality", desc: "Private Chamber Handling" },
                { title: "Article 21 Rights", desc: "Supreme Court Protection" },
                { title: "Govt Certificate", desc: "100% Globally Valid" },
              ].map((g, i) => (
                <div key={i} className="rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur-md">
                  <p className="font-bold text-[var(--gold-light)]">{g.title}</p>
                  <p className="text-[11px] text-slate-200 mt-0.5">{g.desc}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/book" className="btn-primary shimmer-badge !py-3.5 !px-8 text-sm">
                <span>Book Private Consultation</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage in Nagpur.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-3.5 !px-8 text-sm"
              >
                <Phone size={16} />
                <span>WhatsApp Legal Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Marriage Pathways Section ============ */}
      <section className="py-20 bg-[var(--paper-light)] border-b border-[var(--border)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow">Legal Registration Options</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2">
              Choose the Right Legal Marriage Pathway
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)]">
              Depending on your religion, timeline, and personal preference, marriage can be solemnized and registered under different Indian statutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pathways.map((p, idx) => (
              <div
                key={idx}
                className="card flex flex-col justify-between p-7 rounded-2xl bg-white border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-[var(--gold)] transition-all"
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

                  <h3 className="text-xl font-bold font-serif text-[var(--ink)] leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--gold)] mt-1">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)] mt-3 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-4">
                    {p.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink-soft)]">
                        <CheckCircle2 size={13} className="text-[#cba758] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border)]">
                  <Link
                    href={`/book?service=court-marriage&matter=${encodeURIComponent(p.title)}`}
                    className="btn-pathway w-full !text-white"
                  >
                    <span style={{ color: "#ffffff", fontWeight: 700 }}>Consult on this pathway</span>
                    <ArrowRight size={14} style={{ color: "#cba758" }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Complete Document Checklist ============ */}
      <section className="py-20 bg-white border-b border-[var(--border)]">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="eyebrow">Document Checklist</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2">
              Required Documents for Court Marriage in Nagpur
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)]">
              Ensure you have the following documents ready before filing. Our chamber assists in preparing and notarizing all legal affidavits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documents.map((docGroup, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[var(--paper)] border border-[var(--border)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4 text-black">
                    <FileCheck2 size={18} className="text-[var(--gold)]" />
                    <h3 className="font-serif font-bold text-base">{docGroup.party}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {docGroup.items.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--ink-soft)] leading-relaxed">
                        <span className="text-[var(--gold)] font-bold shrink-0">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] text-[11px] text-[var(--ink-muted)]">
                  <span>Photocopies and original verification required before Registrar.</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Special Note on Previous Marriages:</strong> If either party was previously married, an official certified copy of the Divorce Decree from a competent Family Court or the Death Certificate of the deceased spouse is mandatory before filing notice.
            </p>
          </div>
        </div>
      </section>

      {/* ============ Step-by-Step Procedure ============ */}
      <section className="py-20 bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Process Roadmap</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2">
              Step-by-Step Court Marriage Procedure
            </h2>
            <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)]">
              From initial confidential document verification to collecting your official Government Marriage Certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-5 rounded-2xl bg-white border border-[var(--border)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-mono font-bold text-[var(--gold)] block mb-2">
                    {s.num}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[var(--ink)] leading-tight mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Article 21 & Legal Security Band ============ */}
      <section className="py-16 bg-black text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cba758]/20 text-[#cba758] text-xs font-mono uppercase tracking-wider mb-3">
                <ShieldCheck size={14} />
                <span>CONSTITUTIONAL PROTECTION FOR CONSENTING ADULTS</span>
              </span>
              <h3
                style={{ color: "#ffffff" }}
                className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight"
              >
                Facing opposition, harassment, or threats? The Constitution protects your choice.
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Under Article 21 of the Constitution of India and landmark Supreme Court verdicts, every adult citizen has an unfettered legal right to marry the person of their choice. We draft and file formal police protection intimations and emergency high court petitions to prevent harassment, illegal confinement, or false FIRs against couples.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href={`/book?service=court-marriage&matter=${encodeURIComponent("Police Protection & Article 21 Advisory")}`}
                className="btn-primary shimmer-badge !py-3 !px-6 text-center text-xs whitespace-nowrap"
              >
                <span>Book Protection Advisory</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need urgent legal protection guidance regarding our court marriage.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !py-3 !px-6 text-xs text-center flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                }}
              >
                <Phone size={14} style={{ color: "#ffffff", stroke: "#ffffff" }} />
                <span style={{ color: "#ffffff", fontWeight: 700 }}>Direct WhatsApp Helpline</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Comprehensive FAQ Accordion ============ */}
      <section className="py-20 bg-white border-b border-[var(--border)]">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <span className="eyebrow">Frequently Answered Questions</span>
            <h2 className="text-3xl font-serif font-bold mt-2">
              Common Questions About Court Marriage in Nagpur
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 transition-all"
              >
                <h4 className="text-base font-serif font-bold text-[var(--ink)] flex items-start gap-2">
                  <HelpCircle size={17} className="text-[var(--gold)] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Bottom Consultation CTA ============ */}
      <section className="py-20 bg-black text-white text-center">
        <div className="container max-w-2xl">
          <h2
            style={{ color: "#ffffff" }}
            className="text-3xl md:text-4xl font-serif font-bold text-white"
          >
            Schedule a Confidential Marriage Consultation
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed">
            Speak directly with Adv. Shareen Hussain at our Trisharan Square chamber in Nagpur or via private Google Meet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-primary shimmer-badge !py-3.5 !px-8 text-sm">
              <span>Book Appointment Slot</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="px-6 py-3.5 rounded-full text-sm font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Phone size={15} />
              <span>Call Chamber: {site.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
