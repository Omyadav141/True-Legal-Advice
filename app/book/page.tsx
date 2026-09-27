"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Video,
  MapPin,
  X,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { getAllDaySlots, isDateBookable, toDateKey, BOOKING_WINDOW_DAYS } from "@/lib/availability";
import { services, site } from "@/lib/site-config";

function formatSlotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

type Step = "mode" | "slots" | "details" | "success";

const stepOrder: Step[] = ["mode", "slots", "details"];

export default function BookPage() {
  // Convert browser UTC to India time (IST, UTC+5:30)
  const today = useMemo(() => {
    const utcNow = new Date();
    const istNow = new Date(utcNow.getTime() + 5.5 * 60 * 60 * 1000);
    // Return as a local date object for the calendar
    return new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>("mode");

  const [consultationMode, setConsultationMode] = useState<"online" | "offline" | null>(null);
  const [selectedService, setSelectedService] = useState(services[0].slug);
  const [targetDate, setTargetDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{ date: Date; slot: string } | null>(null);

  const allSlots = useMemo(() => getAllDaySlots(), []);

  useEffect(() => {
    if (!showModal || step !== "slots") return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    const dateKey = toDateKey(targetDate);
    fetch(`/api/availability?date=${dateKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.availableSlots) && data.availableSlots.length > 0) {
          setAvailableSlots(data.availableSlots);
        } else {
          setAvailableSlots(allSlots);
        }
      })
      .catch(() => setAvailableSlots(allSlots))
      .finally(() => setSlotsLoading(false));
  }, [showModal, step, targetDate, allSlots]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  function openBooking() {
    setStep("mode");
    setConsultationMode(null);
    setSelectedSlot(null);
    setForm({ name: "", phone: "", email: "", message: "" });
    setSubmitStatus("idle");
    setErrorMsg("");
    setShowModal(true);
  }

  function closeBooking() {
    setShowModal(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !consultationMode) return;
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service: selectedService,
          bookingDate: toDateKey(targetDate),
          bookingTime: selectedSlot,
          consultationMode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setSubmitStatus("idle");
        if (data.slotTaken) {
          setSelectedSlot(null);
          setStep("slots");
          const dateKey = toDateKey(targetDate);
          fetch(`/api/availability?date=${dateKey}`)
            .then((r) => r.json())
            .then((d) => setAvailableSlots(d.availableSlots || []));
        }
        return;
      }

      setConfirmedBooking({ date: targetDate, slot: selectedSlot });
      setStep("success");
    } catch {
      setErrorMsg("Could not connect. Please check your internet and try again.");
      setSubmitStatus("idle");
    }
  }

  const stepIndex = stepOrder.indexOf(step);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <span className="eyebrow">Book an appointment</span>
        <h1 className="mt-3 text-3xl md:text-4xl">Talk to Adv. {site.lawyerName}</h1>
        <p className="mb-9 mt-4 max-w-xl text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Choose an online video consultation or an in-person office visit, pick a time that works for you, and we&apos;ll take it from there.
        </p>

        {/* Hero call-to-book card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col gap-5 overflow-hidden rounded-3xl p-8 md:p-10"
          style={{ background: "var(--green)", color: "var(--paper)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(203,167,88,0.22), transparent 70%)" }}
          />
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold-light)" }}>
            <ShieldCheck size={16} />
            Adv. Shareen Hussain · Nagpur, Maharashtra
          </div>
          <h2 className="text-2xl md:text-3xl" style={{ color: "var(--paper)", margin: 0 }}>
            Ready when you are
          </h2>
          <p className="m-0 max-w-md text-[15px] leading-relaxed" style={{ color: "rgba(250,247,240,0.8)" }}>
            Pick a consultation type and a 30-minute slot within the next {BOOKING_WINDOW_DAYS} days. Your slot is locked the moment you confirm.
          </p>
          <button type="button" onClick={openBooking} className="btn-primary self-start">
            Book appointment <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Two mode cards, informational */}
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="card flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--green-mist)" }}>
              <Video size={22} style={{ color: "var(--green)" }} />
            </div>
            <h3 className="m-0 text-lg">Online consultation</h3>
            <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Video call from wherever you are. You&apos;ll get a Google Meet link on WhatsApp.
            </p>
            <span className="text-[13px] font-semibold text-[var(--gold)]">
              Scheduled private 30-min strategy session
            </span>
          </div>
          <div className="card flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--gold-soft)" }}>
              <MapPin size={22} style={{ color: "var(--gold)" }} />
            </div>
            <h3 className="m-0 text-lg">In-person chamber visit</h3>
            <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Meet at Trisharan Square, Nagpur - 440027. Walk-in desk: 9:30–11:00 AM & 5:30–8:30 PM.
            </p>
            <span className="text-[13px] font-semibold text-[var(--gold)]">
              In-chamber consultation & document review
            </span>
          </div>
        </div>
      </div>

      {/* ================= Booking Modal ================= */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-5"
            style={{ background: "rgba(10,34,23,0.6)", backdropFilter: "blur(5px)" }}
            onClick={closeBooking}
            role="dialog"
            aria-modal="true"
            aria-label="Book an appointment"
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl"
              style={{ background: "var(--white)", maxHeight: "92svh", boxShadow: "0 30px 80px rgba(10,34,23,0.4)" }}
            >
              {/* Modal header: progress + close */}
              <div className="flex items-center justify-between gap-4 border-b px-6 py-4 sm:px-8" style={{ borderColor: "var(--line)" }}>
                {step !== "success" ? (
                  <div className="flex items-center gap-2" aria-label={`Step ${stepIndex + 1} of 3`}>
                    {stepOrder.map((s, i) => (
                      <span
                        key={s}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: i === stepIndex ? 28 : 14,
                          background: i <= stepIndex ? "var(--gold)" : "var(--line)",
                        }}
                      />
                    ))}
                    <span className="ml-2 text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
                      Step {stepIndex + 1} of 3
                    </span>
                  </div>
                ) : (
                  <span />
                )}
                <button
                  onClick={closeBooking}
                  aria-label="Close booking"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none"
                  style={{ background: "var(--paper-dark)", color: "var(--ink-soft)" }}
                >
                  <X size={17} />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
                <AnimatePresence mode="wait">
                  {/* ---------- Step 1: mode ---------- */}
                  {step === "mode" && (
                    <motion.div key="mode" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-6">
                      <div>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--green-mist)" }}>
                          <Calendar size={22} style={{ color: "var(--green)" }} />
                        </div>
                        <h3 className="mb-1.5 text-2xl">Book your appointment</h3>
                        <p className="m-0 text-sm" style={{ color: "var(--ink-soft)" }}>
                          First, how would you like to consult with {site.lawyerName}?
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {(["online", "offline"] as const).map((m) => {
                          const selected = consultationMode === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setConsultationMode(m)}
                              aria-pressed={selected}
                              className="flex cursor-pointer items-center gap-3.5 rounded-2xl p-4 text-left transition-all"
                              style={{
                                border: selected ? "2px solid var(--gold)" : "1.5px solid var(--line)",
                                background: selected ? "var(--gold-soft)" : "var(--paper)",
                              }}
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--white)" }}>
                                {m === "online" ? <Video size={18} style={{ color: "var(--green)" }} /> : <MapPin size={18} style={{ color: "var(--green)" }} />}
                              </div>
                              <div className="flex-1">
                                <div className="text-[15px] font-bold" style={{ color: "var(--green)" }}>
                                  {m === "online" ? "Online — Video call" : "In-person — Office visit"}
                                </div>
                                <div className="text-[13px]" style={{ color: "var(--ink-muted)" }}>
                                  {m === "online" ? "Meet link sent to your WhatsApp" : `At the office in ${site.city}`}
                                </div>
                              </div>
                              <div className="text-[13px] font-bold" style={{ color: "var(--gold)" }}>
                                Fee to be confirmed
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div>
                        <label htmlFor="service-select">Which service do you need?</label>
                        <select id="service-select" className="select" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                          {services.map((s) => (
                            <option key={s.slug} value={s.slug}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button type="button" disabled={!consultationMode} onClick={() => setStep("slots")} className="btn-primary w-full">
                        Continue to time slots <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  )}

                  {/* ---------- Step 2: slots ---------- */}
                  {step === "slots" && (
                    <motion.div key="slots" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-5">
                      <div>
                        <h3 className="mb-1 text-xl">Pick a date &amp; time</h3>
                        <p className="m-0 text-sm" style={{ color: "var(--ink-soft)" }}>
                          Choose any available 30-minute slot in the next {BOOKING_WINDOW_DAYS} days.
                        </p>
                      </div>

                      {/* Horizontal scroll date strip */}
                      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1.5">
                        {Array.from({ length: BOOKING_WINDOW_DAYS }).map((_, i) => {
                          const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
                          if (!isDateBookable(date, today)) return null;
                          const isSelected = toDateKey(date) === toDateKey(targetDate);
                          const dayName = i === 0 ? "Today" : i === 1 ? "Tmrw" : date.toLocaleDateString("en-IN", { weekday: "short" });
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setTargetDate(date)}
                              aria-pressed={isSelected}
                              className="flex min-w-[64px] flex-shrink-0 cursor-pointer flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-all"
                              style={{
                                border: isSelected ? "2px solid var(--gold)" : "1.5px solid var(--line)",
                                background: isSelected ? "var(--gold-soft)" : "var(--white)",
                                color: isSelected ? "var(--green)" : "var(--ink-soft)",
                              }}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wide">{dayName}</span>
                              <span className="text-[15px] font-bold">{date.getDate()}</span>
                              <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
                                {date.toLocaleDateString("en-IN", { month: "short" })}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                        {slotsLoading ? (
                          <div className="col-span-full py-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
                            <Loader2 size={16} className="spin mr-2 inline" />
                            Loading available times...
                          </div>
                        ) : availableSlots && availableSlots.length === 0 ? (
                          <div className="col-span-full py-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
                            No slots left on this day. Try another date.
                          </div>
                        ) : (
                          allSlots.map((slot) => {
                            const isAvailable = availableSlots?.includes(slot);
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                aria-pressed={isSelected}
                                className="rounded-xl px-1.5 py-2.5 text-[13px] font-bold transition-all"
                                style={{
                                  border: isSelected ? "2px solid var(--gold)" : "1.5px solid var(--line)",
                                  background: isSelected ? "var(--gold-soft)" : isAvailable ? "var(--white)" : "var(--paper-dark)",
                                  color: isAvailable ? "var(--green)" : "var(--ink-muted)",
                                  cursor: isAvailable ? "pointer" : "not-allowed",
                                  textDecoration: isAvailable ? "none" : "line-through",
                                }}
                              >
                                {formatSlotLabel(slot)}
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep("mode")} className="btn-secondary" style={{ padding: "13px 20px" }} aria-label="Go back">
                          <ArrowLeft size={16} />
                        </button>
                        <button type="button" disabled={!selectedSlot} onClick={() => setStep("details")} className="btn-primary flex-1">
                          Continue <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ---------- Step 3: details ---------- */}
                  {step === "details" && (
                    <motion.form key="details" onSubmit={handleSubmit} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col gap-4">
                      <div>
                        <h3 className="mb-1 text-xl">Your details</h3>
                        <p className="m-0 text-sm" style={{ color: "var(--ink-soft)" }}>
                          We&apos;ll use this to confirm your appointment.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13.5px] font-semibold" style={{ background: "var(--green-mist)", color: "var(--green)" }}>
                        {consultationMode === "online" ? <Video size={16} /> : <MapPin size={16} />}
                        {targetDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {selectedSlot && formatSlotLabel(selectedSlot)} ·{" "}
                        {consultationMode === "online" ? "Video call" : "Office visit"}
                      </div>

                      <div>
                        <label htmlFor="name">Full name</label>
                        <input className="input" id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Your full name" />
                      </div>
                      <div>
                        <label htmlFor="phone">WhatsApp / phone number</label>
                        <input className="input" id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="e.g. 98765 43210" />
                      </div>
                      <div>
                        <label htmlFor="email">Email (optional)</label>
                        <input className="input" id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                      </div>
                      <div>
                        <label htmlFor="message">Briefly describe your matter (optional)</label>
                        <textarea className="textarea" id="message" name="message" rows={3} value={form.message} onChange={handleChange} placeholder="Any details that will help us prepare" />
                      </div>

                      {errorMsg && (
                        <p className="rounded-xl px-4 py-3 text-[13.5px]" style={{ color: "var(--danger)", background: "#fbeae7" }} role="alert">
                          {errorMsg}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep("slots")} className="btn-secondary" style={{ padding: "13px 20px" }} aria-label="Go back">
                          <ArrowLeft size={16} />
                        </button>
                        <button type="submit" disabled={submitStatus === "loading"} className="btn-primary flex-1">
                          {submitStatus === "loading" ? (
                            <>
                              <Loader2 size={16} className="spin" /> Confirming...
                            </>
                          ) : (
                            `Confirm ${consultationMode === "online" ? "video" : "office"} appointment`
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* ---------- Success ---------- */}
                  {step === "success" && confirmedBooking && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-3 text-center">
                      <div className="flex h-18 w-18 items-center justify-center rounded-full" style={{ background: "var(--success)", width: 72, height: 72 }}>
                        <CheckCircle2 size={36} color="white" />
                      </div>
                      <h3 className="m-0 text-2xl">You&apos;re booked!</h3>
                      <p className="m-0 max-w-sm text-[14.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                        {form.name.split(" ")[0]}, your {consultationMode === "online" ? "video" : "office"} appointment is confirmed for{" "}
                        <strong style={{ color: "var(--green)" }}>
                          {confirmedBooking.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at {formatSlotLabel(confirmedBooking.slot)}
                        </strong>
                        .{" "}
                        {consultationMode === "online"
                          ? "We'll send your Google Meet link to your WhatsApp shortly."
                          : `We'll see you at the office in ${site.city}.`}
                      </p>
                      <button type="button" onClick={closeBooking} className="btn-primary w-full">
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
