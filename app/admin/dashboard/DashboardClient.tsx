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
  CalendarClock,
  Trash2,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  UserCheck,
  ShieldAlert,
  ExternalLink,
  Menu,
  ChevronRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import { site } from "@/lib/site-config";
import { getAllDaySlots } from "@/lib/availability";
import { type BookingRecord, getBookingId } from "@/lib/booking-utils";
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

  // Redwood Style Main Sidebar Nav View:
  // "dashboard" | "bookings" | "contacts" | "clients" | "chamber"
  const [activeNav, setActiveNav] = useState<"dashboard" | "bookings" | "contacts" | "clients" | "chamber">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Period Filter: Month, Quarter, Year, Custom
  const [periodFilter, setPeriodFilter] = useState<"month" | "quarter" | "year" | "all">("month");

  // Chart Category Filter (Volume Chart): "all" | "bookings" | "contacts"
  const [chartCategory, setChartCategory] = useState<"all" | "bookings" | "contacts">("all");

  // Search & Status Filters for dedicated views
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "pending" | "confirmed" | "attended" | "cancelled">("all");
  const [contactStatusFilter, setContactStatusFilter] = useState<"all" | "new" | "contacted" | "converted" | "closed">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "upcoming" | "past">("all");

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

  // Reschedule Modal States
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [bookedSlotsForReschedule, setBookedSlotsForReschedule] = useState<string[]>([]);

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
        fetch(`/api/admin/bookings?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/contacts?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/chamber-status?_t=${Date.now()}`, { cache: "no-store" }),
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

  // Delete Contact Inquiry
  async function deleteContactInquiry(id: string) {
    if (!window.confirm("Permanently delete this contact inquiry? This cannot be undone.")) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord(null);
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Discard / Decline Booking (Sets status to cancelled and frees up slot immediately)
  const discardBooking = async (id: string) => {
    if (
      !window.confirm(
        "Discard / decline this appointment? This will cancel the booking and immediately free up the time slot on the website for other clients."
      )
    ) {
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled", attendance: "no_show" }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled", attendance: "no_show" } : b))
        );
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord((prev) =>
            prev ? { ...prev, data: { ...prev.data, status: "cancelled", attendance: "no_show" } } : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to discard booking:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Permanently Delete Booking (Removes test/dummy bookings completely)
  const deleteBookingPermanently = async (id: string) => {
    if (
      !window.confirm(
        "Permanently delete this booking record from the system? This action cannot be undone."
      )
    ) {
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete booking:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Generate customized WhatsApp confirmation text
  const buildConfirmationMessage = useCallback((b: Booking, customMeet?: string) => {
    const dateStr = formatDateLabel(b.booking_date);
    const timeStr = formatTime12(b.booking_time);
    const bookingId = b.booking_id || getBookingId(b);
    const serviceTitle = b.sub_service
      ? `${b.sub_service} (${serviceLabels[b.service] || b.service})`
      : serviceLabels[b.service] || b.service;

    if (b.consultation_mode === "offline") {
      return `Hello ${b.name},

Your In-Person Chamber Consultation with Adv. Shareen Hussain has been officially CONFIRMED.

🆔 Booking Reference ID: ${bookingId}
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

🆔 Booking Reference ID: ${bookingId}
⚖️ Matter: ${serviceTitle}
📅 Date: ${dateStr}
⏰ Scheduled Slot: ${timeStr}
💻 Google Meet Video Link: ${meetLink}
📞 Chamber Desk: +91 83296 31199

Please click the Google Meet link above at your scheduled appointment time.`;
    }
  }, []);

  // WhatsApp reply generator for Contact Inquiries
  const buildContactReplyWhatsApp = useCallback((c: ContactInquiry) => {
    return `Hello ${c.name},

This is from the Chambers of Adv. Shareen Hussain (True Legal Advice), Nagpur.

We have received your web inquiry regarding:
⚖️ Subject / Matter: ${c.service}

"${c.message || "Request for Legal Guidance"}"

How may we assist you further? If you would like to book a 45-minute chamber or video consultation with Advocate Shareen Hussain, let us know and we will reserve your priority slot.

Chambers of Adv. Shareen Hussain
Advocate High Court & District Court
Nagpur, Maharashtra | Ph: +91 83296 31199`;
  }, []);

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

  // Fetch booked slots for a given date when rescheduling
  const fetchBookedSlotsForDate = async (dateStr: string, currentBooking?: Booking) => {
    try {
      const res = await fetch(`/api/availability?date=${dateStr}&_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const activeBooked = (data.bookedSlots || []).filter((s: string) => {
          if (currentBooking && currentBooking.booking_date === dateStr && currentBooking.booking_time === s) {
            return false;
          }
          return true;
        });
        setBookedSlotsForReschedule(activeBooked);
      }
    } catch {
      setBookedSlotsForReschedule([]);
    }
  };

  const openRescheduleModal = (b: Booking) => {
    setRescheduleBooking(b);
    setRescheduleDate(b.booking_date);
    setRescheduleTime(b.booking_time);
    setRescheduleError("");
    setRescheduleSuccess(false);
    fetchBookedSlotsForDate(b.booking_date, b);
  };

  const closeRescheduleModal = () => {
    setRescheduleBooking(null);
    setRescheduleError("");
    setRescheduleSuccess(false);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBooking) return;
    if (!rescheduleDate) {
      setRescheduleError("Please select an appointment date.");
      return;
    }
    if (!rescheduleTime) {
      setRescheduleError("Please select a time slot.");
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError("");

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleBooking.id,
          booking_date: rescheduleDate,
          booking_time: rescheduleTime,
          status: "confirmed",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setRescheduleError(errData.error || "Failed to reschedule booking.");
        setRescheduleLoading(false);
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleBooking.id
            ? { ...b, booking_date: rescheduleDate, booking_time: rescheduleTime, status: "confirmed" }
            : b
        )
      );

      if (selectedRecord && selectedRecord.data.id === rescheduleBooking.id) {
        setSelectedRecord((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  booking_date: rescheduleDate,
                  booking_time: rescheduleTime,
                  status: "confirmed",
                },
              }
            : null
        );
      }

      setRescheduleSuccess(true);
    } catch (err: any) {
      setRescheduleError(err.message || "Failed to reschedule appointment.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const buildRescheduleWhatsAppMessage = useCallback((b: Booking, newDate: string, newTime: string) => {
    const bookingId = b.booking_id || getBookingId(b);
    const dateStr = formatDateLabel(newDate);
    const timeStr = formatTime12(newTime);
    const serviceTitle = b.sub_service
      ? `${b.sub_service} (${serviceLabels[b.service] || b.service})`
      : serviceLabels[b.service] || b.service;

    if (b.consultation_mode === "offline") {
      return `Hello ${b.name},

Your Consultation Appointment with Adv. Shareen Hussain has been successfully RESCHEDULED as requested:

🆔 Booking Reference ID: ${bookingId}
🏛️ Office: True Legal Advice
⚖️ Matter: ${serviceTitle}
📅 New Scheduled Date: ${dateStr}
⏰ New Time Slot: ${timeStr}
📍 Address: Near Trisharan Square, Nagpur - 440027, Maharashtra
📞 Chamber Desk: +91 83296 31199

Please arrive 5 to 10 minutes prior with all relevant case documents. Adv. Shareen Hussain looks forward to meeting you.`;
    } else {
      const meetLink = b.meet_link || site.googleMeetRoom;
      return `Hello ${b.name},

Your Online Video Consultation with Adv. Shareen Hussain has been successfully RESCHEDULED as requested:

🆔 Booking Reference ID: ${bookingId}
⚖️ Matter: ${serviceTitle}
📅 New Scheduled Date: ${dateStr}
⏰ New Time Slot: ${timeStr}
💻 Google Meet Video Link: ${meetLink}
📞 Chamber Desk: +91 83296 31199

Please join the Google Meet link above at your scheduled appointment time.`;
    }
  }, []);

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

  // Aggregated Clients Directory (Unique Clients from Bookings and Contacts)
  const clientsDirectory = useMemo(() => {
    const map = new Map<string, {
      key: string;
      name: string;
      phone: string;
      email: string | null;
      totalBookings: number;
      totalContacts: number;
      lastMatter: string;
      lastDate: string;
      status: string;
      recentType: "booking" | "contact";
    }>();

    for (const b of bookings) {
      const key = (b.phone || b.name).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          name: b.name,
          phone: b.phone,
          email: b.email,
          totalBookings: 1,
          totalContacts: 0,
          lastMatter: b.sub_service || serviceLabels[b.service] || b.service,
          lastDate: b.booking_date,
          status: b.status,
          recentType: "booking",
        });
      } else {
        existing.totalBookings += 1;
        if (!existing.email && b.email) existing.email = b.email;
        if (new Date(b.booking_date).getTime() > new Date(existing.lastDate).getTime()) {
          existing.lastMatter = b.sub_service || serviceLabels[b.service] || b.service;
          existing.lastDate = b.booking_date;
          existing.status = b.status;
        }
      }
    }

    for (const c of contacts) {
      const key = (c.phone || c.name).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalBookings: 0,
          totalContacts: 1,
          lastMatter: c.service,
          lastDate: c.created_at.slice(0, 10),
          status: c.status,
          recentType: "contact",
        });
      } else {
        existing.totalContacts += 1;
        if (!existing.email && c.email) existing.email = c.email;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
  }, [bookings, contacts]);

  // Overall Statistics for Redwood 5 KPI Cards
  const stats = useMemo(() => {
    const totalClients = clientsDirectory.length;
    const totalBookings = bookings.length;
    const totalContacts = contacts.length;
    const attendedCount = bookings.filter((b) => b.attendance === "attended").length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const newContacts = contacts.filter((c) => c.status === "new").length;
    const pendingAction = pendingBookings + newContacts;
    const todayBookings = bookings.filter((b) => b.booking_date === todayStr);

    return {
      totalClients,
      totalBookings,
      totalContacts,
      attendedCount,
      pendingAction,
      todayBookings,
    };
  }, [clientsDirectory, bookings, contacts, todayStr]);

  // Chart Data 1: Volume Stacked Bars (4 Time Buckets)
  const volumeChartData = useMemo(() => {
    // Generate 4 weekly buckets
    const buckets = [
      { label: "Week 1", start: 1, end: 7, bookings: 0, contacts: 0, total: 0 },
      { label: "Week 2", start: 8, end: 14, bookings: 0, contacts: 0, total: 0 },
      { label: "Week 3", start: 15, end: 21, bookings: 0, contacts: 0, total: 0 },
      { label: "Week 4+", start: 22, end: 31, bookings: 0, contacts: 0, total: 0 },
    ];

    bookings.forEach((b) => {
      const d = parseInt(b.booking_date.split("-")[2] || "1", 10);
      const bkt = buckets.find((bk) => d >= bk.start && d <= bk.end) || buckets[3];
      bkt.bookings += 1;
      bkt.total += 1;
    });

    contacts.forEach((c) => {
      const d = parseInt(c.created_at.slice(8, 10) || "1", 10);
      const bkt = buckets.find((bk) => d >= bk.start && d <= bk.end) || buckets[3];
      bkt.contacts += 1;
      bkt.total += 1;
    });

    // Ensure chart has realistic sample visualization if data is light
    return buckets;
  }, [bookings, contacts]);

  const maxVolumeVal = useMemo(() => {
    const max = Math.max(...volumeChartData.map((d) => (chartCategory === "all" ? d.total : chartCategory === "bookings" ? d.bookings : d.contacts)), 1);
    return Math.max(max, 5);
  }, [volumeChartData, chartCategory]);

  // Chart Data 2: Practice Areas Donut Breakdown
  const practiceDonutData = useMemo(() => {
    let marriage = 0;
    let trademark = 0;
    let chamberLitigation = 0;
    let criminalOrOther = 0;

    bookings.forEach((b) => {
      const s = (b.service || "").toLowerCase();
      const sub = (b.sub_service || "").toLowerCase();
      if (s.includes("marriage") || sub.includes("marriage")) {
        marriage += 1;
      } else if (s.includes("trademark") || sub.includes("trademark") || sub.includes("brand") || sub.includes("ip")) {
        trademark += 1;
      } else if (s.includes("legal") || sub.includes("deed") || sub.includes("property") || sub.includes("civil")) {
        chamberLitigation += 1;
      } else {
        criminalOrOther += 1;
      }
    });

    const total = marriage + trademark + chamberLitigation + criminalOrOther;
    return [
      { name: "Court Marriage", count: marriage, color: "#cba758", pct: total ? Math.round((marriage / total) * 100) : 40 },
      { name: "Trademark & IP", count: trademark, color: "#6366f1", pct: total ? Math.round((trademark / total) * 100) : 30 },
      { name: "Chamber Litigation", count: chamberLitigation, color: "#0ea5e9", pct: total ? Math.round((chamberLitigation / total) * 100) : 20 },
      { name: "Bail & Criminal", count: criminalOrOther, color: "#10b981", pct: total ? Math.round((criminalOrOther / total) * 100) : 10 },
    ];
  }, [bookings]);

  // Filtered Bookings for the Dedicated Bookings View
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    if (bookingStatusFilter === "pending") {
      list = list.filter((b) => b.status === "pending");
    } else if (bookingStatusFilter === "confirmed") {
      list = list.filter((b) => b.status === "confirmed");
    } else if (bookingStatusFilter === "attended") {
      list = list.filter((b) => b.attendance === "attended");
    } else if (bookingStatusFilter === "cancelled") {
      list = list.filter((b) => b.status === "cancelled" || b.attendance === "no_show");
    } else if (bookingStatusFilter === "all") {
      list = list.filter((b) => b.status !== "cancelled" && b.attendance !== "no_show");
    }

    if (dateFilter === "today") {
      list = list.filter((b) => b.booking_date === todayStr);
    } else if (dateFilter === "tomorrow") {
      list = list.filter((b) => b.booking_date === tomorrowStr);
    } else if (dateFilter === "upcoming") {
      list = list.filter((b) => b.booking_date >= todayStr);
    } else if (dateFilter === "past") {
      list = list.filter((b) => b.booking_date < todayStr);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          b.service.toLowerCase().includes(q) ||
          (b.sub_service && b.sub_service.toLowerCase().includes(q)) ||
          b.booking_date.includes(q) ||
          (b.booking_id && b.booking_id.toLowerCase().includes(q)) ||
          b.id.toLowerCase().includes(q) ||
          (b.message && b.message.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings, bookingStatusFilter, dateFilter, searchQuery, todayStr, tomorrowStr]);

  // Filtered Contacts for the Dedicated Contact Inquiries View
  const filteredContacts = useMemo(() => {
    let list = [...contacts];

    if (contactStatusFilter !== "all") {
      list = list.filter((c) => c.status === contactStatusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.service.toLowerCase().includes(q) ||
          (c.message && c.message.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [contacts, contactStatusFilter, searchQuery]);

  // Filtered Clients for Directory View
  const filteredClients = useMemo(() => {
    let list = [...clientsDirectory];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (cl) =>
          cl.name.toLowerCase().includes(q) ||
          cl.phone.toLowerCase().includes(q) ||
          (cl.email && cl.email.toLowerCase().includes(q)) ||
          cl.lastMatter.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clientsDirectory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f1f3f7] text-[#09090b] flex flex-col antialiased">
      {/* ================= TOP APPLICATION HEADER (Dark Redwood Band) ================= */}
      <header className="bg-[#1b1f2b] text-white border-b border-[#2d3243] sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <Menu size={20} />
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#cba758] text-black flex items-center justify-center font-bold shadow-sm">
              <Scale size={18} />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wide text-white block leading-none">
                True Legal Advice
              </span>
              <span className="text-[10px] font-mono text-[#cba758] uppercase tracking-wider block mt-0.5">
                Chambers of Adv. Shareen Hussain
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Chamber Status Badge, Refresh, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Chamber Away / Open Indicator */}
          <button
            onClick={() => {
              setActiveNav("chamber");
            }}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              chamberStatus.isOfficeOpen
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                : "bg-amber-950/60 text-amber-300 border-amber-500/40"
            }`}
            title="Click to manage chamber availability"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                chamberStatus.isOfficeOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span>{chamberStatus.isOfficeOpen ? "Chamber Open" : `Away: ${chamberStatus.returnEstimate || "Hearing"}`}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cba758]" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#cba758] to-amber-200 text-black font-bold text-xs flex items-center justify-center font-mono">
              SH
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-white block leading-none">Adv. Shareen</span>
              <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">High Court Desk</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER: SIDEBAR + CONTENT AREA ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= PERSISTENT DARK SIDEBAR (Redwood Style) ================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1f2430] text-slate-300 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col shrink-0 border-r border-[#2c3243] shadow-lg md:shadow-none ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-0 max-md:-translate-x-full"
          }`}
        >
          {/* Sidebar Header Title */}
          <div className="px-5 py-4 border-b border-[#2c3243] flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Admin Portal
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#cba758] font-bold">
              v2.4
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {/* 1. Dashboard Overview */}
            <button
              onClick={() => {
                setActiveNav("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "dashboard"
                  ? "bg-[#2b6cb0] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </div>
              {stats.pendingAction > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* 2. Bookings & Consultations */}
            <button
              onClick={() => {
                setActiveNav("bookings");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "bookings"
                  ? "bg-[#2b6cb0] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} />
                <span>Bookings & Slots</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white font-bold">
                {bookings.length}
              </span>
            </button>

            {/* 3. Contact Inquiries */}
            <button
              onClick={() => {
                setActiveNav("contacts");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "contacts"
                  ? "bg-[#2b6cb0] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={16} />
                <span>Contact Inquiries</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold">
                {contacts.length}
              </span>
            </button>

            {/* 4. Clients Directory */}
            <button
              onClick={() => {
                setActiveNav("clients");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "clients"
                  ? "bg-[#2b6cb0] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Clients Directory</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">
                {clientsDirectory.length}
              </span>
            </button>

            {/* 5. Chamber Status & Presence */}
            <button
              onClick={() => {
                setActiveNav("chamber");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === "chamber"
                  ? "bg-[#2b6cb0] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={16} />
                <span>Chamber Presence</span>
              </div>
              <span
                className={`h-2 w-2 rounded-full ${
                  chamberStatus.isOfficeOpen ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </button>
          </nav>

          {/* Quick CTA: Manual Booking / Block Slot Button */}
          <div className="p-3.5 border-t border-[#2c3243]">
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
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>+ New Booking / Slot</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ================= SUB-HEADER: TITLE + DATE FILTERS (Redwood Style) ================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 capitalize flex items-center gap-2">
                  <span>
                    {activeNav === "dashboard" && "Dashboard"}
                    {activeNav === "bookings" && "Bookings & Consultations"}
                    {activeNav === "contacts" && "Website Contact Inquiries"}
                    {activeNav === "clients" && "Clients Directory"}
                    {activeNav === "chamber" && "Chamber Status & Away Manager"}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f6ad55] inline-block shadow-xs" />
                </h1>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activeNav === "dashboard" && "Executive overview of chamber consultations, client intake, and attendance."}
                {activeNav === "bookings" && "Dedicated appointments desk: schedule, confirm, reschedule, and verify visits."}
                {activeNav === "contacts" && "Dedicated inbox for online inquiry forms with instant WhatsApp reply drafts."}
                {activeNav === "clients" && "Unified legal client directory with historical engagement records."}
                {activeNav === "chamber" && "Live availability manager for office visits and online consultation channels."}
              </p>
            </div>

            {/* Top Period Selector Pills & Action */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <div className="flex items-center p-1 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                {(["month", "quarter", "year", "all"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodFilter(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      periodFilter === p
                        ? "bg-[#2b6cb0] text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {p === "all" ? "All Time" : p}
                  </button>
                ))}
              </div>

              {/* Month Dropdown Indicator */}
              <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono font-medium text-zinc-700 shadow-2xs flex items-center gap-1.5">
                <CalendarDays size={13} className="text-[#cba758]" />
                <span>
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* ================= 5 KPI METRIC CARDS (Redwood Style) ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Users / Clients */}
            <div
              onClick={() => setActiveNav("clients")}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-zinc-300 ${
                activeNav === "clients" ? "border-[#2b6cb0] ring-2 ring-[#2b6cb0]/15" : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Clients</span>
                <Users size={16} />
              </div>
              <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{stats.totalClients}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700">
                <span>▲ Verified clients</span>
              </div>
            </div>

            {/* Card 2: Consultations (Bookings) */}
            <div
              onClick={() => {
                setActiveNav("bookings");
                setBookingStatusFilter("all");
              }}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-zinc-300 ${
                activeNav === "bookings" && bookingStatusFilter === "all"
                  ? "border-[#2b6cb0] ring-2 ring-[#2b6cb0]/15"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Bookings</span>
                <Calendar size={16} />
              </div>
              <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{stats.totalBookings}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-zinc-500">
                <span>Total consultations</span>
              </div>
            </div>

            {/* Card 3: Attended / Came (Fixed Beautiful Light Emerald Theme - No Color Glitch) */}
            <div
              onClick={() => {
                setActiveNav("bookings");
                setBookingStatusFilter("attended");
              }}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-emerald-400 ${
                activeNav === "bookings" && bookingStatusFilter === "attended"
                  ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/40"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                  Attended / Came
                </span>
                <CheckCheck size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{stats.attendedCount}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700">
                <span>✓ Verified chamber visits</span>
              </div>
            </div>

            {/* Card 4: Contact Inquiries */}
            <div
              onClick={() => {
                setActiveNav("contacts");
                setContactStatusFilter("all");
              }}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-blue-400 ${
                activeNav === "contacts" ? "border-blue-600 ring-2 ring-blue-600/15" : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Inquiries</span>
                <MessageSquare size={16} />
              </div>
              <p className="text-2xl font-serif font-bold text-blue-900 mt-2">{stats.totalContacts}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-blue-700">
                <span>Web contact forms</span>
              </div>
            </div>

            {/* Card 5: Needs Action / Awaiting Review */}
            <div
              onClick={() => {
                setActiveNav("bookings");
                setBookingStatusFilter("pending");
              }}
              className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-amber-400 ${
                activeNav === "bookings" && bookingStatusFilter === "pending"
                  ? "border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/40"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Needs Action</span>
                <Clock size={16} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-serif font-bold text-amber-900">{stats.pendingAction}</p>
                {stats.pendingAction > 0 && (
                  <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 animate-pulse">
                    Review
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-700">
                <span>Pending confirmation</span>
              </div>
            </div>
          </div>

          {/* ================= VIEW 1: DASHBOARD OVERVIEW ================= */}
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              {/* Charts Row: Left Volume Bar Chart + Right Matter Donut Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card (7 cols): Consultation & Inquiry Activity Bar Chart */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-zinc-900">
                        Consultation & Inquiry Volume
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Weekly intake activity across all chamber practice areas
                      </p>
                    </div>

                    {/* Chart Category Toggle: All, Consultations, Inquiries */}
                    <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 text-xs font-medium">
                      {(["all", "bookings", "contacts"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setChartCategory(cat)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            chartCategory === cat
                              ? "bg-white text-zinc-900 shadow-xs"
                              : "text-zinc-600 hover:text-black"
                          }`}
                        >
                          {cat === "all" ? "All" : cat === "bookings" ? "Bookings" : "Inquiries"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="h-56 w-full flex items-end justify-between gap-4 pt-4 px-2 pb-2">
                    {volumeChartData.map((d) => {
                      const displayVal =
                        chartCategory === "all"
                          ? d.total
                          : chartCategory === "bookings"
                          ? d.bookings
                          : d.contacts;
                      const heightPct = Math.max(Math.round((displayVal / maxVolumeVal) * 100), 12);

                      return (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="text-xs font-mono font-bold text-zinc-700 group-hover:text-black transition-colors">
                            {displayVal}
                          </span>
                          <div className="w-full max-w-[48px] bg-zinc-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-40">
                            {chartCategory === "all" ? (
                              <>
                                <div
                                  style={{ height: `${Math.round((d.contacts / maxVolumeVal) * 100)}%` }}
                                  className="w-full bg-[#f6ad55] hover:bg-[#ed8936] transition-all"
                                  title={`Inquiries: ${d.contacts}`}
                                />
                                <div
                                  style={{ height: `${Math.round((d.bookings / maxVolumeVal) * 100)}%` }}
                                  className="w-full bg-[#4299e1] hover:bg-[#3182ce] transition-all"
                                  title={`Bookings: ${d.bookings}`}
                                />
                              </>
                            ) : (
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t-xl transition-all ${
                                  chartCategory === "bookings"
                                    ? "bg-[#4299e1] hover:bg-[#3182ce]"
                                    : "bg-[#f6ad55] hover:bg-[#ed8936]"
                                }`}
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center justify-center gap-6 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-md bg-[#4299e1]" />
                      <span>Bookings / Appointments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-md bg-[#f6ad55]" />
                      <span>Contact Inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Right Card (4 cols): Practice Areas Donut Chart */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="border-b border-zinc-100 pb-3">
                    <h3 className="font-serif font-bold text-sm text-zinc-900">
                      Practice Area Breakdown
                    </h3>
                    <p className="text-[11px] text-zinc-500">Distribution of client matters</p>
                  </div>

                  {/* SVG Donut Chart */}
                  <div className="relative flex items-center justify-center my-auto py-2">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#f1f5f9"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      {/* Donut Segments */}
                      {(() => {
                        let accumulated = 0;
                        const circumference = 2 * Math.PI * 38; // ~238.76
                        return practiceDonutData.map((seg, i) => {
                          const strokeLen = (seg.pct / 100) * circumference;
                          const offset = -accumulated;
                          accumulated += strokeLen;
                          return (
                            <circle
                              key={seg.name}
                              cx="50"
                              cy="50"
                              r="38"
                              stroke={seg.color}
                              strokeWidth="14"
                              fill="transparent"
                              strokeDasharray={`${strokeLen} ${circumference}`}
                              strokeDashoffset={offset}
                              className="transition-all duration-500"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Donut Center Count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-serif font-bold text-zinc-900">
                        {bookings.length}
                      </span>
                      <span className="text-[9.5px] font-mono text-zinc-500 uppercase">Matters</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs">
                    {practiceDonutData.map((seg) => (
                      <div key={seg.name} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="text-zinc-700 truncate">{seg.name}</span>
                        </div>
                        <span className="font-mono font-semibold text-zinc-900">{seg.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Today's Urgent Consultations & Chamber Quick Actions */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#cba758]" />
                    <h3 className="font-serif font-bold text-sm text-zinc-900">
                      Today&apos;s Chamber Schedule ({stats.todayBookings.length} Appointments)
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav("bookings");
                      setDateFilter("today");
                    }}
                    className="text-xs font-semibold text-[#2b6cb0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Bookings</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {stats.todayBookings.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No consultation appointments scheduled for today yet.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 overflow-x-auto">
                    {stats.todayBookings.map((b) => (
                      <div
                        key={b.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-black text-[#cba758] flex items-center justify-center font-bold font-mono shrink-0">
                            {formatTime12(b.booking_time).split(" ")[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900">{b.name}</span>
                              <span className="font-mono text-[10px] text-zinc-500">
                                {formatTime12(b.booking_time)}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                                {b.consultation_mode === "online" ? "Google Meet" : "In-Person Office"}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {b.sub_service || serviceLabels[b.service] || b.service} · {b.phone}
                            </p>
                          </div>
                        </div>

                        {/* Quick Attendance & WhatsApp Dispatch */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateAttendance(
                                b.id,
                                b.attendance === "attended" ? "scheduled" : "attended"
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                              b.attendance === "attended"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                : "bg-white text-zinc-700 border-zinc-300 hover:border-emerald-600 hover:text-emerald-700"
                            }`}
                          >
                            <Check size={12} strokeWidth={2.5} className={b.attendance === "attended" ? "text-emerald-700" : ""} />
                            <span>{b.attendance === "attended" ? "Came ✓" : "Mark Came"}</span>
                          </button>

                          <button
                            onClick={() => openConfirmModal(b)}
                            className="px-2.5 py-1 rounded-lg bg-black text-[#cba758] hover:bg-zinc-900 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => openRescheduleModal(b)}
                            className="px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: DEDICATED BOOKINGS & CONSULTATIONS ================= */}
          {activeNav === "bookings" && (
            <div className="space-y-4">
              {/* Action Bar: Search Input + Status Filter Pills + Date Filters */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative w-full lg:w-96">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bookings by client name, phone, TLA-2026 ID, or matter..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
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

                  {/* Add Manual Booking Button */}
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
                    className="px-3.5 py-2 rounded-xl bg-black text-[#cba758] hover:bg-zinc-900 border border-[#cba758]/30 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer self-start lg:self-center"
                  >
                    <Plus size={14} />
                    <span>+ Add Walk-in / Block Slot</span>
                  </button>
                </div>

                {/* Status & Date Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-xs">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10.5px] uppercase font-bold text-zinc-500 mr-1">
                      Status:
                    </span>
                    {[
                      { id: "all", label: "Active Slots" },
                      { id: "pending", label: "Awaiting Review" },
                      { id: "confirmed", label: "Confirmed" },
                      { id: "attended", label: "Attended / Came" },
                      { id: "cancelled", label: "Declined / Cancelled" },
                    ].map((f) => {
                      const isSelected = bookingStatusFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setBookingStatusFilter(f.id as any)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? f.id === "attended"
                                ? "bg-emerald-600 text-white font-bold shadow-xs"
                                : "bg-black text-white font-bold shadow-xs"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Date Quick Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10.5px] uppercase font-bold text-zinc-500 mr-1">
                      Date:
                    </span>
                    {[
                      { id: "all", label: "All" },
                      { id: "today", label: "Today" },
                      { id: "upcoming", label: "Upcoming" },
                      { id: "past", label: "Past" },
                    ].map((df) => (
                      <button
                        key={df.id}
                        onClick={() => setDateFilter(df.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          dateFilter === df.id
                            ? "bg-[#cba758] text-black font-bold shadow-xs"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {df.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dedicated Bookings Table */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 size={30} className="animate-spin text-[#cba758] mx-auto mb-2" />
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                      Loading appointments...
                    </p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="py-16 px-6 text-center max-w-sm mx-auto">
                    <Calendar size={32} className="text-zinc-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-zinc-900">No Appointments Found</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {searchQuery
                        ? `No bookings match "${searchQuery}".`
                        : "No bookings for the selected filter."}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setBookingStatusFilter("all");
                        setDateFilter("all");
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">Client</th>
                          <th className="py-3 px-4 font-semibold">Booking ID & Mode</th>
                          <th className="py-3 px-4 font-semibold">Legal Matter</th>
                          <th className="py-3 px-4 font-semibold">Date & Slot</th>
                          <th className="py-3 px-4 font-semibold">Slot Status</th>
                          <th className="py-3 px-4 font-semibold text-center">Attendance (Came?)</th>
                          <th className="py-3 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredBookings.map((b, idx) => {
                          const statusMeta = statusStyles[b.status] || statusStyles.pending;
                          const isAttended = b.attendance === "attended";
                          const isNoShow = b.attendance === "no_show";

                          return (
                            <tr
                              key={b.id}
                              className={`hover:bg-zinc-50/80 transition-colors ${
                                isAttended ? "bg-emerald-50/20" : ""
                              }`}
                            >
                              {/* Client Details */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`h-8 w-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                    }`}
                                  >
                                    {getInitials(b.name)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-zinc-900 block">{b.name}</span>
                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                                      <span>{b.phone}</span>
                                      {b.email && (
                                        <>
                                          <span>·</span>
                                          <span className="truncate max-w-[120px]">{b.email}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Booking ID & Mode */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="font-mono text-[10px] font-bold text-[#9f7d32]">
                                    {b.booking_id || getBookingId(b)}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      b.consultation_mode === "online"
                                        ? "bg-purple-50 text-purple-800 border-purple-200"
                                        : "bg-zinc-100 text-zinc-800 border-zinc-200"
                                    }`}
                                  >
                                    {b.consultation_mode === "online" ? (
                                      <>
                                        <Video size={10} className="text-purple-600" />
                                        <span>Google Meet</span>
                                      </>
                                    ) : (
                                      <>
                                        <MapPin size={10} className="text-zinc-600" />
                                        <span>In-Person Chamber</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </td>

                              {/* Legal Matter */}
                              <td className="py-3 px-4 max-w-[220px]">
                                <p className="font-bold text-zinc-900 truncate">
                                  {serviceLabels[b.service] || b.service}
                                </p>
                                {b.sub_service && (
                                  <span className="text-[10px] font-mono text-[#9f7d32] font-semibold truncate block mt-0.5">
                                    {b.sub_service}
                                  </span>
                                )}
                              </td>

                              {/* Date & Slot */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                                  <Clock size={12} className="text-zinc-400" />
                                  <span>{formatTime12(b.booking_time)}</span>
                                </div>
                                <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                                  {formatDateLabel(b.booking_date)}
                                </div>
                              </td>

                              {/* Slot Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                                  >
                                    {statusMeta.label}
                                  </span>
                                  {b.status === "pending" && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <button
                                        onClick={() => openConfirmModal(b)}
                                        className="px-2 py-0.5 rounded bg-black text-[#cba758] text-[10px] font-bold hover:bg-zinc-900 cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => discardBooking(b.id)}
                                        className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold cursor-pointer"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Attendance (Came?) - Clean, Beautiful, Emerald High-Contrast UI */}
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateAttendance(
                                        b.id,
                                        isAttended ? "scheduled" : "attended"
                                      );
                                      if (b.status === "cancelled") {
                                        updateBookingStatus(b.id, "confirmed");
                                      }
                                    }}
                                    disabled={updatingId === b.id}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                      isAttended
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                                        : "bg-white text-zinc-700 border-zinc-300 hover:border-emerald-600 hover:text-emerald-700"
                                    }`}
                                    title="Toggle client attendance"
                                  >
                                    <Check size={12} strokeWidth={2.5} className={isAttended ? "text-emerald-700" : ""} />
                                    <span>{isAttended ? "Came ✓" : "Mark Came"}</span>
                                  </button>

                                  {!isAttended && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!isNoShow) {
                                          updateAttendance(b.id, "no_show");
                                          updateBookingStatus(b.id, "cancelled");
                                        } else {
                                          updateAttendance(b.id, "scheduled");
                                        }
                                      }}
                                      disabled={updatingId === b.id}
                                      className={`px-2 py-1 rounded-lg text-[10.5px] transition-all cursor-pointer border ${
                                        isNoShow
                                          ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
                                          : "bg-white text-zinc-400 border-zinc-200 hover:text-rose-600"
                                      }`}
                                      title={isNoShow ? "Marked No-Show" : "Mark No-Show & Release Slot"}
                                    >
                                      {isNoShow ? "No-Show" : <X size={11} />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* WhatsApp / Confirm Modal */}
                                  <button
                                    onClick={() => openConfirmModal(b)}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                    title="WhatsApp Dispatch & Confirm"
                                  >
                                    <MessageCircle size={14} />
                                  </button>

                                  {/* Reschedule Modal */}
                                  <button
                                    onClick={() => openRescheduleModal(b)}
                                    className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                    title="Reschedule Appointment Slot"
                                  >
                                    <CalendarClock size={14} />
                                  </button>

                                  {/* View Detail Drawer */}
                                  <button
                                    onClick={() => setSelectedRecord({ type: "booking", data: b })}
                                    className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                    title="View Case Details"
                                  >
                                    <Eye size={14} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => deleteBookingPermanently(b.id)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Record"
                                  >
                                    <Trash2 size={14} />
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
            </div>
          )}

          {/* ================= VIEW 3: DEDICATED WEBSITE CONTACT INQUIRIES ================= */}
          {activeNav === "contacts" && (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-96">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search inquiries by sender name, phone, email, or message..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
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

                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {(["all", "new", "contacted", "converted", "closed"] as const).map((st) => {
                      const isSelected = contactStatusFilter === st;
                      return (
                        <button
                          key={st}
                          onClick={() => setContactStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dedicated Inquiries Table */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 size={30} className="animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                      Loading inquiries...
                    </p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="py-16 px-6 text-center max-w-sm mx-auto">
                    <Inbox size={32} className="text-zinc-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-zinc-900">No Inquiries Found</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {searchQuery
                        ? `No contact inquiries match "${searchQuery}".`
                        : "No inquiries under this status filter."}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setContactStatusFilter("all");
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">Sender Details</th>
                          <th className="py-3 px-4 font-semibold">Subject / Practice Track</th>
                          <th className="py-3 px-4 font-semibold">Message Preview</th>
                          <th className="py-3 px-4 font-semibold">Received Date</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold text-right">Quick Contact & Reply</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredContacts.map((c) => {
                          const statusMeta = statusStyles[c.status] || statusStyles.new;

                          return (
                            <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                              {/* Sender */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="font-bold text-zinc-900 block">{c.name}</span>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono mt-0.5">
                                  <span>{c.phone}</span>
                                  {c.email && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate max-w-[130px]">{c.email}</span>
                                    </>
                                  )}
                                </div>
                              </td>

                              {/* Service */}
                              <td className="py-3 px-4 max-w-[180px]">
                                <span className="font-semibold text-zinc-900 block truncate">
                                  {c.service}
                                </span>
                              </td>

                              {/* Message */}
                              <td className="py-3 px-4 max-w-[280px]">
                                <p className="text-zinc-600 truncate text-[11px]">
                                  &ldquo;{c.message || "No message body"}&rdquo;
                                </p>
                              </td>

                              {/* Received Date */}
                              <td className="py-3 px-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                                {formatDateLabel(c.created_at.slice(0, 10))}
                              </td>

                              {/* Status Dropdown */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <select
                                  value={c.status}
                                  onChange={(e) =>
                                    updateContactStatus(c.id, e.target.value as ContactInquiry["status"])
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} focus:outline-none`}
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="converted">Converted</option>
                                  <option value="closed">Closed</option>
                                </select>
                              </td>

                              {/* Quick Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Direct WhatsApp Reply */}
                                  <a
                                    href={`https://wa.me/${formatWhatsAppNumber(c.phone)}?text=${encodeURIComponent(
                                      buildContactReplyWhatsApp(c)
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => updateContactStatus(c.id, "contacted")}
                                    className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                                  >
                                    <MessageCircle size={12} />
                                    <span>WhatsApp Reply</span>
                                  </a>

                                  {/* Call */}
                                  <a
                                    href={`tel:${c.phone}`}
                                    className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                    title="Call Sender"
                                  >
                                    <Phone size={13} />
                                  </a>

                                  {/* View Detail Drawer */}
                                  <button
                                    onClick={() => setSelectedRecord({ type: "contact", data: c })}
                                    className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                    title="View Full Message"
                                  >
                                    <Eye size={13} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => deleteContactInquiry(c.id)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                                    title="Delete Inquiry"
                                  >
                                    <Trash2 size={13} />
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
            </div>
          )}

          {/* ================= VIEW 4: CLIENTS DIRECTORY ================= */}
          {activeNav === "clients" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clients by name, phone, or matter history..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
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

                <div className="text-xs text-zinc-500 font-mono">
                  Total Active Directory: <strong>{filteredClients.length} Clients</strong>
                </div>
              </div>

              {/* Clients Table */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {filteredClients.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 text-xs">
                    No clients found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-600 font-mono text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold">Client Name</th>
                          <th className="py-3 px-4 font-semibold">Phone & Contact</th>
                          <th className="py-3 px-4 font-semibold text-center">Consultations</th>
                          <th className="py-3 px-4 font-semibold text-center">Inquiries</th>
                          <th className="py-3 px-4 font-semibold">Last Legal Matter</th>
                          <th className="py-3 px-4 font-semibold">Last Interaction</th>
                          <th className="py-3 px-4 font-semibold text-right">Quick Connect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredClients.map((cl, idx) => (
                          <tr key={cl.key} className="hover:bg-zinc-50/80 transition-colors">
                            {/* Name & Avatar */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`h-8 w-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                  }`}
                                >
                                  {getInitials(cl.name)}
                                </div>
                                <span className="font-bold text-zinc-900">{cl.name}</span>
                              </div>
                            </td>

                            {/* Phone & Email */}
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-600">
                              <div>{cl.phone}</div>
                              {cl.email && <div className="text-zinc-400 truncate max-w-[140px]">{cl.email}</div>}
                            </td>

                            {/* Bookings Count */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                                {cl.totalBookings}
                              </span>
                            </td>

                            {/* Inquiries Count */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full">
                                {cl.totalContacts}
                              </span>
                            </td>

                            {/* Last Matter */}
                            <td className="py-3 px-4 max-w-[200px] truncate text-zinc-800">
                              {cl.lastMatter}
                            </td>

                            {/* Last Date */}
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                              {formatDateLabel(cl.lastDate)}
                            </td>

                            {/* Connect Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`https://wa.me/${formatWhatsAppNumber(cl.phone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
                                  title="WhatsApp Client"
                                >
                                  <MessageCircle size={13} />
                                </a>
                                <a
                                  href={`tel:${cl.phone}`}
                                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                  title="Call Client"
                                >
                                  <Phone size={13} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 5: CHAMBER AVAILABILITY & AWAY MANAGER ================= */}
          {activeNav === "chamber" && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-zinc-900">
                      Chamber Presence & Live Status Manager
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Control live banner alerts visible to clients on the website
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      chamberStatus.isOfficeOpen
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {chamberStatus.isOfficeOpen ? "Status: Open" : "Status: Away"}
                  </span>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                    Quick Status Presets
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        saveChamberAvailability({
                          isOfficeOpen: true,
                          isOnlineOpen: true,
                          awayReason: "",
                          returnEstimate: "",
                        })
                      }
                      className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-xs text-emerald-900 block">
                        🏛️ In Chamber (Active & Open)
                      </span>
                      <span className="text-[11px] text-emerald-700 block mt-0.5">
                        Office visits and online slots are fully open at Trisharan Square.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        saveChamberAvailability({
                          isOfficeOpen: false,
                          isOnlineOpen: true,
                          awayReason: "High Court Hearings",
                          returnEstimate: "1–2 Hours",
                        })
                      }
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-xs text-amber-900 block">
                        ⚖️ Attending High Court Hearings
                      </span>
                      <span className="text-[11px] text-amber-700 block mt-0.5">
                        Office visits paused; Google Meet consultations remain open.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        saveChamberAvailability({
                          isOfficeOpen: false,
                          isOnlineOpen: true,
                          awayReason: "District Court & Registry",
                          returnEstimate: "3:00 PM",
                        })
                      }
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-xs text-amber-900 block">
                        📑 District Court & Marriage Registrar
                      </span>
                      <span className="text-[11px] text-amber-700 block mt-0.5">
                        Solemnizing registry marriage appointments.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        saveChamberAvailability({
                          isOfficeOpen: false,
                          isOnlineOpen: false,
                          awayReason: "Chamber Leave / Closed Today",
                          returnEstimate: "Tomorrow 10:00 AM",
                        })
                      }
                      className="p-3 rounded-xl border border-rose-300 bg-rose-50/50 hover:bg-rose-50 text-left transition-all cursor-pointer"
                    >
                      <span className="font-bold text-xs text-rose-900 block">
                        🛑 Chamber Closed
                      </span>
                      <span className="text-[11px] text-rose-700 block mt-0.5">
                        All in-person and video consultations suspended until next session.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Custom Configuration Inputs */}
                <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">
                        Away Reason / Cause
                      </label>
                      <input
                        type="text"
                        value={statusModalReason}
                        onChange={(e) => setStatusModalReason(e.target.value)}
                        placeholder="e.g. High Court Motion Hearing"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">
                        Estimated Return Timing
                      </label>
                      <input
                        type="text"
                        value={statusModalEstimate}
                        onChange={(e) => setStatusModalEstimate(e.target.value)}
                        placeholder="e.g. 1–2 hours or 4:30 PM"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                      <input
                        type="checkbox"
                        checked={statusModalOfficeOpen}
                        onChange={(e) => setStatusModalOfficeOpen(e.target.checked)}
                        className="h-4 w-4 rounded accent-black"
                      />
                      <span>In-Person Office Visits Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800">
                      <input
                        type="checkbox"
                        checked={statusModalOnlineOpen}
                        onChange={(e) => setStatusModalOnlineOpen(e.target.checked)}
                        className="h-4 w-4 rounded accent-black"
                      />
                      <span>Online Video Consultations Active</span>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => saveChamberAvailability()}
                      className="px-5 py-2 rounded-xl bg-black text-[#cba758] hover:bg-zinc-900 font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {statusSaving && <Loader2 size={13} className="animate-spin" />}
                      <span>Save Status & Publish Notice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= RECORD DETAIL SLIDE-OVER DRAWER ================= */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#cba758] bg-black px-2 py-0.5 rounded">
                      {selectedRecord.type === "booking"
                        ? selectedRecord.data.booking_id || getBookingId(selectedRecord.data)
                        : "INQUIRY"}
                    </span>
                    <span className="text-xs font-mono uppercase text-zinc-500">
                      {selectedRecord.type}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 py-4 text-xs">
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900">
                      {selectedRecord.data.name}
                    </h3>
                    <p className="font-mono text-zinc-500 mt-0.5">{selectedRecord.data.phone}</p>
                    {selectedRecord.data.email && (
                      <p className="font-mono text-zinc-500">{selectedRecord.data.email}</p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <p>
                      <strong>Matter:</strong>{" "}
                      {serviceLabels[selectedRecord.data.service] || selectedRecord.data.service}
                    </p>
                    {selectedRecord.data.sub_service && (
                      <p>
                        <strong>Specific Track:</strong> {selectedRecord.data.sub_service}
                      </p>
                    )}
                    {selectedRecord.type === "booking" && (
                      <>
                        <p>
                          <strong>Slot:</strong>{" "}
                          {formatDateLabel(selectedRecord.data.booking_date)} at{" "}
                          {formatTime12(selectedRecord.data.booking_time)}
                        </p>
                        <p>
                          <strong>Mode:</strong>{" "}
                          {selectedRecord.data.consultation_mode === "online"
                            ? "Google Meet Video"
                            : "In-Person Office"}
                        </p>
                      </>
                    )}
                  </div>

                  {selectedRecord.data.message && (
                    <div>
                      <label className="font-bold text-zinc-700 block mb-1">Case Brief / Message</label>
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 leading-relaxed">
                        {selectedRecord.data.message}
                      </div>
                    </div>
                  )}

                  {/* Attendance Controls for Booking */}
                  {selectedRecord.type === "booking" && (
                    <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
                      <label className="font-bold text-zinc-800 block">Attendance Verification</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateAttendance(selectedRecord.data.id, "attended")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            selectedRecord.data.attendance === "attended"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                              : "bg-white text-zinc-800 border-zinc-300"
                          }`}
                        >
                          <Check size={13} className="text-emerald-700" />
                          <span>Came / Attended</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendance(selectedRecord.data.id, "no_show")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            selectedRecord.data.attendance === "no_show"
                              ? "bg-rose-100 text-rose-800 border-rose-300 shadow-xs"
                              : "bg-white text-zinc-600 border-zinc-300"
                          }`}
                        >
                          <X size={13} />
                          <span>No-Show</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Contact */}
              <div className="pt-4 border-t border-zinc-200 flex gap-2">
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(selectedRecord.data.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${selectedRecord.data.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-black text-[#cba758] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CONFIRMATION MODAL & WHATSAPP DISPATCH ================= */}
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
                    <h3 className="text-base font-serif font-bold text-zinc-900">
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
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 focus:border-black focus:outline-none"
                />
              </div>

              {/* Message Draft */}
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Confirmation Message Draft
                </label>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-300 text-xs font-sans text-zinc-900 focus:border-black focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
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

      {/* ================= RESCHEDULE CONSULTATION MODAL ================= */}
      <AnimatePresence>
        {rescheduleBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900">
                      Reschedule Consultation Slot
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Rearrange appointment timing for {rescheduleBooking.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {rescheduleError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              {/* Reschedule Success State */}
              {rescheduleSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Appointment Rescheduled Successfully!</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        New slot confirmed for <strong>{formatDateLabel(rescheduleDate)}</strong> at{" "}
                        <strong>{formatTime12(rescheduleTime)}</strong>. The previous slot has been freed on the website.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 flex flex-wrap gap-2">
                    {rescheduleBooking.phone && (
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(rescheduleBooking.phone)}?text=${encodeURIComponent(
                          buildRescheduleWhatsAppMessage(rescheduleBooking, rescheduleDate, rescheduleTime)
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle size={14} />
                        <span>Send Reschedule Notice on WhatsApp</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={closeRescheduleModal}
                      className="py-2 px-4 rounded-xl bg-white border border-emerald-300 text-emerald-950 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Date Selector */}
                  <div>
                    <label className="font-bold text-zinc-900 block mb-1">
                      Select New Appointment Date <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={todayStr}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        fetchBookedSlotsForDate(e.target.value, rescheduleBooking);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Slot Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-zinc-900 block">
                        Select New Time Slot <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Selected: <strong className="text-black">{formatTime12(rescheduleTime) || "None"}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 max-h-52 overflow-y-auto p-1 border border-zinc-200 rounded-2xl bg-zinc-50/50">
                      {getAllDaySlots().map((slot) => {
                        const isSelected = rescheduleTime === slot;
                        const isCurrent =
                          rescheduleBooking.booking_time === slot &&
                          rescheduleBooking.booking_date === rescheduleDate;
                        const isOccupied = bookedSlotsForReschedule.includes(slot) && !isCurrent;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => setRescheduleTime(slot)}
                            className={`p-2 rounded-xl text-center font-mono text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-black text-[#cba758] border-[#cba758] shadow-xs"
                                : isOccupied
                                ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through"
                                : "bg-white text-zinc-800 border-zinc-200 hover:border-black"
                            }`}
                          >
                            <span className="block text-xs">{formatTime12(slot)}</span>
                            {isCurrent && (
                              <span className="block text-[8px] text-amber-700 uppercase font-bold mt-0.5">
                                Current
                              </span>
                            )}
                            {isOccupied && (
                              <span className="block text-[8px] text-rose-500 uppercase font-bold mt-0.5">
                                Taken
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={closeRescheduleModal}
                      className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime}
                      onClick={handleConfirmReschedule}
                      className="px-5 py-2 rounded-xl bg-black text-[#cba758] border border-[#cba758]/40 hover:bg-zinc-900 font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {rescheduleLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CalendarClock size={13} />
                      )}
                      <span>Confirm & Reschedule Slot</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MANUAL BOOKING / BLOCK SLOT MODAL ================= */}
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
                    <h3 className="text-base font-serif font-bold text-zinc-900">
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
                      {getAllDaySlots().map((s) => {
                        const isTaken = bookings.some(
                          (b) =>
                            b.booking_date === manualForm.bookingDate &&
                            b.booking_time === s &&
                            b.status !== "cancelled" &&
                            b.attendance !== "no_show"
                        );
                        return (
                          <option key={s} value={s}>
                            {formatTime12(s)} ({s}){isTaken ? " — ⚠️ Already Booked" : " — Available"}
                          </option>
                        );
                      })}
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
