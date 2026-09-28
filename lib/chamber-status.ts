import fs from "fs";
import path from "path";

export type ChamberStatus = {
  isOfficeOpen: boolean;
  isOnlineOpen: boolean;
  status: "available" | "away" | "closed_for_day";
  channelsAffected: "office_only" | "online_only" | "both" | "none";
  awayReason: string;
  returnEstimate: string;
  returnTime?: string;
  notice: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const statusFilePath = path.join(dataDir, "chamber-status.json");

const defaultStatus: ChamberStatus = {
  isOfficeOpen: true,
  isOnlineOpen: true,
  status: "available",
  channelsAffected: "none",
  awayReason: "",
  returnEstimate: "",
  returnTime: "",
  notice: "Advocate Shareen Hussain is present in chamber at Trisharan Square, Nagpur. Consultations are active.",
  updatedAt: new Date().toISOString(),
};

export function getChamberStatus(): ChamberStatus {
  try {
    if (!fs.existsSync(statusFilePath)) {
      return defaultStatus;
    }
    const raw = fs.readFileSync(statusFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      isOfficeOpen: typeof parsed.isOfficeOpen === "boolean" ? parsed.isOfficeOpen : true,
      isOnlineOpen: typeof parsed.isOnlineOpen === "boolean" ? parsed.isOnlineOpen : true,
      status: parsed.status || (parsed.isOfficeOpen === false ? "away" : "available"),
      channelsAffected: parsed.channelsAffected || (parsed.isOfficeOpen === false ? "office_only" : "none"),
      awayReason: parsed.awayReason || "",
      returnEstimate: parsed.returnEstimate || "",
      returnTime: parsed.returnTime || "",
      notice: parsed.notice || defaultStatus.notice,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to read chamber-status.json:", err);
    return defaultStatus;
  }
}

export function saveChamberStatus(update: Partial<ChamberStatus>): ChamberStatus {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const current = getChamberStatus();
    const updated: ChamberStatus = {
      isOfficeOpen: typeof update.isOfficeOpen === "boolean" ? update.isOfficeOpen : current.isOfficeOpen,
      isOnlineOpen: typeof update.isOnlineOpen === "boolean" ? update.isOnlineOpen : current.isOnlineOpen,
      status: update.status || (update.isOfficeOpen === false ? "away" : "available"),
      channelsAffected: update.channelsAffected || current.channelsAffected,
      awayReason: typeof update.awayReason === "string" ? update.awayReason : current.awayReason,
      returnEstimate: typeof update.returnEstimate === "string" ? update.returnEstimate : current.returnEstimate,
      returnTime: typeof update.returnTime === "string" ? update.returnTime : current.returnTime,
      notice: typeof update.notice === "string" ? update.notice : current.notice,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(statusFilePath, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Failed to write chamber-status.json:", err);
    return {
      ...defaultStatus,
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }
}
