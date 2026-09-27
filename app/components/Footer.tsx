import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { site } from "@/lib/site-config";
import Logo from "./Logo";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "var(--green-deep)", color: "var(--paper)" }}>
      {/* CTA band */}
      <div style={{ borderBottom: "1px solid rgba(250,247,240,0.1)" }}>
        <div className="container flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-2xl md:text-3xl" style={{ color: "var(--paper)" }}>
              Need legal guidance today?
            </h2>
            <p className="max-w-md text-sm" style={{ color: "rgba(250,247,240,0.7)" }}>
              Request a consultation with Adv. {site.lawyerName} — online or in {site.city}. Confirm fees and visit details with the team.
            </p>
          </div>
          <Link href="/book" className="btn-primary">
            Book an appointment <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Logo variant="light" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: "rgba(250,247,240,0.72)" }}>
            Founded by Adv. {site.lawyerName} in Nagpur, Maharashtra. Consultation, documentation, advisory and representation, with practice across the District Court, Nagpur and the Bombay High Court, Nagpur Bench.
          </p>
          <p className="mt-4 text-sm font-semibold" style={{ color: "var(--gold-light)" }}>
            {site.tagline}
          </p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm no-underline transition-opacity hover:opacity-80"
            style={{ color: "var(--gold-light)" }}
          >
            <InstagramIcon size={16} /> @{site.instagramHandle}
          </a>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--gold-light)", fontFamily: "var(--font-body)" }}>
            Services
          </h4>
          <div className="flex flex-col gap-3">
            {[
              { href: "/court-marriage", label: "Court marriage" },
              { href: "/trademark-registration", label: "Trademark registration" },
              { href: "/legal-services", label: "Other legal services" },
              { href: "/about", label: "About the advocate" },
              { href: "/book", label: "Book appointment" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm no-underline transition-opacity hover:opacity-80" style={{ color: "rgba(250,247,240,0.72)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--gold-light)", fontFamily: "var(--font-body)" }}>
            Contact
          </h4>
          <div className="flex flex-col gap-3.5">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm no-underline" style={{ color: "rgba(250,247,240,0.72)" }}>
              <Phone size={15} style={{ color: "var(--gold-light)", flexShrink: 0 }} /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 text-sm no-underline" style={{ color: "rgba(250,247,240,0.72)" }}>
              <Mail size={15} style={{ color: "var(--gold-light)", flexShrink: 0 }} /> {site.email}
            </a>
            <div className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(250,247,240,0.72)" }}>
              <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--gold-light)" }} /> {site.address}
            </div>
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(250,247,240,0.72)" }}>
              <Clock size={15} style={{ color: "var(--gold-light)", flexShrink: 0 }} /> Walk-in: {site.walkInHours}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(250,247,240,0.1)" }}>
        <div className="container flex flex-wrap items-center justify-between gap-2 py-5 text-[13px]" style={{ color: "rgba(250,247,240,0.5)" }}>
          <span>
            © {new Date().getFullYear()} {site.businessName}. All rights reserved.
          </span>
          <Link href="/admin/login" className="no-underline transition-opacity hover:opacity-80" style={{ color: "rgba(250,247,240,0.5)" }}>
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
