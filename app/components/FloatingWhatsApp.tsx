"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { site } from "@/lib/site-config";

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  const cleanNumber = site.phone.replace(/\D/g, "");
  const defaultMessage = encodeURIComponent(
    `Hello Adv. ${site.lawyerName}, I am visiting True Legal Advice and would like to enquire about a legal consultation.`
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="relative hidden sm:flex items-center gap-2 rounded-2xl bg-black px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-[var(--gold)]/30 backdrop-blur-md animate-float-gentle">
          <span>Need quick legal help? Chat on WhatsApp</span>
          <button
            onClick={() => setShowTooltip(false)}
            aria-label="Close tooltip"
            className="text-white/60 hover:text-white cursor-pointer"
          >
            <X size={12} />
          </button>
          {/* Arrow */}
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-6 border-l-black" />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with True Legal Advice on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-black/40 cursor-pointer no-underline"
      >
        {/* Pulsing radar ping */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:opacity-0" />
        <MessageCircle size={28} className="relative z-10 transition-transform group-hover:rotate-12" />
      </a>
    </aside>
  );
}
