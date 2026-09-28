"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Video,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  User,
  Scale,
  Stamp,
  HeartHandshake,
  Check,
  Copy,
  X,
  Building2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { getAllDaySlots, isDateBookable, toDateKey, BOOKING_WINDOW_DAYS } from "@/lib/availability";
import { services, site } from "@/lib/site-config";
import type { ChamberStatus } from "@/lib/chamber-status";

function formatSlotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

type Step = "mode" | "slots" | "details" | "success";

const SERVICE_MATTERS: Record<string, { label: string; icon: any; matters: string[] }> = {
  "court-marriage": {
    label: "Court Marriage & Registration",
    icon: HeartHandshake,
    matters: [
      "Special Marriage Act, 1954 (Civil / Inter-Faith / Inter-Caste)",
      "Hindu Marriage Act, 1955 (Arya Samaj / Customary Court Registration)",
      "Muslim Personal Law & Nikahnama Registration",
      "Police Protection & Article 21 Urgent Advisory",
      "Fast-Track 24–48h Court Marriage Legal Procedures",
      "Other Court Marriage & Personal Law Matter",
    ],
  },
  "trademark-registration": {
    label: "Trademark & Intellectual Property",
    icon: Stamp,
    matters: [
      "Trademark Search, Filing & Registration (Classes 1 to 45)",
      "Examination Report & Section 9/11 Objection Reply",
      "Opposition & Trademark Registrar Hearing Advocacy",
      "Corporate IP, Copyright & Brand Licensing",
      "MSME (Udyam), Gumasta & Company Incorporation Legalities",
      "Other Brand Protection / IP Matter",
    ],
  },
  "legal-services": {
    label: "Chamber Documentation & Litigation",
    icon: Scale,
    matters: [
      "Property Title Search, Sale Deeds, Gift Deeds & Wills",
      "Family & Muslim Personal Law (Divorce, Maintenance, Custody)",
      "Litigation & Court Representation (High Court & District Court)",
      "Consumer Court & MACT Accident Claims",
      "Commercial Contracts, NDAs & Legal Notices",
      "Criminal Law, Regular & Anticipatory Bail Advisory",
      "Other Civil / Criminal Legal Matter",
    ],
  },
};

function BookClient() {
  const searchParams = useSearchParams();

  // India time (IST, UTC+5:30)
  const today = useMemo(() => {
    const utcNow = new Date();
    const istNow = new Date(utcNow.getTime() + 5.5 * 60 * 60 * 1000);
    return new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  }, []);

  // Popup Modal Control
  const [showModal, setShowModal] = useState(true);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackName, setCallbackName] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);

  const [step, setStep] = useState<Step>("mode");

  // Chamber Status from backend
  const [chamberStatus, setChamberStatus] = useState<ChamberStatus>({
    isOfficeOpen: true,
    isOnlineOpen: true,
    status: "available",
    channelsAffected: "none",
    awayReason: "",
    returnEstimate: "",
    returnTime: "",
    notice: "",
    updatedAt: new Date().toISOString(),
  });

  const [consultationMode, setConsultationMode] = useState<"online" | "offline">("online");
  const [selectedService, setSelectedService] = useState<string>("court-marriage");
  const [selectedMatter, setSelectedMatter] = useState<string>("");
  const [customMatter, setCustomMatter] = useState<string>("");

  const [targetDate, setTargetDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{ date: Date; slot: string; id: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const allSlots = useMemo(() => getAllDaySlots(), []);

  // Parse URL search params once mounted
  useEffect(() => {
    const sParam = searchParams.get("service")?.toLowerCase();
    const mParam = searchParams.get("matter");
    const modeParam = searchParams.get("mode")?.toLowerCase();

    if (sParam) {
      if (sParam.includes("court") || sParam.includes("marriage")) {
        setSelectedService("court-marriage");
      } else if (sParam.includes("trade") || sParam.includes("brand") || sParam.includes("ip")) {
        setSelectedService("trademark-registration");
      } else if (sParam.includes("legal") || sParam.includes("other") || sParam.includes("service")) {
        setSelectedService("legal-services");
      }
    }

    if (mParam) {
      setSelectedMatter(mParam);
    }

    if (modeParam === "online" || modeParam === "offline") {
      setConsultationMode(modeParam);
    }
  }, [searchParams]);

  // Fetch live chamber status
  useEffect(() => {
    fetch("/api/admin/chamber-status")
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d.isOfficeOpen === "boolean") {
          setChamberStatus(d);
          // If office is closed/away, default to online
          if (!d.isOfficeOpen) {
            setConsultationMode("online");
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch available slots when on Step 2
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

  // Lock body scroll while modal is open
  useEffect(() => {
    if (showModal || showCallbackModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showCallbackModal]);

  function openBookingModal(mode?: "online" | "offline") {
    if (mode) setConsultationMode(mode);
    setStep("mode");
    setShowModal(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const effectiveMatter = customMatter.trim() || selectedMatter || SERVICE_MATTERS[selectedService]?.matters[0] || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !consultationMode || !selectedService) return;
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service: selectedService,
          sub_service: effectiveMatter || null,
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
        }
        return;
      }

      setConfirmedBooking({
        date: targetDate,
        slot: selectedSlot,
        id: data.booking?.id || "BK-" + Math.floor(100000 + Math.random() * 900000),
      });
      setStep("success");
      setSubmitStatus("idle");
    } catch {
      setErrorMsg("Network error. Please try again or WhatsApp our helpline directly.");
      setSubmitStatus("idle");
    }
  }

  async function handleCallbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackLoading(true);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callbackName.trim() || "Chamber Visitor",
          phone: callbackPhone.trim(),
          service: selectedService ? SERVICE_MATTERS[selectedService]?.label : "Chamber Visit Request",
          mode: "Office Visit (Trisharan Square, Nagpur)",
          message: `Request for in-person chamber meeting when advocate returns. Away Status: ${chamberStatus.awayReason || "Court hearing"} (${chamberStatus.returnEstimate || "1-2 hours"}).`,
        }),
      });
      setCallbackSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCallbackLoading(false);
    }
  }

  const isAway = !chamberStatus.isOfficeOpen || chamberStatus.status === "away";
  const currentStepNum = step === "mode" ? 1 : step === "slots" ? 2 : step === "details" ? 3 : 4;

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ============ Top Hero & Advocate Chamber Card ============ */}
      <section className="relative py-12 lg:py-18 bg-[var(--green-deep)] text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-[var(--gold)]/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />

        <div className="container relative z-10 max-w-4xl">
          {/* Away / Offline Notice Banner (If Advocate is away in court or out of chamber) */}
          {isAway && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-amber-400/40 bg-amber-500/15 p-4 sm:p-5 text-amber-100 backdrop-blur-md shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold">
                    <Scale size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                        {chamberStatus.awayReason ? `CHAMBER NOTICE: ${chamberStatus.awayReason.toUpperCase()}` : "ADVOCATE NOTICE: TEMPORARILY AWAY"}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold uppercase">
                        {chamberStatus.returnEstimate || "Away ~1–2 Hours"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-amber-100 leading-relaxed">
                      {chamberStatus.notice ||
                        `Advocate Shareen Hussain is currently attending court hearings. In-person chamber visits will resume in approximately 1–2 hours. Online Google Meet consultations remain fully active.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowCallbackModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-amber-950 hover:bg-amber-300 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar size={13} />
                    <span>Ask for In-Chamber Meeting</span>
                  </button>
                  <button
                    onClick={() => openBookingModal("online")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video size={13} />
                    <span>Book Online Video Call</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Compact Advocate Profile Card */}
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-[var(--gold)]/40 shadow-lg shrink-0 bg-[#0d1c16]">
                <Image
                  src="/images/shareen-portrait.jpg"
                  alt="Adv. Shareen Hussain"
                  fill
                  className="object-cover object-top"
                  sizes="120px"
                  priority
                />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/30 text-[var(--gold-light)] text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Scale size={12} />
                  <span>BOMBAY HIGH COURT (NAGPUR BENCH) & DISTRICT COURTS</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  Chambers of Adv. Shareen Hussain
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  B.Com, M.Com, LL.B — Registered Trade Mark Attorney & Advocate. Direct consultation for Court Marriage, Trademark Filing, Property Law, and Court Litigation.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[var(--gold)]" />
                    <span>Trisharan Square, Nagpur</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[var(--gold)]" />
                    <span>9:30–11:00 AM & 5:30–8:30 PM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Popup Button */}
            <div className="shrink-0 flex flex-col items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto btn-primary shimmer-badge !py-3.5 !px-8 text-sm font-bold shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar size={16} />
                <span>Book Appointment Now</span>
              </button>

              <span className="text-[11px] font-mono text-slate-300 text-center">
                Opens in quick popup window · Instant slot confirmation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Compact Step-By-Step Modal Popup Dialog ============ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[var(--line)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="border-b border-[var(--line)] bg-[var(--paper-dark)]/60 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--green-deep)] text-[var(--gold)] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[var(--ink)]">
                      Consultation Booking Desk
                    </h3>
                    <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                      Adv. Shareen Hussain · Nagpur Chambers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Close popup"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step Progress Indicators */}
              {step !== "success" && (
                <div className="border-b border-[var(--line)] bg-white px-6 py-3 shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    {[
                      { num: 1, label: "Mode & Service" },
                      { num: 2, label: "Date & Slot" },
                      { num: 3, label: "Client Details" },
                    ].map((s, idx) => {
                      const isActive = currentStepNum === s.num;
                      const isDone = currentStepNum > s.num;
                      return (
                        <div key={s.num} className="flex items-center gap-2 flex-1">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isActive
                                ? "bg-[var(--gold)] text-[#0a2217] font-extrabold ring-2 ring-[var(--gold)]/30"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isDone ? <Check size={12} strokeWidth={3} /> : s.num}
                          </div>
                          <span
                            className={`hidden sm:inline text-xs font-semibold ${
                              isActive ? "text-[var(--green)]" : "text-slate-400"
                            }`}
                          >
                            {s.label}
                          </span>
                          {idx < 2 && (
                            <div
                              className={`h-0.5 flex-1 mx-2 transition-all ${
                                currentStepNum > s.num ? "bg-emerald-600" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Body / Scrollable Content */}
              <div className="p-6 sm:p-7 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {/* ================= STEP 1: MODE & SERVICE ================= */}
                  {step === "mode" && (
                    <motion.div
                      key="step-mode"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="space-y-6"
                    >
                      {/* Consultation Mode Picker */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)] block mb-2">
                          1. Select Consultation Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setConsultationMode("online")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              consultationMode === "online"
                                ? "border-[var(--green)] bg-emerald-50/60 ring-2 ring-[var(--green)]/20 shadow-xs"
                                : "border-[var(--line)] bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-purple-700">
                              <Video size={18} />
                              <span className="font-bold text-xs text-[var(--ink)]">Online Video Call</span>
                            </div>
                            <p className="text-[11px] text-[var(--ink-soft)] mt-1.5 leading-snug">
                              Google Meet · Join from any device securely
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConsultationMode("offline")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                              consultationMode === "offline"
                                ? "border-[var(--green)] bg-emerald-50/60 ring-2 ring-[var(--green)]/20 shadow-xs"
                                : "border-[var(--line)] bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-emerald-800">
                              <MapPin size={18} />
                              <span className="font-bold text-xs text-[var(--ink)]">Office Visit</span>
                            </div>
                            <p className="text-[11px] text-[var(--ink-soft)] mt-1.5 leading-snug">
                              In-person at Trisharan Square, Nagpur
                            </p>

                            {isAway && (
                              <span className="mt-2 inline-block text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                {chamberStatus.returnEstimate ? `Away: ${chamberStatus.returnEstimate}` : "Away ~1–2h"}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Service Category */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)] block mb-2">
                          2. Legal Practice Area
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {Object.entries(SERVICE_MATTERS).map(([key, item]) => {
                            const isSelected = selectedService === key;
                            const IconComponent = item.icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setSelectedService(key);
                                  setSelectedMatter(item.matters[0]);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[var(--green)] bg-[var(--green-deep)] text-white shadow-xs"
                                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent size={15} className={isSelected ? "text-[var(--gold)]" : "text-slate-500"} />
                                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-Matter Dropdown */}
                      {SERVICE_MATTERS[selectedService] && (
                        <div>
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)] block mb-1.5">
                            3. Specific Legal Matter
                          </label>
                          <select
                            value={selectedMatter}
                            onChange={(e) => setSelectedMatter(e.target.value)}
                            className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none shadow-2xs"
                          >
                            {SERVICE_MATTERS[selectedService].matters.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setStep("slots")}
                        className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Continue to Select Date & Slot</span>
                        <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  )}

                  {/* ================= STEP 2: DATE & SLOTS ================= */}
                  {step === "slots" && (
                    <motion.div
                      key="step-slots"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="space-y-6"
                    >
                      {/* Date Horizontal Picker */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)]">
                            Select Consultation Date
                          </label>
                          <span className="text-[11px] font-mono text-slate-500">Next 7 Days</span>
                        </div>

                        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                          {Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(today);
                            d.setDate(d.getDate() + i);
                            const isSelected = toDateKey(d) === toDateKey(targetDate);
                            const isTodayDate = i === 0;

                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setTargetDate(d)}
                                className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-2 rounded-2xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[var(--green)] bg-[var(--green-deep)] text-white shadow-xs"
                                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-slate-300"
                                }`}
                              >
                                <span className={`text-[10px] font-mono uppercase ${isSelected ? "text-[var(--gold-light)]" : "text-slate-400"}`}>
                                  {isTodayDate ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}
                                </span>
                                <span className="text-base font-bold my-0.5">
                                  {d.getDate()}
                                </span>
                                <span className="text-[10px] opacity-75">
                                  {d.toLocaleDateString("en-IN", { month: "short" })}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots Grid */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--gold)] block mb-2">
                          Select One-Hour Consultation Slot
                        </label>

                        {slotsLoading ? (
                          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin text-[var(--gold)]" />
                            <span>Checking live chamber calendar...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {(availableSlots || allSlots).map((slot) => {
                              const isSelected = selectedSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-[var(--green)] bg-emerald-600 text-white font-bold shadow-xs"
                                      : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--green)]"
                                  }`}
                                >
                                  {formatSlotLabel(slot)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("mode")}
                          className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          disabled={!selectedSlot}
                          onClick={() => setStep("details")}
                          className="btn-primary flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <span>Proceed to Client Details</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ================= STEP 3: CLIENT DETAILS ================= */}
                  {step === "details" && (
                    <motion.form
                      key="step-details"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Summary Capsule */}
                      <div className="p-3 rounded-2xl bg-[var(--paper-dark)] border border-[var(--line)] text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[var(--green)]">
                            {formatSlotLabel(selectedSlot!)} · {targetDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          <p className="text-[11px] text-[var(--ink-soft)] truncate max-w-[260px]">
                            {consultationMode === "online" ? "Google Meet Video" : "Office Visit"} · {effectiveMatter}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep("slots")}
                          className="text-[11px] font-bold text-[var(--gold)] hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your complete name"
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number"
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Email (Optional, for Google Meet invite)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Case / Consultation Notes (Optional)
                        </label>
                        <textarea
                          name="message"
                          rows={2}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Brief description of your legal requirement..."
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none shadow-2xs"
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                          {errorMsg}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("slots")}
                          className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitStatus === "loading"}
                          className="btn-primary flex-1 !py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {submitStatus === "loading" ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Securing Slot...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Confirm Consultation Slot</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* ================= STEP 4: SUCCESS PASS ================= */}
                  {step === "success" && confirmedBooking && (
                    <motion.div
                      key="step-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 space-y-5"
                    >
                      <div className="h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-100">
                        <CheckCircle2 size={28} />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                          SLOT CONFIRMED · {confirmedBooking.id}
                        </span>
                        <h3 className="text-xl font-serif font-bold text-[var(--green)] mt-2">
                          Consultation Scheduled!
                        </h3>
                        <p className="text-xs text-[var(--ink-soft)] mt-1">
                          Thank you, <strong>{form.name}</strong>. Your consultation with <strong>Adv. Shareen Hussain</strong> has been scheduled for{" "}
                          <strong>{confirmedBooking.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {formatSlotLabel(confirmedBooking.slot)}</strong>.
                        </p>
                      </div>

                      {/* Pass details card */}
                      <div className="p-4 rounded-2xl bg-[var(--paper-dark)] border border-[var(--line)] text-left text-xs space-y-2">
                        <p><strong>Matter:</strong> {effectiveMatter}</p>
                        <p><strong>Mode:</strong> {consultationMode === "online" ? "Google Meet Video Call" : "In-Person (Trisharan Sq, Nagpur)"}</p>
                        <p><strong>Contact:</strong> {form.phone}</p>
                      </div>

                      {/* Direct WhatsApp Pass Button */}
                      {(() => {
                        const dateFormatted = confirmedBooking.date.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        });
                        const timeFormatted = formatSlotLabel(confirmedBooking.slot);
                        const passText = `*LEGAL CONSULTATION APPOINTMENT PASS*
🏛️ *Chambers of Adv. Shareen Hussain (Nagpur Bench)*

👤 *Client:* ${form.name}
⚖️ *Matter:* ${effectiveMatter}
📅 *Date:* ${dateFormatted}
⏰ *Time:* ${timeFormatted}
${consultationMode === "offline" ? "📍 *Chamber:* Near Trisharan Square, Nagpur - 440027" : "💻 *Mode:* Online Video Call (Google Meet)"}
📞 *Helpline:* +91 83296 31199`;

                        const waUrl = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(passText)}`;

                        return (
                          <div className="space-y-2.5 pt-1">
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                            >
                              <MessageCircle size={16} />
                              <span>Open / Save WhatsApp Booking Pass</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(passText);
                                setCopiedPass(true);
                                setTimeout(() => setCopiedPass(false), 2000);
                              }}
                              className="w-full py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {copiedPass ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              <span>{copiedPass ? "Pass Copied!" : "Copy Pass Details"}</span>
                            </button>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ Ask For Meeting When Back Callback Modal ============ */}
      <AnimatePresence>
        {showCallbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[var(--line)]"
            >
              <button
                onClick={() => {
                  setShowCallbackModal(false);
                  setCallbackSent(false);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>

              {!callbackSent ? (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-[var(--ink)]">
                        Request In-Chamber Meeting
                      </h3>
                      <p className="text-xs text-[var(--ink-soft)]">
                        Adv. Shareen will be alerted immediately when she returns.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    <strong>Current Status:</strong> {chamberStatus.awayReason || "In Court Session"}{" "}
                    ({chamberStatus.returnEstimate || "Expected in 1–2 hours"})
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="e.g. 9823012345"
                      className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--green)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackLoading}
                    className="btn-primary w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {callbackLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Notify Me & Request Meeting</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-serif font-bold text-[var(--green)]">
                    Request Received!
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                    Thank you, <strong>{callbackName}</strong>. Advocate Shareen Hussain&apos;s chamber desk has been notified. You will receive a direct WhatsApp/call update as soon as the advocate steps into the Trisharan Square chamber.
                  </p>
                  <button
                    onClick={() => {
                      setShowCallbackModal(false);
                      setCallbackSent(false);
                    }}
                    className="mt-2 px-5 py-2 rounded-xl bg-[var(--green-deep)] text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-xs text-[var(--ink-muted)]">
            <Loader2 size={24} className="animate-spin text-[var(--gold)] mx-auto mb-2" />
            <span>Loading Consultation Desk...</span>
          </div>
        </div>
      }
    >
      <BookClient />
    </Suspense>
  );
}
