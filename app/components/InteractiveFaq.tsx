"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site-config";

const faqs = [
  {
    q: "Can I consult Adv. Shareen Hussain online via video call?",
    a: "Yes. We offer online video consultations via Google Meet for clients residing outside Nagpur, NRIs, and those who prefer consulting from home or office. Once confirmed by the legal secretary, your private Google Meet link is sent directly to your WhatsApp.",
  },
  {
    q: "How does the appointment booking flow work?",
    a: "Select your preferred date and available 30-minute time slot through our website calendar. Our legal secretary verifies the slot, contacts you on WhatsApp/phone to confirm, and provides the meeting coordinates.",
  },
  {
    q: "Which courts does Adv. Shareen Hussain practice in?",
    a: "Adv. Shareen Hussain practices across the District & Sessions Court, Nagpur, and the High Court of Judicature at Bombay (Nagpur Bench), handling civil, family, property, corporate documentation, and dispute representation.",
  },
  {
    q: "What should I prepare before our consultation?",
    a: "Keep all relevant documents, existing notices, court papers, agreements, or identity proofs ready. Having a chronological summary of facts helps us give you the most accurate legal advice during the 30-minute session.",
  },
  {
    q: "How are consultation fees and office visits arranged?",
    a: "Consultation fees and exact office visiting details are confirmed transparently by our staff before your appointment is finalized. There are zero hidden charges or uncommunicated litigation costs.",
  },
  {
    q: "What services are covered under Trademark & IP registration?",
    a: "We assist with prior comprehensive trademark search across classes, brand filing with the Controller General of Patents, Designs and Trade Marks, replying to examination objections, hearing attendance, and renewal filings.",
  },
];

export default function InteractiveFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section bg-[var(--paper-dark)]/40" aria-labelledby="faq-heading">
      <div className="container max-w-4xl">
        
        <div className="text-center mb-12">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[var(--gold)]" />
            <span>Frequently Asked Questions</span>
          </span>
          <h2 id="faq-heading" className="mt-2 text-3xl font-serif md:text-4xl text-balance">
            Clear answers to common questions
          </h2>
          <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)] max-w-lg mx-auto">
            Everything you need to know about our legal practice, consultations, and court representation.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card)] transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left cursor-pointer gap-4"
                >
                  <span className="font-serif text-base sm:text-lg font-semibold text-[var(--green)]">
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen
                        ? "bg-[var(--gold)] text-[var(--green-deep)] rotate-180"
                        : "bg-[var(--paper-dark)] text-[var(--ink-soft)]"
                    }`}
                  >
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[var(--ink-soft)] border-t border-[var(--line)]/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still have questions card */}
        <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <h4 className="font-serif text-lg font-bold text-[var(--green)]">
              Still have a specific query?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-1">
              Speak directly with our office desk on WhatsApp or call during working hours.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 justify-center">
            <Link href="/contact" className="btn-secondary !py-2.5 !px-5 text-xs">
              Contact Us
            </Link>
            <Link href="/book" className="btn-primary !py-2.5 !px-5 text-xs">
              <span>Book Appointment</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
