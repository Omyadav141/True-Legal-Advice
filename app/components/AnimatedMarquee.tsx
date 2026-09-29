import { Sparkles, Scale, Shield, Building2, FileText, Heart, Stamp, CheckCircle2 } from "lucide-react";

const items = [
  { label: "Bombay High Court, Nagpur Bench", icon: Scale },
  { label: "District & Sessions Court, Nagpur", icon: Building2 },
  { label: "Trademark & IP Brand Protection", icon: Stamp },
  { label: "Court Marriage & Registration", icon: Heart },
  { label: "Family Law & Matrimonial Advisory", icon: Shield },
  { label: "Property Due Diligence & Deeds", icon: FileText },
  { label: "Consumer & Motor Accident Matters", icon: CheckCircle2 },
  { label: "Startup & Business Compliance", icon: Sparkles },
];

export default function AnimatedMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-[var(--gold)]/20 bg-black py-3.5 text-white select-none">
      {/* Edge gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

      <div className="animate-marquee flex items-center gap-8">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 whitespace-nowrap rounded-full border border-[var(--gold)]/25 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold tracking-wider text-white transition-all duration-300 hover:border-[var(--gold-light)] hover:bg-black"
            >
              <Icon size={14} className="text-[var(--gold-light)]" />
              <span>{item.label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-light)]/60" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
