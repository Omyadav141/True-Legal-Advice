import fs from "fs";
import path from "path";
import os from "os";
import { supabaseServer } from "./supabase-server";

export interface NotificationsPayload {
  version: number;
  dismissedIds: string[];
  updatedAt: string;
}

// System Row Constants in Supabase bookings table
const SYS_NOTIF_ROW_ID = "00000000-0000-0000-0000-000000006e6f";
const SYS_SERVICE_FLAG = "__SYSTEM_CONFIG__";
const SYS_STATUS_FLAG = "system_notif_store";

let memoryPayload: NotificationsPayload | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2000; // 2s cache for near-instant cross-device synchronization

function getStoragePaths() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  const bundledDir = path.join(process.cwd(), "data");
  const bundledFile = path.join(bundledDir, "dismissed-notifications.json");
  const writableDir = isServerless ? path.join(os.tmpdir(), "tla_data") : bundledDir;
  const writableFile = path.join(writableDir, "dismissed-notifications.json");

  return { isServerless, bundledFile, writableDir, writableFile };
}

function readLocalDiskPayload(): NotificationsPayload | null {
  const { isServerless, bundledFile, writableFile } = getStoragePaths();

  if (isServerless) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ writableFile)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ writableFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.dismissedIds)) return parsed;
      }
    } catch (err) {
      console.warn("Could not read notifications file from tmp:", err);
    }
  }

  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ bundledFile)) {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ bundledFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.dismissedIds)) return parsed;
    }
  } catch (err) {
    console.warn("Could not read bundled dismissed-notifications.json:", err);
  }

  return null;
}

function saveLocalDiskPayload(payload: NotificationsPayload) {
  const { writableDir, writableFile } = getStoragePaths();
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ writableDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ writableDir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ writableFile, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("Notice: could not write dismissed-notifications to filesystem:", err?.message || err);
  }
}

async function fetchRemotePayload(): Promise<NotificationsPayload | null> {
  try {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (!hasSupabase) return null;

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("bookings")
      .select("message")
      .eq("id", SYS_NOTIF_ROW_ID)
      .maybeSingle();

    if (!error && data && data.message) {
      const parsed = JSON.parse(data.message);
      if (parsed && Array.isArray(parsed.dismissedIds)) {
        return {
          version: parsed.version || 1,
          dismissedIds: parsed.dismissedIds,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("Could not fetch global notifications payload from Supabase:", err);
  }

  return null;
}

async function saveRemotePayload(payload: NotificationsPayload): Promise<boolean> {
  try {
    const hasSupabase =
      Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (!hasSupabase) return false;

    const supabase = supabaseServer();
    const { error } = await supabase.from("bookings").upsert({
      id: SYS_NOTIF_ROW_ID,
      name: "SYSTEM_NOTIFICATIONS_STORE",
      phone: "0000000000",
      service: SYS_SERVICE_FLAG,
      booking_date: "2099-12-31",
      booking_time: "00:00",
      status: SYS_STATUS_FLAG,
      message: JSON.stringify(payload),
    });

    if (error) {
      console.error("Supabase notifications save error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to persist notifications globally to Supabase:", err);
    return false;
  }
}

export async function getDismissedNotificationIds(): Promise<string[]> {
  const now = Date.now();
  if (memoryPayload && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryPayload.dismissedIds;
  }

  const remote = await fetchRemotePayload();
  if (remote) {
    memoryPayload = remote;
    lastFetchTime = now;
    saveLocalDiskPayload(remote);
    return remote.dismissedIds;
  }

  const disk = readLocalDiskPayload();
  if (disk) {
    memoryPayload = disk;
    lastFetchTime = now;
    return disk.dismissedIds;
  }

  if (!memoryPayload) {
    memoryPayload = {
      version: 1,
      dismissedIds: [],
      updatedAt: new Date().toISOString(),
    };
  }

  return memoryPayload.dismissedIds;
}

export async function addDismissedNotificationIds(ids: string[]): Promise<string[]> {
  const current = await getDismissedNotificationIds();
  const merged = Array.from(new Set([...current, ...ids]));

  // Cap array size to latest 500 items to prevent unbounded growth over years
  const trimmed = merged.slice(-500);

  const payload: NotificationsPayload = {
    version: 1,
    dismissedIds: trimmed,
    updatedAt: new Date().toISOString(),
  };

  memoryPayload = payload;
  lastFetchTime = Date.now();
  saveLocalDiskPayload(payload);
  await saveRemotePayload(payload);

  return payload.dismissedIds;
}

export async function resetDismissedNotifications(): Promise<string[]> {
  const payload: NotificationsPayload = {
    version: 1,
    dismissedIds: [],
    updatedAt: new Date().toISOString(),
  };

  memoryPayload = payload;
  lastFetchTime = Date.now();
  saveLocalDiskPayload(payload);
  await saveRemotePayload(payload);

  return [];
}
