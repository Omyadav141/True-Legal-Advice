"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import AiLegalAssistantBot from "./AiLegalAssistantBot";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main style={{ minHeight: "60vh" }}>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <AiLegalAssistantBot />}
    </>
  );
}
