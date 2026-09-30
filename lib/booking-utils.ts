export interface BookingRecord {
  id: string;
  booking_id?: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  sub_service?: string | null;
  booking_date: string;
  booking_time: string;
  consultation_mode: "online" | "offline";
  meet_link: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  attendance?: "attended" | "no_show" | "scheduled" | null;
  created_at: string;
}

export function generateBookingId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TLA-${year}-${randomNum}`;
}

export function getBookingId(b: { id: string; booking_id?: string; created_at?: string }): string {
  if (b.booking_id && b.booking_id.trim()) return b.booking_id;
  if (!b.id) return generateBookingId();
  if (b.id.startsWith("TLA-")) return b.id;
  const digits = b.id.replace(/\D/g, "");
  const suffix = digits.length >= 4 ? digits.slice(-4) : b.id.slice(0, 4).toUpperCase();
  const year = b.created_at ? new Date(b.created_at).getFullYear() : new Date().getFullYear();
  return `TLA-${year}-${suffix}`;
}
