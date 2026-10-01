"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Scale, RefreshCw, Home } from "lucide-react";
import { site } from "@/lib/site-config";

export default function BookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Booking page error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-[#09090b] border border-[#cba758]/40 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <div className="h-14 w-14 rounded-2xl bg-[#cba758] text-black flex items-center justify-center mx-auto font-bold shadow-lg">
          <Scale size={28} />
        </div>
        <h2 className="text-xl font-serif font-bold text-white">
          Chamber Reservation Desk
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          We encountered an unexpected issue while loading the consultation pass. Your booking details are safely recorded in our chamber database.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#cba758] text-black font-bold text-xs hover:bg-[#dfbe73] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reload Desk</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 no-underline"
          >
            <Home size={13} />
            <span>Chamber Home</span>
          </Link>
        </div>
        <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400">
          Chamber Helpline: <a href={`tel:${site.phone}`} className="text-[#cba758] font-mono hover:underline">{site.phone}</a>
        </div>
      </div>
    </div>
  );
}
