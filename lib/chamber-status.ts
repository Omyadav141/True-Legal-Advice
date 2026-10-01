import fs from "fs";
import path from "path";
import os from "os";
import { ChamberStatus } from "./chamber-utils";
import { supabaseServer } from "./supabase-server";

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
  notice: "Office visits are active at Trisharan Square, Nagpur. Online video consultations are also open.",
  updatedAt: new Date().toISOString(),
  onLeave: false,
  leaveStartDate: "",
  leaveEndDate: "",
  leaveReason: "",
  leaveChannelsAffected: "both",
};

let memoryStatus: ChamberStatus | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 seconds in-memory cache to keep reads instantaneous while respecting updates

export function getChamberStatusSync(): ChamberStatus {
  if (memoryStatus) return memoryStatus;

  try {
    if (fs.existsSync(statusFilePath)) {
      const raw = fs.readFileSync(statusFilePath, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(bundledFilePath)) {
      const raw = fs.readFileSync(bundledFilePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}

  return defaultStatus;
}

export async function getChamberStatus(): Promise<ChamberStatus> {
  const now = Date.now();
  if (memoryStatus && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryStatus;
  }

  // 1. Try Supabase first (source of truth across all serverless instances and cold starts)
  try {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (hasSupabase) {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("message")
        .eq("id", "system_chamber_status")
        .single();

      if (!error && data && data.message) {
        const parsed = JSON.parse(data.message);
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
        lastFetchTime = now;
        return memoryStatus;
      }
    }
  } catch (err) {
    console.warn("Notice: could not query Supabase for chamber status, checking disk fallback:", err);
  }

  // 2. Disk fallback (local development or when Supabase is temporarily unreachable)
  try {
    if (fs.existsSync(statusFilePath)) {
      const raw = fs.readFileSync(statusFilePath, "utf-8");
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
      lastFetchTime = now;
      return memoryStatus;
    }

    if (fs.existsSync(bundledFilePath)) {
      const raw = fs.readFileSync(bundledFilePath, "utf-8");
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
      lastFetchTime = now;
      return memoryStatus;
    }
  } catch (err) {
    console.error("Failed to read chamber-status.json:", err);
  }

  return defaultStatus;
}

export async function saveChamberStatus(update: Partial<ChamberStatus>): Promise<ChamberStatus> {
  const current = await getChamberStatus();
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
  lastFetchTime = Date.now();

  // 1. Persist to Supabase so it's live across ALL Vercel serverless containers and clients
  try {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (hasSupabase) {
      const supabase = supabaseServer();
      const { error } = await supabase.from("contact_inquiries").upsert({
        id: "system_chamber_status",
        name: "System Chamber Status Config",
        phone: "0000000000",
        service: "system_chamber_status",
        message: JSON.stringify(updated),
        status: "new",
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.warn("Notice: could not upsert chamber status in Supabase:", error.message);
      }
    }
  } catch (err) {
    console.warn("Notice: Supabase upsert error:", err);
  }

  // 2. Persist to disk as local fallback
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(statusFilePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write chamber-status to disk:", err?.message || err);
  }

  return updated;
}
