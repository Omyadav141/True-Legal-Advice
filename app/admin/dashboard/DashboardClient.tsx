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
  Archive,
  Bell,
  KeyRound,
  UserPlus,
  Shield,
  EyeOff,
  Lock,
  CheckSquare,
  Globe,
} from "lucide-react";
import { site } from "@/lib/site-config";
import { getAllDaySlots } from "@/lib/availability";
import { type BookingRecord, getBookingId } from "@/lib/booking-utils";
import type { ChamberStatus } from "@/lib/chamber-utils";
import type { ContactInquiry } from "@/lib/contacts-store";

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
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    label: "Declined / Freed",
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
    label: "Retained Client",
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
  const [role, setRole] = useState<"admin" | "secretary" | "assistant">("admin");

  // Navigation View: Dashboard vs Bookings vs Contacts vs Clients vs Chamber vs Team
  const [activeNav, setActiveNav] = useState<"dashboard" | "bookings" | "contacts" | "clients" | "chamber" | "team">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Current session staff member & Team list
  const [currentStaff, setCurrentStaff] = useState<{
    id: string;
    name: string;
    email: string;
    role: "admin" | "secretary" | "assistant";
    title: string;
    permissions: {
      canManageBookings: boolean;
      canManageInquiries: boolean;
      canViewClients: boolean;
      canManageChamber: boolean;
      canManageStaff: boolean;
    };
  } | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Helper to check capability against current staff permissions
  const canAccess = useCallback(
    (perm: "bookings" | "contacts" | "clients" | "chamber" | "team") => {
      if (!currentStaff) return true;
      if (currentStaff.role === "admin") return true;
      if (!currentStaff.permissions) return true;
      if (perm === "bookings") return currentStaff.permissions.canManageBookings !== false;
      if (perm === "contacts") return currentStaff.permissions.canManageInquiries !== false;
      if (perm === "clients") return currentStaff.permissions.canViewClients !== false;
      if (perm === "chamber") return currentStaff.permissions.canManageChamber !== false;
      if (perm === "team") return currentStaff.permissions.canManageStaff !== false;
      return true;
    },
    [currentStaff]
  );

  // Automatic redirect if activeNav points to an unauthorized view
  useEffect(() => {
    if (!currentStaff) return;
    if (activeNav === "bookings" && !canAccess("bookings")) {
      setActiveNav("dashboard");
    } else if (activeNav === "contacts" && !canAccess("contacts")) {
      setActiveNav("dashboard");
    } else if (activeNav === "clients" && !canAccess("clients")) {
      setActiveNav("dashboard");
    } else if (activeNav === "chamber" && !canAccess("chamber")) {
      setActiveNav("dashboard");
    } else if (activeNav === "team" && !canAccess("team")) {
      setActiveNav("dashboard");
    }
  }, [currentStaff, activeNav, canAccess]);

  const renderAccessRestricted = (title: string, message: string) => (
    <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4 my-8">
      <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
        <ShieldAlert size={32} />
      </div>
      <div>
        <h3 className="font-serif font-bold text-lg text-zinc-900">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setActiveNav("dashboard")}
        className="px-5 py-2.5 rounded-xl bg-black text-[#cba758] font-bold text-xs hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
      >
        Return to Dashboard Overview
      </button>
    </div>
  );

  // Notification Center with persistent cross-device synchronization
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  // Load persisted dismissed notification IDs on client mount from local storage and server
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tla_dismissed_notif_ids");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setDismissedNotifIds(parsed);
      }
    } catch {}

    // Fetch initial dismissed IDs from server for instant cross-device sync
    fetch(`/api/admin/notifications?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.dismissedIds)) {
          setDismissedNotifIds((prev) => {
            const merged = Array.from(new Set([...prev, ...data.dismissedIds]));
            try {
              localStorage.setItem("tla_dismissed_notif_ids", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleDismissNotif = async (id: string) => {
    // 1. Optimistic local update
    setDismissedNotifIds((prev) => {
      const updated = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem("tla_dismissed_notif_ids", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Persist to server for instant cross-device sync across mobile & laptop
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.dismissedIds)) {
          setDismissedNotifIds(data.dismissedIds);
        }
      }
    } catch (err) {
      console.warn("Notice: could not sync dismissed notification to server:", err);
    }
  };

  const handleClearAllNotifs = async (currentList: { id: string }[]) => {
    const ids = currentList.map((n) => n.id);
    if (ids.length === 0) return;

    // 1. Optimistic local update
    setDismissedNotifIds((prev) => {
      const updated = Array.from(new Set([...prev, ...ids]));
      try {
        localStorage.setItem("tla_dismissed_notif_ids", JSON.stringify(updated));
        localStorage.setItem("tla_last_cleared_notifs_time", Date.now().toString());
      } catch {}
      return updated;
    });

    // 2. Persist to server so clearing on laptop clears mobile and vice-versa
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.dismissedIds)) {
          setDismissedNotifIds(data.dismissedIds);
        }
      }
    } catch (err) {
      console.warn("Notice: could not sync cleared notifications to server:", err);
    }
  };

  // Profile dropdown in header
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Add Assistant / Team Modal States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    title: "Legal Assistant",
    role: "assistant" as "assistant" | "secretary",
    permissions: {
      canManageBookings: true,
      canManageInquiries: true,
      canViewClients: true,
      canManageChamber: false,
      canManageStaff: false,
    },
  });
  const [showNewStaffPw, setShowNewStaffPw] = useState(false);
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");
  const [createdStaffCreds, setCreatedStaffCreds] = useState<{ email: string; password: string; name: string } | null>(null);

  // Period Filter: Month, Quarter, Year, Custom
  const [periodFilter, setPeriodFilter] = useState<"month" | "quarter" | "year" | "all">("month");

  // Chart Category Filter (Volume Chart): "all" | "bookings" | "contacts"
  const [chartCategory, setChartCategory] = useState<"all" | "bookings" | "contacts">("all");

  // Search input
  const [searchQuery, setSearchQuery] = useState("");

  // Dedicated Booking Filter Tab: Default to "today" as requested
  const [bookingTabFilter, setBookingTabFilter] = useState<"all" | "today" | "tomorrow" | "upcoming" | "pending" | "attended" | "completed" | "declined">("today");
  // Sub-filter for Today's Slots: "remaining" (pending/confirmed consultations) vs "completed" (attended) vs "all"
  const [todaySubFilter, setTodaySubFilter] = useState<"remaining" | "completed" | "all">("remaining");

  // Dedicated Contact Inquiries Filter:
  // "all" | "new" | "contacted" | "converted" | "closed"
  const [contactStatusFilter, setContactStatusFilter] = useState<"all" | "new" | "contacted" | "converted" | "closed">("all");

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

  // Multi-Day Chamber Leave / Holiday Planner States
  const [leaveActive, setLeaveActive] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveChannelsAffected, setLeaveChannelsAffected] = useState<"both" | "office_only" | "online_only">("both");

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

  // Fetch Bookings & Contacts with optional silent background refresh
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [bookRes, contRes, statusRes, staffRes, notifRes] = await Promise.all([
        fetch(`/api/admin/bookings?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/contacts?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/chamber-status?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/staff?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/notifications?_t=${Date.now()}`, { cache: "no-store" }),
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
        if (!showStatusModal) {
          setStatusModalOfficeOpen(statusData.isOfficeOpen);
          setStatusModalOnlineOpen(statusData.isOnlineOpen);
          setStatusModalReason(statusData.awayReason || "");
          setStatusModalEstimate(statusData.returnEstimate || "");
          setLeaveActive(Boolean(statusData.onLeave));
          setLeaveStartDate(statusData.leaveStartDate || "");
          setLeaveEndDate(statusData.leaveEndDate || "");
          setLeaveReason(statusData.leaveReason || "");
          setLeaveChannelsAffected(statusData.leaveChannelsAffected || "both");
        }
      }

      if (staffRes && staffRes.ok) {
        const staffData = await staffRes.json();
        if (staffData.currentStaff) {
          setCurrentStaff(staffData.currentStaff);
          if (staffData.currentStaff.role) setRole(staffData.currentStaff.role);
        }
        if (staffData.staff) {
          setStaffList(staffData.staff);
        }
      }

      if (notifRes && notifRes.ok) {
        const notifData = await notifRes.json();
        if (Array.isArray(notifData.dismissedIds)) {
          setDismissedNotifIds((prev) => {
            const merged = Array.from(new Set([...prev, ...notifData.dismissedIds]));
            try {
              localStorage.setItem("tla_dismissed_notif_ids", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [router, showStatusModal]);

  useEffect(() => {
    loadData(false);
    // Background polling: automatically sync live bookings & inquiries every 10 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Live Notifications Computed from System Data (Accurate individual notifications & cross-device synced)
  const notificationsList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      type: "booking" | "inquiry" | "chamber" | "alert";
      actionLabel?: string;
      onClick?: () => void;
    }> = [];

    // 1. Individual Live Bookings (Recent, Pending, and Today's Consultations)
    if (canAccess("bookings")) {
      const nowMs = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      // Sort bookings so newest are evaluated first
      const sortedBookings = [...bookings].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      for (const b of sortedBookings) {
        if (b.status === "cancelled") continue;

        const isToday = b.booking_date === todayStr;
        const isPending = b.status === "pending";
        const createdMs = b.created_at ? new Date(b.created_at).getTime() : 0;
        const isRecentlyCreated = createdMs > 0 && (nowMs - createdMs) < SEVEN_DAYS_MS;
        const isUpcoming = b.booking_date >= todayStr;

        // Show individual notification for every booking that is pending review, scheduled for today, upcoming, or created in last 7 days
        if (isPending || isToday || isRecentlyCreated || isUpcoming) {
          const serviceTitle = serviceLabels[b.service] || b.service || "Legal Consultation";
          const modeLabel = b.consultation_mode === "online" ? "Online Video Meet" : "In-Chamber Visit";
          const formattedSlot = formatTime12(b.booking_time);
          const dateLabel = isToday ? "Today" : formatDateLabel(b.booking_date);

          let title = "";
          let badgeTime = dateLabel;
          let notifType: "booking" | "alert" = "booking";
          let message = "";

          if (isToday) {
            title = `Today's Session: ${b.name}`;
            message = `${formattedSlot} (${modeLabel}) · ${serviceTitle}${b.sub_service ? ` — ${b.sub_service}` : ""}`;
            badgeTime = `Today ${formattedSlot}`;
            notifType = "alert";
          } else if (isPending) {
            title = `Pending Review: ${b.name}`;
            message = `Requested for ${dateLabel} at ${formattedSlot} (${modeLabel}) · ${serviceTitle}`;
            badgeTime = "Pending";
            notifType = "alert";
          } else {
            title = `New Booking: ${b.name}`;
            message = `Scheduled for ${dateLabel} at ${formattedSlot} (${modeLabel}) · ${serviceTitle}`;
            badgeTime = dateLabel;
            notifType = "booking";
          }

          list.push({
            id: `booking-${b.id}`,
            title,
            message,
            time: badgeTime,
            type: notifType,
            actionLabel: "View Booking",
            onClick: () => {
              setActiveNav("bookings");
              setSearchQuery(b.booking_id || b.name);
              setBookingTabFilter("all");
              setNotificationOpen(false);
            },
          });
        }
      }
    }

    // 2. Individual New Contact Inquiries
    if (canAccess("contacts")) {
      const newContacts = contacts.filter((c) => c.status === "new");
      for (const c of newContacts) {
        list.push({
          id: `inquiry-${c.id}`,
          title: `New Inquiry: ${c.name}`,
          message: `${c.service || "General Inquiry"}${c.message ? ` — "${c.message.slice(0, 65)}..."` : ""}`,
          time: "New",
          type: "inquiry",
          actionLabel: "Open Inquiry",
          onClick: () => {
            setActiveNav("contacts");
            setContactStatusFilter("new");
            setSearchQuery(c.name);
            setNotificationOpen(false);
          },
        });
      }
    }

    // 3. Chamber Presence & Scheduled Vacation / Recess Notice
    if (canAccess("chamber")) {
      if (chamberStatus.onLeave) {
        list.push({
          id: `chamber-leave-${chamberStatus.leaveStartDate}-${chamberStatus.leaveEndDate}`,
          title: "Chamber Recess / Scheduled Leave",
          message: `Advocate Shareen Hussain is on leave (${chamberStatus.leaveReason || "Scheduled Leave"}) until ${formatDateLabel(chamberStatus.leaveEndDate || "")}.`,
          time: "Recess",
          type: "chamber",
          actionLabel: "Chamber Planner",
          onClick: () => {
            setActiveNav("chamber");
            setNotificationOpen(false);
          },
        });
      } else if (!chamberStatus.isOfficeOpen) {
        list.push({
          id: `chamber-away-${chamberStatus.updatedAt || "away"}`,
          title: "Chamber Office is AWAY",
          message: `Away notice: ${chamberStatus.awayReason || "Attending court proceedings"}. Estimated resume: ${chamberStatus.returnEstimate || "Later today"}.`,
          time: "Away",
          type: "chamber",
          actionLabel: "Manage Presence",
          onClick: () => {
            setActiveNav("chamber");
            setNotificationOpen(false);
          },
        });
      }
    }

    return list.filter((n) => !dismissedNotifIds.includes(n.id));
  }, [bookings, contacts, chamberStatus, todayStr, dismissedNotifIds, canAccess]);

  // Handle Change Password Form Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Both current and new passwords are required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password.");
      } else {
        setPasswordSuccess("Password updated successfully! Your credentials have been saved.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 1800);
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Add Assistant
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");

    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
      setStaffError("Name, email, and initial password are required.");
      return;
    }
    if (newStaffForm.password.length < 6) {
      setStaffError("Password must be at least 6 characters long.");
      return;
    }

    setStaffSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setStaffError(data.error || "Failed to create assistant account.");
      } else {
        setStaffSuccess(`Assistant "${newStaffForm.name}" created successfully!`);
        setCreatedStaffCreds({
          name: newStaffForm.name,
          email: newStaffForm.email,
          password: newStaffForm.password,
        });
        setStaffList((prev) => [...prev, data.staff]);
        setNewStaffForm({
          name: "",
          email: "",
          password: "",
          title: "Legal Assistant",
          role: "assistant",
          permissions: {
            canManageBookings: true,
            canManageInquiries: true,
            canViewClients: true,
            canManageChamber: false,
            canManageStaff: false,
          },
        });
      }
    } catch {
      setStaffError("Network error while creating assistant.");
    } finally {
      setStaffSubmitting(false);
    }
  };

  // Handle Toggle Permission
  const handleToggleStaffPermission = async (staffId: string, permKey: string) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target || target.role === "admin") return;

    const updatedPermissions = {
      ...target.permissions,
      [permKey]: !target.permissions[permKey],
    };

    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: staffId, permissions: updatedPermissions }),
      });
      if (res.ok) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, permissions: updatedPermissions } : s))
        );
      }
    } catch (err) {
      console.error("Failed to toggle permission:", err);
    }
  };

  // Handle Delete Assistant
  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove assistant "${name}"? They will lose dashboard access immediately.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(staffId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
    }
  };

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
    isOfficeOpen?: boolean;
    isOnlineOpen?: boolean;
    awayReason?: string;
    returnEstimate?: string;
    onLeave?: boolean;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveReason?: string;
    leaveChannelsAffected?: "both" | "office_only" | "online_only";
  }) => {
    setStatusSaving(true);
    try {
      const officeOpen = preset && typeof preset.isOfficeOpen === "boolean" ? preset.isOfficeOpen : statusModalOfficeOpen;
      const onlineOpen = preset && typeof preset.isOnlineOpen === "boolean" ? preset.isOnlineOpen : statusModalOnlineOpen;
      const reason = preset && preset.awayReason !== undefined ? preset.awayReason : statusModalReason.trim();
      const estimate = preset && preset.returnEstimate !== undefined ? preset.returnEstimate : statusModalEstimate.trim();

      const onLeave = preset && typeof preset.onLeave === "boolean" ? preset.onLeave : leaveActive;
      const lStart = preset && preset.leaveStartDate !== undefined ? preset.leaveStartDate : leaveStartDate;
      const lEnd = preset && preset.leaveEndDate !== undefined ? preset.leaveEndDate : leaveEndDate;
      const lReason = preset && preset.leaveReason !== undefined ? preset.leaveReason : leaveReason.trim();
      const lChannels = preset && preset.leaveChannelsAffected ? preset.leaveChannelsAffected : leaveChannelsAffected;

      let noticeText = "";
      if (onLeave && lStart && lEnd) {
        noticeText = `Advocate Shareen Hussain is on scheduled chamber leave from ${lStart} to ${lEnd}${lReason ? ` (${lReason})` : ""}. ${
          lChannels === "office_only"
            ? "In-person visits are paused; online video consultations remain open."
            : "Chamber consultations will resume on the next business day."
        }`;
      } else if (officeOpen && onlineOpen) {
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
          status: onLeave ? "on_leave" : officeOpen ? "available" : "away",
          channelsAffected: onLeave ? lChannels : !officeOpen && !onlineOpen ? "both" : !officeOpen ? "office_only" : "none",
          awayReason: reason,
          returnEstimate: estimate,
          notice: noticeText,
          onLeave,
          leaveStartDate: lStart,
          leaveEndDate: lEnd,
          leaveReason: lReason,
          leaveChannelsAffected: lChannels,
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

  // Attendance Updater (Mark if customer came and completed)
  async function updateAttendance(
    id: string,
    attendance: "attended" | "no_show" | "scheduled",
    statusOverride?: Booking["status"]
  ) {
    setUpdatingId(id);
    const newStatus = statusOverride ?? (attendance === "attended" ? "completed" : attendance === "scheduled" ? "confirmed" : undefined);
    const body: Record<string, any> = { id, attendance };
    if (newStatus) body.status = newStatus;

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  attendance,
                  ...(newStatus ? { status: newStatus } : {}),
                }
              : b
          )
        );
        if (selectedRecord && selectedRecord.data.id === id) {
          setSelectedRecord((prev) =>
            prev
              ? {
                  ...prev,
                  data: {
                    ...prev.data,
                    attendance,
                    ...(newStatus ? { status: newStatus } : {}),
                  },
                }
              : null
          );
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
    if (!window.confirm("Permanently delete this contact inquiry? This action cannot be undone.")) return;
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

  // Overall Statistics for Dashboard View ONLY
  const dashboardStats = useMemo(() => {
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

  // Specific Booking Metrics for "Bookings & Slots" View ONLY
  const bookingMetrics = useMemo(() => {
    const todayAll = bookings.filter((b) => b.booking_date === todayStr && b.status !== "cancelled" && b.attendance !== "no_show");
    const todayCount = todayAll.length;
    const todayRemainingCount = todayAll.filter((b) => b.attendance !== "attended" && b.status !== "completed").length;
    const todayCompletedCount = todayAll.filter((b) => b.attendance === "attended" || b.status === "completed").length;
    const tomorrowCount = bookings.filter((b) => b.booking_date === tomorrowStr && b.status !== "cancelled" && b.attendance !== "no_show").length;
    const upcomingCount = bookings.filter((b) => b.booking_date > tomorrowStr && b.status !== "cancelled" && b.attendance !== "no_show").length;
    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const attendedCount = bookings.filter((b) => b.attendance === "attended").length;
    const completedCount = bookings.filter((b) => b.status === "completed").length;
    const declinedCount = bookings.filter((b) => b.status === "cancelled" || b.attendance === "no_show").length;
    const totalActive = bookings.filter((b) => b.status !== "cancelled" && b.attendance !== "no_show").length;

    return {
      todayCount,
      todayRemainingCount,
      todayCompletedCount,
      tomorrowCount,
      upcomingCount,
      pendingCount,
      attendedCount,
      completedCount,
      declinedCount,
      totalActive,
    };
  }, [bookings, todayStr, tomorrowStr]);

  // Specific Contact Inquiry Metrics
  const contactMetrics = useMemo(() => {
    const newCount = contacts.filter((c) => c.status === "new").length;
    const contactedCount = contacts.filter((c) => c.status === "contacted").length;
    const convertedCount = contacts.filter((c) => c.status === "converted").length;
    const closedCount = contacts.filter((c) => c.status === "closed").length;
    return {
      total: contacts.length,
      newCount,
      contactedCount,
      convertedCount,
      closedCount,
    };
  }, [contacts]);

  // Chart Data 1: Volume Stacked Bars (4 Time Buckets)
  const volumeChartData = useMemo(() => {
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

  // Filtered Bookings for the Dedicated Bookings View (strictly separated by time & status)
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    if (bookingTabFilter === "today") {
      if (todaySubFilter === "remaining") {
        list = list.filter(
          (b) =>
            b.booking_date === todayStr &&
            b.status !== "cancelled" &&
            b.attendance !== "attended" &&
            b.status !== "completed"
        );
      } else if (todaySubFilter === "completed") {
        list = list.filter(
          (b) =>
            b.booking_date === todayStr &&
            (b.attendance === "attended" || b.status === "completed")
        );
      } else {
        list = list.filter((b) => b.booking_date === todayStr && b.status !== "cancelled");
      }
    } else if (bookingTabFilter === "tomorrow") {
      list = list.filter((b) => b.booking_date === tomorrowStr && b.status !== "cancelled");
    } else if (bookingTabFilter === "upcoming") {
      list = list.filter((b) => b.booking_date > tomorrowStr && b.status !== "cancelled");
    } else if (bookingTabFilter === "pending") {
      list = list.filter((b) => b.status === "pending");
    } else if (bookingTabFilter === "attended") {
      list = list.filter((b) => b.attendance === "attended");
    } else if (bookingTabFilter === "completed") {
      list = list.filter((b) => b.status === "completed");
    } else if (bookingTabFilter === "declined") {
      list = list.filter((b) => b.status === "cancelled" || b.attendance === "no_show");
    } else {
      // "all": Active, not declined or no-show
      list = list.filter((b) => b.status !== "cancelled" && b.attendance !== "no_show");
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
      if (a.booking_date === todayStr && b.booking_date !== todayStr) return -1;
      if (b.booking_date === todayStr && a.booking_date !== todayStr) return 1;
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings, bookingTabFilter, todaySubFilter, searchQuery, todayStr, tomorrowStr]);

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
    <div className="h-screen max-h-screen bg-[#f1f3f7] text-[#09090b] flex flex-col antialiased overflow-hidden">
      {/* ================= TOP APPLICATION HEADER ================= */}
      <header className="shrink-0 bg-[#1b1f2b] text-white border-b border-[#2d3243] sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle navigation drawer"
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

        {/* Right Controls: Chamber Status Badge, View Website, Notifications, Refresh, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Quick Link to Live Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-[#cba758]/20 text-slate-200 hover:text-[#cba758] border border-white/10 hover:border-[#cba758]/40 font-medium text-xs transition-all cursor-pointer shadow-xs"
            title="Open live True Legal Advice website in a new tab"
          >
            <Globe size={13} className="text-[#cba758]" />
            <span className="hidden md:inline font-semibold">View Website</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>

          {/* Quick Chamber Away / Open Indicator */}
          {canAccess("chamber") && (
            <button
              type="button"
              onClick={() => setActiveNav("chamber")}
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
          )}

          {/* Real Notification Center Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileDropdownOpen(false);
              }}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer relative"
              title="Chamber Notifications"
            >
              <Bell size={14} className={notificationsList.length > 0 ? "text-[#cba758]" : ""} />
              {notificationsList.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {notificationsList.length}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#181b22] border border-[#cba758]/30 shadow-2xl p-4 z-50 text-xs text-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-[#cba758]" />
                    <span className="font-bold text-white text-sm">Chamber Notifications</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#cba758]/20 text-[#cba758] font-mono text-[10px] font-bold">
                      {notificationsList.length}
                    </span>
                  </div>
                  {notificationsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleClearAllNotifs(notificationsList)}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notificationsList.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
                      <p className="font-semibold text-white">All caught up!</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">No urgent notifications right now.</p>
                    </div>
                  ) : (
                    notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#cba758]/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            {notif.type === "booking" && <Calendar size={12} className="text-[#cba758]" />}
                            {notif.type === "alert" && <Clock size={12} className="text-amber-400" />}
                            {notif.type === "inquiry" && <MessageSquare size={12} className="text-blue-400" />}
                            {notif.type === "chamber" && <Building2 size={12} className="text-emerald-400" />}
                            <span>{notif.title}</span>
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9.5px] font-mono text-[#cba758] bg-[#cba758]/10 px-1.5 py-0.5 rounded">
                              {notif.time}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissNotif(notif.id);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Dismiss notification"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.onClick && (
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={notif.onClick}
                              className="text-[10.5px] font-bold text-[#cba758] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{notif.actionLabel || "View Details"}</span>
                              <ChevronRight size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissNotif(notif.id);
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Refresh / Sync Button */}
          <button
            type="button"
            onClick={() => loadData(false)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Auto-syncing every 10 seconds. Click to refresh live database now."
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#cba758]" : "text-emerald-400"} />
            <span className="hidden sm:inline font-semibold">Sync</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Live 10s</span>
            </span>
          </button>

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2 pl-2 border-l border-slate-700 hover:opacity-90 transition-opacity cursor-pointer text-left"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#cba758] to-amber-200 text-black font-bold text-xs flex items-center justify-center font-mono">
                {currentStaff ? getInitials(currentStaff.name) : "SH"}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-white block leading-none">
                  {currentStaff ? currentStaff.name : "Adv. Shareen"}
                </span>
                <span className="text-[9.5px] text-slate-400 font-mono block mt-0.5">
                  {currentStaff ? currentStaff.title : "High Court Desk"}
                </span>
              </div>
              <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#181b22] border border-[#cba758]/30 shadow-2xl p-2 z-50 text-xs text-slate-200 space-y-1">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="font-bold text-white text-xs truncate">
                    {currentStaff?.name || "Adv. Shareen Hussain"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    {currentStaff?.email || "shareenhussain@truelegaladvice.com"}
                  </p>
                  <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-[#cba758]/20 text-[#cba758]">
                    {currentStaff?.role === "admin" ? "Master Advocate" : currentStaff?.title || "Staff Assistant"}
                  </span>
                </div>

                {/* Change Password Option */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setShowPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <KeyRound size={14} className="text-[#cba758]" />
                  <span>Change Password</span>
                </button>

                {/* Team & Assistants Option (if allowed) */}
                {canAccess("team") && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveNav("team");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <UserCheck size={14} className="text-[#cba758]" />
                    <span>Team & Assistants</span>
                  </button>
                )}

                <div className="border-t border-white/10 my-1" />

                {/* Logout Option */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER: SIDEBAR + CONTENT AREA ================= */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          />
        )}

        {/* ================= PERSISTENT DARK SIDEBAR ================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1f2430] text-slate-300 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col shrink-0 border-r border-[#2c3243] shadow-2xl md:shadow-none h-full min-h-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Sidebar Header Title */}
          <div className="px-5 py-4 border-b border-[#2c3243] flex items-center justify-between shrink-0">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Admin Portal
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto min-h-0">
            {/* 1. Dashboard Overview */}
            <button
              type="button"
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
                <span>Dashboard Overview</span>
              </div>
              {dashboardStats.pendingAction > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* 2. Bookings & Slots (defaults to Today's Slots) */}
            {canAccess("bookings") && (
              <button
                type="button"
                onClick={() => {
                  setActiveNav("bookings");
                  setBookingTabFilter("today");
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
            )}

            {/* 3. Contact Inquiries */}
            {canAccess("contacts") && (
              <button
                type="button"
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
            )}

            {/* 4. Clients Directory */}
            {canAccess("clients") && (
              <button
                type="button"
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
            )}

            {/* 5. Chamber Status & Presence */}
            {canAccess("chamber") && (
              <button
                type="button"
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
            )}

            {/* 6. Team & Assistants (Master Admin & authorized staff) */}
            {canAccess("team") && (
              <button
                type="button"
                onClick={() => {
                  setActiveNav("team");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeNav === "team"
                    ? "bg-[#2b6cb0] text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={16} />
                  <span>Team & Assistants</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#cba758]/20 text-[#cba758] font-bold">
                  {staffList.length || 1}
                </span>
              </button>
            )}
          </nav>

          {/* Quick Shortcuts: View Website & Manual Booking */}
          <div className="shrink-0 p-3.5 border-t border-[#2c3243] space-y-2 bg-[#1f2430]">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#cba758]/15 border border-white/10 hover:border-[#cba758]/30 text-slate-300 hover:text-[#cba758] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Globe size={14} className="text-[#cba758]" />
              <span>View Live Website ↗</span>
            </a>

            <button
              type="button"
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
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>+ New Booking / Slot</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT VIEWPORT ================= */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-8 min-h-0">
          {/* ================= EXECUTIVE DARK LUXURY HERO BANNER ================= */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#cba758]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#cba758]/20 text-[#cba758] border border-[#cba758]/40">
                  {activeNav === "dashboard" && "Chamber Intelligence"}
                  {activeNav === "bookings" && "Appointments Desk"}
                  {activeNav === "contacts" && "Client Leads Inbox"}
                  {activeNav === "clients" && "Chamber Directory"}
                  {activeNav === "chamber" && "Chamber Presence"}
                  {activeNav === "team" && "Chamber Administration"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {activeNav === "dashboard" && "Executive Analytics & Metrics"}
                  {activeNav === "bookings" && "Real-Time Consultation Schedule"}
                  {activeNav === "contacts" && "Direct Website Submissions"}
                  {activeNav === "clients" && "Client Records & Matters"}
                  {activeNav === "chamber" && "Live Office & Online Notice"}
                  {activeNav === "team" && "Role-Based Access Control"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5 flex items-center gap-2">
                <span>
                  {activeNav === "dashboard" && "Dashboard Overview"}
                  {activeNav === "bookings" && "Bookings & Consultations"}
                  {activeNav === "contacts" && "Website Contact Inquiries"}
                  {activeNav === "clients" && "Clients Directory"}
                  {activeNav === "chamber" && "Chamber Status & Presence"}
                  {activeNav === "team" && "Team & Assistant Management"}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#f6ad55] inline-block shadow-xs animate-pulse" />
              </h1>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                {activeNav === "dashboard" && "Executive metrics, consultation volume, practice breakdown, and today's schedule."}
                {activeNav === "bookings" && "Appointments desk: view and manage bookings by Today, Tomorrow, Upcoming, Attended, and Completed."}
                {activeNav === "contacts" && "Inquiries inbox: website client inquiries with instant one-click WhatsApp reply drafts."}
                {activeNav === "clients" && "Client directory: unique client records, contact details, and past consultation histories."}
                {activeNav === "chamber" && "Chamber availability manager: update in-person office visits and online consultation notice."}
                {activeNav === "team" && "Assistant accounts: manage logins, assign role permissions, and customize dashboard access."}
              </p>
            </div>

            {/* Right Controls in Hero Card */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
              {/* Period selector for dashboard view */}
              {activeNav === "dashboard" && (
                <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 shadow-inner">
                  {(["month", "quarter", "year", "all"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodFilter(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        periodFilter === p
                          ? "bg-gradient-to-r from-[#cba758] to-[#dfbf76] text-black font-bold shadow-xs"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      {p === "all" ? "All Time" : p}
                    </button>
                  ))}
                </div>
              )}

              {/* Month Dropdown / Date Pill */}
              <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono font-medium text-zinc-200 shadow-inner flex items-center gap-1.5">
                <CalendarDays size={13} className="text-[#cba758]" />
                <span>
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>

              {/* Team View Action: + Add Assistant */}
              {activeNav === "team" && (!currentStaff || currentStaff.permissions?.canManageStaff !== false) && (
                <button
                  type="button"
                  onClick={() => {
                    setStaffError("");
                    setStaffSuccess("");
                    setCreatedStaffCreds(null);
                    setShowAddStaffModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <UserPlus size={15} strokeWidth={2.5} />
                  <span>+ Add New Assistant</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= VIEW 1: DASHBOARD OVERVIEW ONLY ================= */}
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              {/* 5 Overall Dashboard KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Card 1: Total Clients */}
                <div
                  onClick={() => {
                    if (canAccess("clients")) setActiveNav("clients");
                  }}
                  className={`p-4 rounded-2xl bg-white border border-zinc-200 transition-all shadow-2xs ${
                    canAccess("clients") ? "cursor-pointer hover:border-[#2b6cb0]" : "cursor-default opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Clients</span>
                    <Users size={16} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{dashboardStats.totalClients}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700">
                    <span>▲ Verified client base</span>
                  </div>
                </div>

                {/* Card 2: Consultations Booked */}
                <div
                  onClick={() => {
                    if (canAccess("bookings")) {
                      setActiveNav("bookings");
                      setBookingTabFilter("all");
                    }
                  }}
                  className={`p-4 rounded-2xl bg-white border border-zinc-200 transition-all shadow-2xs ${
                    canAccess("bookings") ? "cursor-pointer hover:border-[#2b6cb0]" : "cursor-default opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Bookings</span>
                    <Calendar size={16} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{dashboardStats.totalBookings}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-zinc-500">
                    <span>Total consultations</span>
                  </div>
                </div>

                {/* Card 3: Attended / Came (Fixed light emerald theme) */}
                <div
                  onClick={() => {
                    if (canAccess("bookings")) {
                      setActiveNav("bookings");
                      setBookingTabFilter("attended");
                    }
                  }}
                  className={`p-4 rounded-2xl bg-white border border-zinc-200 transition-all shadow-2xs ${
                    canAccess("bookings") ? "cursor-pointer hover:border-emerald-500" : "cursor-default opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                      Attended / Came
                    </span>
                    <CheckCheck size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{dashboardStats.attendedCount}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-700">
                    <span>✓ Verified chamber visits</span>
                  </div>
                </div>

                {/* Card 4: Contact Inquiries */}
                <div
                  onClick={() => {
                    if (canAccess("contacts")) setActiveNav("contacts");
                  }}
                  className={`p-4 rounded-2xl bg-white border border-zinc-200 transition-all shadow-2xs ${
                    canAccess("contacts") ? "cursor-pointer hover:border-blue-500" : "cursor-default opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between text-blue-800">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Inquiries</span>
                    <MessageSquare size={16} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-blue-900 mt-2">{dashboardStats.totalContacts}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-blue-700">
                    <span>Web contact forms</span>
                  </div>
                </div>

                {/* Card 5: Needs Action */}
                <div
                  onClick={() => {
                    if (canAccess("bookings")) {
                      setActiveNav("bookings");
                      setBookingTabFilter("pending");
                    }
                  }}
                  className={`p-4 rounded-2xl bg-white border border-zinc-200 transition-all shadow-2xs ${
                    canAccess("bookings") ? "cursor-pointer hover:border-amber-500" : "cursor-default opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Needs Action</span>
                    <Clock size={16} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-serif font-bold text-amber-900">{dashboardStats.pendingAction}</p>
                    {dashboardStats.pendingAction > 0 && (
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

              {/* Charts Row: Volume Bar Chart + Practice Areas Donut Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card (8 cols): Volume Stacked Bars */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-zinc-900">
                        Consultation & Inquiry Volume
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Weekly intake activity across all chamber practice tracks
                      </p>
                    </div>

                    <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 text-xs font-medium">
                      {(["all", "bookings", "contacts"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
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
                        const circumference = 2 * Math.PI * 38;
                        return practiceDonutData.map((seg) => {
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

              {/* Today's Urgent Schedule Preview */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#cba758]" />
                    <h3 className="font-serif font-bold text-sm text-zinc-900">
                      Today&apos;s Chamber Schedule ({dashboardStats.todayBookings.length} Appointments)
                    </h3>
                  </div>
                  {canAccess("bookings") && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNav("bookings");
                        setBookingTabFilter("today");
                      }}
                      className="text-xs font-semibold text-[#2b6cb0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Today in Bookings</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>

                {dashboardStats.todayBookings.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No consultation appointments scheduled for today yet.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 overflow-x-auto">
                    {dashboardStats.todayBookings.map((b) => (
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
                            type="button"
                            onClick={() => openConfirmModal(b)}
                            className="px-2.5 py-1 rounded-lg bg-black text-[#cba758] hover:bg-zinc-900 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW 2: DEDICATED BOOKINGS & SLOTS ONLY ================= */}
          {activeNav === "bookings" && (
            canAccess("bookings") ? (
              <div className="space-y-4">
              {/* Dedicated Booking Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Today's Slots */}
                <div
                  onClick={() => setBookingTabFilter("today")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-[#cba758] ${
                    bookingTabFilter === "today"
                      ? "border-[#cba758] ring-2 ring-[#cba758]/25 bg-amber-50/20"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#9f7d32]">
                      Today&apos;s Slots
                    </span>
                    <CalendarDays size={15} className="text-[#cba758]" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1.5">
                    {bookingMetrics.todayCount}
                  </p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Scheduled for today</p>
                </div>

                {/* 2. Tomorrow's Slots */}
                <div
                  onClick={() => setBookingTabFilter("tomorrow")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-[#2b6cb0] ${
                    bookingTabFilter === "tomorrow"
                      ? "border-[#2b6cb0] ring-2 ring-[#2b6cb0]/25 bg-blue-50/20"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-blue-700">
                      Tomorrow
                    </span>
                    <Calendar size={15} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1.5">
                    {bookingMetrics.tomorrowCount}
                  </p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Upcoming tomorrow</p>
                </div>

                {/* 3. Upcoming (Future) */}
                <div
                  onClick={() => setBookingTabFilter("upcoming")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-purple-500 ${
                    bookingTabFilter === "upcoming"
                      ? "border-purple-500 ring-2 ring-purple-500/25 bg-purple-50/20"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-purple-700">
                      Upcoming
                    </span>
                    <CalendarClock size={15} className="text-purple-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1.5">
                    {bookingMetrics.upcomingCount}
                  </p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Future booked slots</p>
                </div>

                {/* 4. Awaiting Review */}
                <div
                  onClick={() => setBookingTabFilter("pending")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-amber-500 ${
                    bookingTabFilter === "pending"
                      ? "border-amber-500 ring-2 ring-amber-500/25 bg-amber-50/30"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">
                      Awaiting Review
                    </span>
                    <Clock size={15} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <p className="text-2xl font-serif font-bold text-amber-900">
                      {bookingMetrics.pendingCount}
                    </p>
                    {bookingMetrics.pendingCount > 0 && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Needs confirmation</p>
                </div>

                {/* 5. Attended / Came (Fixed clean emerald theme) */}
                <div
                  onClick={() => setBookingTabFilter("attended")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-emerald-500 ${
                    bookingTabFilter === "attended"
                      ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/40"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                      Attended / Came
                    </span>
                    <CheckCheck size={15} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1.5">
                    {bookingMetrics.attendedCount}
                  </p>
                  <p className="text-[10.5px] text-emerald-700 mt-0.5">Verified chamber visits</p>
                </div>
              </div>

              {/* Action Bar: Search Bar + Filter Tabs + New Booking */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-96">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bookings by client name, phone, or TLA-2026 ID..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Add Manual Booking / Block Slot Button */}
                  <button
                    type="button"
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
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-all"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Add Walk-in / Block Slot</span>
                  </button>
                </div>

                {/* Booking Section Time & Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-100 text-xs no-scrollbar">
                  {[
                    { id: "all", label: "All Active", count: bookingMetrics.totalActive },
                    { id: "today", label: "Today's Slots", count: bookingMetrics.todayRemainingCount > 0 ? bookingMetrics.todayRemainingCount : bookingMetrics.todayCount },
                    { id: "tomorrow", label: "Tomorrow", count: bookingMetrics.tomorrowCount },
                    { id: "upcoming", label: "Upcoming", count: bookingMetrics.upcomingCount },
                    { id: "pending", label: "Awaiting Review", count: bookingMetrics.pendingCount },
                    { id: "attended", label: "Attended / Came", count: bookingMetrics.attendedCount },
                    { id: "completed", label: "Completed", count: bookingMetrics.completedCount },
                    { id: "declined", label: "Declined / Freed", count: bookingMetrics.declinedCount },
                  ].map((tab) => {
                    const isSelected = bookingTabFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBookingTabFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? tab.id === "attended"
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : tab.id === "today"
                              ? "bg-[#cba758] text-black font-bold shadow-xs"
                              : "bg-black text-white font-bold shadow-xs"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isSelected ? "bg-white/20 text-white" : "bg-black/5 text-zinc-500"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-filter Selector for Today's Slots */}
                {bookingTabFilter === "today" && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setTodaySubFilter("remaining")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          todaySubFilter === "remaining"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <span>⏳ Remaining Consultations</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            todaySubFilter === "remaining"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {bookingMetrics.todayRemainingCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTodaySubFilter("completed")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          todaySubFilter === "completed"
                            ? "bg-white text-emerald-800 shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <span>✓ Attended & Completed</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            todaySubFilter === "completed"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {bookingMetrics.todayCompletedCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTodaySubFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          todaySubFilter === "all"
                            ? "bg-white text-zinc-900 shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <span>All Today ({bookingMetrics.todayCount})</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-500">
                      {todaySubFilter === "remaining"
                        ? `${bookingMetrics.todayRemainingCount} slot${bookingMetrics.todayRemainingCount === 1 ? "" : "s"} awaiting attendance today`
                        : todaySubFilter === "completed"
                        ? `${bookingMetrics.todayCompletedCount} client${bookingMetrics.todayCompletedCount === 1 ? "" : "s"} attended today`
                        : `Total ${bookingMetrics.todayCount} consultation slot${bookingMetrics.todayCount === 1 ? "" : "s"} scheduled today`}
                    </span>
                  </div>
                )}
              </div>

              {/* Bookings Container */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 size={30} className="animate-spin text-[#cba758] mx-auto mb-2" />
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                      Loading bookings desk...
                    </p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="py-16 px-6 text-center max-w-sm mx-auto">
                    {bookingTabFilter === "today" && todaySubFilter === "remaining" && bookingMetrics.todayCompletedCount > 0 ? (
                      <>
                        <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-sm text-zinc-900">All Today's Consultations Completed! 🎉</h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          All {bookingMetrics.todayCompletedCount} client consultation{bookingMetrics.todayCompletedCount === 1 ? "" : "s"} scheduled for today have been attended.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTodaySubFilter("completed")}
                          className="mt-3.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          <span>View Completed Consultations ({bookingMetrics.todayCompletedCount})</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Calendar size={32} className="text-zinc-400 mx-auto mb-2" />
                        <h4 className="font-bold text-sm text-zinc-900">No Appointments Found</h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {searchQuery
                            ? `No bookings match "${searchQuery}".`
                            : "No appointments match this timing tab."}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setBookingTabFilter("all");
                          }}
                          className="mt-3 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Show All Active Slots
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View (Scrollable container with sticky header so buttons never push down) */}
                    <div className="hidden sm:block overflow-x-auto max-h-[580px] overflow-y-auto rounded-xl border border-zinc-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-zinc-100/95 backdrop-blur-xs shadow-2xs border-b border-zinc-200">
                          <tr className="text-zinc-700 font-mono text-[11px] uppercase tracking-wider">
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
                                          type="button"
                                          onClick={() => openConfirmModal(b)}
                                          className="px-2 py-0.5 rounded bg-black text-[#cba758] text-[10px] font-bold hover:bg-zinc-900 cursor-pointer"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => discardBooking(b.id)}
                                          className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[10px] font-bold cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Attendance Column */}
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
                                    <button
                                      type="button"
                                      onClick={() => openConfirmModal(b)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                      title="WhatsApp Dispatch & Confirm"
                                    >
                                      <MessageCircle size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openRescheduleModal(b)}
                                      className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                      title="Reschedule Appointment Slot"
                                    >
                                      <CalendarClock size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRecord({ type: "booking", data: b })}
                                      className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                                      title="View Case Details"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      type="button"
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

                    {/* Mobile Touch Cards View (Max-height scroll container so controls stay top) */}
                    <div className="sm:hidden divide-y divide-zinc-200 max-h-[580px] overflow-y-auto rounded-xl border border-zinc-200">
                      {filteredBookings.map((b) => {
                        const statusMeta = statusStyles[b.status] || statusStyles.pending;
                        const isAttended = b.attendance === "attended";
                        const isNoShow = b.attendance === "no_show";

                        return (
                          <div key={b.id} className="p-4 space-y-3 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-zinc-900">{b.name}</span>
                                  <span className="font-mono text-[10px] font-bold text-[#9f7d32] bg-[#cba758]/10 px-1.5 py-0.5 rounded">
                                    {b.booking_id || getBookingId(b)}
                                  </span>
                                </div>
                                <a
                                  href={`tel:${b.phone}`}
                                  className="font-mono text-xs text-blue-600 font-semibold block mt-0.5"
                                >
                                  📞 {b.phone}
                                </a>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            {/* Slot & Service Box */}
                            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                                  <Clock size={13} className="text-[#cba758]" />
                                  <span>{formatTime12(b.booking_time)}</span>
                                  <span className="text-zinc-400 font-normal">· {formatDateLabel(b.booking_date)}</span>
                                </div>
                                <span className="text-[11px] text-zinc-600 block mt-0.5 truncate max-w-[200px]">
                                  {b.sub_service || serviceLabels[b.service] || b.service}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                                  b.consultation_mode === "online"
                                    ? "bg-purple-50 text-purple-800 border-purple-200"
                                    : "bg-zinc-100 text-zinc-800 border-zinc-200"
                                }`}
                              >
                                {b.consultation_mode === "online" ? "Meet 📹" : "Office 🏛️"}
                              </span>
                            </div>

                            {/* Thumb-friendly mobile action buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  updateAttendance(b.id, isAttended ? "scheduled" : "attended");
                                  if (b.status === "cancelled") updateBookingStatus(b.id, "confirmed");
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                                  isAttended
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-white text-zinc-800 border-zinc-300 hover:border-emerald-600"
                                }`}
                              >
                                <Check size={14} strokeWidth={2.5} className={isAttended ? "text-emerald-700" : ""} />
                                <span>{isAttended ? "Came ✓" : "Mark Came"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openConfirmModal(b)}
                                className="py-2 px-3 rounded-xl bg-black text-[#cba758] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp</span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 text-xs">
                              <button
                                type="button"
                                onClick={() => openRescheduleModal(b)}
                                className="py-1 px-2.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <CalendarClock size={12} />
                                <span>Reschedule</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedRecord({ type: "booking", data: b })}
                                  className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteBookingPermanently(b.id)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
            ) : (
              renderAccessRestricted(
                "Bookings Access Restricted",
                "Your assistant profile does not have permission to view or manage consultation appointments. Please contact Adv. Shareen Hussain if you require access."
              )
            )
          )}

          {/* ================= VIEW 3: DEDICATED CONTACT INQUIRIES ONLY ================= */}
          {activeNav === "contacts" && (
            canAccess("contacts") ? (
              <div className="space-y-4">
              {/* Dedicated Inquiries Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setContactStatusFilter("all")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    contactStatusFilter === "all" ? "border-blue-600 ring-2 ring-blue-600/20" : "border-zinc-200"
                  }`}
                >
                  <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-blue-700">
                    Total Inquiries
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1">{contactMetrics.total}</p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">All received forms</p>
                </div>

                <div
                  onClick={() => setContactStatusFilter("new")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    contactStatusFilter === "new" ? "border-blue-600 ring-2 ring-blue-600/20" : "border-zinc-200"
                  }`}
                >
                  <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-blue-700">
                    New / Unread
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-2xl font-serif font-bold text-blue-900">{contactMetrics.newCount}</p>
                    {contactMetrics.newCount > 0 && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-blue-600 mt-0.5">Fresh inquiries</p>
                </div>

                <div
                  onClick={() => setContactStatusFilter("contacted")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    contactStatusFilter === "contacted" ? "border-purple-600 ring-2 ring-purple-600/20" : "border-zinc-200"
                  }`}
                >
                  <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-purple-700">
                    Contacted
                  </div>
                  <p className="text-2xl font-serif font-bold text-purple-900 mt-1">{contactMetrics.contactedCount}</p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Replied on WhatsApp/call</p>
                </div>

                <div
                  onClick={() => setContactStatusFilter("converted")}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs ${
                    contactStatusFilter === "converted" ? "border-black ring-2 ring-black/20" : "border-zinc-200"
                  }`}
                >
                  <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#9f7d32]">
                    Retained Clients
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-1">{contactMetrics.convertedCount}</p>
                  <p className="text-[10.5px] text-zinc-500 mt-0.5">Converted to mandate</p>
                </div>
              </div>

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
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
                    {(["all", "new", "contacted", "converted", "closed"] as const).map((st) => {
                      const isSelected = contactStatusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setContactStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
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

              {/* Inquiries Container */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 size={30} className="animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                      Loading inquiries inbox...
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
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setContactStatusFilter("all");
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
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

                                <td className="py-3 px-4 max-w-[180px]">
                                  <span className="font-semibold text-zinc-900 block truncate">
                                    {c.service}
                                  </span>
                                </td>

                                <td className="py-3 px-4 max-w-[280px]">
                                  <p className="text-zinc-600 truncate text-[11px]">
                                    &ldquo;{c.message || "No message body"}&rdquo;
                                  </p>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                                  {formatDateLabel(c.created_at.slice(0, 10))}
                                </td>

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

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
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

                                    <a
                                      href={`tel:${c.phone}`}
                                      className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                      title="Call Sender"
                                    >
                                      <Phone size={13} />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedRecord({ type: "contact", data: c })}
                                      className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                      title="View Full Message"
                                    >
                                      <Eye size={13} />
                                    </button>

                                    <button
                                      type="button"
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

                    {/* Mobile Touch Cards View */}
                    <div className="sm:hidden divide-y divide-zinc-200">
                      {filteredContacts.map((c) => {
                        const statusMeta = statusStyles[c.status] || statusStyles.new;

                        return (
                          <div key={c.id} className="p-4 space-y-3 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-sm text-zinc-900 block">{c.name}</span>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 mt-0.5">
                                  <span>{c.phone}</span>
                                  {c.email && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate max-w-[120px]">{c.email}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <select
                                value={c.status}
                                onChange={(e) =>
                                  updateContactStatus(c.id, e.target.value as ContactInquiry["status"])
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} focus:outline-none`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>

                            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
                              <span className="font-semibold text-zinc-900 block">{c.service}</span>
                              <p className="text-zinc-600 text-[11.5px] leading-relaxed">
                                &ldquo;{c.message || "No message body"}&rdquo;
                              </p>
                              <span className="font-mono text-[10px] text-zinc-400 block pt-1">
                                Received: {formatDateLabel(c.created_at.slice(0, 10))}
                              </span>
                            </div>

                            {/* Mobile Actions */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <a
                                href={`https://wa.me/${formatWhatsAppNumber(c.phone)}?text=${encodeURIComponent(
                                  buildContactReplyWhatsApp(c)
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => updateContactStatus(c.id, "contacted")}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp Reply</span>
                              </a>
                              <a
                                href={`tel:${c.phone}`}
                                className="p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                title="Call"
                              >
                                <Phone size={14} />
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteContactInquiry(c.id)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
            ) : (
              renderAccessRestricted(
                "Contact Inquiries Access Restricted",
                "Your assistant profile does not have permission to view or respond to website contact inquiries. Please contact Adv. Shareen Hussain if you require access."
              )
            )
          )}

          {/* ================= VIEW 4: DEDICATED CLIENTS DIRECTORY ONLY ================= */}
          {activeNav === "clients" && (
            canAccess("clients") ? (
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
                      type="button"
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

              {/* Clients Container */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                {filteredClients.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 text-xs">
                    No clients found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
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

                              <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-600">
                                <div>{cl.phone}</div>
                                {cl.email && <div className="text-zinc-400 truncate max-w-[140px]">{cl.email}</div>}
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                                  {cl.totalBookings}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {cl.totalContacts}
                                </span>
                              </td>

                              <td className="py-3 px-4 max-w-[200px] truncate text-zinc-800">
                                {cl.lastMatter}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                                {formatDateLabel(cl.lastDate)}
                              </td>

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

                    {/* Mobile Touch Cards View */}
                    <div className="sm:hidden divide-y divide-zinc-200">
                      {filteredClients.map((cl, idx) => (
                        <div key={cl.key} className="p-4 space-y-3 bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`h-8 w-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                  AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                }`}
                              >
                                {getInitials(cl.name)}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-zinc-900 block">{cl.name}</span>
                                <span className="font-mono text-xs text-zinc-500">{cl.phone}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold">
                                {cl.totalBookings} Consults
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                            <span className="text-zinc-500 font-mono text-[10.5px] block">Last Matter:</span>
                            <span className="font-semibold text-zinc-900 block mt-0.5">{cl.lastMatter}</span>
                            <span className="font-mono text-[10px] text-zinc-400 block mt-1">
                              Last Active: {formatDateLabel(cl.lastDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`https://wa.me/${formatWhatsAppNumber(cl.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${cl.phone}`}
                              className="py-2 px-4 rounded-xl bg-zinc-100 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200"
                            >
                              <Phone size={14} />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            ) : (
              renderAccessRestricted(
                "Clients Directory Access Restricted",
                "Your assistant profile does not have permission to browse or access the chamber clients directory. Please contact Adv. Shareen Hussain if you require access."
              )
            )
          )}

          {/* ================= VIEW 5: DEDICATED CHAMBER PRESENCE ONLY ================= */}
          {activeNav === "chamber" && (
            canAccess("chamber") ? (
              <div className="w-full space-y-6">
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
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {statusSaving && <Loader2 size={13} className="animate-spin" />}
                      <span>Save Status & Publish Notice</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= MULTI-DAY CHAMBER LEAVE & HOLIDAY PLANNER ================= */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#cba758]/20 text-[#8f6d23] border border-[#cba758]/40">
                        Chamber Calendar
                      </span>
                      <h3 className="font-serif font-bold text-base text-zinc-900">
                        Multi-Day Chamber Leave & Holiday Planner
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Schedule 3 to 4 days (or custom period) chamber vacation, court recess, or personal leave. Dates are automatically blocked on the public booking calendar.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${
                      chamberStatus.onLeave
                        ? "bg-amber-100 text-amber-900 border-amber-400 font-mono shadow-xs"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {chamberStatus.onLeave
                      ? `🏖️ On Leave: ${chamberStatus.leaveStartDate} to ${chamberStatus.leaveEndDate}`
                      : "🏛️ No Active Leave"}
                  </span>
                </div>

                {/* Quick Multi-Day Presets */}
                <div>
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                    Quick Leave Presets
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* 3 Days Leave */}
                    <button
                      type="button"
                      onClick={() => {
                        const start = todayStr;
                        const endDate = new Date(Date.now() + 3 * 86400000 + 5.5 * 3600000);
                        const end = endDate.toISOString().split("T")[0];
                        setLeaveActive(true);
                        setLeaveStartDate(start);
                        setLeaveEndDate(end);
                        setLeaveReason("Chamber Vacation / Leave");
                        setLeaveChannelsAffected("both");
                        saveChamberAvailability({
                          onLeave: true,
                          leaveStartDate: start,
                          leaveEndDate: end,
                          leaveReason: "Chamber Vacation / Leave",
                          leaveChannelsAffected: "both",
                          isOfficeOpen: false,
                          isOnlineOpen: false,
                        });
                      }}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="font-bold text-xs text-amber-950 block">🌴 3 Days Leave</span>
                      <span className="text-[11px] text-amber-800 block mt-0.5">
                        Blocks today through next 3 days on calendar.
                      </span>
                    </button>

                    {/* 4 Days Leave */}
                    <button
                      type="button"
                      onClick={() => {
                        const start = todayStr;
                        const endDate = new Date(Date.now() + 4 * 86400000 + 5.5 * 3600000);
                        const end = endDate.toISOString().split("T")[0];
                        setLeaveActive(true);
                        setLeaveStartDate(start);
                        setLeaveEndDate(end);
                        setLeaveReason("Out of Station / Hearing Trip");
                        setLeaveChannelsAffected("both");
                        saveChamberAvailability({
                          onLeave: true,
                          leaveStartDate: start,
                          leaveEndDate: end,
                          leaveReason: "Out of Station / Hearing Trip",
                          leaveChannelsAffected: "both",
                          isOfficeOpen: false,
                          isOnlineOpen: false,
                        });
                      }}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="font-bold text-xs text-amber-950 block">🌴 4 Days Leave</span>
                      <span className="text-[11px] text-amber-800 block mt-0.5">
                        Blocks today through next 4 days on calendar.
                      </span>
                    </button>

                    {/* 1 Week Court Recess */}
                    <button
                      type="button"
                      onClick={() => {
                        const start = todayStr;
                        const endDate = new Date(Date.now() + 7 * 86400000 + 5.5 * 3600000);
                        const end = endDate.toISOString().split("T")[0];
                        setLeaveActive(true);
                        setLeaveStartDate(start);
                        setLeaveEndDate(end);
                        setLeaveReason("High Court Recess / Vacation");
                        setLeaveChannelsAffected("both");
                        saveChamberAvailability({
                          onLeave: true,
                          leaveStartDate: start,
                          leaveEndDate: end,
                          leaveReason: "High Court Recess / Vacation",
                          leaveChannelsAffected: "both",
                          isOfficeOpen: false,
                          isOnlineOpen: false,
                        });
                      }}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="font-bold text-xs text-amber-950 block">⚖️ 1 Week Vacation</span>
                      <span className="text-[11px] text-amber-800 block mt-0.5">
                        High Court vacation / annual leave.
                      </span>
                    </button>

                    {/* Clear Leave / Back to Chamber */}
                    <button
                      type="button"
                      onClick={() => {
                        setLeaveActive(false);
                        setLeaveStartDate("");
                        setLeaveEndDate("");
                        setLeaveReason("");
                        saveChamberAvailability({
                          onLeave: false,
                          leaveStartDate: "",
                          leaveEndDate: "",
                          leaveReason: "",
                          isOfficeOpen: true,
                          isOnlineOpen: true,
                        });
                      }}
                      className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="font-bold text-xs text-emerald-950 block">🏛️ Back to Chamber</span>
                      <span className="text-[11px] text-emerald-800 block mt-0.5">
                        End leave & resume normal booking slots immediately.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Custom Leave Dates & Settings */}
                <div className="space-y-4 pt-3 border-t border-zinc-100 text-xs">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-900 text-sm">
                      <input
                        type="checkbox"
                        checked={leaveActive}
                        onChange={(e) => setLeaveActive(e.target.checked)}
                        className="h-4 w-4 rounded accent-black"
                      />
                      <span>Enable Scheduled Chamber Leave</span>
                    </label>
                  </div>

                  {leaveActive && (
                    <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Leave Start Date
                          </label>
                          <input
                            type="date"
                            value={leaveStartDate}
                            onChange={(e) => setLeaveStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Leave End Date (Return Day)
                          </label>
                          <input
                            type="date"
                            value={leaveEndDate}
                            onChange={(e) => setLeaveEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 font-mono focus:border-black focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Reason / Occasion
                          </label>
                          <input
                            type="text"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            placeholder="e.g. Diwali Vacation, Court Recess, Personal"
                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Channels affected */}
                      <div>
                        <label className="font-bold text-zinc-800 block mb-1.5">
                          Consultation Channels Affected During Leave
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setLeaveChannelsAffected("both")}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              leaveChannelsAffected === "both"
                                ? "bg-black text-[#cba758] border-[#cba758] shadow-xs"
                                : "bg-white text-zinc-700 border-zinc-200"
                            }`}
                          >
                            <span className="font-bold text-xs block">Full Chamber Closure</span>
                            <span className="text-[11px] opacity-80 block">Both office visits & online video consultations paused.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setLeaveChannelsAffected("office_only")}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              leaveChannelsAffected === "office_only"
                                ? "bg-black text-[#cba758] border-[#cba758] shadow-xs"
                                : "bg-white text-zinc-700 border-zinc-200"
                            }`}
                          >
                            <span className="font-bold text-xs block">In-Person Office Visits Only</span>
                            <span className="text-[11px] opacity-80 block">Office visits paused; Google Meet video consultations stay open.</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => saveChamberAvailability()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {statusSaving && <Loader2 size={13} className="animate-spin" />}
                      <span>Save Chamber Leave & Publish Notice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              renderAccessRestricted(
                "Chamber Presence Access Restricted",
                "Your assistant profile does not have permission to modify live chamber presence or status notices. Please contact Adv. Shareen Hussain if you require access."
              )
            )
          )}

          {/* ================= VIEW 6: TEAM & ASSISTANTS MANAGEMENT ================= */}
          {activeNav === "team" && (
            canAccess("team") ? (
              <div className="space-y-6">
              {/* Staff Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Staff</span>
                    <Users size={16} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">{staffList.length}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Active chamber accounts</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Assistants</span>
                    <UserCheck size={16} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-zinc-900 mt-2">
                    {staffList.filter((s) => s.role !== "admin").length}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Delegated staff members</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
                  <div className="flex items-center justify-between text-[#9f7d32]">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Head of Chambers</span>
                    <Shield size={16} />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 mt-2 truncate">Adv. Shareen Hussain</p>
                  <p className="text-[11px] text-[#9f7d32] mt-0.5 font-medium">Permanent Master Admin</p>
                </div>
              </div>

              {/* Staff Members Roster */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-zinc-900">
                      Chamber Staff Directory & Permissions
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Toggle active permissions to instantly grant or revoke access to dashboard modules.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-zinc-200">
                  {staffList.map((member) => {
                    const isMaster = member.role === "admin";
                    return (
                      <div key={member.id} className="p-4 sm:p-6 space-y-4 hover:bg-zinc-50/60 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-11 w-11 rounded-2xl font-mono font-bold text-sm flex items-center justify-center shrink-0 ${
                                isMaster
                                  ? "bg-black text-[#cba758] border border-[#cba758]/50 shadow-md"
                                  : "bg-zinc-800 text-white"
                              }`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-zinc-900">{member.name}</h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                    isMaster
                                      ? "bg-black text-[#cba758] border-[#cba758]/40"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {isMaster ? "Master Admin" : member.role}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600 font-mono mt-0.5">{member.email}</p>
                              <span className="text-[11px] text-zinc-500 block mt-0.5 font-sans font-medium">
                                {member.title}
                              </span>
                            </div>
                          </div>

                          {!isMaster && (!currentStaff || currentStaff.permissions?.canManageStaff !== false) && (
                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(member.id, member.name)}
                                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 size={13} />
                                <span>Remove Assistant</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Permission Pills / Toggle Switchboard */}
                        <div className="pt-2 border-t border-zinc-100">
                          <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                            Assigned Dashboard Powers & Modules
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {/* 1. Bookings Desk */}
                            <div
                              onClick={() => {
                                if (!isMaster) handleToggleStaffPermission(member.id, "canManageBookings");
                              }}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isMaster
                                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                                  : member.permissions?.canManageBookings
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 cursor-pointer hover:bg-emerald-100"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-pointer hover:bg-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Calendar size={13} />
                                  <span>Bookings Desk</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold">
                                  {isMaster || member.permissions?.canManageBookings ? "✓ ON" : "✕ OFF"}
                                </span>
                              </div>
                              <p className="text-[10px] mt-1 opacity-80">
                                Confirm slots, reschedule, attendance
                              </p>
                            </div>

                            {/* 2. Web Inquiries */}
                            <div
                              onClick={() => {
                                if (!isMaster) handleToggleStaffPermission(member.id, "canManageInquiries");
                              }}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isMaster
                                  ? "bg-blue-50/80 border-blue-300 text-blue-900"
                                  : member.permissions?.canManageInquiries
                                  ? "bg-blue-50 border-blue-300 text-blue-800 cursor-pointer hover:bg-blue-100"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-pointer hover:bg-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <MessageSquare size={13} />
                                  <span>Inquiries Inbox</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold">
                                  {isMaster || member.permissions?.canManageInquiries ? "✓ ON" : "✕ OFF"}
                                </span>
                              </div>
                              <p className="text-[10px] mt-1 opacity-80">
                                View website forms, WhatsApp replies
                              </p>
                            </div>

                            {/* 3. Clients Directory */}
                            <div
                              onClick={() => {
                                if (!isMaster) handleToggleStaffPermission(member.id, "canViewClients");
                              }}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isMaster
                                  ? "bg-purple-50/80 border-purple-300 text-purple-900"
                                  : member.permissions?.canViewClients
                                  ? "bg-purple-50 border-purple-300 text-purple-800 cursor-pointer hover:bg-purple-100"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-pointer hover:bg-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Users size={13} />
                                  <span>Client Directory</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold">
                                  {isMaster || member.permissions?.canViewClients ? "✓ ON" : "✕ OFF"}
                                </span>
                              </div>
                              <p className="text-[10px] mt-1 opacity-80">
                                Client history, contact details
                              </p>
                            </div>

                            {/* 4. Chamber Presence */}
                            <div
                              onClick={() => {
                                if (!isMaster) handleToggleStaffPermission(member.id, "canManageChamber");
                              }}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isMaster
                                  ? "bg-amber-50/80 border-amber-300 text-amber-900"
                                  : member.permissions?.canManageChamber
                                  ? "bg-amber-50 border-amber-300 text-amber-800 cursor-pointer hover:bg-amber-100"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-pointer hover:bg-zinc-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Building2 size={13} />
                                  <span>Chamber Presence</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold">
                                  {isMaster || member.permissions?.canManageChamber ? "✓ ON" : "✕ OFF"}
                                </span>
                              </div>
                              <p className="text-[10px] mt-1 opacity-80">
                                Away notice, office open/closed status
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            ) : (
              renderAccessRestricted(
                "Team & Staff Access Restricted",
                "Only the Master Advocate (Adv. Shareen Hussain) and authorized administrators can manage assistant accounts and permissions."
              )
            )
          )}
        </main>

        {/* ================= MOBILE BOTTOM NAVIGATION BAR (Fixed bottom for phone usability) ================= */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1b1f2b] border-t border-[#2d3243] px-2 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md">
          {/* 1. Overview (Always visible) */}
          <button
            type="button"
            onClick={() => setActiveNav("dashboard")}
            className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
              activeNav === "dashboard" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="mt-0.5">Overview</span>
          </button>

          {/* 2. Bookings & Slots */}
          {canAccess("bookings") && (
            <button
              type="button"
              onClick={() => {
                setActiveNav("bookings");
                setBookingTabFilter("today");
              }}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all relative ${
                activeNav === "bookings" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar size={18} />
              <span className="mt-0.5">Bookings</span>
              {bookingMetrics.todayCount > 0 && (
                <span className="absolute top-0.5 right-4 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          )}

          {/* 3. Contact Inquiries */}
          {canAccess("contacts") && (
            <button
              type="button"
              onClick={() => setActiveNav("contacts")}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all relative ${
                activeNav === "contacts" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={18} />
              <span className="mt-0.5">Inquiries</span>
              {contactMetrics.newCount > 0 && (
                <span className="absolute top-0.5 right-4 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          )}

          {/* 4. Clients Directory */}
          {canAccess("clients") && (
            <button
              type="button"
              onClick={() => setActiveNav("clients")}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
                activeNav === "clients" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={18} />
              <span className="mt-0.5">Clients</span>
            </button>
          )}

          {/* 5. Chamber Status & Presence */}
          {canAccess("chamber") && (
            <button
              type="button"
              onClick={() => setActiveNav("chamber")}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
                activeNav === "chamber" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 size={18} />
              <span className="mt-0.5">Chamber</span>
            </button>
          )}

          {/* 6. Team & Assistants */}
          {canAccess("team") && (
            <button
              type="button"
              onClick={() => setActiveNav("team")}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl text-[10px] font-semibold transition-all ${
                activeNav === "team" ? "text-[#cba758] bg-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck size={18} />
              <span className="mt-0.5">Team</span>
            </button>
          )}
        </div>
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
                    type="button"
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
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
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
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  className="text-slate-400 hover:text-slate-700"
                >
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
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
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
                      type="submit"
                      disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime}
                      onClick={handleConfirmReschedule}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
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
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
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
                  type="button"
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
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md transition-all text-xs"
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

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900">Change Password</h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Update your chamber account credentials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                {/* Current Password */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter existing password"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">New Password (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new secure password"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md transition-all text-xs"
                  >
                    {passwordLoading && <Loader2 size={13} className="animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ADD ASSISTANT MODAL ================= */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-black text-[#cba758] border border-[#cba758]/30 flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-zinc-900">Add Chamber Assistant</h3>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Create assistant login & assign customized dashboard powers
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {createdStaffCreds ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Assistant account created successfully!</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 font-mono text-xs text-zinc-800 space-y-1.5">
                    <p><strong>Name:</strong> {createdStaffCreds.name}</p>
                    <p><strong>Email:</strong> {createdStaffCreds.email}</p>
                    <p><strong>Password:</strong> {createdStaffCreds.password}</p>
                    <p><strong>Portal URL:</strong> /admin/login</p>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    Share these credentials with your assistant. They can log in immediately at the admin portal and their dashboard will only display their authorized features.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedStaffCreds(null);
                      setShowAddStaffModal(false);
                    }}
                    className="w-full py-2 rounded-xl bg-black text-[#cba758] font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
                  {staffError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-rose-600" />
                      <span>{staffError}</span>
                    </div>
                  )}

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newStaffForm.name}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newStaffForm.email}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                        placeholder="assistant@truelegaladvice.com"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Initial Password * (Min 6 chars)</label>
                      <div className="relative">
                        <input
                          type={showNewStaffPw ? "text" : "password"}
                          required
                          value={newStaffForm.password}
                          onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                          placeholder="assistant123"
                          className="w-full pl-3 pr-9 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewStaffPw(!showNewStaffPw)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showNewStaffPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Role / Job Title</label>
                      <input
                        type="text"
                        value={newStaffForm.title}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, title: e.target.value })}
                        placeholder="e.g. Legal Secretary / Junior Advocate"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Customized Role Permissions Checklist */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <label className="font-bold text-zinc-800 block font-mono text-[11px] uppercase tracking-wider">
                      Assign Dashboard Access Powers:
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-zinc-200 hover:border-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffForm.permissions.canManageBookings}
                        onChange={(e) =>
                          setNewStaffForm({
                            ...newStaffForm,
                            permissions: { ...newStaffForm.permissions, canManageBookings: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded accent-black"
                      />
                      <div>
                        <span className="font-bold text-zinc-900 block">Manage Bookings & Consultations</span>
                        <span className="text-[10.5px] text-zinc-500">Confirm slots, reschedule, view today's list, mark Came ✓</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-zinc-200 hover:border-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffForm.permissions.canManageInquiries}
                        onChange={(e) =>
                          setNewStaffForm({
                            ...newStaffForm,
                            permissions: { ...newStaffForm.permissions, canManageInquiries: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded accent-black"
                      />
                      <div>
                        <span className="font-bold text-zinc-900 block">Manage Web Contact Inquiries</span>
                        <span className="text-[10.5px] text-zinc-500">Read website client messages and dispatch WhatsApp replies</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-zinc-200 hover:border-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffForm.permissions.canViewClients}
                        onChange={(e) =>
                          setNewStaffForm({
                            ...newStaffForm,
                            permissions: { ...newStaffForm.permissions, canViewClients: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded accent-black"
                      />
                      <div>
                        <span className="font-bold text-zinc-900 block">Access Client Directory</span>
                        <span className="text-[10.5px] text-zinc-500">Search client records and view historical consultations</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-zinc-200 hover:border-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffForm.permissions.canManageChamber}
                        onChange={(e) =>
                          setNewStaffForm({
                            ...newStaffForm,
                            permissions: { ...newStaffForm.permissions, canManageChamber: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded accent-black"
                      />
                      <div>
                        <span className="font-bold text-zinc-900 block">Manage Chamber Office Presence</span>
                        <span className="text-[10.5px] text-zinc-500">Update office open/away status and publish public notice banners</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={staffSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#cba758] to-[#dfbf76] hover:from-[#b89547] hover:to-[#cba758] text-black font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md transition-all text-xs"
                    >
                      {staffSubmitting && <Loader2 size={13} className="animate-spin" />}
                      <span>Create Assistant Account</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
