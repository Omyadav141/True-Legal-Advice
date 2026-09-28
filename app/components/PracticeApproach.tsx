"use client";

import Link from "next/link";
import { ArrowRight, Compass, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { site } from "@/lib/site-config";

const principles = [
  {
    num: "01",
    title: "Understand the person. And the matter.",
    text: "Good legal advice begins with listening attentively. We analyze the facts, family or business context, and the client's actual goals before jumping to procedural filings.",
  },
  {
    num: "02",
    title: "Bring clarity to the next step.",
    text: "Legal knowledge meets practical common sense. You will always know your legal standing, document requirements, expected timeline, and court procedures with zero jargon.",
  },
  {
    num: "03",
    title: "Give every detail its attention.",
    text: "Careful drafting, thorough cross-verification of paperwork, and continuous advocate communication are the backbone of our practice in Nagpur.",
  },
];

export default function PracticeApproach() {
  return (
    <section className="section bg-[var(--paper)]" aria-labelledby="approach-heading">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
        
        {/* Left Side: Story & Tagline */}
        <div className="lg:col-span-5 flex flex-col items-start gap-5">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Compass size={14} className="text-[var(--gold)]" />
            <span>Practice Philosophy</span>
          </span>
          
          <h2 id="approach-heading" className="text-balance font-serif text-3xl leading-tight md:text-5xl">
            Clear guidance.
            <br />
            Practical solutions.
            <br />
            Personal attention.
          </h2>
          
          <p className="text-base leading-relaxed text-[var(--ink-soft)]">
            Whether you are securing trademark protection for your startup, registering a court marriage, verifying a property title deed, or seeking counsel in a dispute, the goal is always clarity and peace of mind.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/book" className="btn-secondary shimmer-badge !py-3 !px-6">
              <span>Discuss your matter</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-4 mt-2">
            <p className="text-xs font-bold text-black">
              {site.tagline}
            </p>
          </div>
        </div>

        {/* Right Side: Animated Interactive Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              whileHover={{ x: 6 }}
              transition={{ duration: 0.25 }}
              className="group rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-[var(--gold)] hover:shadow-lg"
            >
              <div className="flex items-start gap-5">
                <span className="font-mono text-2xl font-bold text-[var(--gold)] group-hover:scale-110 transition-transform">
                  {principle.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {principle.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
