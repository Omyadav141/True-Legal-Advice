import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scale } from "lucide-react";
import { site, otherLegalServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Legal Services in ${site.city} | ${site.businessName}`,
  description: `Trademark, property, Family and Muslim Law, consumer, motor accident, documentation and business-support services from Adv. ${site.lawyerName} in ${site.city}.`,
};

export default function LegalServicesPage() {
  return (
    <>
      {/* Cinematic hero */}
      <section className="relative flex min-h-[70svh] items-end overflow-hidden">
        <div className="hero-media">
          <Image src="/images/hero-legal.png" alt="" fill priority className="object-cover" sizes="100vw" />
        </div>
        <div className="hero-overlay" />
        <div className="container relative z-10 pb-16 pt-32">
          <span className="eyebrow eyebrow-light fade-up">Other legal services</span>
          <h1
            className="fade-up fade-up-delay-1 mt-4 max-w-3xl text-4xl leading-tight md:text-5xl text-white font-serif font-bold"
            style={{ color: "#ffffff" }}
          >
            Legal support for everyday matters
          </h1>
          <p className="fade-up fade-up-delay-2 mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "rgba(250,247,240,0.85)" }}>
            Adv. {site.lawyerName} assists individuals, businesses and organisations with Trademark & Intellectual Property, Property & Real Estate, Family and Muslim Law, Consumer and Motor Accident matters, alongside legal drafting and business-support services.
          </p>
          <div className="fade-up fade-up-delay-3 mt-8">
            <Link href="/book" className="btn-primary">
              Book an appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">Areas of practice</span>
          <h2 className="mb-10 mt-3 text-2xl md:text-3xl">How we can help</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {otherLegalServices.map((service) => (
              <div key={service.title} className="card card-hover flex gap-5">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                >
                  <Scale size={22} />
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg">{service.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center" style={{ background: "var(--green)" }}>
        <div className="container max-w-2xl">
          <h2
            className="mb-3 text-2xl md:text-3xl font-serif font-bold text-white"
            style={{ color: "#ffffff" }}
          >
            Not sure which service you need?
          </h2>
          <p className="mb-7" style={{ color: "rgba(250,247,240,0.75)" }}>
            Book an appointment and describe your situation — we&apos;ll guide you from there.
          </p>
          <Link href="/book" className="btn-primary">
            Book an appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
