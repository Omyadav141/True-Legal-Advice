import { Star } from "lucide-react";
import { site } from "@/lib/site-config";

export default function GoogleRating() {
  if (!site.googleReviewsUrl || site.googleReviewsUrl.includes("/example/")) return null;
  return (
    <a
      href={site.googleReviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: "10px 16px",
        textDecoration: "none",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14-5.1l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.7 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{site.googleRating}</span>
          <div style={{ display: "flex", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={13} fill="#FFC107" color="#FFC107" />
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{site.googleReviewCount} Google reviews</span>
      </div>
    </a>
  );
}
