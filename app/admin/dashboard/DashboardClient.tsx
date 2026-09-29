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
  Users,
  Eye,
  Filter,
  CheckCheck,
  AlertCircle,
  ChevronDown,
  Building2,
  Briefcase,
  HelpCircle,
  Plus,
  CreditCard,
} from "lucide-react";
import { site } from "@/lib/site-config";
import { getAllDaySlots } from "@/lib/availability";
import type { BookingRecord } from "@/lib/bookings-store";
import type { ContactInquiry } from "@/lib/contacts-store";
import type { ChamberStatus } from "@/lib/chamber-status";

export type Booking = BookingRecord;

const serviceLabels: Record<string, string> = {
  "court-marriage": "Court Marriage & Registration",
  "trademark-registration": "Trademark & Brand Protection",
  "legal-services": "Chamber Litigation & Deeds",
};

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    label: "Awaiting Review",
  },
  confirmed: {
    bg: "bg-black",
    text: "text-[#cba758]",
    border: "border-[#cba758]/40",
    label: "Confirmed Slot",
  },
  completed: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    label: "Declined",
  },
  new: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    label: "New Inquiry",
  },
  contacted: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    label: "Contacted",
  },
  converted: {
    bg: "bg-black",
    text: "text-[#cba758]",
    border: "border-[#cba758]/40",
    label: "Retained",
  },
  closed: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    label: "Closed",
  },
};

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

function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-black text-[#cba758] border border-[#cba758]/30",
  "bg-zinc-800 text-white",
  "bg-zinc-900 text-zinc-100",
  "bg-[#18181b] text-[#cba758] border border-[#cba758]/30",
  "bg-zinc-700 text-white",
];

export default function DashboardClient() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "secretary">("admin");

  // Tab: All Clients / Mandates vs Bookings vs Contact Forms
  const [viewTab, setViewTab] = useState<"all" | "bookings" | "contacts">("all");

  // Date Filter: All Dates, Today, Tomorrow, Upcoming, Past
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "upcoming" | "past">("all");

  // Status Filter: All Active, Pending Review, Confirmed, Attended, Completed, Declined, Everything
  const [statusFilter, setStatusFilter] = useState<"all" | "everything" | "pending" | "confirmed" | "attended" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual Booking Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "legal-services",
    sub_service: "",
    bookingDate: todayInIndia(),
    bookingTime: "18:00",
    consultationMode: "offline" as "offline" | "online",
    message: "",
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  // Chamber Availability & Away Manager Modal
  const [chamberStatus, setChamberStatus] = useState<ChamberStatus>({
    isOfficeOpen: true,
    isOnlineOpen: true,
    status: "available",
    channelsAffected: "none",
    awayReason: "",
    returnEstimate: "",
    returnTime: "",
    notice: "Office visits are open today at Trisharan Square, Nagpur.",
    updatedAt: new Date().toISOString(),
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalReason, setStatusModalReason] = useState("");
  const [statusModalEstimate, setStatusModalEstimate] = useState("");
  const [statusModalOfficeOpen, setStatusModalOfficeOpen] = useState(true);
  const [statusModalOnlineOpen, setStatusModalOnlineOpen] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  // Selected Item for Detail Slide-Over / Modal
  const [selectedRecord, setSelectedRecord] = useState<{ type: "booking" | "contact"; data: any } | null>(null);

  // Custom Confirmation & WhatsApp Modal
  const [confirmModalBooking, setConfirmModalBooking] = useState<Booking | null>(null);
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const todayStr = useMemo(() => todayInIndia(), []);
  const tomorrowStr = useMemo(() => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const y = tm.getFullYear();
    const m = String(tm.getMonth() + 1).padStart(2, "0");
    const d = String(tm.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // Fetch Bookings & Contacts
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, contRes, statusRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/contacts"),
        fetch("/api/admin/chamber-status"),
      ]);

      if (bookRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData.bookings || []);
        if (bookData.role) setRole(bookData.role);
      }

      if (contRes.ok) {
        const contData = await contRes.json();
        setContacts(contData.contacts || []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setChamberStatus(statusData);
        setStatusModalOfficeOpen(statusData.isOfficeOpen);
        setStatusModalOnlineOpen(statusData.isOnlineOpen);
        setStatusModalReason(statusData.awayReason || "");
        setStatusModalEstimate(statusData.returnEstimate || "");
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  // Chamber Status Saver
  const saveChamberAvailability = async (preset?: {
    isOfficeOpen: boolean;
    isOnlineOpen: boolean;
    awayReason: string;
    returnEstimate: string;
  }) => {
    setStatusSaving(true);
    try {
      const officeOpen = preset ? preset.isOfficeOpen : statusModalOfficeOpen;
      const onlineOpen = preset ? preset.isOnlineOpen : statusModalOnlineOpen;
      const reason = preset ? preset.awayReason : statusModalReason.trim();
      const estimate = preset ? preset.returnEstimate : statusModalEstimate.trim();

      let noticeText = "";
      if (officeOpen && onlineOpen) {
        noticeText = "Office visits are active at Trisharan Square, Nagpur. Online video consultations are also open.";
      } else if (!officeOpen && onlineOpen) {
        noticeText = `Advocate Shareen Hussain is currently away attending ${reason || "court hearings"}. Office visits will resume in approximately ${estimate || "1–2 hours"}. Online Google Meet video consultations remain available.`;
      } else {
        noticeText = `Advocate Shareen Hussain's chamber is currently closed (${reason || "Court sessions / Leave"}). Resuming at ${estimate || "the next scheduled session"}.`;
      }

      const res = await fetch("/api/admin/chamber-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOfficeOpen: officeOpen,
          isOnlineOpen: onlineOpen,
          status: officeOpen ? "available" : "away",
          channelsAffected: !officeOpen && !onlineOpen ? "both" : !officeOpen ? "office_only" : "none",
          awayReason: reason,
          returnEstimate: estimate,
          notice: noticeText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChamberStatus(data.status);
        setShowStatusModal(false);
      }
    } catch (err) {
      console.error("Failed to update chamber status:", err);
    } finally {
      setStatusSaving(false);
    }
  };

  // Status Updater (Bookings)
  async function updateBookingStatus(id: string, status: Booking["status"]) {
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
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord((prev) => prev ? { ...prev, data: { ...prev.data, status } } : null);
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Attendance Updater (Mark if customer came or not)
  async function updateAttendance(id: string, attendance: "attended" | "no_show" | "scheduled") {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, attendance }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, attendance } : b))
        );
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord((prev) => prev ? { ...prev, data: { ...prev.data, attendance } } : null);
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Contact Status Updater
  async function updateContactStatus(id: string, status: ContactInquiry["status"]) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord((prev) => prev ? { ...prev, data: { ...prev.data, status } } : null);
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Generate customized WhatsApp confirmation text
  const buildConfirmationMessage = useCallback((b: Booking, customMeet?: string) => {
    const dateStr = formatDateLabel(b.booking_date);
    const timeStr = formatTime12(b.booking_time);
    const serviceTitle = b.sub_service
      ? `${b.sub_service} (${serviceLabels[b.service] || b.service})`
      : serviceLabels[b.service] || b.service;

    if (b.consultation_mode === "offline") {
      return `Hello ${b.name},

Your In-Person Chamber Consultation with Adv. Shareen Hussain has been officially CONFIRMED.

🏛️ Office: True Legal Advice
⚖️ Matter: ${serviceTitle}
📅 Date: ${dateStr}
⏰ Scheduled Slot: ${timeStr}
📍 Address: Near Trisharan Square, Nagpur - 440027, Maharashtra
📞 Chamber Desk: +91 83296 31199

Please arrive 5 to 10 minutes prior with all relevant case documents, notices, or identity proofs. Adv. Shareen Hussain looks forward to meeting you at our Nagpur office.`;
    } else {
      const meetLink = customMeet || b.meet_link || site.googleMeetRoom;
      return `Hello ${b.name},

Your Online Video Consultation with Adv. Shareen Hussain has been officially CONFIRMED.

⚖️ Matter: ${serviceTitle}
📅 Date: ${dateStr}
⏰ Scheduled Slot: ${timeStr}
💻 Google Meet Video Link: ${meetLink}
📞 Chamber Desk: +91 83296 31199

Please click the Google Meet link above at your scheduled appointment time.`;
    }
  }, []);

  // Generate Payment Verification WhatsApp message
  const buildPaymentCheckMessage = useCallback(
    (r: { name: string; phone: string; service: string; date: string; time?: string; mode?: string }) => {
      const serviceText = r.service || "Legal Consultation";
      const dateText = formatDateLabel(r.date);
      const timeText = r.time ? formatTime12(r.time) : "Chamber Slot";
      const modeText = r.mode === "online" ? "Google Meet Video Call" : "In-Person Chamber Visit";

      return `Namaste ${r.name},

This is from the Chambers of Adv. Shareen Hussain (True Legal Advice), Nagpur.

We have received your consultation appointment request for:
⚖️ Matter: ${serviceText}
📅 Date: ${dateText} at ${timeText}
📍 Mode: ${modeText}

To confirm and block your consultation slot, kindly share your ₹1,000 consultation payment receipt / screenshot via UPI.

🏦 UPI ID: 9371509246@okbizaxis (or Google Pay / PhonePe / Paytm to +91 9371509246)
Amount: ₹1,000 (Chamber Consultation Fee)

Once your payment receipt is verified, Advocate Shareen Hussain will officially confirm your appointment and provide your calendar confirmation${
        r.mode === "online" ? " and Google Meet link" : ""
      }.

Chambers of Adv. Shareen Hussain
Advocate High Court & District Court
Nagpur, Maharashtra | Ph: +91 9371509246 / +91 83296 31199`;
    },
    []
  );

  const openConfirmModal = (b: Booking) => {
    setConfirmModalBooking(b);
    let initialMeet = b.meet_link || "";
    if (b.consultation_mode === "online" && (!initialMeet || initialMeet === site.googleMeetRoom)) {
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      initialMeet = `https://meet.google.com/tla-${p1}-${p2}-${p3}`;
    }
    setMeetLinkInput(initialMeet);
    setCustomMessage(buildConfirmationMessage(b, initialMeet));
    setCopied(false);
  };

  const regenerateMeetLink = () => {
    const p1 = Math.random().toString(36).substring(2, 5);
    const p2 = Math.random().toString(36).substring(2, 6);
    const p3 = Math.random().toString(36).substring(2, 5);
    const newMeet = `https://meet.google.com/tla-${p1}-${p2}-${p3}`;
    setMeetLinkInput(newMeet);
    if (confirmModalBooking) {
      setCustomMessage(buildConfirmationMessage(confirmModalBooking, newMeet));
    }
  };

  const closeConfirmModal = () => {
    setConfirmModalBooking(null);
    setMeetLinkInput("");
    setCustomMessage("");
    setCopied(false);
  };

  // Handler: Manual Booking / Block Slot Submission
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim()) {
      setManualError("Please enter a client name or purpose (e.g. Walk-in / High Court Matter).");
      return;
    }
    const cleanPhone = manualForm.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setManualError("Please enter a valid 10-digit Indian mobile number (e.g. 9823012345).");
      return;
    }
    if (manualForm.email && manualForm.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(manualForm.email.trim())) {
        setManualError("Please enter a valid email address.");
        return;
      }
    }

    setManualLoading(true);
    setManualError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualForm.name.trim(),
          phone: cleanPhone,
          email: manualForm.email.trim() || null,
          service: manualForm.service,
          sub_service: manualForm.sub_service.trim() || null,
          bookingDate: manualForm.bookingDate,
          bookingTime: manualForm.bookingTime,
          consultationMode: manualForm.consultationMode,
          message: manualForm.message.trim() || "Manual Appointment booked via Admin Desk",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setManualError(data.error || "Failed to create booking.");
        setManualLoading(false);
        return;
      }

      setShowManualModal(false);
      setManualForm({
        name: "",
        phone: "",
        email: "",
        service: "legal-services",
        sub_service: "",
        bookingDate: todayStr,
        bookingTime: "18:00",
        consultationMode: "offline",
        message: "",
      });
      await loadData();
    } catch (err: any) {
      setManualError(err.message || "Network error. Please try again.");
    } finally {
      setManualLoading(false);
    }
  };

  // Metrics Calculations (Trend / Summary stats like Image 3)
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalContacts = contacts.length;
    const totalRecords = totalBookings + totalContacts;

    const todayBookings = bookings.filter((b) => b.booking_date === todayStr).length;
    const attendedCount = bookings.filter((b) => b.attendance === "attended").length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const newContacts = contacts.filter((c) => c.status === "new").length;

    return {
      totalRecords,
      totalBookings,
      totalContacts,
      todayBookings,
      attendedCount,
      pendingAction: pendingBookings + newContacts,
    };
  }, [bookings, contacts, todayStr]);

  // Combined and Filtered Records for Data Table
  const filteredRows = useMemo(() => {
    let rows: Array<{
      type: "booking" | "contact";
      id: string;
      name: string;
      phone: string;
      email: string | null;
      service: string;
      sub_service?: string | null;
      date: string;
      time?: string;
      mode?: "online" | "offline" | string;
      status: string;
      attendance?: "attended" | "no_show" | "scheduled" | null;
      message?: string | null;
      created_at: string;
      raw: Booking | ContactInquiry;
    }> = [];

    if (viewTab === "all" || viewTab === "bookings") {
      rows.push(
        ...bookings.map((b) => ({
          type: "booking" as const,
          id: b.id,
          name: b.name,
          phone: b.phone,
          email: b.email,
          service: serviceLabels[b.service] || b.service,
          sub_service: b.sub_service,
          date: b.booking_date,
          time: b.booking_time,
          mode: b.consultation_mode,
          status: b.status,
          attendance: b.attendance,
          message: b.message,
          created_at: b.created_at,
          raw: b,
        }))
      );
    }

    if (viewTab === "all" || viewTab === "contacts") {
      rows.push(
        ...contacts.map((c) => ({
          type: "contact" as const,
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          service: c.service,
          sub_service: null,
          date: c.created_at.split("T")[0],
          time: "",
          mode: c.mode,
          status: c.status,
          attendance: null,
          message: c.message,
          created_at: c.created_at,
          raw: c,
        }))
      );
    }

    // Apply Date Filter
    if (dateFilter === "today") {
      rows = rows.filter((r) => r.date === todayStr);
    } else if (dateFilter === "tomorrow") {
      rows = rows.filter((r) => r.date === tomorrowStr);
    } else if (dateFilter === "upcoming") {
      rows = rows.filter((r) => r.date >= todayStr);
    } else if (dateFilter === "past") {
      rows = rows.filter((r) => r.date < todayStr);
    }

    // Apply Status Filter
    if (statusFilter === "pending") {
      rows = rows.filter((r) => r.status === "pending" || r.status === "new");
    } else if (statusFilter === "confirmed") {
      rows = rows.filter((r) => r.status === "confirmed");
    } else if (statusFilter === "attended") {
      rows = rows.filter((r) => r.attendance === "attended");
    } else if (statusFilter === "completed") {
      rows = rows.filter((r) => r.status === "completed" || r.status === "converted" || r.status === "closed");
    } else if (statusFilter === "cancelled") {
      rows = rows.filter((r) => r.status === "cancelled");
    } else if (statusFilter === "all") {
      // Active Mandates View: Hide completed and declined so they don't clutter the active view!
      rows = rows.filter((r) => r.status !== "completed" && r.status !== "converted" && r.status !== "closed" && r.status !== "cancelled");
    }
    // "everything" tab shows all records without status filtering

    // Apply Search Query across Name, Phone, Email, Service, Date
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          r.service.toLowerCase().includes(q) ||
          (r.sub_service && r.sub_service.toLowerCase().includes(q)) ||
          r.date.includes(q) ||
          (r.message && r.message.toLowerCase().includes(q))
      );
    }

    // Sort: Pending first, then by date descending
    return rows.sort((a, b) => {
      const aIsPending = a.status === "pending" || a.status === "new";
      const bIsPending = b.status === "pending" || b.status === "new";
      if (aIsPending && !bIsPending) return -1;
      if (bIsPending && !aIsPending) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings, contacts, viewTab, statusFilter, dateFilter, searchQuery, todayStr, tomorrowStr]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b]">
      {/* ================= Modern Executive Header ================= */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold shadow-sm">
              <Scale size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#9f7d32]">
                  CHAMBERS OF ADV. SHAREEN HUSSAIN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/5 text-[#09090b] border border-black/10">
                  {role === "admin" ? "Advocate Master Desk" : "Legal Staff Desk"}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-[#09090b]">
                Chamber Client Mandates & Legal Database
              </h1>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Manual Booking / Block Slot Button */}
            <button
              onClick={() => {
                setManualForm({
                  name: "",
                  phone: "",
                  email: "",
                  service: "legal-services",
                  sub_service: "",
                  bookingDate: todayStr,
                  bookingTime: "18:00",
                  consultationMode: "offline",
                  message: "",
                });
                setManualError("");
                setShowManualModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#cba758] text-black hover:bg-[#b89547] transition-all shadow-2xs cursor-pointer"
              title="Add Walk-in Client or Block Slot"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>+ Manual Booking / Block Slot</span>
            </button>

            {/* Live Availability Status Quick Pill */}
            <button
              onClick={() => setShowStatusModal(true)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                chamberStatus.isOfficeOpen
                  ? "bg-black text-[#cba758] border-[#cba758]/40 hover:bg-zinc-900"
                  : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${chamberStatus.isOfficeOpen ? "bg-[#cba758] animate-pulse" : "bg-amber-600 animate-pulse"}`} />
              <span>
                {chamberStatus.isOfficeOpen
                  ? "Chamber Desk: Open"
                  : `Away: ${chamberStatus.returnEstimate || "1-2 Hours"}`}
              </span>
              <ChevronDown size={13} className="opacity-60" />
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-all shadow-2xs cursor-pointer"
              title="Refresh database"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#9f7d32]" : ""} />
              <span>Refresh</span>
            </button>

            {/* Log out */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-all shadow-2xs cursor-pointer"
            >
              <LogOut size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= Top Trend & Stats Cards (Like Image 3) ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Stat 1: Total Records */}
          <div
            onClick={() => {
              setViewTab("all");
              setStatusFilter("all");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              viewTab === "all" && statusFilter === "all"
                ? "bg-white border-black ring-2 ring-black/10"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">All Mandates</span>
              <Users size={16} />
            </div>
            <p className="text-2xl font-serif font-bold text-[#09090b] mt-2">{stats.totalRecords}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Database total</p>
          </div>

          {/* Stat 2: Today's Appointments */}
          <div
            onClick={() => {
              setViewTab("bookings");
              setDateFilter("today");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              dateFilter === "today"
                ? "bg-amber-950 text-white border-[#cba758] ring-2 ring-[#cba758]/30 shadow-md"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  dateFilter === "today" ? "text-[#cba758]" : "text-[#9f7d32]"
                }`}
              >
                Today&apos;s Slots
              </span>
              <CalendarDays
                size={16}
                className={dateFilter === "today" ? "text-[#cba758]" : "text-[#9f7d32]"}
              />
            </div>
            <p
              className={`text-2xl font-serif font-bold mt-2 ${
                dateFilter === "today" ? "text-white" : "text-[#09090b]"
              }`}
            >
              {stats.todayBookings}
            </p>
            <p
              className={`text-[11px] mt-0.5 ${
                dateFilter === "today" ? "text-amber-200/80" : "text-zinc-500"
              }`}
            >
              Scheduled today
            </p>
          </div>

          {/* Stat 3: Attended / Came (Fixed coloring for crystal clarity) */}
          <div
            onClick={() => {
              setViewTab("bookings");
              setStatusFilter("attended");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              statusFilter === "attended"
                ? "bg-emerald-950 text-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  statusFilter === "attended" ? "text-emerald-400" : "text-zinc-700"
                }`}
              >
                Attended / Came
              </span>
              <CheckCheck
                size={16}
                className={statusFilter === "attended" ? "text-emerald-400" : "text-[#9f7d32]"}
              />
            </div>
            <p
              className={`text-2xl font-serif font-bold mt-2 ${
                statusFilter === "attended" ? "text-white" : "text-[#09090b]"
              }`}
            >
              {stats.attendedCount}
            </p>
            <p
              className={`text-[11px] mt-0.5 ${
                statusFilter === "attended" ? "text-emerald-300/80" : "text-zinc-500"
              }`}
            >
              Visited chamber
            </p>
          </div>

          {/* Stat 4: Website Contact Inquiries */}
          <div
            onClick={() => {
              setViewTab("contacts");
              setStatusFilter("all");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              viewTab === "contacts"
                ? "bg-white border-blue-600 ring-2 ring-blue-600/15"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Contact Inquiries</span>
              <Mail size={16} />
            </div>
            <p className="text-2xl font-serif font-bold text-blue-900 mt-2">{stats.totalContacts}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">From Contact Us form</p>
          </div>

          {/* Stat 5: Needs Action / Pending */}
          <div
            onClick={() => {
              setViewTab("all");
              setStatusFilter("pending");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
              statusFilter === "pending"
                ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20"
                : "bg-white border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Needs Action</span>
              <Clock size={16} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-serif font-bold text-amber-800">{stats.pendingAction}</p>
              {stats.pendingAction > 0 && (
                <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                  Review
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Pending confirmation</p>
          </div>
        </div>

        {/* ================= Navigation Tabs, Sub-Filters & Live Search Bar ================= */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Master View Tabs (All vs Bookings vs Contacts) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 w-fit">
              {[
                { id: "all", label: "All Records", count: stats.totalRecords },
                { id: "bookings", label: "Chamber Bookings", count: stats.totalBookings },
                { id: "contacts", label: "Contact Inquiries", count: stats.totalContacts },
              ].map((tab) => {
                const isActive = viewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-white text-black shadow-xs"
                        : "text-zinc-600 hover:text-black"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-black/10 text-black" : "bg-black/5 text-zinc-500"}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Search Input */}
            <div className="relative w-full lg:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, phone, matter, or date..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-[#09090b] placeholder-zinc-400 focus:border-black focus:outline-none shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Quick Filter Pills: Date Filter Row + Status Filter Row */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            {/* Row 1: Date Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mr-2 flex items-center gap-1">
                <CalendarDays size={12} className="text-[#9f7d32]" />
                <span>Date:</span>
              </span>
              {[
                { id: "all", label: "All Dates" },
                { id: "today", label: "Today's Mandates" },
                { id: "tomorrow", label: "Tomorrow" },
                { id: "upcoming", label: "Upcoming (Future)" },
                { id: "past", label: "Past Dates" },
              ].map((df) => {
                const isSelected = dateFilter === df.id;
                return (
                  <button
                    key={df.id}
                    onClick={() => setDateFilter(df.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#cba758] text-black shadow-2xs font-bold"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {df.label}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mr-2 flex items-center gap-1">
                <Filter size={12} />
                <span>Status:</span>
              </span>
              {[
                { id: "all", label: "Active Mandates" },
                { id: "pending", label: "Pending Review" },
                { id: "confirmed", label: "Confirmed" },
                { id: "attended", label: "Attended / Came" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Declined" },
                { id: "everything", label: "All Records (Unfiltered)" },
              ].map((f) => {
                const isSelected = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-black text-white shadow-2xs font-bold"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= Modern Database Table (Image 3 Style) ================= */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 size={32} className="animate-spin text-[#cba758] mx-auto mb-2" />
              <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Loading chamber records...
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-20 px-6 text-center max-w-md mx-auto">
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-3">
                <Inbox size={26} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#09090b]">No Records Found</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {searchQuery
                  ? `No entries match "${searchQuery}". Clear your search term to see all client mandates.`
                  : "No mandates match the selected filter criteria."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Channel / Type</th>
                    <th className="py-3 px-4 font-semibold">Legal Matter</th>
                    <th className="py-3 px-4 font-semibold">Mode</th>
                    <th className="py-3 px-4 font-semibold">Date & Slot</th>
                    <th className="py-3 px-4 font-semibold">Status / Confirmation</th>
                    <th className="py-3 px-4 font-semibold text-center">Attendance (Came?)</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRows.map((r, idx) => {
                    const statusMeta = statusStyles[r.status] || statusStyles.pending;
                    const cleanPhone = formatWhatsAppNumber(r.phone);
                    const isToday = r.date === todayStr;
                    const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-zinc-50/80 transition-colors group"
                      >
                        {/* Column 1: Client Name, Initials, Phone, Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarBg}`}>
                              {getInitials(r.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-serif font-bold text-[#09090b] text-sm truncate">
                                {r.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                                <span className="font-mono">{r.phone}</span>
                                {r.email && (
                                  <>
                                    <span>·</span>
                                    <span className="truncate max-w-[120px]">{r.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Source Badge */}
                        <td className="py-3.5 px-4">
                          {r.type === "booking" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/5 text-[#09090b] border border-black/15">
                              <CalendarDays size={10} />
                              <span>Booking</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Mail size={10} />
                              <span>Contact Form</span>
                            </span>
                          )}
                        </td>

                        {/* Column 3: Legal Service & Matter */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="font-bold text-[#09090b] truncate">{r.service}</p>
                          {r.sub_service && (
                            <span className="text-[10px] font-mono text-[#9f7d32] font-semibold truncate block mt-0.5">
                              {r.sub_service}
                            </span>
                          )}
                          {r.message && !r.sub_service && (
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              &ldquo;{r.message}&rdquo;
                            </p>
                          )}
                        </td>

                        {/* Column 4: Mode */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {r.mode === "online" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                              <Video size={12} />
                              <span>Google Meet</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300">
                              <MapPin size={12} />
                              <span>Office Visit</span>
                            </span>
                          )}
                        </td>

                        {/* Column 5: Scheduled Date & Slot */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#09090b]">
                              {formatDateLabel(r.date)}
                            </span>
                            {isToday && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9.5px] font-mono font-bold">
                                Today
                              </span>
                            )}
                          </div>
                          {r.time && (
                            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                              {formatTime12(r.time)}
                            </p>
                          )}
                        </td>

                        {/* Column 6: Status & Quick Confirmation (First before attendance!) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} border`}
                            >
                              {statusMeta.label}
                            </span>
                            {r.type === "booking" && r.status === "pending" && (
                              <button
                                onClick={() => openConfirmModal(r.raw as Booking)}
                                className="px-2.5 py-1 rounded-lg bg-black text-[#cba758] text-[10.5px] font-bold hover:bg-zinc-900 border border-[#cba758]/30 transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                                title="Confirm Appointment & Dispatch"
                              >
                                <CheckCircle2 size={12} />
                                <span>Confirm Slot</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Column 7: Attendance ("Did they come?") */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {r.type === "booking" ? (
                            <div className="inline-flex items-center gap-1 justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  updateAttendance(
                                    r.id,
                                    r.attendance === "attended" ? "scheduled" : "attended"
                                  )
                                }
                                disabled={updatingId === r.id}
                                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                  r.attendance === "attended"
                                    ? "bg-emerald-700 text-white border-emerald-600 shadow-2xs"
                                    : "bg-white text-zinc-700 border-zinc-300 hover:border-black hover:text-black"
                                }`}
                                title="Toggle customer attendance: Click to mark Came / Attended"
                              >
                                <Check size={11} strokeWidth={3} />
                                <span>{r.attendance === "attended" ? "Came ✓" : "Mark Came"}</span>
                              </button>

                              {r.attendance !== "attended" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAttendance(
                                      r.id,
                                      r.attendance === "no_show" ? "scheduled" : "no_show"
                                    )
                                  }
                                  disabled={updatingId === r.id}
                                  className={`px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer border ${
                                    r.attendance === "no_show"
                                      ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
                                      : "bg-white text-slate-400 border-zinc-200 hover:text-rose-600"
                                  }`}
                                  title="Mark No Show"
                                >
                                  {r.attendance === "no_show" ? "No-Show" : <X size={12} />}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Column 8: Direct Actions (Payment Check, WhatsApp, Call, View) */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Check Payment WhatsApp Button (₹1,000 UPI request) */}
                            {cleanPhone && r.type === "booking" && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(buildPaymentCheckMessage(r))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10.5px] font-semibold transition-all shadow-2xs"
                                title="Send ₹1,000 UPI Payment Verification request on WhatsApp before confirming"
                              >
                                <CreditCard size={12} />
                                <span className="hidden sm:inline">Check Payment</span>
                              </a>
                            )}

                            {/* WhatsApp Button */}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-7 w-7 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366] text-[#09090b] hover:text-white flex items-center justify-center transition-all shadow-2xs"
                                title={`WhatsApp ${r.phone}`}
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}

                            {/* Call Button */}
                            {r.phone && (
                              <a
                                href={`tel:${r.phone}`}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-black text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                                title={`Call ${r.phone}`}
                              >
                                <Phone size={13} />
                              </a>
                            )}

                            {/* Detail Drawer Trigger */}
                            <button
                              onClick={() => setSelectedRecord({ type: r.type, data: r.raw })}
                              className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                              title="View Mandate Details"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ================= Chamber Availability & Away Manager Modal ================= */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#09090b]">
                      Chamber Availability & Away Manager
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Configure real-time presence and customer-facing notice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick One-Click Presets */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#9f7d32] block mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalOfficeOpen(true);
                      setStatusModalOnlineOpen(true);
                      setStatusModalReason("");
                      setStatusModalEstimate("");
                      saveChamberAvailability({
                        isOfficeOpen: true,
                        isOnlineOpen: true,
                        awayReason: "",
                        returnEstimate: "",
                      });
                    }}
                    className="p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 text-left text-xs font-bold hover:bg-zinc-100 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-black shrink-0" />
                    <span>🟢 Desk Open (Full Active)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalOfficeOpen(false);
                      setStatusModalOnlineOpen(true);
                      setStatusModalReason("High Court Hearing Session");
                      setStatusModalEstimate("1–2 Hours");
                      saveChamberAvailability({
                        isOfficeOpen: false,
                        isOnlineOpen: true,
                        awayReason: "High Court Hearing Session",
                        returnEstimate: "1–2 Hours",
                      });
                    }}
                    className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-left text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>⚖️ Away: Court (1–2 Hours)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalOfficeOpen(false);
                      setStatusModalOnlineOpen(true);
                      setStatusModalReason("District Court / Registrar Duty");
                      setStatusModalEstimate("Back at 4:30 PM");
                      saveChamberAvailability({
                        isOfficeOpen: false,
                        isOnlineOpen: true,
                        awayReason: "District Court / Registrar Duty",
                        returnEstimate: "Back at 4:30 PM",
                      });
                    }}
                    className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-left text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>🏛️ District Court (Back ~4:30 PM)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatusModalOfficeOpen(false);
                      setStatusModalOnlineOpen(false);
                      setStatusModalReason("Chamber Closed for the Day");
                      setStatusModalEstimate("Tomorrow 9:30 AM");
                      saveChamberAvailability({
                        isOfficeOpen: false,
                        isOnlineOpen: false,
                        awayReason: "Chamber Closed for the Day",
                        returnEstimate: "Tomorrow 9:30 AM",
                      });
                    }}
                    className="p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-left text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shrink-0" />
                    <span>🔴 Closed for Rest of Day</span>
                  </button>
                </div>
              </div>

              {/* Custom Configuration Form */}
              <div className="space-y-3 pt-1 border-t border-zinc-200">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#9f7d32] block">
                  Or Custom Availability Settings
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusModalOfficeOpen}
                      onChange={(e) => setStatusModalOfficeOpen(e.target.checked)}
                      className="rounded text-black"
                    />
                    <span>Office Visits Open</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusModalOnlineOpen}
                      onChange={(e) => setStatusModalOnlineOpen(e.target.checked)}
                      className="rounded text-black"
                    />
                    <span>Google Meet Video Open</span>
                  </label>
                </div>

                {!statusModalOfficeOpen && (
                  <div className="space-y-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-600 block mb-1">
                        Reason for Away Status
                      </label>
                      <input
                        type="text"
                        value={statusModalReason}
                        onChange={(e) => setStatusModalReason(e.target.value)}
                        placeholder="e.g. Attending High Court Hearing Session"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-600 block mb-1">
                        Expected Return Time / Estimate
                      </label>
                      <div className="flex gap-1.5 flex-wrap mb-1.5">
                        {["1 Hour", "1–2 Hours", "Back at 4:00 PM", "Back at 5:30 PM", "Tomorrow"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setStatusModalEstimate(preset)}
                            className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-300 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={statusModalEstimate}
                        onChange={(e) => setStatusModalEstimate(e.target.value)}
                        placeholder="e.g. 1–2 Hours (Returning at ~4:00 PM)"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={statusSaving}
                  onClick={() => saveChamberAvailability()}
                  className="px-5 py-2 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 text-xs font-bold hover:bg-zinc-900 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {statusSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Save Chamber Status</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Detail Slide-Over Drawer ================= */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg h-full bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#9f7d32]">
                      {selectedRecord.type === "booking" ? "APPOINTMENT MANDATE DETAILS" : "CONTACT INQUIRY DETAILS"}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#09090b] mt-0.5">
                      {selectedRecord.data.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <p><strong>Phone:</strong> {selectedRecord.data.phone}</p>
                    {selectedRecord.data.email && <p><strong>Email:</strong> {selectedRecord.data.email}</p>}
                    <p><strong>Service:</strong> {selectedRecord.data.service}</p>
                    {selectedRecord.data.sub_service && (
                      <p><strong>Matter:</strong> {selectedRecord.data.sub_service}</p>
                    )}
                    {selectedRecord.data.booking_date && (
                      <p>
                        <strong>Scheduled:</strong> {formatDateLabel(selectedRecord.data.booking_date)} at {formatTime12(selectedRecord.data.booking_time)}
                      </p>
                    )}
                    {selectedRecord.data.consultation_mode && (
                      <p>
                        <strong>Mode:</strong> {selectedRecord.data.consultation_mode === "online" ? "Google Meet Video Call" : "In-Person Office Visit"}
                      </p>
                    )}
                    {selectedRecord.data.meet_link && (
                      <p className="flex items-center gap-1.5 flex-wrap">
                        <strong>Google Meet:</strong>{" "}
                        <a
                          href={selectedRecord.data.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 underline font-mono text-[11px]"
                        >
                          {selectedRecord.data.meet_link}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Add to Google Calendar Action */}
                  {selectedRecord.type === "booking" && selectedRecord.data.booking_date && (() => {
                    const [slotH, slotM] = (selectedRecord.data.booking_time || "10:00").split(":").map(Number);
                    const [y, m, d] = selectedRecord.data.booking_date.split("-").map(Number);
                    const startUtcMs = Date.UTC(y, m - 1, d, (slotH || 10) - 5, (slotM || 0) - 30);
                    const startUtc = new Date(startUtcMs);
                    const endUtc = new Date(startUtcMs + 45 * 60 * 1000);
                    const formatCalDate = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
                    const isOnline = selectedRecord.data.consultation_mode === "online";
                    const meetUrl = selectedRecord.data.meet_link || (isOnline ? site.googleMeetRoom : "");
                    const title = `Legal Consultation: ${selectedRecord.data.name} (${selectedRecord.data.service})`;
                    const loc = isOnline ? `${meetUrl} (Google Meet)` : "True Legal Advice, Near Trisharan Square, Nagpur - 440027, Maharashtra";
                    const desc = `Client: ${selectedRecord.data.name}\\nPhone: ${selectedRecord.data.phone}\\nMatter: ${selectedRecord.data.service}\\nMode: ${isOnline ? "Google Meet Video Call" : "In-Person Chamber Visit"}\\n${isOnline ? `Google Meet Link: ${meetUrl}` : ""}`;
                    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatCalDate(startUtc)}/${formatCalDate(endUtc)}&ctz=Asia/Kolkata&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(loc)}`;

                    return (
                      <a
                        href={gcal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center justify-center gap-2 no-underline transition-colors shadow-2xs"
                      >
                        <CalendarDays size={14} className="text-[#9f7d32]" />
                        <span>Add Appointment to Google Calendar</span>
                      </a>
                    );
                  })()}

                  {selectedRecord.data.message && (
                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-500 block mb-1">
                        Client Message / Case Brief
                      </label>
                      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-800 leading-relaxed">
                        {selectedRecord.data.message}
                      </div>
                    </div>
                  )}

                  {/* Attendance Controls */}
                  {selectedRecord.type === "booking" && (
                    <div className="p-3.5 rounded-2xl border border-zinc-300 bg-zinc-50 space-y-2">
                      <label className="text-[11px] font-mono font-bold uppercase text-zinc-900 block">
                        Customer Attendance Tracking
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateAttendance(selectedRecord.data.id, "attended")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            selectedRecord.data.attendance === "attended"
                              ? "bg-black text-[#cba758] border border-[#cba758]/40 shadow-xs"
                              : "bg-white text-zinc-800 border border-zinc-300"
                          }`}
                        >
                          <Check size={13} />
                          <span>Came / Attended</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendance(selectedRecord.data.id, "no_show")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            selectedRecord.data.attendance === "no_show"
                              ? "bg-rose-700 text-white shadow-xs"
                              : "bg-white text-rose-800 border border-rose-300"
                          }`}
                        >
                          <X size={13} />
                          <span>No Show</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status Updaters */}
                  <div>
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-500 block mb-1">
                      Update Mandate Status
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecord.type === "booking" ? (
                        <>
                          {["pending", "confirmed", "completed", "cancelled"].map((st) => (
                            <button
                              key={st}
                              onClick={() => updateBookingStatus(selectedRecord.data.id, st as any)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                selectedRecord.data.status === st
                                  ? "bg-black text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </>
                      ) : (
                        <>
                          {["new", "contacted", "converted", "closed"].map((st) => (
                            <button
                              key={st}
                              onClick={() => updateContactStatus(selectedRecord.data.id, st as any)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                selectedRecord.data.status === st
                                  ? "bg-black text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Contact Bar */}
              <div className="pt-6 border-t border-zinc-200 flex gap-3">
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(selectedRecord.data.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Client</span>
                </a>
                <a
                  href={`tel:${selectedRecord.data.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Confirmation, Google Meet & Multi-Channel Dispatch Modal ================= */}
      <AnimatePresence>
        {confirmModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#09090b]">
                      Confirm Appointment & Dispatch
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Client: {confirmModalBooking.name} ({confirmModalBooking.phone})
                    </p>
                  </div>
                </div>
                <button onClick={closeConfirmModal} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              {/* Google Meet Link Control */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Video size={13} className="text-purple-600" />
                    <span>Google Meet Video Link</span>
                  </label>
                  <button
                    type="button"
                    onClick={regenerateMeetLink}
                    className="text-[11px] font-mono text-[#9f7d32] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Regenerate Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={meetLinkInput}
                  onChange={(e) => {
                    setMeetLinkInput(e.target.value);
                    if (confirmModalBooking) {
                      setCustomMessage(buildConfirmationMessage(confirmModalBooking, e.target.value));
                    }
                  }}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono text-[#09090b] focus:border-black focus:outline-none"
                />
              </div>

              {/* Channel Availability Notice */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-zinc-800">
                  <span>Client Notification Channels:</span>
                  <div className="flex items-center gap-1.5">
                    {confirmModalBooking.phone && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <MessageCircle size={10} />
                        <span>WhatsApp</span>
                      </span>
                    )}
                    {confirmModalBooking.email && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-300">
                        <Mail size={10} />
                        <span>Email</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {confirmModalBooking.phone && confirmModalBooking.email
                    ? "Both WhatsApp and Email are present for this client. You can dispatch confirmation to both channels."
                    : confirmModalBooking.phone
                    ? "Client provided WhatsApp number only."
                    : "Client provided Email address only."}
                </p>
              </div>

              {/* Message Draft */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Confirmation Message Draft
                </label>
                <textarea
                  rows={7}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 text-xs font-sans text-[#09090b] focus:border-black focus:outline-none"
                />
              </div>

              {/* Dispatch Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customMessage);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-[#cba758]" /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateBookingStatus(confirmModalBooking.id, "confirmed");
                      closeConfirmModal();
                    }}
                    className="px-3 py-2 rounded-xl border border-black text-xs font-bold text-black hover:bg-zinc-100 cursor-pointer"
                  >
                    Confirm Only
                  </button>

                  {/* Send Email if email exists */}
                  {confirmModalBooking.email && (
                    <a
                      href={`mailto:${confirmModalBooking.email}?subject=${encodeURIComponent(
                        `Appointment Confirmed: Chambers of Adv. Shareen Hussain (${formatDateLabel(confirmModalBooking.booking_date)})`
                      )}&body=${encodeURIComponent(customMessage)}`}
                      onClick={() => {
                        updateBookingStatus(confirmModalBooking.id, "confirmed");
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Send confirmation via Email client"
                    >
                      <Mail size={13} />
                      <span>Email</span>
                    </a>
                  )}

                  {/* Send WhatsApp if phone exists */}
                  {confirmModalBooking.phone && (
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(confirmModalBooking.phone)}?text=${encodeURIComponent(customMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        updateBookingStatus(confirmModalBooking.id, "confirmed");
                        closeConfirmModal();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebe5d] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= Manual Booking / Block Slot Modal ================= */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#09090b]">
                      Manual Booking / Block Slot
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Book walk-in client or reserve slot on chamber calendar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {manualError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
                {/* Client Name or Block Purpose */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Client Name or Purpose <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma (or 'Blocked - High Court Hearing')"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      10-Digit Mobile <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={manualForm.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setManualForm({ ...manualForm, phone: digits });
                      }}
                      placeholder="e.g. 9823012345"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      placeholder="client@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Service and Matter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      Service Category
                    </label>
                    <select
                      value={manualForm.service}
                      onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                    >
                      <option value="legal-services">Chamber Litigation & Deeds</option>
                      <option value="court-marriage">Court Marriage & Family</option>
                      <option value="trademark-registration">Trademark & IP</option>
                      <option value="general-consultation">General Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      Specific Matter
                    </label>
                    <input
                      type="text"
                      value={manualForm.sub_service}
                      onChange={(e) => setManualForm({ ...manualForm, sub_service: e.target.value })}
                      placeholder="e.g. Bail Hearing / Title Search"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date & Slot Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      Date <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={manualForm.bookingDate}
                      onChange={(e) => setManualForm({ ...manualForm, bookingDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-800 block mb-1">
                      Time Slot <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={manualForm.bookingTime}
                      onChange={(e) => setManualForm({ ...manualForm, bookingTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                    >
                      {getAllDaySlots().map((s) => (
                        <option key={s} value={s}>
                          {formatTime12(s)} ({s})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mode */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, consultationMode: "offline" })}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        manualForm.consultationMode === "offline"
                          ? "bg-black text-[#cba758] border-[#cba758]"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      In-Person Chamber Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, consultationMode: "online" })}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        manualForm.consultationMode === "online"
                          ? "bg-purple-900 text-white border-purple-500"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      Google Meet Online
                    </button>
                  </div>
                </div>

                {/* Message / Brief */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">
                    Internal Notes / Case Brief
                  </label>
                  <textarea
                    rows={2}
                    value={manualForm.message}
                    onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                    placeholder="Walk-in client or slot blocked for court hearings..."
                    className="w-full p-2.5 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manualLoading}
                    className="px-5 py-2 rounded-xl bg-black text-[#cba758] hover:bg-zinc-900 border border-[#cba758]/30 font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {manualLoading && <Loader2 size={13} className="animate-spin" />}
                    <span>Confirm & Block Slot</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
