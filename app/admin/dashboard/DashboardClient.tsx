"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Phone,
  Mail,
  CalendarDays,
  RefreshCw,
  Loader2,
  Video,
  MapPin,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  FileText,
  ShieldCheck,
  Quote,
  Sparkles,
  Search,
  Copy,
  Check,
  ArrowUpRight,
  Sun,
  Moon,
  Send,
  X,
  Scale,
} from "lucide-react";
import { site } from "@/lib/site-config";

export type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  booking_date: string;
  booking_time: string;
  consultation_mode: "online" | "offline";
  meet_link: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court Marriage & Registration",
  "trademark-registration": "Trademark & Brand Protection",
  "legal-services": "Chamber Documentation & Litigation",
};

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Awaiting Confirmation",
  },
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    label: "Confirmed & Scheduled",
  },
  completed: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    label: "Consultation Completed",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    label: "Declined / Cancelled",
  },
};

const ADVOCATE_QUOTES = [
  {
    quote: "Justice is truth in action. When you stand before the court or advise a citizen in your chamber, you hold the shield of constitutional dignity.",
    author: "Chamber Motto",
    title: "Adv. Shareen Hussain Chambers",
  },
  {
    quote: "A lawyer without history or literature is a mechanic, a mere working mason; if he possesses some knowledge of these, he may venture to call himself an architect.",
    author: "Sir Walter Scott",
    title: "Architect of Legal Remedies",
  },
  {
    quote: "Cultivate the spirit of fearless advocacy. The legal profession is not a trade; it is a sacred trust to protect the rights of the citizen under the Constitution.",
    author: "Justice V. R. Krishna Iyer",
    title: "Judicial Beacon",
  },
  {
    quote: "Law and order are the medicine of the body politic and when the body politic gets sick, medicine must be administered with precision and courage.",
    author: "Dr. B. R. Ambedkar",
    title: "Father of Indian Constitution",
  },
  {
    quote: "Every citizen who walks into Trisharan Square brings their deepest hope for justice. Deliver with clarity, uncompromising ethics, and strategic mastery.",
    author: "High Court & District Court Practice",
    title: "True Legal Advice",
  },
];

function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function todayInIndia(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(
    ist.getUTCDate()
  ).padStart(2, "0")}`;
}

function formatTime12(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${period}`;
}

function formatDateLabel(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTimeOfDayGreeting(): { greeting: string; icon: any } {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const hour = ist.getUTCHours();
  if (hour < 12) return { greeting: "Good morning", icon: Sun };
  if (hour < 17) return { greeting: "Good afternoon", icon: Sun };
  return { greeting: "Good evening", icon: Moon };
}

export default function DashboardClient() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "today" | "confirmed" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "secretary">("admin");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Modal State for Confirmation & Direct WhatsApp Dispatch
  const [confirmModalBooking, setConfirmModalBooking] = useState<Booking | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
      if (data.role) setRole(data.role);
    } catch (err) {
      console.error("Failed to load chamber bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Rotate quotes every 45 seconds or on manual click
  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % ADVOCATE_QUOTES.length);
  };

  // Generate customized WhatsApp confirmation text
  const buildConfirmationMessage = useCallback((b: Booking) => {
    const dateStr = formatDateLabel(b.booking_date);
    const timeStr = formatTime12(b.booking_time);
    const serviceTitle = serviceLabels[b.service] || b.service;

    if (b.consultation_mode === "offline") {
      return `Hello ${b.name},

Your In-Chamber Legal Consultation with Adv. Shareen Hussain has been officially CONFIRMED.

🏛️ Chamber: True Legal Advice
⚖️ Matter: ${serviceTitle}
📅 Date: ${dateStr}
⏰ Scheduled Slot: ${timeStr}
📍 Address: Trisharan Square, Nagpur - 440027, Maharashtra
📞 Helpline: +91 83296 31199

Please arrive 5 to 10 minutes prior with all relevant case documents, notices, or identity proofs. Adv. Shareen Hussain looks forward to assisting you.`;
    } else {
      const meetLink = b.meet_link || site.googleMeetRoom;
      return `Hello ${b.name},

Your Online Video Consultation with Adv. Shareen Hussain has been officially CONFIRMED.

⚖️ Matter: ${serviceTitle}
📅 Date: ${dateStr}
⏰ Scheduled Slot: ${timeStr}
💻 Google Meet Link: ${meetLink}
📞 Helpline: +91 83296 31199

Please click the Google Meet link above at your scheduled appointment time.`;
    }
  }, []);

  const openConfirmModal = (b: Booking) => {
    setConfirmModalBooking(b);
    setCustomMessage(buildConfirmationMessage(b));
    setCopied(false);
  };

  const closeConfirmModal = () => {
    setConfirmModalBooking(null);
    setCustomMessage("");
    setCopied(false);
  };

  // Status Updater
  async function updateStatus(id: string, status: Booking["status"]) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Handle Dispatch & Confirm from Modal
  async function handleConfirmAndDispatchWhatsApp() {
    if (!confirmModalBooking) return;
    const b = confirmModalBooking;
    const cleanPhone = formatWhatsAppNumber(b.phone);
    const textParam = encodeURIComponent(customMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${textParam}`;

    // 1. Update database status to confirmed
    await updateStatus(b.id, "confirmed");

    // 2. Open WhatsApp immediately on direct user click
    window.open(waUrl, "_blank");

    closeConfirmModal();
  }

  async function handleConfirmSilently() {
    if (!confirmModalBooking) return;
    await updateStatus(confirmModalBooking.id, "confirmed");
    closeConfirmModal();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayStr = todayInIndia();

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      today: bookings.filter((b) => b.booking_date === todayStr && b.status !== "cancelled").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings, todayStr]);

  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    if (activeTab === "pending") {
      list = list.filter((b) => b.status === "pending");
    } else if (activeTab === "today") {
      list = list.filter((b) => b.booking_date === todayStr);
    } else if (activeTab === "confirmed") {
      list = list.filter((b) => b.status === "confirmed");
    } else if (activeTab === "completed") {
      list = list.filter((b) => b.status === "completed");
    } else if (activeTab === "cancelled") {
      list = list.filter((b) => b.status === "cancelled");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          b.service.toLowerCase().includes(q) ||
          b.booking_date.includes(q)
      );
    }

    return list.sort((a, b) => {
      // Pending requests come to the top
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return `${b.booking_date} ${b.booking_time}`.localeCompare(`${a.booking_date} ${a.booking_time}`);
    });
  }, [bookings, activeTab, searchQuery, todayStr]);

  const { greeting, icon: GreetingIcon } = getTimeOfDayGreeting();
  const currentQuote = ADVOCATE_QUOTES[quoteIndex];

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#1a1f1c]">
      {/* ================= Top Sub-Bar & Chamber Header ================= */}
      <header className="border-b border-[#e8e2d4] bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#123526] text-[#cba758] flex items-center justify-center font-serif font-bold text-lg border border-[#cba758]/30 shadow-sm">
                <Scale size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#b08a3e]">
                    CHAMBERS OF ADV. SHAREEN HUSSAIN
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#123526]/10 text-[#123526] border border-[#123526]/20 capitalize">
                    {role} Desk
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#123526] leading-tight">
                  Chamber Appointments & Client Mandates
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                onClick={loadBookings}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#e0d9ca] text-[#47504a] hover:bg-[#faf7f0] hover:border-[#123526]/30 transition-all shadow-2xs"
                title="Refresh booking list"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-[#b08a3e]" : ""} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-all shadow-2xs"
              >
                <LogOut size={13} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ================= Motivational Chamber Quote & Greeting Banner ================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden border border-[#dfd6c3] bg-gradient-to-br from-[#123526] via-[#153e2d] to-[#0c2419] text-[#faf7f0] p-6 sm:p-8 shadow-lg"
        >
          {/* Subtle Ambient Gold Glow Background */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(203,167,88,0.25), transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#cba758]">
                <GreetingIcon size={14} className="text-[#cba758]" />
                <span>{greeting}, Adv. Shareen Hussain</span>
                <span className="text-white/40">·</span>
                <span>Trisharan Square Chambers, Nagpur</span>
              </div>

              {/* Animated Rotating Quote */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3.5"
                >
                  <Quote size={28} className="text-[#cba758]/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base sm:text-lg font-serif italic text-white/95 leading-relaxed">
                      &ldquo;{currentQuote.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-xs font-mono font-bold text-[#cba758] flex items-center gap-1.5">
                      <span>— {currentQuote.author}</span>
                      <span className="text-white/40 font-normal">({currentQuote.title})</span>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quote Cycler Button */}
            <div className="shrink-0 flex sm:flex-col items-center gap-2">
              <button
                onClick={nextQuote}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#cba758] text-[#0a2217] hover:bg-[#dfbe73] hover:shadow-md transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>Daily Chamber Boost</span>
              </button>
              <span className="text-[10px] font-mono text-white/60">Quote {quoteIndex + 1} of {ADVOCATE_QUOTES.length}</span>
            </div>
          </div>
        </motion.div>

        {/* ================= 4 Metric Stat Cards ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: All Requests */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setActiveTab("all")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "all"
                ? "bg-white border-[#123526] ring-2 ring-[#123526]/15 shadow-md"
                : "bg-white border-[#e5decb] hover:border-[#123526]/40 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47504a]">
                All Appointments
              </span>
              <div className="h-9 w-9 rounded-xl bg-[#123526]/10 text-[#123526] flex items-center justify-center">
                <Inbox size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-[#123526] mt-3">
              {counts.all}
            </p>
            <p className="text-xs text-[#7c847d] mt-1">Total received records</p>
          </motion.div>

          {/* Card 2: Pending Approval */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setActiveTab("pending")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "pending"
                ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "bg-white border-[#e5decb] hover:border-amber-400 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                Pending Requests
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <p className="text-3xl font-serif font-bold text-amber-800">
                {counts.pending}
              </p>
              {counts.pending > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                  Needs Action
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900/80 mt-1">Awaiting confirmation</p>
          </motion.div>

          {/* Card 3: Today's Appointments */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setActiveTab("today")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "today"
                ? "bg-[#cba758]/10 border-[#cba758] ring-2 ring-[#cba758]/20 shadow-md"
                : "bg-white border-[#e5decb] hover:border-[#cba758]/50 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47504a]">
                Today&apos;s Schedule
              </span>
              <div className="h-9 w-9 rounded-xl bg-[#cba758]/15 text-[#b08a3e] flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-[#1a1f1c] mt-3">
              {counts.today}
            </p>
            <p className="text-xs text-[#7c847d] mt-1">Scheduled for today</p>
          </motion.div>

          {/* Card 4: Confirmed & Completed */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => setActiveTab("confirmed")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all ${
              activeTab === "confirmed"
                ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-white border-[#e5decb] hover:border-emerald-400 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#47504a]">
                Confirmed Slots
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-emerald-800 mt-3">
              {counts.confirmed}
            </p>
            <p className="text-xs text-emerald-800/80 mt-1">Active confirmed clients</p>
          </motion.div>
        </div>

        {/* ================= Filter Tabs & Client Search Bar ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#e5decb] shadow-2xs w-fit">
            {[
              { id: "all", label: "All Bookings", count: counts.all },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "today", label: "Today", count: counts.today },
              { id: "confirmed", label: "Confirmed", count: counts.confirmed },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "cancelled", label: "Declined", count: counts.cancelled },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected ? "text-white" : "text-[#47504a] hover:text-[#123526] hover:bg-[#faf7f0]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-xl bg-[#123526] shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : tab.id === "pending" && tab.count > 0
                        ? "bg-amber-100 text-amber-900 font-bold"
                        : "bg-[#f0ebd9] text-[#47504a]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c847d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, phone, or date..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e5decb] bg-white text-xs text-[#1a1f1c] placeholder-[#7c847d] focus:border-[#123526] focus:outline-none shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ================= Bookings List Container ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <Loader2 size={36} className="animate-spin text-[#cba758] mb-3" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#7c847d]">
              Syncing chamber appointments desk...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-[#e5decb] bg-white p-16 text-center flex flex-col items-center shadow-xs"
          >
            <div className="h-16 w-16 rounded-2xl bg-[#faf7f0] border border-[#e5decb] flex items-center justify-center text-[#7c847d] mb-4">
              <Inbox size={28} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#123526]">
              No appointments in this view
            </h3>
            <p className="text-xs text-[#47504a] mt-1.5 max-w-sm leading-relaxed">
              {searchQuery
                ? `No booking records match "${searchQuery}". Clear your search query to see all appointments.`
                : activeTab === "pending"
                ? "All caught up! There are currently no pending appointment requests awaiting confirmation."
                : activeTab === "today"
                ? "No consultations are scheduled for today. Check upcoming slots under All Bookings."
                : "No appointment records match the selected filter."}
            </p>
            {(activeTab !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-6 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#123526] text-white hover:bg-[#1a4733] transition-all shadow-xs"
              >
                Reset Filters & View All
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBookings.map((b) => {
                const isPending = b.status === "pending";
                const isConfirmed = b.status === "confirmed";
                const isOnline = b.consultation_mode === "online";
                const meetLink = b.meet_link || site.googleMeetRoom;
                const statusMeta = statusStyles[b.status] || statusStyles.pending;
                const cleanPhone = formatWhatsAppNumber(b.phone);

                return (
                  <motion.article
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-2xl border p-6 transition-all duration-200 shadow-xs ${
                      isPending
                        ? "border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white"
                        : "border-[#e5decb] bg-white hover:border-[#123526]/30"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left Side: Client Data, Date, Time & Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg font-serif font-bold text-[#123526]">
                            {b.name}
                          </h3>

                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} border`}
                          >
                            {statusMeta.label}
                          </span>

                          {/* Mode Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              isOnline
                                ? "bg-purple-100 text-purple-900 border border-purple-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {isOnline ? <Video size={13} /> : <MapPin size={13} />}
                            <span>{isOnline ? "Online Video Call" : "In-Person Chamber Visit"}</span>
                          </span>
                        </div>

                        {/* Service Label */}
                        <p className="text-sm font-bold text-[#b08a3e] flex items-center gap-2">
                          <ShieldCheck size={15} />
                          <span>{serviceLabels[b.service] || b.service}</span>
                        </p>

                        {/* Date and Time Badges */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#1a1f1c]">
                          <span className="flex items-center gap-1.5 bg-[#f4f0e6] px-3.5 py-1.5 rounded-lg border border-[#e2dbc8]">
                            <CalendarDays size={14} className="text-[#b08a3e]" />
                            <span>{formatDateLabel(b.booking_date)}</span>
                          </span>

                          <span className="flex items-center gap-1.5 bg-[#f4f0e6] px-3.5 py-1.5 rounded-lg border border-[#e2dbc8]">
                            <Clock size={14} className="text-[#b08a3e]" />
                            <span>{formatTime12(b.booking_time)}</span>
                          </span>
                        </div>

                        {/* Client Phone & Contact info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#47504a] pt-1">
                          <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                            <Phone size={13} className="text-[#123526]" />
                            <span className="font-bold text-[#1a1f1c]">Number: {b.phone}</span>
                          </span>

                          {b.email && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Mail size={13} className="text-[#b08a3e]" />
                              <span>{b.email}</span>
                            </span>
                          )}

                          <span className="text-[11px] text-[#7c847d]">
                            Booked: {new Date(b.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Client Message */}
                        {b.message && (
                          <div className="mt-2.5 rounded-xl bg-[#faf7f0] border border-[#e5decb] p-3 text-xs text-[#47504a] flex items-start gap-2 max-w-2xl">
                            <FileText size={14} className="shrink-0 mt-0.5 text-[#b08a3e]" />
                            <span className="leading-relaxed">{b.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Action Buttons & Communication */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0 min-w-[220px]">
                        {isPending ? (
                          <>
                            {/* Primary Confirm Button with WhatsApp Dispatch */}
                            <button
                              onClick={() => openConfirmModal(b)}
                              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123526] text-white hover:bg-[#1a4733] transition-all shadow-sm flex items-center justify-center gap-2 group active:scale-95"
                            >
                              <CheckCircle2 size={15} className="text-[#cba758]" />
                              <span>Confirm Appointment</span>
                            </button>

                            <button
                              onClick={() => updateStatus(b.id, "cancelled")}
                              disabled={updatingId === b.id}
                              className="w-full px-4 py-2 rounded-xl text-xs font-semibold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle size={14} />
                              <span>Decline Request</span>
                            </button>
                          </>
                        ) : isConfirmed ? (
                          <>
                            {isOnline && (
                              <a
                                href={meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 transition-all shadow-sm flex items-center justify-center gap-2"
                              >
                                <Video size={14} />
                                <span>Join Google Meet</span>
                              </a>
                            )}

                            <button
                              onClick={() => updateStatus(b.id, "completed")}
                              disabled={updatingId === b.id}
                              className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                              <Check size={14} />
                              <span>Mark as Completed</span>
                            </button>
                          </>
                        ) : null}

                        {/* Direct Communication Strip: WhatsApp & Call */}
                        <div className="flex items-center gap-2 w-full pt-1">
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(buildConfirmationMessage(b))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            title={`Send direct WhatsApp message to ${b.phone}`}
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp ({b.phone})</span>
                          </a>

                          <a
                            href={`tel:${b.phone}`}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-white text-[#1a1f1c] border border-[#e5decb] hover:bg-[#faf7f0] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            title={`Call ${b.phone}`}
                          >
                            <Phone size={14} />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ================= Confirmation & WhatsApp Dispatch Modal ================= */}
      <AnimatePresence>
        {confirmModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#dfd6c3] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#f0ebd9]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#b08a3e]">
                    <CheckCircle2 size={14} />
                    <span>APPOINTMENT CONFIRMATION DESK</span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#123526] mt-1">
                    Confirm & Dispatch Notice
                  </h2>
                </div>

                <button
                  onClick={closeConfirmModal}
                  className="p-1.5 rounded-full text-[#7c847d] hover:text-[#1a1f1c] hover:bg-[#faf7f0] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Client Summary Box */}
              <div className="my-5 rounded-2xl bg-[#faf7f0] border border-[#e5decb] p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#47504a]">Client Name:</span>
                  <span className="font-bold text-[#123526] text-sm">{confirmModalBooking.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#47504a]">Client Phone (WhatsApp):</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                    +{formatWhatsAppNumber(confirmModalBooking.phone)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#47504a]">Consultation Type:</span>
                  <span className="font-bold text-[#1a1f1c]">
                    {confirmModalBooking.consultation_mode === "offline" ? "In-Person (Trisharan Square)" : "Online Video Call"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#47504a]">Date & Time Slot:</span>
                  <span className="font-semibold text-[#b08a3e]">
                    {formatDateLabel(confirmModalBooking.booking_date)} at {formatTime12(confirmModalBooking.booking_time)}
                  </span>
                </div>
              </div>

              {/* Custom Message Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#47504a]">
                    WhatsApp Notice to Client:
                  </label>
                  <button
                    onClick={() => copyText(customMessage)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b08a3e] hover:text-[#123526] transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full rounded-xl border border-[#e5decb] bg-slate-50/70 p-3 text-xs leading-relaxed text-[#1a1f1c] font-sans focus:bg-white focus:border-[#123526] focus:outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleConfirmAndDispatchWhatsApp}
                  disabled={updatingId === confirmModalBooking.id}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>Confirm & Send to +{formatWhatsAppNumber(confirmModalBooking.phone)}</span>
                </button>

                <button
                  onClick={handleConfirmSilently}
                  disabled={updatingId === confirmModalBooking.id}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold bg-white border border-[#e5decb] text-[#47504a] hover:bg-[#faf7f0] transition-all"
                >
                  Confirm Silently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
