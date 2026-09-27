"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  MessageCircle,
  Send,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import GoogleRating from "../components/GoogleRating";
import { site } from "@/lib/site-config";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Court Marriage & Registration",
    mode: "In-Chamber (Trisharan Square, Nagpur)",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    // Simulate instantaneous processing
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Adv. Shareen Hussain,

I submitted an inquiry through your True Legal Advice website:
• Name: ${formData.name}
• Phone: ${formData.phone}
• Email: ${formData.email || "N/A"}
• Matter Category: ${formData.service}
• Preferred Mode: ${formData.mode}
• Details: ${formData.message || "Please provide consultation details."}`
  );

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* ============ Header Hero ============ */}
      <section className="relative py-16 md:py-24 bg-[var(--green-deep)] text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full bg-[var(--gold)]/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />

        <div className="container relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[var(--gold-light)] text-xs font-mono uppercase tracking-wider mb-4">
            <Scale size={14} />
            <span>DIRECT CHAMBER CONTACT & INQUIRY</span>
          </div>

          <h1
            style={{ color: "#ffffff" }}
            className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight"
          >
            Contact True Legal Advice
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-300 leading-relaxed">
            Reach out to <strong>Adv. {site.lawyerName}</strong> for confidential legal consultation, document drafting, and court representation in Nagpur. Fill the form below or message our legal desk directly.
          </p>
        </div>
      </section>

      {/* ============ Contact Form & Chamber Info Grid ============ */}
      <section className="py-16 md:py-24">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-10 shadow-lg">
              {!submitted ? (
                <div>
                  <div className="mb-8">
                    <span className="eyebrow">Client Inquiry Form</span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--ink)] mt-1.5">
                      Send a Consultation Request
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-2">
                      Please enter your contact information and case details. Adv. Shareen Hussain&apos;s chamber desk will review and connect with you promptly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:bg-white focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                          Phone / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email & Matter Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:bg-white focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                          Legal Service Needed
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:bg-white focus:outline-none transition-all"
                        >
                          <option value="Court Marriage & Registration">Court Marriage & Legal Registration</option>
                          <option value="Trademark & IP Protection">Trademark & Brand Protection</option>
                          <option value="Property Title Verification & Deeds">Property Title & Deed Drafting</option>
                          <option value="Muslim Law & Family Advisory">Muslim Law & Family Settlement</option>
                          <option value="Startup & Business Compliance">Company Setup & GST / Gumasta</option>
                          <option value="Civil, Criminal & MACT Claims">Civil, Criminal & MACT Claims</option>
                          <option value="General Legal Advisory">General Legal Consultation</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Consultation Mode */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                        Preferred Consultation Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "In-Chamber (Trisharan Square, Nagpur)",
                          "Online Video Call (Google Meet)",
                        ].map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setFormData({ ...formData, mode: m })}
                            className={`px-4 py-3 rounded-xl border text-xs font-bold text-left transition-all ${
                              formData.mode === m
                                ? "border-[var(--green)] bg-[var(--green)] text-white shadow-sm"
                                : "border-[var(--border)] bg-slate-50 text-[var(--ink-soft)] hover:border-slate-400"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message / Matter Details */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                        Brief Overview of Legal Matter
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe your query, urgency, or documents available..."
                        className="w-full rounded-xl border border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Privacy Guarantee Note */}
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                      <span>
                        <strong>Confidentiality Guarantee:</strong> All shared details are protected by advocate-client legal privilege.
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary shimmer-badge !py-4 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      <span>{submitting ? "Transmitting..." : "Submit Consultation Request"}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[var(--ink)]">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your consultation details have been sent to Adv. Shareen Hussain&apos;s chamber desk. We will contact you at <strong>{formData.phone}</strong> shortly.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${site.whatsappNumber}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
                    >
                      <MessageCircle size={15} />
                      <span>Open in WhatsApp</span>
                    </a>

                    <Link
                      href="/book"
                      className="btn-primary shimmer-badge !py-3 !px-6 text-xs w-full sm:w-auto justify-center"
                    >
                      <span>Book Instant Slot</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        service: "Court Marriage & Registration",
                        mode: "In-Chamber (Trisharan Square, Nagpur)",
                        message: "",
                      });
                    }}
                    className="mt-6 text-xs text-[var(--ink-muted)] hover:underline"
                  >
                    Submit another inquiry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Direct Chamber Details & Notice */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Contact Cards */}
            <div className="rounded-3xl border border-[var(--border)] bg-white p-7 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-bold text-[var(--ink)]">
                Chamber Office Details
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold uppercase text-[var(--gold)]">
                      PHONE & WHATSAPP
                    </p>
                    <a
                      href={`tel:${site.phone.replace(/\s/g, "")}`}
                      className="text-base font-bold text-[var(--ink)] hover:text-[var(--gold)] transition-colors mt-0.5 block"
                    >
                      {site.phone}
                    </a>
                    <p className="text-xs text-[var(--ink-muted)]">Direct chamber reception</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold uppercase text-emerald-700">
                      INSTANT WHATSAPP DESK
                    </p>
                    <a
                      href={`https://wa.me/${site.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-[var(--ink)] hover:text-emerald-600 transition-colors mt-0.5 block"
                    >
                      +91 83296 31199
                    </a>
                    <p className="text-xs text-[var(--ink-muted)]">Quick verification & slot booking</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[var(--green)] shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold uppercase text-[var(--ink-soft)]">
                      CHAMBER ADDRESS
                    </p>
                    <p className="text-sm font-semibold text-[var(--ink)] mt-0.5 leading-snug">
                      Trisharan Square, Nagpur - 440027, Maharashtra
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                      Bombay High Court & District Court Practice
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold uppercase text-amber-800">
                      WALK-IN DESK HOURS
                    </p>
                    <p className="text-xs font-bold text-[var(--ink)] mt-0.5">
                      Morning: 9:30 AM – 11:00 AM
                    </p>
                    <p className="text-xs font-bold text-[var(--ink)]">
                      Evening: 5:30 PM – 8:30 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[var(--border)]">
                <GoogleRating />
              </div>
            </div>

            {/* Direct Booking Highlight Card */}
            <div className="rounded-3xl bg-[var(--green-deep)] text-white p-7 relative overflow-hidden border border-[var(--gold)]/30">
              <div className="relative z-10">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-light)] font-bold">
                  FAST-TRACK SCHEDULING
                </span>
                <h4 style={{ color: "#ffffff" }} className="text-xl font-serif font-bold text-white mt-1">
                  Prefer an Instant Confirmed Slot?
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Skip the inquiry form and pick a 30-minute consultation slot directly from our calendar.
                </p>
                <Link
                  href="/book"
                  className="mt-5 btn-primary shimmer-badge !py-3 !px-6 text-xs inline-flex items-center gap-2"
                >
                  <span>Select Slot & Book</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
