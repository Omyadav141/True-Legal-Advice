"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CalendarPlus,
  Download,
  Share2,
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
  Lock,
  ChevronRight,
  HelpCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

const SERVICE_MATTERS: Record<
  string,
  { label: string; icon: any; desc: string; matters: string[] }
> = {
  "court-marriage": {
    label: "Court Marriage & Family Law",
    icon: HeartHandshake,
    desc: "Special Marriage Act, Hindu Marriage, Police Protection, Inter-Faith Marriage",
    matters: [
      "Special Marriage Act, 1954 (Civil / Inter-Faith / Inter-Caste)",
      "Hindu Marriage Act, 1955 (Customary / Arya Samaj / Registration)",
      "Certified Marriage Registration (SRO Nagpur)",
      "Article 21 Protection & Urgent Police Security Advisory",
      "Fast-Track 24–48h Marriage Legal Procedures",
      "Other Court Marriage & Matrimonial Matter",
    ],
  },
  "trademark-registration": {
    label: "Trademark & Brand Protection",
    icon: Stamp,
    desc: "Trade Mark Attorney filing, Class 1-45, Examination Objections & Hearing",
    matters: [
      "Trademark Search, Classification & Application (Classes 1 to 45)",
      "Examination Report Objection Reply (Section 9 & 11)",
      "Opposition & Trademark Registrar Hearing Advocacy",
      "Corporate IP, Copyright & Brand Licensing",
      "MSME (Udyam), Gumasta & Company Legal Setup",
      "Other Brand Protection / IP Matter",
    ],
  },
  "legal-services": {
    label: "Chamber Litigation & Deeds",
    icon: Scale,
    desc: "High Court & District Court, Property Title Search, Deeds, Bail, Civil / Criminal",
    matters: [
      "Property Title Search, Sale Deeds, Gift Deeds & Wills",
      "Family & Matrimonial Law (Divorce, Maintenance, Custody)",
      "Litigation & Court Representation (High Court & District Court)",
      "Regular & Anticipatory Bail Advisory (Criminal Law)",
      "Commercial Contracts, NDAs & Legal Notices",
      "Consumer Court & MACT Accident Claims",
      "Other Civil / Criminal Legal Matter",
    ],
  },
  "general-consultation": {
    label: "General Legal Consultation",
    icon: BriefcaseIcon,
    desc: "Confidential 1-on-1 legal review, advice on rights, legal notices & documentation",
    matters: [
      "General Legal Advisory & Case Scrutiny",
      "Notice / Rejoinder Legal Scrutiny",
      "Pre-Litigation Strategy & Dispute Assessment",
      "Document Verification & Second Legal Opinion",
    ],
  },
};

function BriefcaseIcon(props: any) {
  return <Building2 {...props} />;
}

function BookClient() {
  const searchParams = useSearchParams();

  // India time (IST, UTC+5:30)
  const today = useMemo(() => {
    const utcNow = new Date();
    const istNow = new Date(utcNow.getTime() + 5.5 * 60 * 60 * 1000);
    return new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
  }, []);

  // Popup Modal Control: Starts CLOSED as requested
  const [showModal, setShowModal] = useState(false);
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

  // Mode: null initially or determined after status load
  const [consultationMode, setConsultationMode] = useState<"online" | "offline" | null>(null);

  // Service: Defaults to "" (Empty / N/A, not automatically Special Marriage Act!)
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedMatter, setSelectedMatter] = useState<string>("");

  const [targetDate, setTargetDate] = useState<Date>(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [passedSlots, setPassedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: Date;
    slot: string;
    id: string;
    meet_link?: string | null;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  const allSlots = useMemo(() => getAllDaySlots(), []);

  // Parse URL search params if passed (e.g. ?service=court-marriage)
  useEffect(() => {
    const sParam = searchParams.get("service")?.toLowerCase();
    const mParam = searchParams.get("matter");
    const modeParam = searchParams.get("mode")?.toLowerCase();

    if (sParam) {
      if (sParam.includes("court") || sParam.includes("marriage")) {
        setSelectedService("court-marriage");
      } else if (sParam.includes("trade") || sParam.includes("brand") || sParam.includes("ip")) {
        setSelectedService("trademark-registration");
      } else if (sParam.includes("legal") || sParam.includes("deed") || sParam.includes("litigation")) {
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
      .then((d: ChamberStatus) => {
        if (d && typeof d.isOfficeOpen === "boolean") {
          setChamberStatus(d);

          // If offline office visits are closed today:
          if (!d.isOfficeOpen) {
            // If online is also closed today:
            if (!d.isOnlineOpen) {
              setConsultationMode(null);
              // Target tomorrow for calendar by default
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              setTargetDate(tomorrow);
            } else {
              setConsultationMode("online");
            }
          } else {
            setConsultationMode("offline");
          }
        }
      })
      .catch(() => {});
  }, [today]);

  // Determine if today is disabled for the selected mode
  const isTodayDisabledForMode = useMemo(() => {
    if (consultationMode === "offline" && !chamberStatus.isOfficeOpen) return true;
    if (consultationMode === "online" && !chamberStatus.isOnlineOpen) return true;
    if (!chamberStatus.isOfficeOpen && !chamberStatus.isOnlineOpen) return true;
    return false;
  }, [consultationMode, chamberStatus]);

  // If today is disabled and user has targetDate as today, push to tomorrow
  useEffect(() => {
    if (isTodayDisabledForMode && toDateKey(targetDate) === toDateKey(today)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTargetDate(tomorrow);
    }
  }, [isTodayDisabledForMode, targetDate, today]);

  // Fetch available and booked slots when on Step 2
  useEffect(() => {
    if (!showModal || step !== "slots") return;

    // If today is disabled for this mode, do not allow slots for today
    if (toDateKey(targetDate) === toDateKey(today) && isTodayDisabledForMode) {
      setAvailableSlots([]);
      setBookedSlots(allSlots);
      setPassedSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSelectedSlot(null);
    const dateKey = toDateKey(targetDate);
    fetch(`/api/availability?date=${dateKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAvailableSlots(Array.isArray(data.availableSlots) ? data.availableSlots : allSlots);
          setBookedSlots(Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
          setPassedSlots(Array.isArray(data.passedSlots) ? data.passedSlots : []);
        } else {
          setAvailableSlots(allSlots);
          setBookedSlots([]);
          setPassedSlots([]);
        }
      })
      .catch(() => {
        setAvailableSlots(allSlots);
        setBookedSlots([]);
        setPassedSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [showModal, step, targetDate, allSlots, today, isTodayDisabledForMode]);

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

  function openBookingModal(initialService?: string, initialMode?: "online" | "offline") {
    if (initialService) {
      setSelectedService(initialService);
      setSelectedMatter("");
    }
    if (initialMode) {
      // Only set mode if it's available
      if (initialMode === "offline" && !chamberStatus.isOfficeOpen) {
        // Can't select offline
      } else if (initialMode === "online" && !chamberStatus.isOnlineOpen) {
        // Can't select online
      } else {
        setConsultationMode(initialMode);
      }
    }
    setStep("mode");
    setShowModal(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === "phone") {
      // Strictly 10 digits only
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, phone: digits }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const effectiveMatter =
    selectedMatter.trim() ||
    (selectedService ? `${SERVICE_MATTERS[selectedService]?.label} (General Consultation)` : "General Legal Consultation");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !consultationMode || !selectedService) return;

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (e.g. 9823012345).");
      setSubmitStatus("idle");
      return;
    }

    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.email.trim())) {
        setErrorMsg("Please enter a valid email address with @ and domain extension (e.g. name@gmail.com).");
        setSubmitStatus("idle");
        return;
      }
    }

    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: cleanPhone,
          service: selectedService,
          sub_service: effectiveMatter,
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

      const returnedMeetLink =
        data.booking?.meet_link ||
        (consultationMode === "online" ? site.googleMeetRoom : null);

      setConfirmedBooking({
        date: targetDate,
        slot: selectedSlot,
        id: data.booking?.id || "BK-" + Math.floor(100000 + Math.random() * 900000),
        meet_link: returnedMeetLink,
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
          service: selectedService ? SERVICE_MATTERS[selectedService]?.label : "General Legal Consultation",
          mode: "Office Visit (Trisharan Square, Nagpur)",
          message: `Request for in-person chamber meeting when advocate returns. Status: ${chamberStatus.awayReason || "Away"} (${chamberStatus.returnEstimate || "Resuming Soon"}).`,
        }),
      });
      setCallbackSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCallbackLoading(false);
    }
  }

  const isAway = !chamberStatus.isOfficeOpen || !chamberStatus.isOnlineOpen || chamberStatus.status === "away";
  const isBothClosed = !chamberStatus.isOfficeOpen && !chamberStatus.isOnlineOpen;
  const currentStepNum = step === "mode" ? 1 : step === "slots" ? 2 : step === "details" ? 3 : 4;

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[var(--ink)]">
      {/* ============ Top Hero & Advocate Chamber Desk (The "First Screen") ============ */}
      <section className="relative py-12 lg:py-20 bg-black text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-[var(--gold)]/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-white/5 blur-[110px]" />

        <div className="container relative z-10 max-w-4xl space-y-6">
          {/* Prominent Chamber Alert Notice Banner (When Advocate is Away or Closed) */}
          {isAway && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-400/50 bg-[#18181b] p-5 sm:p-6 text-amber-100 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-[#cba758] text-black flex items-center justify-center shrink-0 font-bold shadow-md">
                    <Scale size={22} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758]">
                        CHAMBER NOTICE: {chamberStatus.awayReason ? chamberStatus.awayReason.toUpperCase() : "ADVOCATE UNAVAILABLE"}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold uppercase">
                        {chamberStatus.returnEstimate ? `RESUMING: ${chamberStatus.returnEstimate}` : "AWAY"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {chamberStatus.notice ||
                        (isBothClosed
                          ? "Advocate Shareen Hussain's chamber is currently closed for the rest of today. Consultations will resume tomorrow morning. You may leave an urgent callback request below."
                          : "Advocate Shareen Hussain is currently attending court hearings. In-person chamber visits are paused. Online video consultations remain open.")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => setShowCallbackModal(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#cba758] text-black hover:bg-[#dfbe73] transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Calendar size={13} />
                    <span>Ask for In-Chamber Meeting</span>
                  </button>

                  {!isBothClosed && chamberStatus.isOnlineOpen && (
                    <button
                      onClick={() => openBookingModal(undefined, "online")}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video size={13} />
                      <span>Book Online Video Call</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Clean Advocate Chamber Card */}
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
            <div className="shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto btn-primary shimmer-badge !py-3.5 !px-8 text-sm font-bold shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar size={16} />
                <span>Book Consultation Appointment</span>
              </button>

              <span className="text-[11px] font-mono text-slate-300 text-center">
                Click to open reservation desk · Instant pass delivery
              </span>
            </div>
          </div>

          {/* Quick Practice Area Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              {
                id: "court-marriage",
                title: "Court Marriage & Registration",
                desc: "Special Marriage Act 1954, Hindu Marriage, Police Protection & Legal Advice.",
                icon: HeartHandshake,
              },
              {
                id: "trademark-registration",
                title: "Trademark & Intellectual Property",
                desc: "Brand Search, Trademark Filing, Examination Objections & Hearing Advocacy.",
                icon: Stamp,
              },
              {
                id: "legal-services",
                title: "Chamber Documentation & Litigation",
                desc: "Property Title Search, Sale Deeds, Regular/Anticipatory Bail & Court Advocacy.",
                icon: Scale,
              },
            ].map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-white/10 bg-[#0d2218]/60 p-4 flex flex-col justify-between gap-3 text-left hover:border-[var(--gold)]/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="h-8 w-8 rounded-lg bg-[var(--gold)]/20 border border-[var(--gold)]/30 text-[var(--gold)] flex items-center justify-center">
                      <IconComp size={16} />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-300 leading-snug">{srv.desc}</p>
                  </div>

                  <button
                    onClick={() => openBookingModal(srv.id)}
                    className="text-xs font-bold text-[var(--gold-light)] hover:text-white flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Book for this area</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Black / Dark Luxury Step-By-Step Modal Popup Dialog ============ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#cba758]/40"
              style={{
                backgroundColor: "#09090b",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(203, 167, 88, 0.15)",
                color: "#faf7f0",
              }}
            >
              {/* Modal Top Bar (Dark Luxury) */}
              <div
                className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10"
                style={{ backgroundColor: "#000000" }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#cba758] text-black flex items-center justify-center font-serif font-bold text-sm shadow-md">
                    <Scale size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white">
                      Consultation Booking Desk
                    </h3>
                    <p className="text-[11px] font-mono text-[#cba758]">
                      Adv. Shareen Hussain · Nagpur Chambers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close popup"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step Progress Indicators */}
              {step !== "success" && (
                <div className="px-6 py-3 shrink-0 border-b border-white/10 bg-[#121214]">
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
                                ? "bg-[#cba758] text-black"
                                : isActive
                                ? "bg-[#cba758] text-black font-extrabold ring-2 ring-[#cba758]/40"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {isDone ? <Check size={12} strokeWidth={3} /> : s.num}
                          </div>
                          <span
                            className={`hidden sm:inline text-xs font-semibold ${
                              isActive ? "text-[#cba758]" : "text-slate-400"
                            }`}
                          >
                            {s.label}
                          </span>
                          {idx < 2 && (
                            <div
                              className={`h-0.5 flex-1 mx-2 transition-all ${
                                currentStepNum > s.num ? "bg-[#cba758]" : "bg-white/10"
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
              <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
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
                      {/* Notice if Closed Today */}
                      {isBothClosed && (
                        <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-200 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-rose-300">
                            <AlertTriangle size={14} />
                            <span>Chamber Notice: Closed for Rest of Day</span>
                          </div>
                          <p className="leading-relaxed">
                            Advocate Shareen Hussain is currently unavailable for consultations today ({chamberStatus.awayReason || "Court Hearing / Closed"}). Resuming: <strong>{chamberStatus.returnEstimate || "Tomorrow 9:30 AM"}</strong>.
                          </p>
                          <p className="text-[11px] text-rose-300/80">
                            You may select an upcoming date (e.g. Tomorrow onwards) below, or request a direct callback.
                          </p>
                        </div>
                      )}

                      {/* 1. Consultation Mode Picker */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758] block mb-2">
                          1. Select Consultation Mode
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Online Mode Button */}
                          {(() => {
                            const isOnlineClosed = !chamberStatus.isOnlineOpen;
                            const isSelected = consultationMode === "online";

                            return (
                              <button
                                type="button"
                                disabled={isOnlineClosed && !isBothClosed}
                                onClick={() => setConsultationMode("online")}
                                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                                  isOnlineClosed && !isBothClosed
                                    ? "opacity-40 cursor-not-allowed border-dashed border-slate-700 bg-white/5"
                                    : isSelected
                                    ? "border-[#cba758] bg-[#18181b] ring-2 ring-[#cba758]/30 shadow-md cursor-pointer"
                                    : "border-white/10 bg-white/5 hover:border-white/20 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center gap-2 text-purple-400">
                                  <Video size={17} />
                                  <span className="font-bold text-xs text-white">Online Video Call</span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                                  Google Meet · Secure video consultation
                                </p>

                                {isOnlineClosed && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/40 font-bold">
                                    <Lock size={9} />
                                    <span>Closed Today</span>
                                  </span>
                                )}
                              </button>
                            );
                          })()}

                          {/* Offline Mode Button */}
                          {(() => {
                            const isOfficeClosed = !chamberStatus.isOfficeOpen;
                            const isSelected = consultationMode === "offline";

                            return (
                              <button
                                type="button"
                                disabled={isOfficeClosed && !isBothClosed}
                                onClick={() => setConsultationMode("offline")}
                                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                                  isOfficeClosed && !isBothClosed
                                    ? "opacity-40 cursor-not-allowed border-dashed border-slate-700 bg-white/5"
                                    : isSelected
                                    ? "border-[#cba758] bg-[#18181b] ring-2 ring-[#cba758]/30 shadow-md cursor-pointer"
                                    : "border-white/10 bg-white/5 hover:border-white/20 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center gap-2 text-[#cba758]">
                                  <MapPin size={17} />
                                  <span className="font-bold text-xs text-white">Office Visit</span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-1.5 leading-snug">
                                  In-person at Trisharan Square, Nagpur
                                </p>

                                {isOfficeClosed && (
                                  <span className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/40 font-bold">
                                    <Lock size={9} />
                                    <span>{chamberStatus.returnEstimate ? `Away: ${chamberStatus.returnEstimate}` : "Closed Today"}</span>
                                  </span>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                      {/* 2. Legal Practice Area (Starts at N/A / unselected!) */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758] block mb-2">
                          2. Legal Practice Area
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {Object.entries(SERVICE_MATTERS).map(([key, item]) => {
                            const isSelected = selectedService === key;
                            const IconComponent = item.icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setSelectedService(key);
                                  setSelectedMatter("");
                                }}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[#cba758] bg-[#163528] text-white shadow-md ring-1 ring-[#cba758]/40"
                                    : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent
                                    size={16}
                                    className={isSelected ? "text-[#cba758]" : "text-slate-400"}
                                  />
                                  <span className="text-xs font-bold leading-tight">{item.label}</span>
                                </div>
                                <p className="text-[10.5px] text-slate-300 mt-1 line-clamp-1">
                                  {item.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Specific Legal Matter (Starts with N/A, not forced to Special Marriage Act!) */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758] block mb-1.5">
                          3. Specific Legal Matter (Select Matter or N/A)
                        </label>
                        <select
                          value={selectedMatter}
                          onChange={(e) => setSelectedMatter(e.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white focus:border-[#cba758] focus:outline-none"
                        >
                          <option value="" className="bg-[#09090b] text-slate-300">
                            -- N/A - General Consultation (Select if unsure) --
                          </option>
                          <option value="N/A - General Legal Consultation" className="bg-[#09090b] text-slate-200">
                            N/A - General Legal Consultation
                          </option>

                          {selectedService &&
                            SERVICE_MATTERS[selectedService]?.matters.map((m) => (
                              <option key={m} value={m} className="bg-[#09090b] text-white">
                                {m}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="button"
                          disabled={!consultationMode || !selectedService}
                          onClick={() => setStep("slots")}
                          className="w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: "#cba758",
                            color: "#000000",
                          }}
                        >
                          <span>Continue to Select Date & Slot</span>
                          <ArrowRight size={14} />
                        </button>

                        {isBothClosed && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              setShowCallbackModal(true);
                            }}
                            className="w-full py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-700/30 hover:bg-amber-950/60 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Calendar size={13} />
                            <span>Or Request In-Chamber Callback When Advocate Resumes</span>
                          </button>
                        )}
                      </div>
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
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758]">
                            Select Consultation Date
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">Next 7 Days</span>
                        </div>

                        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                          {Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(today);
                            d.setDate(d.getDate() + i);
                            const isSelected = toDateKey(d) === toDateKey(targetDate);
                            const isTodayDate = i === 0;
                            const isDateDisabled = isTodayDate && isTodayDisabledForMode;

                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={isDateDisabled}
                                onClick={() => setTargetDate(d)}
                                className={`flex flex-col items-center justify-center min-w-[72px] py-2.5 px-2 rounded-2xl border text-center transition-all ${
                                  isDateDisabled
                                    ? "opacity-35 cursor-not-allowed border-dashed border-slate-700 bg-white/5"
                                    : isSelected
                                    ? "border-[#cba758] bg-[#163528] text-white shadow-md ring-1 ring-[#cba758]/50 cursor-pointer"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 cursor-pointer"
                                }`}
                              >
                                <span
                                  className={`text-[10px] font-mono uppercase ${
                                    isDateDisabled
                                      ? "text-rose-400 line-through"
                                      : isSelected
                                      ? "text-[#cba758] font-bold"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {isTodayDate ? (isDateDisabled ? "Closed" : "Today") : d.toLocaleDateString("en-IN", { weekday: "short" })}
                                </span>
                                <span className="text-base font-bold my-0.5 text-white">
                                  {d.getDate()}
                                </span>
                                <span className="text-[10px] opacity-75">
                                  {d.toLocaleDateString("en-IN", { month: "short" })}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {isTodayDisabledForMode && toDateKey(targetDate) === toDateKey(today) && (
                          <p className="mt-2 text-xs text-rose-300 flex items-center gap-1.5">
                            <Lock size={12} />
                            <span>
                              {chamberStatus.awayReason || "Consultations currently paused today"}. Resuming: {chamberStatus.returnEstimate || "tomorrow"}. Please select tomorrow or an upcoming date above.
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Time Slots Grid */}
                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#cba758] block mb-2">
                          Select One-Hour Consultation Slot
                        </label>

                        {slotsLoading ? (
                          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin text-[#cba758]" />
                            <span>Checking live chamber schedule...</span>
                          </div>
                        ) : (availableSlots || []).length === 0 ? (
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-300 space-y-1">
                            <p className="font-bold text-white">No Slots Available for this Date</p>
                            <p className="text-[11px] text-slate-400">
                              Please select another date above (e.g. tomorrow) or request a direct callback.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {allSlots.map((slot) => {
                              const isSelected = selectedSlot === slot;
                              const isBooked = bookedSlots.includes(slot);
                              const isPassed = passedSlots.includes(slot);

                              if (isBooked) {
                                return (
                                  <div
                                    key={slot}
                                    className="py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-semibold flex items-center justify-between cursor-not-allowed select-none opacity-75"
                                    title="This time slot is already booked by another client"
                                  >
                                    <span className="line-through">{formatSlotLabel(slot)}</span>
                                    <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30">
                                      Booked ✕
                                    </span>
                                  </div>
                                );
                              }

                              if (isPassed) {
                                return (
                                  <div
                                    key={slot}
                                    className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-xs font-semibold flex items-center justify-between cursor-not-allowed select-none opacity-45"
                                    title="Consultation time has passed for today"
                                  >
                                    <span className="line-through">{formatSlotLabel(slot)}</span>
                                    <span className="text-[9.5px] font-mono text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                                      Passed
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? "border-[#cba758] bg-[#cba758] text-black font-bold shadow-md ring-2 ring-[#cba758]/40"
                                      : "border-white/15 bg-white/5 text-slate-200 hover:border-[#cba758]/50 hover:bg-white/10"
                                  }`}
                                >
                                  <span>{formatSlotLabel(slot)}</span>
                                  <span className={`text-[9.5px] font-mono ${isSelected ? "text-black/80 font-bold" : "text-[#cba758]"}`}>
                                    Available
                                  </span>
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
                          className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          disabled={!selectedSlot}
                          onClick={() => setStep("details")}
                          className="flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: "#cba758",
                            color: "#000000",
                          }}
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
                      <div className="p-3 rounded-2xl bg-[#121214] border border-[#cba758]/30 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#cba758]">
                            {formatSlotLabel(selectedSlot!)} · {targetDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                          <p className="text-[11px] text-slate-300 truncate max-w-[280px]">
                            {consultationMode === "online" ? "Google Meet Video" : "Office Visit"} · {effectiveMatter}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep("slots")}
                          className="text-[11px] font-bold text-[#cba758] hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your complete name"
                          className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#cba758] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          WhatsApp Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile number (e.g. 9823012345)"
                          className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#cba758] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Email (Optional, for Google Meet invite)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-[#cba758] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Brief Case / Consultation Notes (Optional)
                        </label>
                        <textarea
                          name="message"
                          rows={2}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Summary of case or specific legal documentation required..."
                          className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-[#cba758] focus:outline-none"
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
                          {errorMsg}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("slots")}
                          className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitStatus === "loading"}
                          className="flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                          style={{
                            backgroundColor: "#cba758",
                            color: "#000000",
                          }}
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

                  {/* ================= STEP 4: SUCCESS PASS & CALENDAR ================= */}
                  {step === "success" && confirmedBooking && (() => {
                    const isOnline = consultationMode === "online";
                    const meetUrl =
                      confirmedBooking.meet_link || (isOnline ? site.googleMeetRoom : null);

                    const dateFormatted = confirmedBooking.date.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const timeFormatted = formatSlotLabel(confirmedBooking.slot);

                    // Extract slot hour & minute
                    const [slotH, slotM] = (confirmedBooking.slot || "10:00")
                      .split(":")
                      .map(Number);
                    const slotHours = isNaN(slotH) ? 10 : slotH;
                    const slotMinutes = isNaN(slotM) ? 0 : slotM;

                    // Compute start and end times in UTC (IST is UTC+5:30)
                    const year = confirmedBooking.date.getFullYear();
                    const month = confirmedBooking.date.getMonth();
                    const day = confirmedBooking.date.getDate();

                    const startUtcMs = Date.UTC(year, month, day, slotHours - 5, slotMinutes - 30);
                    const startUtc = new Date(startUtcMs);
                    const endUtc = new Date(startUtcMs + 45 * 60 * 1000); // 45-minute consultation

                    const formatCalDate = (d: Date) =>
                      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

                    const gCalStart = formatCalDate(startUtc);
                    const gCalEnd = formatCalDate(endUtc);

                    const eventTitle = `Legal Consultation: Adv. Shareen Hussain (${effectiveMatter})`;
                    const eventLocation = isOnline
                      ? `${meetUrl} (Google Meet Video)`
                      : `True Legal Advice, Near Trisharan Square, Nagpur - 440027, Maharashtra`;

                    const eventDetails = `LEGAL CONSULTATION APPOINTMENT CONFIRMATION\nChambers of Adv. Shareen Hussain (Nagpur Bench)\n\n• Booking ID: ${confirmedBooking.id}\n• Client Name: ${form.name}\n• Phone: ${form.phone}\n• Legal Matter: ${effectiveMatter}\n• Mode: ${isOnline ? "Google Meet Video Call" : "In-Person Chamber Visit (Trisharan Sq, Nagpur)"}\n${isOnline ? `• Google Meet Link: ${meetUrl}` : `• Chamber Address: Near Trisharan Square, Nagpur - 440027, Maharashtra`}\n• Chamber Helpline: +91 83296 31199\n\nInstructions:\n${isOnline ? "- Please join via the Google Meet link 5 minutes prior to your slot." : "- Please arrive 5 to 10 minutes prior with all case documents/agreements."}`;

                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      eventTitle
                    )}&dates=${gCalStart}/${gCalEnd}&ctz=Asia/Kolkata&details=${encodeURIComponent(
                      eventDetails
                    )}&location=${encodeURIComponent(eventLocation)}`;

                    const bookingId = confirmedBooking.id;

                    function downloadIcs() {
                      const icsLines = [
                        "BEGIN:VCALENDAR",
                        "VERSION:2.0",
                        "PRODID:-//True Legal Advice//Advocate Consultation//EN",
                        "CALSCALE:GREGORIAN",
                        "METHOD:PUBLISH",
                        "BEGIN:VEVENT",
                        `UID:${bookingId}@truelegaladvice.in`,
                        `DTSTAMP:${formatCalDate(new Date())}`,
                        `DTSTART:${gCalStart}`,
                        `DTEND:${gCalEnd}`,
                        `SUMMARY:${eventTitle}`,
                        `DESCRIPTION:${eventDetails.replace(/\n/g, "\\n")}`,
                        `LOCATION:${eventLocation}`,
                        isOnline && meetUrl ? `URL:${meetUrl}` : "",
                        "STATUS:CONFIRMED",
                        "BEGIN:VALARM",
                        "TRIGGER:-PT30M",
                        "ACTION:DISPLAY",
                        "DESCRIPTION:Reminder: Legal Consultation with Adv. Shareen Hussain in 30 minutes",
                        "END:VALARM",
                        "END:VEVENT",
                        "END:VCALENDAR",
                      ].filter(Boolean);

                      const icsBlob = new Blob([icsLines.join("\r\n")], {
                        type: "text/calendar;charset=utf-8",
                      });
                      const url = URL.createObjectURL(icsBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `consultation-${bookingId}.ics`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setDownloadedIcs(true);
                      setTimeout(() => setDownloadedIcs(false), 3000);
                    }

                    const passText = `*LEGAL CONSULTATION APPOINTMENT PASS*
🏛️ *Chambers of Adv. Shareen Hussain (Nagpur Bench)*

🆔 *Booking Ref:* ${confirmedBooking.id}
👤 *Client:* ${form.name}
⚖️ *Matter:* ${effectiveMatter}
📅 *Date:* ${dateFormatted}
⏰ *Time:* ${timeFormatted}
${
  isOnline
    ? `💻 *Mode:* Online Video Call (Google Meet)\n🔗 *Meet Link:* ${meetUrl}\n(Click link to join at scheduled slot)`
    : `📍 *Chamber:* Near Trisharan Square, Nagpur - 440027, Maharashtra\n(Please arrive 5–10 mins prior)`
}
📞 *Helpline:* +91 83296 31199
🌐 *Website:* https://true-legal-advice.vercel.app`;

                    const chamberWaUrl = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(passText)}`;
                    const cleanClientPhone = form.phone.replace(/\D/g, "").slice(-10);
                    const clientWaUrl = `https://wa.me/91${cleanClientPhone}?text=${encodeURIComponent(passText)}`;

                    return (
                      <motion.div
                        key="step-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-2 space-y-4"
                      >
                        <div className="h-14 w-14 rounded-full bg-[#cba758] text-black flex items-center justify-center mx-auto shadow-lg ring-4 ring-[#cba758]/20">
                          <CheckCircle2 size={28} />
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cba758] bg-[#cba758]/20 px-3 py-1 rounded-full border border-[#cba758]/40">
                            SLOT CONFIRMED · {confirmedBooking.id}
                          </span>
                          <h3 className="text-xl font-serif font-bold text-white mt-2">
                            Consultation Scheduled!
                          </h3>
                          <p className="text-xs text-slate-300 mt-1">
                            Thank you, <strong>{form.name}</strong>. Your consultation with <strong>Adv. Shareen Hussain</strong> has been scheduled for{" "}
                            <strong>
                              {confirmedBooking.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {formatSlotLabel(confirmedBooking.slot)}
                            </strong>.
                          </p>
                        </div>

                        {/* Pass details card */}
                        <div className="p-4 rounded-2xl bg-[#121214] border border-[#cba758]/35 text-left text-xs space-y-2.5 text-slate-200">
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#cba758] font-bold">Booking Details</span>
                            <span className="text-[10px] font-mono text-zinc-400">ID: {confirmedBooking.id}</span>
                          </div>
                          <p><strong>Legal Matter:</strong> {effectiveMatter}</p>
                          <p>
                            <strong>Consultation Mode:</strong>{" "}
                            {isOnline ? "Google Meet Video Call" : "In-Person Office Visit (Trisharan Sq, Nagpur)"}
                          </p>

                          {/* Show Google Meet Link directly with clickable button */}
                          {isOnline && meetUrl && (
                            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                                  Google Meet Consultation Room
                                </span>
                                <a
                                  href={meetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-white underline font-mono truncate block hover:text-[#cba758] mt-0.5"
                                >
                                  {meetUrl}
                                </a>
                              </div>
                              <a
                                href={meetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 no-underline shadow-sm"
                              >
                                <Video size={13} />
                                <span>Join Room</span>
                              </a>
                            </div>
                          )}

                          {!isOnline && (
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/60 text-zinc-300 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#cba758] font-bold block">
                                  Chamber Location
                                </span>
                                <span className="text-xs text-zinc-200 block mt-0.5">
                                  Near Trisharan Square, Nagpur - 440027, Maharashtra
                                </span>
                              </div>
                              <a
                                href="https://maps.google.com/?q=Trisharan+Square+Nagpur"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#cba758] border border-[#cba758]/30 font-bold text-xs shrink-0 flex items-center gap-1 no-underline"
                              >
                                <MapPin size={12} />
                                <span>Directions</span>
                              </a>
                            </div>
                          )}

                          <p><strong>Registered Phone:</strong> {form.phone}</p>
                        </div>

                        {/* Calendar Integration Section */}
                        <div className="space-y-2 pt-1 text-left">
                          <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#cba758] block">
                            📅 Add to Calendar:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={googleCalendarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer no-underline border border-[#cba758]"
                              style={{
                                backgroundColor: "#cba758",
                                color: "#000000",
                              }}
                            >
                              <CalendarPlus size={15} />
                              <span>Google Calendar</span>
                            </a>

                            <button
                              type="button"
                              onClick={downloadIcs}
                              className="py-2.5 px-3 rounded-xl border border-white/20 text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <Download size={14} className="text-[#cba758]" />
                              <span>{downloadedIcs ? "Added to Calendar!" : "Apple / Outlook (.ics)"}</span>
                            </button>
                          </div>
                        </div>

                        {/* WhatsApp Pass & Notification Section */}
                        <div className="space-y-2 pt-1 text-left">
                          <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#25D366] block">
                            💬 WhatsApp Pass & Confirmation:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a
                              href={chamberWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer no-underline"
                            >
                              <MessageCircle size={15} />
                              <span>Chamber WhatsApp</span>
                            </a>

                            {cleanClientPhone && (
                              <a
                                href={clientWaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2.5 px-3 rounded-xl border border-[#25D366]/40 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/10 flex items-center justify-center gap-2 cursor-pointer no-underline"
                              >
                                <Share2 size={14} />
                                <span>Send to My WhatsApp</span>
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(passText);
                              setCopiedPass(true);
                              setTimeout(() => setCopiedPass(false), 2000);
                            }}
                            className="w-full py-2 rounded-xl border border-white/15 text-xs font-medium text-slate-300 hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                          >
                            {copiedPass ? <Check size={13} className="text-[#cba758]" /> : <Copy size={13} />}
                            <span>{copiedPass ? "Pass Copied to Clipboard!" : "Copy Full Pass Details"}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ Ask For Meeting When Back Callback Modal ============ */}
      <AnimatePresence>
        {showCallbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#cba758]/40"
              style={{
                backgroundColor: "#09090b",
                color: "#faf7f0",
              }}
            >
              <button
                onClick={() => {
                  setShowCallbackModal(false);
                  setCallbackSent(false);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              {!callbackSent ? (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#cba758] text-black flex items-center justify-center font-bold">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-white">
                        Request In-Chamber Meeting
                      </h3>
                      <p className="text-xs text-slate-300">
                        Adv. Shareen will be alerted immediately when she returns.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#18181b] border border-[#cba758]/30 text-xs text-amber-100">
                    <strong>Current Status:</strong> {chamberStatus.awayReason || "Court Hearing Session"}{" "}
                    ({chamberStatus.returnEstimate ? `Resuming: ${chamberStatus.returnEstimate}` : "Resuming Soon"})
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white focus:border-[#cba758] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="e.g. 9823012345"
                      className="w-full rounded-xl border border-white/20 bg-[#121214] px-3.5 py-2.5 text-xs text-white focus:border-[#cba758] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackLoading}
                    className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    style={{
                      backgroundColor: "#cba758",
                      color: "#000000",
                    }}
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
                  <div className="h-12 w-12 rounded-full bg-[#cba758] text-black flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-serif font-bold text-white">
                    Request Received!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Thank you, <strong>{callbackName}</strong>. Advocate Shareen Hussain&apos;s chamber desk has been notified. You will receive a direct WhatsApp/call update as soon as the advocate steps into the Trisharan Square chamber.
                  </p>
                  <button
                    onClick={() => {
                      setShowCallbackModal(false);
                      setCallbackSent(false);
                    }}
                    className="mt-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#cba758] text-black"
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
        <div className="min-h-[60vh] flex items-center justify-center bg-black text-white">
          <div className="text-center text-xs text-slate-300">
            <Loader2 size={24} className="animate-spin text-[#cba758] mx-auto mb-2" />
            <span>Loading Consultation Desk...</span>
          </div>
        </div>
      }
    >
      <BookClient />
    </Suspense>
  );
}
