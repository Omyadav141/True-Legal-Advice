import { site } from "@/lib/site-config";

export default function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const ring = variant === "light" ? "var(--gold-light)" : "var(--gold)";
  const mark = variant === "light" ? "var(--white)" : "var(--ink)";
  const nameColor = variant === "light" ? "var(--white)" : "var(--ink)";
  const subColor = variant === "light" ? "rgba(255,255,255,0.72)" : "var(--ink-muted)";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="18.5" stroke={ring} strokeWidth="1.5" />
        <circle cx="20" cy="20" r="15" stroke={ring} strokeWidth="0.75" opacity="0.55" />
        {/* Scales of justice, simplified */}
        <path
          d="M20 10.5V27.5M13.5 14.5H26.5M13.5 14.5L10.5 20.5C10.5 22.2 12 23.5 13.5 23.5C15 23.5 16.5 22.2 16.5 20.5L13.5 14.5ZM26.5 14.5L23.5 20.5C23.5 22.2 25 23.5 26.5 23.5C28 23.5 29.5 22.2 29.5 20.5L26.5 14.5Z"
          stroke={mark}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15.5 28.5H24.5" stroke={mark} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: nameColor, letterSpacing: "-0.01em" }}>
          {site.businessName}
        </span>
        <span style={{ fontSize: 11, color: subColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Adv. {site.lawyerName}
        </span>
      </span>
    </span>
  );
}
