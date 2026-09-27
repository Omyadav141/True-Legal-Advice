import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

type Step = { title: string; description: string };
type FAQ = { q: string; a: string };

export default function ServicePage({
  eyebrow,
  title,
  intro,
  documents,
  steps,
  faqs,
  heroImage,
  heroVideo,
  heroQuote,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  documents: string[];
  steps: Step[];
  faqs: FAQ[];
  /** Full-bleed hero image behind the title */
  heroImage: string;
  /** Optional mp4 — plays as the hero background instead of the image */
  heroVideo?: string;
  /** Optional short line shown under the intro, e.g. a warm tagline */
  heroQuote?: string;
}) {
  return (
    <>
      {/* ============ Cinematic hero (image or looping video) ============ */}
      <section className="relative flex min-h-[70svh] items-end overflow-hidden">
        <div className="hero-media">
          {heroVideo ? (
            <video src={heroVideo} poster={heroImage} autoPlay muted loop playsInline aria-hidden="true" />
          ) : (
            <Image src={heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
          )}
        </div>
        <div className="hero-overlay" />
        <div className="container relative z-10 pb-16 pt-32">
          <span className="eyebrow eyebrow-light fade-up">{eyebrow}</span>
          <h1
            className="fade-up fade-up-delay-1 mt-4 max-w-3xl text-4xl leading-tight md:text-5xl text-white font-serif font-bold"
            style={{ color: "#ffffff" }}
          >
            {title}
          </h1>
          <p className="fade-up fade-up-delay-2 mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "rgba(250,247,240,0.85)" }}>
            {intro}
          </p>
          {heroQuote && (
            <p className="fade-up fade-up-delay-2 mt-4 max-w-xl text-sm italic" style={{ color: "var(--gold-light)", fontFamily: "var(--font-display)", fontSize: 17 }}>
              {heroQuote}
            </p>
          )}
          <div className="fade-up fade-up-delay-3 mt-8">
            <Link href="/book" className="btn-primary">
              Book an appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Process + documents ============ */}
      <section className="section">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="eyebrow">Step by step</span>
            <h2 className="mb-8 mt-3 text-2xl md:text-3xl">How the process works</h2>
            <ol className="m-0 flex list-none flex-col gap-0 p-0">
              {steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                  {/* connector line */}
                  {i < steps.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[19px] top-10 h-[calc(100%-40px)] w-px" style={{ background: "var(--line)" }} />
                  )}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: "var(--green)", color: "var(--gold-light)" }}
                  >
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="mb-1.5 text-lg">{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card h-fit lg:sticky lg:top-24" style={{ background: "var(--green)", border: "none" }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(250,247,240,0.12)" }}>
                <FileText size={20} style={{ color: "var(--gold-light)" }} />
              </div>
              <h3 className="text-lg" style={{ color: "var(--paper)" }}>
                Documents you&apos;ll need
              </h3>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {documents.map((doc) => (
                <li key={doc} className="flex items-start gap-2.5">
                  <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0" style={{ color: "var(--gold-light)" }} />
                  <span className="text-sm leading-relaxed" style={{ color: "rgba(250,247,240,0.85)" }}>
                    {doc}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/book" className="btn-primary mt-7 w-full">
              Book an appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section" style={{ background: "var(--paper-dark)" }}>
        <div className="container max-w-3xl">
          <span className="eyebrow">Common questions</span>
          <h2 className="mb-8 mt-3 text-2xl md:text-3xl">Frequently asked questions</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="card group !p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-base font-semibold" style={{ color: "var(--green)", fontFamily: "var(--font-display)" }}>
                  {faq.q}
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg transition-transform duration-200 group-open:rotate-45"
                    style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
                  >
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section text-center">
        <div className="container max-w-2xl">
          <h2 className="mb-3 text-2xl md:text-3xl">Have questions about your case?</h2>
          <p className="mb-7" style={{ color: "var(--ink-soft)" }}>
            Book an appointment and we&apos;ll call you back to discuss the details.
          </p>
          <Link href="/book" className="btn-primary">
            Book an appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
