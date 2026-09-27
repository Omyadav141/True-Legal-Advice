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
  "court-marriage": "Court marriage",
  "trademark-registration": "Trademark registration",
  "legal-services": "Other legal service",
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#fdf3e0] text-[#946a1a]",
  confirmed: "bg-[#e2f1e8] text-[#1f6b41]",
  completed: "bg-[#e5eaf0] text-[#3a4a5c]",
  cancelled: "bg-[#fdecea] text-[#a33333]",
};

const secretaryFilters = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

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
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
  const [filter, setFilter] = useState<string>("all");
  const [adminTab, setAdminTab] = useState<"today" | "all">("today");
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
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function updateStatus(id: string, status: string) {
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
          prev.map((b) => (b.id === id ? { ...b, status: status as Booking["status"] } : b))
        );
        
        // When secretary confirms, send Google Meet link to client via WhatsApp
        if (status === "confirmed" && booking?.consultation_mode === "online" && booking?.phone) {
          const meetLink = booking.meet_link || site.googleMeetRoom;
          const message = encodeURIComponent(
            `Hi ${booking.name}! Your appointment for ${booking.service} on ${formatDateLabel(booking.booking_date)} at ${formatTime12(booking.booking_time)} is confirmed. Join here: ${meetLink}`
          );
          // Open WhatsApp with the message (user will send manually, or integrate Twilio for auto-send)
          window.open(`https://wa.me/${booking.phone.replace(/\D/g, "")}?text=${message}`, "_blank");
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

  // ---------- Secretary data ----------
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts: Record<(typeof secretaryFilters)[number], number> = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  // ---------- Advocate (admin) data: appointments only ----------
  const todayStr = todayInIndia();
  const appointments = useMemo(() => {
    const active = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
    return [...active].sort((a, b) =>
      `${a.booking_date} ${a.booking_time}`.localeCompare(`${b.booking_date} ${b.booking_time}`)
    );
  }, [bookings]);
  const todaysAppointments = appointments.filter((b) => b.booking_date === todayStr);
  const shownAppointments = adminTab === "today" ? todaysAppointments : appointments;
  const pendingCount = counts.pending;

  const isAdmin = role === "admin";

  return (
    <section className="py-10 md:py-14" style={{ background: "#faf7f0" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
        {/* Header row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{isAdmin ? "Advocate dashboard" : "Staff dashboard"}</p>
            <h1 className="mt-2 text-2xl md:text-3xl">
              {isAdmin ? "My appointments" : "Booking requests"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {site.businessName}
              {!isAdmin && (
                <span className="ml-2 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-soft)]">
                  Legal secretary &mdash; confirm or cancel
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={loadBookings}
              className="btn-secondary"
              style={{ padding: "10px 18px", fontSize: 14 }}
            >
              <RefreshCw size={15} aria-hidden="true" /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: "10px 18px", fontSize: 14 }}
            >
              <LogOut size={15} aria-hidden="true" /> Log out
            </button>
          </div>
        </div>

        {isAdmin ? (
          /* ================= ADVOCATE VIEW ================= */
          <>
            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
              <div className="card flex items-center gap-4" style={{ padding: 20 }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <CalendarDays size={18} className="text-[var(--green)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-serif text-2xl leading-none text-[var(--green)]">
                    {todaysAppointments.length}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="card flex items-center gap-4" style={{ padding: 20 }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <CheckCircle2 size={18} className="text-[#1f6b41]" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-serif text-2xl leading-none text-[var(--green)]">
                    {appointments.length}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">All appointments</p>
                </div>
              </div>
              <div className="card flex items-center gap-4" style={{ padding: 20 }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Clock4 size={18} className="text-[#946a1a]" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-serif text-2xl leading-none text-[var(--green)]">{pendingCount}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">Awaiting secretary</p>
                </div>
              </div>
            </div>

            {/* Two sections: Today / Upcoming */}
            <div className="mt-8 flex gap-2">
              <button
                onClick={() => setAdminTab("today")}
                aria-pressed={adminTab === "today"}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  adminTab === "today"
                    ? "border-[var(--green)] bg-[var(--green)] text-[var(--paper)]"
                    : "border-border bg-card text-[var(--ink-soft)] hover:border-[var(--green)]"
                }`}
              >
                {"Today's appointments"} ({todaysAppointments.length})
              </button>
              <button
                onClick={() => setAdminTab("all")}
                aria-pressed={adminTab === "all"}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  adminTab === "all"
                    ? "border-[var(--green)] bg-[var(--green)] text-[var(--paper)]"
                    : "border-border bg-card text-[var(--ink-soft)] hover:border-[var(--green)]"
                }`}
              >
                Upcoming appointments ({appointments.length})
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="spin text-muted-foreground" aria-label="Loading appointments" />
              </div>
            ) : shownAppointments.length === 0 ? (
              <div className="card mt-6 flex flex-col items-center gap-3 py-14 text-center">
                <Inbox size={28} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  {adminTab === "today"
                    ? "No appointments scheduled for today."
                    : "No upcoming appointments."}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                {shownAppointments.map((b) => {
                  const joinLink =
                    b.consultation_mode === "online" ? b.meet_link || site.googleMeetRoom : null;
                  return (
                    <article key={b.id} className="card" style={{ padding: 24 }}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-[240px] flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-lg">{b.name}</h3>
                            <span
                              className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusStyles[b.status] ?? ""}`}
                            >
                              {b.status}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                                b.consultation_mode === "online"
                                  ? "bg-[var(--green-mist)] text-[var(--green)]"
                                  : "bg-secondary text-[var(--ink-soft)]"
                              }`}
                            >
                              {b.consultation_mode === "online" ? (
                                <Video size={12} aria-hidden="true" />
                              ) : (
                                <MapPin size={12} aria-hidden="true" />
                              )}
                              {b.consultation_mode === "online" ? "Online" : "In-person"}
                            </span>
                          </div>

                          <p className="mt-1.5 text-[13.5px] font-semibold text-accent">
                            {serviceLabels[b.service] || b.service}
                          </p>

                          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--green)]">
                            <CalendarDays size={14} aria-hidden="true" />
                            {formatDateLabel(b.booking_date)} at {formatTime12(b.booking_time)}
                          </p>

                          {b.message ? (
                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary px-3.5 py-2.5">
                              <FileText
                                size={14}
                                className="mt-0.5 shrink-0 text-[var(--ink-soft)]"
                                aria-hidden="true"
                              />
                              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                                {b.message}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-muted-foreground">
                              No issue details shared by the client.
                            </p>
                          )}
                        </div>

                        {/* Action column */}
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px]">
                          {joinLink && b.status === "confirmed" && (
                            <a
                              href={joinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary"
                              style={{
                                padding: "11px 18px",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                              }}
                            >
                              <Video size={16} aria-hidden="true" /> Join Google Meet
                            </a>
                          )}
                          <a
                            href={`tel:${b.phone}`}
                            className="btn-secondary"
                            style={{
                              padding: "11px 18px",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <Phone size={15} aria-hidden="true" /> Call {b.phone}
                          </a>
                          <a
                            href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                            style={{
                              padding: "11px 18px",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                          </a>
                          {b.email && (
                            <a
                              href={`mailto:${b.email}`}
                              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-[var(--green)]"
                            >
                              <Mail size={12} aria-hidden="true" /> {b.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ================= SECRETARY VIEW ================= */
          <>
            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {(
                [
                  { label: "Total requests", value: counts.all, icon: Inbox, tone: "text-[var(--green)]" },
                  { label: "Pending", value: counts.pending, icon: Clock4, tone: "text-[#946a1a]" },
                  { label: "Confirmed", value: counts.confirmed, icon: CheckCircle2, tone: "text-[#1f6b41]" },
                  { label: "Cancelled", value: counts.cancelled, icon: XCircle, tone: "text-[#a33333]" },
                ] as const
              ).map((s) => (
                <div key={s.label} className="card flex items-center gap-4" style={{ padding: 20 }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <s.icon size={18} className={s.tone} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl leading-none text-[var(--green)]">{s.value}</p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
              {secretaryFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold capitalize transition-colors ${
                    filter === f
                      ? "border-[var(--green)] bg-[var(--green)] text-[var(--paper)]"
                      : "border-border bg-card text-[var(--ink-soft)] hover:border-[var(--green)]"
                  }`}
                >
                  {f} ({counts[f]})
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="spin text-muted-foreground" aria-label="Loading bookings" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="card mt-6 flex flex-col items-center gap-3 py-14 text-center">
                <Inbox size={28} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  No bookings {filter !== "all" ? `with status "${filter}"` : "yet"}.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                {filtered.map((b) => (
                  <article key={b.id} className="card" style={{ padding: 24 }}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-[240px] flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg">{b.name}</h3>
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusStyles[b.status] ?? ""}`}
                          >
                            {b.status}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                              b.consultation_mode === "online"
                                ? "bg-[var(--green-mist)] text-[var(--green)]"
                                : "bg-secondary text-[var(--ink-soft)]"
                            }`}
                          >
                            {b.consultation_mode === "online" ? (
                              <Video size={12} aria-hidden="true" />
                            ) : (
                              <MapPin size={12} aria-hidden="true" />
                            )}
                            {b.consultation_mode === "online" ? "Online" : "In-person"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] font-semibold text-accent">
                          {serviceLabels[b.service] || b.service}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                          <a
                            href={`tel:${b.phone}`}
                            className="flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--green)]"
                          >
                            <Phone size={14} aria-hidden="true" /> {b.phone}
                          </a>
                          {b.email && (
                            <a
                              href={`mailto:${b.email}`}
                              className="flex items-center gap-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--green)]"
                            >
                              <Mail size={14} aria-hidden="true" /> {b.email}
                            </a>
                          )}
                          {b.booking_date && (
                            <span className="flex items-center gap-1.5 text-sm text-[var(--ink-soft)]">
                              <CalendarDays size={14} aria-hidden="true" /> {b.booking_date}
                              {b.booking_time && ` at ${formatTime12(b.booking_time)}`}
                            </span>
                          )}
                        </div>

                        {b.message && (
                          <p className="mt-3 rounded-xl bg-secondary px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                            {b.message}
                          </p>
                        )}

                        <p className="mt-3 text-xs text-muted-foreground">
                          Submitted {new Date(b.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[180px]">
                        {b.status === "pending" ? (
                          <>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(b.id, "confirmed")}
                                disabled={updatingId === b.id}
                                className="btn-primary"
                                style={{
                                  padding: "10px 14px",
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 5,
                                  flex: 1,
                                }}
                              >
                                <CheckCircle2 size={14} aria-hidden="true" />
                                {updatingId === b.id ? "…" : "Confirm"}
                              </button>
                              <button
                                onClick={() => updateStatus(b.id, "cancelled")}
                                disabled={updatingId === b.id}
                                className="btn-secondary"
                                style={{ padding: "10px 14px", fontSize: 12, flex: 1 }}
                              >
                                Cancel
                              </button>
                            </div>
                            <a
                              href={`tel:${b.phone}`}
                              className="btn-secondary"
                              style={{
                                padding: "10px 14px",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                              }}
                            >
                              <Phone size={13} aria-hidden="true" /> Call
                            </a>
                            <a
                              href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{
                                padding: "10px 14px",
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                              }}
                            >
                              <MessageCircle size={13} aria-hidden="true" /> WhatsApp
                            </a>
                          </>
                        ) : (
                          <span className="text-xs font-medium" style={{ color: "var(--ink-soft)" }}>
                            {b.status === "confirmed" && "✓ Confirmed"}
                            {b.status === "completed" && "✓✓ Completed"}
                            {b.status === "cancelled" && "✕ Cancelled"}
                          </span>
                        )}
                        {updatingId === b.id && (
                          <Loader2 size={14} className="spin text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
