export type ChamberStatus = {
  isOfficeOpen: boolean;
  isOnlineOpen: boolean;
  status: "available" | "away" | "closed_for_day" | "on_leave";
  channelsAffected: "office_only" | "online_only" | "both" | "none";
  awayReason: string;
  returnEstimate: string;
  returnTime?: string;
  notice: string;
  updatedAt: string;
  // Multi-day Chamber Holiday / Vacation / Leave:
  onLeave?: boolean;
  leaveStartDate?: string; // "YYYY-MM-DD"
  leaveEndDate?: string;   // "YYYY-MM-DD"
  leaveReason?: string;    // e.g. "High Court Vacation", "Diwali Recess", "Personal Leave"
  leaveChannelsAffected?: "office_only" | "online_only" | "both";
};

/**
 * Checks if a given date string (YYYY-MM-DD) falls within the advocate's scheduled multi-day leave
 */
export function isDateInChamberLeave(
  dateStr: string,
  chamber: ChamberStatus,
  mode?: "offline" | "online" | null
): boolean {
  if (!chamber.onLeave || !chamber.leaveStartDate || !chamber.leaveEndDate) {
    return false;
  }
  if (dateStr >= chamber.leaveStartDate && dateStr <= chamber.leaveEndDate) {
    const channel = chamber.leaveChannelsAffected || "both";
    if (channel === "both") return true;
    if (mode === "offline" && channel === "office_only") return true;
    if (mode === "online" && channel === "online_only") return true;
    if (!mode) return true;
  }
  return false;
}
