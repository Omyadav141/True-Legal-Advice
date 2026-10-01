import fs from "fs";
import path from "path";
import os from "os";
import { ChamberStatus } from "./chamber-utils";

export * from "./chamber-utils";

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

const dataDir = isServerless ? path.join(os.tmpdir(), "tla_data") : path.join(process.cwd(), "data");
const statusFilePath = path.join(dataDir, "chamber-status.json");
const bundledFilePath = path.join(process.cwd(), "data", "chamber-status.json");

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
  onLeave: false,
  leaveStartDate: "",
  leaveEndDate: "",
  leaveReason: "",
  leaveChannelsAffected: "both",
};

let memoryStatus: ChamberStatus | null = null;

export function getChamberStatus(): ChamberStatus {
  if (memoryStatus) return memoryStatus;

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ statusFilePath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ statusFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      memoryStatus = {
        isOfficeOpen: typeof parsed.isOfficeOpen === "boolean" ? parsed.isOfficeOpen : true,
        isOnlineOpen: typeof parsed.isOnlineOpen === "boolean" ? parsed.isOnlineOpen : true,
        status: parsed.status || (parsed.isOfficeOpen === false ? "away" : "available"),
        channelsAffected: parsed.channelsAffected || (parsed.isOfficeOpen === false ? "office_only" : "none"),
        awayReason: parsed.awayReason || "",
        returnEstimate: parsed.returnEstimate || "",
        returnTime: parsed.returnTime || "",
        notice: parsed.notice || defaultStatus.notice,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        onLeave: Boolean(parsed.onLeave),
        leaveStartDate: parsed.leaveStartDate || "",
        leaveEndDate: parsed.leaveEndDate || "",
        leaveReason: parsed.leaveReason || "",
        leaveChannelsAffected: parsed.leaveChannelsAffected || "both",
      };
      return memoryStatus;
    }

    if (fs.existsSync(/*turbopackIgnore: true*/ bundledFilePath)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ bundledFilePath, "utf-8");
      const parsed = JSON.parse(raw);
      memoryStatus = {
        isOfficeOpen: typeof parsed.isOfficeOpen === "boolean" ? parsed.isOfficeOpen : true,
        isOnlineOpen: typeof parsed.isOnlineOpen === "boolean" ? parsed.isOnlineOpen : true,
        status: parsed.status || (parsed.isOfficeOpen === false ? "away" : "available"),
        channelsAffected: parsed.channelsAffected || (parsed.isOfficeOpen === false ? "office_only" : "none"),
        awayReason: parsed.awayReason || "",
        returnEstimate: parsed.returnEstimate || "",
        returnTime: parsed.returnTime || "",
        notice: parsed.notice || defaultStatus.notice,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        onLeave: Boolean(parsed.onLeave),
        leaveStartDate: parsed.leaveStartDate || "",
        leaveEndDate: parsed.leaveEndDate || "",
        leaveReason: parsed.leaveReason || "",
        leaveChannelsAffected: parsed.leaveChannelsAffected || "both",
      };
      return memoryStatus;
    }
  } catch (err) {
    console.error("Failed to read chamber-status.json:", err);
  }

  return defaultStatus;
}

export function saveChamberStatus(update: Partial<ChamberStatus>): ChamberStatus {
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
    onLeave: typeof update.onLeave === "boolean" ? update.onLeave : current.onLeave,
    leaveStartDate: typeof update.leaveStartDate === "string" ? update.leaveStartDate : current.leaveStartDate,
    leaveEndDate: typeof update.leaveEndDate === "string" ? update.leaveEndDate : current.leaveEndDate,
    leaveReason: typeof update.leaveReason === "string" ? update.leaveReason : current.leaveReason,
    leaveChannelsAffected: update.leaveChannelsAffected || current.leaveChannelsAffected || "both",
  };

  memoryStatus = updated;

  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dataDir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ statusFilePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write chamber-status in serverless:", err?.message || err);
  }

  return updated;
}
