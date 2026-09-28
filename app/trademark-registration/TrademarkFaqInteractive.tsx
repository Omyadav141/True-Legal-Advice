"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, Search, Sparkles, ShieldCheck, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site-config";

interface TrademarkFaqItem {
  q: string;
  a: string;
  category: "Search & Filing" | "Classes & Protection" | "Objection & Hearing" | "Govt Fees & MSME" | "Opposition & Renewal";
}

const TRADEMARK_FAQS: TrademarkFaqItem[] = [
  {
    category: "Search & Filing",
    q: "Can I start using the ™ symbol immediately after filing with Adv. Shareen?",
    a: "Yes! The moment Form TM-A is submitted to the Controller General of Patents, Designs and Trade Marks (CGPDTM), an official Application Number with timestamp is generated within 24 to 48 hours. By law, this grants you immediate legal entitlement to affix the ™ symbol next to your brand name, logo, or packaging, legally warning copycats that statutory rights are claimed.",
  },
  {
    category: "Govt Fees & MSME",
    q: "How does MSME / Udyam registration save 50% on official Government Trademark fees?",
    a: "The Government of India charges ₹9,000 per class for corporate entities (Pvt Ltd, Public Ltd, large firms). However, for Individuals, Sole Proprietorships, Startups, and MSME-registered businesses (Udyam), the official Government fee is subsidized by 50% down to ₹4,500 per class. Through our chamber, Adv. Shareen Hussain facilitates immediate Udyam registration for your business, securing this ₹4,500 per class statutory discount.",
  },
  {
    category: "Objection & Hearing",
    q: "What is a Section 9 Objection (Absolute Grounds of Refusal)?",
    a: "A Section 9 objection is issued when the Trademark Examiner believes your mark lacks distinctive character, or consists exclusively of words indicating the kind, quality, quantity, intended purpose, or geographical origin of the goods/services (e.g. attempting to register 'Pure Fresh Water' for bottled water). As a certified Trade Mark Attorney, Adv. Shareen drafts an exhaustive legal counter-statement, submits evidence of prior commercial use, invoices, and market recognition to establish acquired distinctiveness.",
  },
  {
    category: "Objection & Hearing",
    q: "What is a Section 11 Objection (Relative Grounds of Refusal)?",
    a: "A Section 11 objection occurs when the Examiner cites an existing registered mark or pending application that has visual, phonetic, or conceptual similarity in the same or allied class. We draft a comprehensive distinction brief demonstrating differences in target audience, trade channels, phonetic cadence, logo device elements, and consumer perception, supported by landmark High Court and Supreme Court precedents.",
  },
  {
    category: "Objection & Hearing",
    q: "Can Adv. Shareen Hussain attend show-cause hearings before the Registrar on my behalf?",
    a: "Yes. Adv. Shareen Hussain is a registered Trade Mark Attorney entitled to represent clients before the Registrar of Trade Marks (Mumbai Jurisdiction, Delhi, and nationwide virtual hearings). If the Examiner is not fully satisfied by the written reply, she represents you directly during show-cause hearings with legal arguments and documented exhibits.",
  },
  {
    category: "Classes & Protection",
    q: "What is the difference between Class 1–34 (Goods) and Class 35–45 (Services)?",
    a: "Under the international Nice Classification system, Classes 1 through 34 govern tangible physical products (e.g. Class 25 for apparel/clothing, Class 3 for cosmetics/perfumes, Class 9 for electronics/software products). Classes 35 through 45 govern services (e.g. Class 35 for retail, e-commerce, advertising & business management, Class 41 for education/entertainment, Class 42 for software development and IT services). Choosing the wrong class leaves your real business exposed. We conduct a thorough analysis to select the exact classes that match both your current operations and future 5-year expansion.",
  },
  {
    category: "Opposition & Renewal",
    q: "What happens during the 4-month Trademark Journal publication period?",
    a: "Once an application passes examination, it is published in the official weekly Trademark Journal. The Trade Marks Act grants the general public and competitors a 4-month statutory period to review the mark. If no opposition is filed within 4 months, the mark proceeds directly to registration. If a competitor files a Notice of Opposition (Form TM-O), our chamber drafts your counter-statement (Form TM-A) within the mandatory 60 days to defend your trademark.",
  },
  {
    category: "Opposition & Renewal",
    q: "How long is a registered trademark valid in India, and how is it renewed?",
    a: "A registered trademark in India remains valid for 10 years from the date of filing. It can be renewed indefinitely every 10 years by filing Form TM-R with the statutory renewal fee. With timely renewals, your trademark monopoly and legal protection can last perpetually across generations.",
  },
  {
    category: "Search & Filing",
    q: "Can an individual or unregistered startup own a trademark?",
    a: "Yes. An individual citizen, freelancer, or sole proprietor can apply for and legally own a trademark in their individual name. When you later incorporate a Private Limited Company or LLP, the trademark can be legally assigned or licensed to your company through an Assignment Deed drafted by our chamber.",
  },
  {
    category: "Classes & Protection",
    q: "What is a Logo TM-60 Certificate and why is Copyright also important?",
    a: "If your brand has a unique artistic logo, mascot, or graphic icon, you can protect both the brand name under the Trade Marks Act and the artistic design under the Copyright Act, 1957. A Search Certificate (Form TM-60) is obtained from the Trademark Registry confirming no identical mark exists, allowing you to secure permanent artistic copyright protection valid for the author's lifetime plus 60 years.",
  },
  {
    category: "Classes & Protection",
    q: "Can an Indian trademark protect my brand in international markets?",
    a: "Trademarks are territorial. However, India is a signatory to the Madrid Protocol administered by WIPO. With an Indian trademark application or registration as your base, Adv. Shareen can coordinate international filings across up to 130 member countries with a single consolidated application.",
  },
  {
    category: "Search & Filing",
    q: "Why is a preliminary clearance search necessary before applying?",
    a: "Filing blindly without a preliminary clearance search is the #1 reason trademark applications get stuck or abandoned. A comprehensive search examines not only exact matches, but phonetic homophones, translation equivalents, and cross-class citations. Our search prevents you from investing time and money into a brand name that will ultimately face fatal objections.",
  },
];

const CATEGORIES = [
  "All",
  "Search & Filing",
  "Classes & Protection",
  "Objection & Hearing",
  "Govt Fees & MSME",
  "Opposition & Renewal",
] as const;

export default function TrademarkFaqInteractive() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return TRADEMARK_FAQS.filter((faq) => {
      const matchesCat = selectedCategory === "All" || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="section bg-[var(--paper-dark)]/40 border-y border-[var(--line)]" aria-labelledby="tm-faq-heading">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="eyebrow inline-flex items-center gap-1.5 justify-center">
            <HelpCircle size={14} className="text-[var(--gold)]" />
            <span>AUTHORITATIVE IP CLEARANCE & ANSWERS</span>
          </span>
          <h2 id="tm-faq-heading" className="mt-2 text-3xl font-serif md:text-4xl text-balance text-[var(--ink)] font-bold">
            Frequently Asked Questions on Trademarks
          </h2>
          <p className="mt-3 text-sm md:text-base text-[var(--ink-soft)] max-w-xl mx-auto">
            Everything entrepreneurs, startups, and established enterprises need to know about statutory brand protection, classes, objections, and hearings.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword e.g. MSME discount, Section 9, Class 35, Hearing, ® vs ™..."
              className="w-full rounded-2xl border border-[var(--line)] bg-white pl-11 pr-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] shadow-xs focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-muted)] hover:text-black font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOpenIndex(0);
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? "bg-[var(--gold)] text-black shadow-md shadow-[var(--gold)]/20"
                      : "bg-white border border-[var(--line)] text-[var(--ink-soft)] hover:text-black hover:border-[var(--gold)]/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">
              No matching questions found for "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-3 text-xs font-bold text-[var(--gold)] underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition-colors duration-200 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 text-left cursor-pointer gap-4 group"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--gold)] block">
                        {faq.category}
                      </span>
                      <span className="font-serif text-base sm:text-lg font-semibold text-[var(--ink)] group-hover:text-black transition-colors">
                        {faq.q}
                      </span>
                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        isOpen
                          ? "bg-[var(--gold)] text-black rotate-180"
                          : "bg-[var(--paper-dark)] text-[var(--ink-soft)] group-hover:bg-[var(--gold)] group-hover:text-black"
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
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 text-xs sm:text-sm leading-relaxed text-[var(--ink-soft)] border-t border-[var(--line)]/60 bg-[var(--paper)]/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Specific Questions Card (Matching Homepage Excellence) */}
        <div className="mt-10 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-r from-black via-[#18181b] to-black text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center sm:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold-light)] block mb-1">
              DIRECT ADVOCATE CONSULTATION
            </span>
            <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
              Have a Specific Brand Name or Section 9/11 Objection?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
              Send your proposed brand name or Examination Report to Adv. Shareen Hussain for a preliminary legal review.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to get my brand name cleared for Trademark registration.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow flex items-center gap-2"
            >
              <Phone size={14} />
              <span>WhatsApp Brand Clearance</span>
            </a>
            <Link
              href="/book?service=trademark"
              className="btn-primary shimmer-badge !py-3 !px-5 text-xs whitespace-nowrap"
            >
              <span>Book Appointment Slot</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
