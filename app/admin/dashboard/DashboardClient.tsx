"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Clock4,
  CheckCircle2,
  XCircle,
  MessageCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { site } from "@/lib/site-config";

type Booking = {
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

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 border border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-900 border border-emerald-300",
  completed: "bg-slate-100 text-slate-800 border border-slate-300",
  cancelled: "bg-red-100 text-red-900 border border-red-300",
};

const filterTabs = ["all", "pending", "today", "confirmed", "completed", "cancelled"] as const;
type FilterTab = (typeof filterTabs)[number];

/** Today's date string in India time (IST, UTC+5:30) as YYYY-MM-DD */
function todayInIndia(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(
    ist.getUTCDate()
  ).padStart(2, "0")}`;
}

function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m || 0).padStart(2, "0")} ${period}`;
}

function formatDateLabel(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardClient() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "secretary">("admin");

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
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateStatus(id: string, status: Booking["status"]) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const booking = bookings.find((b) => b.id === id);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );

        // When confirmed, if online consultation, offer WhatsApp message
        if (status === "confirmed" && booking?.phone) {
          const meetLink = booking.meet_link || site.googleMeetRoom;
          const msg =
            booking.consultation_mode === "online"
              ? `Hello ${booking.name}, your online legal consultation with Adv. Shareen Hussain on ${formatDateLabel(booking.booking_date)} at ${formatTime12(booking.booking_time)} is CONFIRMED. Google Meet Link: ${meetLink}`
              : `Hello ${booking.name}, your in-chamber consultation with Adv. Shareen Hussain at Trisharan Square, Nagpur on ${formatDateLabel(booking.booking_date)} at ${formatTime12(booking.booking_time)} is CONFIRMED. Chamber: Trisharan Square, Nagpur. Helpline: +91 83296 31199`;

          window.open(`https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

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

  const displayedBookings = useMemo(() => {
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

    return list.sort((a, b) => {
      // Prioritize pending first if viewing all
      if (activeTab === "all" && a.status !== b.status) {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
      }
      return `${b.booking_date} ${b.booking_time}`.localeCompare(`${a.booking_date} ${a.booking_time}`);
    });
  }, [bookings, activeTab, todayStr]);

  return (
    <section className="py-10 md:py-14 bg-[var(--paper)] text-[var(--ink)] min-h-[90vh]">
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[var(--gold)] mb-1">
              <ShieldCheck size={14} />
              <span>CHAMBER ADMINISTRATION PORTAL</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--green)]">
              Chamber Appointments & Bookings
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              True Legal Advice · Adv. Shareen Hussain (Nagpur High Court & District Courts)
              <span className="ml-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 capitalize">
                Role: {role}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBookings}
              className="btn-secondary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 rounded-xl shadow-xs"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2 rounded-xl text-red-600 hover:text-red-700 shadow-xs"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Stat Overview Cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: All Bookings */}
          <div
            onClick={() => setActiveTab("all")}
            className={`card cursor-pointer p-5 rounded-2xl border transition-all ${
              activeTab === "all"
                ? "border-[var(--green)] bg-white ring-2 ring-[var(--green)]/20 shadow-md"
                : "border-[var(--border)] bg-white hover:border-[var(--green)]/40 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                All Requests
              </span>
              <div className="h-9 w-9 rounded-xl bg-[var(--green)]/10 text-[var(--green)] flex items-center justify-center">
                <Inbox size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-[var(--green)] mt-3">
              {counts.all}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">Total appointments received</p>
          </div>

          {/* Card 2: Pending Approval */}
          <div
            onClick={() => setActiveTab("pending")}
            className={`card cursor-pointer p-5 rounded-2xl border transition-all ${
              activeTab === "pending"
                ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-md"
                : "border-[var(--border)] bg-white hover:border-amber-400 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                Pending Approval
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock4 size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-amber-700 mt-3 flex items-center gap-2">
              <span>{counts.pending}</span>
              {counts.pending > 0 && (
                <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                  Needs Action
                </span>
              )}
            </p>
            <p className="text-xs text-amber-800/80 mt-1">Awaiting confirmation</p>
          </div>

          {/* Card 3: Today's Appointments */}
          <div
            onClick={() => setActiveTab("today")}
            className={`card cursor-pointer p-5 rounded-2xl border transition-all ${
              activeTab === "today"
                ? "border-[var(--gold)] bg-[var(--gold)]/10 ring-2 ring-[var(--gold)]/20 shadow-md"
                : "border-[var(--border)] bg-white hover:border-[var(--gold)]/40 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                Today&apos;s Schedule
              </span>
              <div className="h-9 w-9 rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] flex items-center justify-center">
                <CalendarDays size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-[var(--ink)] mt-3">
              {counts.today}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">Appointments for today</p>
          </div>

          {/* Card 4: Confirmed & Completed */}
          <div
            onClick={() => setActiveTab("confirmed")}
            className={`card cursor-pointer p-5 rounded-2xl border transition-all ${
              activeTab === "confirmed"
                ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md"
                : "border-[var(--border)] bg-white hover:border-emerald-400 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                Confirmed Slots
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-3xl font-serif font-bold text-emerald-700 mt-3">
              {counts.confirmed}
            </p>
            <p className="text-xs text-emerald-800/80 mt-1">Confirmed & active slots</p>
          </div>
        </div>

        {/* Tab Selector Filter Strip */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pb-2">
          {filterTabs.map((tab) => {
            const count = counts[tab];
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 capitalize ${
                  isSelected
                    ? "bg-[var(--green)] text-white shadow-sm"
                    : "bg-white text-[var(--ink-soft)] border border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)]"
                }`}
              >
                <span>{tab === "all" ? "All Bookings" : tab === "today" ? "Today's Schedule" : tab}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : tab === "pending" && count > 0
                      ? "bg-amber-100 text-amber-800 font-bold"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="spin text-[var(--gold)] mb-3" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Loading chamber appointment desk...
            </p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="card mt-6 rounded-3xl border border-[var(--border)] bg-white p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-[var(--paper-dark)] flex items-center justify-center text-[var(--ink-muted)] mb-4">
              <Inbox size={28} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--ink)]">
              No appointments found in this view
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mt-1.5 max-w-sm">
              {activeTab === "pending"
                ? "Great! All pending booking requests have been reviewed and confirmed."
                : activeTab === "today"
                ? "No appointments are scheduled for today. Check upcoming slots in 'All Bookings'."
                : "No appointments match the selected filter."}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-5 btn-secondary !py-2 !px-4 text-xs font-bold rounded-xl"
              >
                View All {counts.all} Bookings
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {displayedBookings.map((b) => {
              const isPending = b.status === "pending";
              const isConfirmed = b.status === "confirmed";
              const isOnline = b.consultation_mode === "online";
              const meetLink = b.meet_link || site.googleMeetRoom;

              return (
                <article
                  key={b.id}
                  className={`rounded-2xl border p-6 transition-all shadow-xs ${
                    isPending
                      ? "border-amber-300 bg-amber-50/20"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Client & Appointment Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-serif font-bold text-[var(--ink)]">
                          {b.name}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusStyles[b.status]}`}
                        >
                          {b.status}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isOnline
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isOnline ? <Video size={13} /> : <MapPin size={13} />}
                          <span>{isOnline ? "Online Video Call" : "In-Person Chamber Visit"}</span>
                        </span>
                      </div>

                      {/* Service Category */}
                      <p className="text-sm font-bold text-[var(--gold)] flex items-center gap-2">
                        <span>{serviceLabels[b.service] || b.service}</span>
                      </p>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--ink)]">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          <CalendarDays size={14} className="text-[var(--gold)]" />
                          <span>{formatDateLabel(b.booking_date)}</span>
                        </span>

                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Clock4 size={14} className="text-[var(--gold)]" />
                          <span>{formatTime12(b.booking_time)}</span>
                        </span>
                      </div>

                      {/* Client Contact Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-soft)] pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Phone size={13} className="text-[var(--gold)]" />
                          <span className="font-bold text-[var(--ink)]">{b.phone}</span>
                        </span>

                        {b.email && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail size={13} className="text-[var(--gold)]" />
                            <span>{b.email}</span>
                          </span>
                        )}

                        <span className="text-[11px] text-[var(--ink-muted)]">
                          Booked on: {new Date(b.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Client Note / Message if any */}
                      {b.message && (
                        <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-[var(--ink-soft)] flex items-start gap-2 max-w-2xl">
                          <FileText size={14} className="shrink-0 mt-0.5 text-[var(--gold)]" />
                          <span>{b.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0 min-w-[200px]">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            disabled={updatingId === b.id}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123526] text-white hover:bg-[#1a4733] transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={15} />
                            <span>{updatingId === b.id ? "Confirming..." : "Confirm Appointment"}</span>
                          </button>

                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            disabled={updatingId === b.id}
                            className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
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
                              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm flex items-center justify-center gap-2"
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
                            <CheckCircle2 size={14} />
                            <span>Mark as Completed</span>
                          </button>
                        </>
                      ) : null}

                      {/* Contact Actions for All Bookings */}
                      <div className="flex items-center gap-2 w-full pt-1">
                        <a
                          href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${b.phone}`}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-white text-[var(--ink)] border border-[var(--border)] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Phone size={14} />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
