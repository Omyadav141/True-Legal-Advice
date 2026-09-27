import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Landmark, BriefcaseBusiness, Users, Scale, Stamp, FileCheck, ShieldCheck, Building2, HeartHandshake, CheckCircle2 } from "lucide-react";
import GoogleRating from "../components/GoogleRating";
import PracticeApproach from "../components/PracticeApproach";
import { site, otherLegalServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `About Advocate ${site.lawyerName} | ${site.businessName}`,
  description: `Learn about Advocate ${site.lawyerName}'s background, experience, and approach to legal practice in ${site.city}.`,
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ background: "var(--paper-dark)" }}>
        <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl shadow-xl border-2 border-[var(--gold)]/40">
            <Image
              src={site.advocateDeskPhoto}
              alt={`Advocate ${site.lawyerName}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
          <div>
            <span className="eyebrow fade-up">The advocate behind True Legal Advice</span>
            <h1 className="fade-up fade-up-delay-1 mt-3 text-balance font-serif text-3xl leading-tight md:text-5xl">About Adv. {site.lawyerName}</h1>
            <p className="fade-up fade-up-delay-2 mt-5 text-base leading-relaxed md:text-lg" style={{ color: "var(--ink-soft)" }}>
              Adv. Shareen Hussain is a practicing Advocate based in Nagpur, Maharashtra, and the founder of True Legal Advice, a legal consultancy and professional legal services platform providing practical, client-focused legal assistance.
            </p>
            <p className="fade-up fade-up-delay-3 mt-4 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              With a practice extending across the District Court, Nagpur and the Bombay High Court, Nagpur Bench, Adv. Shareen Hussain assists individuals, entrepreneurs, businesses, startups and organisations with legal consultation, documentation, advisory and representation.
            </p>
            <div className="mt-7">
              <GoogleRating />
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section">
        <div className="container grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { icon: <Landmark size={24} aria-hidden="true" />, title: "Court practice", detail: "District Court, Nagpur · Bombay High Court, Nagpur Bench" },
            { icon: <BriefcaseBusiness size={24} aria-hidden="true" />, title: "True Legal Advice", detail: "Legal consultation, documentation, advisory and representation" },
            { icon: <Users size={24} aria-hidden="true" />, title: "Who she assists", detail: "Individuals, entrepreneurs, businesses, startups and organisations" },
          ].map((c) => (
            <div key={c.title} className="card card-hover flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                {c.icon}
              </div>
              <h3 className="text-lg">{c.title}</h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {c.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed About — Areas of Practice */}
      <section className="section" style={{ background: "var(--paper-dark)" }}>
        <div className="container">
          <span className="eyebrow">Areas of practice</span>
          <h2 className="mb-4 mt-3 text-2xl md:text-3xl">What she handles</h2>
          <p className="mb-8 max-w-3xl text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Her areas of practice include Trademark & Intellectual Property matters, Property & Real Estate matters, Family and Muslim Law, Consumer matters, Motor Accident matters, legal drafting, agreements, due diligence, business registrations and other legal consultancy services.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Stamp, title: "Trademark & IP", desc: "Trademark registration and prosecution, brand and IP protection" },
              { icon: Building2, title: "Property & Real Estate", desc: "Property documentation, due diligence, deeds and property transactions" },
              { icon: HeartHandshake, title: "Family & Muslim Law", desc: "Personalised consultation and assistance with family and Muslim Law matters" },
              { icon: Scale, title: "Consumer & MACT", desc: "Legal advice, documentation and representation for consumer and motor accident matters" },
              { icon: FileCheck, title: "Drafting & Agreements", desc: "Legal agreements, notices, deeds, Power of Attorney and documentation" },
              { icon: ShieldCheck, title: "Business Registrations", desc: "GST, Udyam, Gumasta, FSSAI, company registration and compliance" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card card-hover flex flex-col gap-3 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--green)" }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Through True Legal Advice paragraph */}
          <div className="rounded-2xl border border-[var(--gold)]/30 bg-white p-6 md:p-8 max-w-4xl">
            <p className="text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Through True Legal Advice, clients can also seek professional assistance for business and compliance requirements such as Trademark registration and prosecution, GST, Udyam Registration, Gumasta, FSSAI-related work, company registration, legal agreements, notices, deeds, Power of Attorney, property documentation and other legal and business-support services.
            </p>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              The practice focuses on providing clear legal guidance, practical solutions and personalised attention to every client. Whether it is protecting a brand, starting or expanding a business, dealing with a property transaction, preparing important legal documentation or seeking guidance in a legal dispute, True Legal Advice aims to make the legal process more understandable and accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Practice Tags */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">Full practice range</span>
          <h2 className="mb-8 mt-3 text-2xl md:text-3xl">All service areas</h2>
          <div className="flex flex-wrap gap-3">
            {otherLegalServices.map(({ title: area }) => (
              <span
                key={area}
                className="rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:border-[var(--gold)] hover:bg-[var(--gold-soft)]"
                style={{ borderColor: "var(--line)", background: "var(--white)", color: "var(--green)" }}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PracticeApproach />

      {/* Brand Tagline */}
      <section className="py-16 bg-[var(--green-deep)] text-center">
        <div className="container">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold-light)] mb-3">True Legal Advice</p>
          <h2 className="text-2xl md:text-4xl font-serif" style={{ color: "var(--paper)" }}>
            Your Brand, Your Identity, Our Protection.
          </h2>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="container max-w-2xl">
          <h2 className="mb-3 text-2xl md:text-3xl">Ready to discuss your matter?</h2>
          <p className="mb-7" style={{ color: "var(--ink-soft)" }}>
            Request a consultation — online or in {site.city}. Please confirm the applicable fee and office details with the team before your visit.
          </p>
          <Link href="/book" className="btn-primary">
            Book an appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
