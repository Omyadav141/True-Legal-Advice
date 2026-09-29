"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, Scale, Phone, ArrowUpRight, CheckCircle2, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site-config";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  suggestedActions?: { label: string; href?: string; external?: boolean; query?: string }[];
}

// Helper: Extract user's name if introduced in the text
function extractNameFromText(text: string): string | null {
  const clean = text.trim();
  const introMatch = clean.match(/(?:my name is|i am|i'm|this is|myself|call me)\s+([a-zA-Z]{2,20})/i);
  if (introMatch && introMatch[1]) {
    const raw = introMatch[1].trim();
    const commonVerbs = ["looking", "facing", "having", "married", "seeking", "asking", "interested", "confused", "worried", "going", "trying", "calling", "writing", "a", "an", "the"];
    if (!commonVerbs.includes(raw.toLowerCase())) {
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
  }

  const hereMatch = clean.match(/^([a-zA-Z]{2,20})\s+here$/i);
  if (hereMatch && hereMatch[1]) {
    const raw = hereMatch[1].trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  return null;
}

function getInstantLegalResponse(text: string, currentUserName?: string) {
  const query = text.toLowerCase().trim();
  const detectedName = extractNameFromText(text);
  const activeName = detectedName || currentUserName || "";
  const nameGreeting = activeName ? ` ${activeName}` : "";

  // 1. Purely non-legal queries (cooking, coding, sports, entertainment, homework)
  const nonLegalKeywords = [
    "recipe", "cook", "biryani", "pizza", "burger", "cake",
    "python", "javascript", "react", "html", "css", "coding", "software bug", "programming", "java", "c++",
    "weather", "temperature", "rain",
    "cricket", "ipl", "football", "fifa", "messi", "ronaldo",
    "movie", "song", "lyrics", "singer", "actor", "actress", "bollywood", "hollywood", "netflix",
    "homework", "solve equation", "tell me a joke", "sing a song",
  ];
  if (nonLegalKeywords.some((k) => query.includes(k))) {
    return {
      text: `I can only assist with legal matters of the court, legal advice, and legal documentation for Adv. Shareen Hussain's chambers.

How can I help you with a legal question today?`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "View Legal Services", href: "/legal-services" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal query.")}`, external: true },
      ],
    };
  }

  // 2. Overly deep / high-risk / win guarantee queries
  const deepTriggers = [
    "guarantee i will win", "can you guarantee a win", "guarantee my case", "promise win",
    "how to bribe", "give money to judge", "forge", "fake certificate", "fake document",
    "how to hide money from wife", "hide assets from court", "escape police without bail",
    "exact settlement amount", "calculate my exact alimony", "how to beat the judge",
  ];
  if (deepTriggers.some((t) => query.includes(t))) {
    return {
      text: `${activeName ? activeName + ", " : ""}because this matter involves specific case facts, evidence examination, and critical court proceedings, Adv. Shareen Hussain needs to review your case documents directly in a private consultation.

Indian courts decide cases strictly on evidence and statutory law. Adv. Shareen will review your documents and provide a direct legal evaluation.`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need a consultation regarding a complex court litigation matter.")}`, external: true },
        { label: "View Chamber Timings", href: "/contact" },
      ],
    };
  }

  // 3. User introduces their name (e.g. "My name is Faiez", "I am Faiez")
  if (detectedName) {
    return {
      text: `Hi ${detectedName}! How are you doing today?

How can Adv. Shareen Hussain's chamber assist you with your legal case or documentation?`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Explore Legal Services", href: "/legal-services" },
        { label: "Court Marriage Guidance", href: "/court-marriage" },
        { label: "Trademark / Startup Help", href: "/trademark-registration" },
      ],
    };
  }

  // 4. Polite "How are you" / "I am good"
  if (
    query.includes("how are you") ||
    query.includes("how r u") ||
    query === "i am good" ||
    query === "i'm good" ||
    query === "i am fine" ||
    query === "i'm fine" ||
    query === "all good"
  ) {
    return {
      text: `I am doing well, thank you${nameGreeting}!

How can I assist you with your legal case, court matter, or documentation today?`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Court Marriage Help", href: "/court-marriage" },
        { label: "Trademark Registration", href: "/trademark-registration" },
        { label: "Office Timings & Location", href: "/contact" },
      ],
    };
  }

  // 5. Short, Natural Greetings ("hi", "hello", "hey", "namaste", "good morning", etc.)
  const isDirectGreeting =
    query === "hi" ||
    query === "hello" ||
    query === "hey" ||
    query === "namaste" ||
    query === "namaskar" ||
    query === "good morning" ||
    query === "good afternoon" ||
    query === "good evening" ||
    query === "salam" ||
    query === "assalam" ||
    query === "salaam" ||
    query === "adaab" ||
    query === "pranam" ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ");

  if (isDirectGreeting) {
    const greeting = activeName
      ? `Hello ${activeName}! Welcome back to True Legal Advice.`
      : `Hello! Welcome to True Legal Advice. I am the AI assistant of Adv. Shareen Hussain.`;

    return {
      text: `${greeting} How can I help you today?`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Explore Legal Services", href: "/legal-services" },
        { label: "Chamber Timings & Location", href: "/contact" },
      ],
    };
  }

  // 6. High Court Practice (Bombay High Court Nagpur Bench, Writ Petitions, Appeals)
  if (
    query.includes("high court") ||
    query.includes("writ") ||
    query.includes("bombay high court") ||
    query.includes("appeal") ||
    query.includes("revision") ||
    query.includes("stay order") ||
    query.includes("article 226") ||
    query.includes("article 227")
  ) {
    return {
      text: `Adv. Shareen Hussain actively practices at the Bombay High Court (Nagpur Bench), handling:
• Writ Petitions under Article 226 & 227 of the Constitution
• Criminal & Civil Appeals, Revisions & Stay Applications
• Section 482 CrPC FIR Quashing & High Court Bail Petitions
• Challenging arbitrary government orders, tender disputes & tribunal appeals

Would you like to schedule a consultation to review your court case records?`,
      suggestedActions: [
        { label: "Book High Court Consultation", href: "/book" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need legal representation at the Bombay High Court (Nagpur Bench).")}`, external: true },
        { label: "Chamber Address & Timings", href: "/contact" },
      ],
    };
  }

  // 7. Criminal Defense, Bail, Police Complaints, FIR, Cheque Bounce
  if (
    query.includes("bail") ||
    query.includes("anticipatory") ||
    query.includes("arrest") ||
    query.includes("police") ||
    query.includes("fir") ||
    query.includes("complaint") ||
    query.includes("criminal") ||
    query.includes("cheque bounce") ||
    query.includes("138") ||
    query.includes("ni act") ||
    query.includes("cyber") ||
    query.includes("498a")
  ) {
    return {
      text: `Adv. Shareen Hussain provides experienced criminal defense representation across Sessions Courts and High Court:
• Anticipatory Bail (Sec 438) & Regular Bail (Sec 439)
• FIR Quashing & Police Harassment Protection
• Cheque Bounce Cases (Section 138 NI Act) — Legal notice drafting & court trial
• Cyber Crime, Financial Fraud & Defamation cases
• Criminal trial defense & witness examination

For urgent arrest or bail matters, immediate consultation is recommended.`,
      suggestedActions: [
        { label: "Book Urgent Bail Consultation", href: "/book" },
        { label: "Emergency WhatsApp Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have an urgent Criminal / Bail legal matter.")}`, external: true },
      ],
    };
  }

  // 8. Civil Litigation, Property Disputes, Deeds, Wills, Land Title
  if (
    query.includes("property") ||
    query.includes("civil") ||
    query.includes("suit") ||
    query.includes("injunction") ||
    query.includes("land") ||
    query.includes("flat") ||
    query.includes("sale deed") ||
    query.includes("gift deed") ||
    query.includes("will") ||
    query.includes("succession") ||
    query.includes("partition") ||
    query.includes("tenant") ||
    query.includes("landlord") ||
    query.includes("title search")
  ) {
    return {
      text: `Adv. Shareen Hussain handles complete Civil & Real Estate Property matters in Nagpur District & Civil Courts:
• Comprehensive 30-Year Property Title Search & Due Diligence Reports
• Drafting & Government Registration of Sale Deeds, Gift Deeds, Release Deeds & Wills
• Partition Suits, Property Ownership Disputes & Declaration of Title
• Permanent Injunctions, Tenant Eviction Suits & Lease Agreements
• Succession Certificates, Legal Heir Certificates & Power of Attorney (PoA)

Would you like Adv. Shareen to inspect your property documents?`,
      suggestedActions: [
        { label: "Book Property Consultation", href: "/book" },
        { label: "WhatsApp Document Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with Property verification / Deed drafting.")}`, external: true },
      ],
    };
  }

  // 9. Court Marriage & Special Marriage Act
  if (
    query.includes("love") ||
    query.includes("marriage") ||
    query.includes("nikah") ||
    query.includes("shaadi") ||
    query.includes("inter-caste") ||
    query.includes("inter-religion") ||
    query.includes("special marriage") ||
    query.includes("arya samaj")
  ) {
    return {
      text: `Adv. Shareen Hussain specializes in Court Marriage, Love Marriage registrations, and Special Marriage Act (1954) filings with 100% confidentiality.

💍 Key Highlights:
• Lawful procedure under Special Marriage Act, 1954 or personal marriage laws
• Legal security & police protection under Article 21 for consenting adults
• Age verification (Boy: 21+, Girl: 18+) & preparation of affidavits & notices
• Guidance on 3 witnesses & registrar representation in Nagpur
• Official Government Marriage Certificate issued directly by the Registrar`,
      suggestedActions: [
        { label: "Court Marriage Guide & Checklist", href: "/court-marriage" },
        { label: "Book Private Marriage Advisory", href: "/book" },
        { label: "Confidential WhatsApp Inquiry", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage.")}`, external: true },
      ],
    };
  }

  // 10. Divorce, Family Disputes, Maintenance, Child Custody, DV Act
  if (
    query.includes("divorce") ||
    query.includes("maintenance") ||
    query.includes("alimony") ||
    query.includes("custody") ||
    query.includes("domestic violence") ||
    query.includes("dv act") ||
    query.includes("family court") ||
    query.includes("matrimonial")
  ) {
    return {
      text: `We handle family and matrimonial disputes with utmost sensitivity, confidentiality, and firm legal representation in Nagpur Family Courts:
• Mutual Consent Divorce (Fast-track cooling period waiver) & Contested Divorce
• Maintenance & Interim Alimony under Section 125 CrPC & Personal Laws
• Child Custody, Visitation Rights & Guardianship petitions
• Domestic Violence Protection Orders & Residence Rights under DV Act
• Formal Matrimonial Settlement Agreements & Mediation`,
      suggestedActions: [
        { label: "Book Confidential Consultation", href: "/book" },
        { label: "WhatsApp Advocate Confidentially", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need private consultation regarding a Family / Matrimonial matter.")}`, external: true },
      ],
    };
  }

  // 11. Trademark, Copyright, Startup & Corporate Compliance
  if (
    query.includes("trademark") ||
    query.includes("brand") ||
    query.includes("copyright") ||
    query.includes("gst") ||
    query.includes("company") ||
    query.includes("pvt ltd") ||
    query.includes("llp") ||
    query.includes("startup") ||
    query.includes("gumasta") ||
    query.includes("msme") ||
    query.includes("fssai") ||
    query.includes("patent")
  ) {
    return {
      text: `Adv. Shareen Hussain is an officially certified Trade Mark Attorney (B.Com, M.Com, LL.B) and founder of True Legal Advice (www.securemybrand.in).

🚀 Brand & Corporate Solutions:
• Trademark Search, Filing & Objection Hearings across all Classes (1–45)
• Copyright Registration for logos, software & creative works
• Company Incorporation (Pvt Ltd, LLP, One Person Company)
• GUMASTA / Shop Act License & MSME Udyam Registration
• GST Registration, Monthly Returns & FSSAI Food Licenses
• Commercial Contracts, NDAs, Service Level Agreements & Vendor Contracts`,
      suggestedActions: [
        { label: "Explore Trademark Practice", href: "/trademark-registration" },
        { label: "Book Trademark Advisory", href: "/book" },
        { label: "WhatsApp for Brand Clearance", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I want to conduct a Trademark search & registration.")}`, external: true },
      ],
    };
  }

  // 12. Legal Documentation, Drafting, Notices, Affidavits
  if (
    query.includes("draft") ||
    query.includes("notice") ||
    query.includes("affidavit") ||
    query.includes("agreement") ||
    query.includes("contract") ||
    query.includes("power of attorney") ||
    query.includes("poa") ||
    query.includes("documentation")
  ) {
    return {
      text: `Adv. Shareen Hussain provides expert legal drafting and vetted documentation:
• Formal Legal Notices (Recovery of money, breach of contract, defamation, 138 NI Act)
• Affidavits for court, name change, passport, and government departments
• General & Special Power of Attorney (PoA)
• Commercial Contracts, Partnership Deeds, NDAs & Employment Agreements
• Rent / Lease Agreements on official Stamp Paper with notary & registration`,
      suggestedActions: [
        { label: "Book Drafting Consultation", href: "/book" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need help drafting a Legal Notice / Agreement / Affidavit.")}`, external: true },
      ],
    };
  }

  // 13. Fees, Consultation Charges & Booking Process
  if (
    query.includes("fee") ||
    query.includes("charge") ||
    query.includes("rate") ||
    query.includes("cost") ||
    query.includes("price") ||
    query.includes("consultation") ||
    query.includes("book") ||
    query.includes("appointment") ||
    query.includes("slot")
  ) {
    return {
      text: `Adv. Shareen Hussain provides dedicated, strategic legal consultations for both Online Video Call (Google Meet) and In-Office Walk-in sessions at Trisharan Square, Nagpur.

📋 How to Book Your Slot:
1. Tap "Book Consultation Slot" below to view live calendar availability
2. Choose between Online Video Call or In-Person Office Visit
3. Select your preferred date & time slot
4. Provide your contact details & brief overview of your case
5. Instant WhatsApp confirmation from our legal desk`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "WhatsApp Legal Desk (+91 83296 31199)", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to book a legal consultation session.")}`, external: true },
        { label: "View Chamber Timings", href: "/contact" },
      ],
    };
  }

  // 14. Office Location, Timings, Nagpur Chamber
  if (
    query.includes("where") ||
    query.includes("address") ||
    query.includes("location") ||
    query.includes("nagpur") ||
    query.includes("timing") ||
    query.includes("time") ||
    query.includes("walk in") ||
    query.includes("office") ||
    query.includes("chamber") ||
    query.includes("reach") ||
    query.includes("contact")
  ) {
    return {
      text: `Adv. Shareen Hussain Chamber Details:

📍 Address:
Trisharan Square, Nagpur - 440027, Maharashtra, India
(Practice at Bombay High Court, Nagpur Bench & District Courts)

⏰ Walk-in Chamber Desk Hours:
• Morning Walk-in: 9:30 AM – 11:00 AM
• Evening Walk-in: 5:30 PM – 8:30 PM
• Online Video Consultations: Monday to Saturday by scheduled appointment

📞 Direct Chamber Contact:
• Phone & WhatsApp: +91 83296 31199`,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Contact & Chamber Directions", href: "/contact" },
        { label: "Call Chamber Desk", href: `tel:${site.phone.replace(/\s/g, "")}` },
      ],
    };
  }

  // 15. Default Legal Overview covering all practices
  return {
    text: `${activeName ? activeName + ", " : ""}Adv. Shareen Hussain practices across Bombay High Court (Nagpur Bench) and District Courts, handling all legal matters including:

• High Court Litigation & Writ Petitions
• Criminal Defense, Bail & 138 NI Act Cheque Bounce
• Civil Suits, Property Title Search & Deeds/Wills
• Court Marriage & Special Marriage Act (Confidential)
• Family Law, Divorce, Child Custody & Maintenance
• Trademark, Copyright & Business Startup Compliance

How can we assist you with your specific legal matter today?`,
    suggestedActions: [
      { label: "Book Consultation Slot", href: "/book" },
      { label: "Court Marriage Help", href: "/court-marriage" },
      { label: "Trademark Services", href: "/trademark-registration" },
      { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal inquiry.")}`, external: true },
    ],
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-welcome",
    sender: "bot",
    text: `Hello and welcome to True Legal Advice! I am the AI assistant for Adv. Shareen Hussain (Bombay High Court & District Courts).

How can I assist you with your legal matter today?`,
    time: "Just now",
    suggestedActions: [
      { label: "Book Consultation Slot", href: "/book" },
      { label: "Court Marriage Procedure", query: "Can you explain the Court Marriage and Special Marriage Act procedure?" },
      { label: "Trademark & Startup IP", query: "How can I register my trademark and business?" },
      { label: "Property & Civil Law", query: "What property verification and civil services do you provide?" },
    ],
  },
];


const CHAT_STORAGE_KEY = "advocate_ai_chat_history";
const CHAT_OPEN_KEY = "advocate_ai_chat_open";

export default function AiLegalAssistantBot() {
  const pathname = usePathname();
  const isBookingPage = pathname?.startsWith("/book");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [userName, setUserName] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore chat messages, open state, and user name from localStorage across page navigation
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setUnreadCount(0);
        }
      }
      const savedName = localStorage.getItem("advocate_ai_user_name");
      if (savedName) {
        setUserName(savedName);
      }
      const savedOpen = localStorage.getItem(CHAT_OPEN_KEY);
      if (savedOpen === "true") {
        setIsOpen(true);
      }
    } catch (e) {
      console.error("Failed to load chat from storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save messages to localStorage on change (after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to persist chat:", e);
    }
  }, [messages, isHydrated]);

  // Persist open/close state so user does not lose their chat widget when clicking page links
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CHAT_OPEN_KEY, isOpen ? "true" : "false");
    } catch (e) {}
  }, [isOpen, isHydrated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) setUnreadCount(0);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setUserName("");
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem("advocate_ai_user_name");
    } catch (e) {}
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    // Detect if user introduced their name
    const detectedName = extractNameFromText(userText);
    const activeName = detectedName || userName;
    if (detectedName && detectedName !== userName) {
      setUserName(detectedName);
      try {
        localStorage.setItem("advocate_ai_user_name", detectedName);
      } catch (e) {}
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call trained server AI backend (supports Grok AI when GROK_API_KEY is configured in .env)
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText.trim(),
          history: [...messages, userMsg].slice(-8),
          userName: activeName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.userName && data.userName !== userName) {
          setUserName(data.userName);
          try {
            localStorage.setItem("advocate_ai_user_name", data.userName);
          } catch (e) {}
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply || "How can I assist you with your legal matter?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedActions: data.suggestedActions,
        };

        setMessages((prev) => [...prev, botMsg]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("AI backend fetch failed, using high-performance local engine:", err);
    }

    // Instant local fallback with identical trained legal rules
    setTimeout(() => {
      const instantAnswer = getInstantLegalResponse(userText, activeName);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: instantAnswer.text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: instantAnswer.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 350);
  };

  return (
    <>
      {/* Floating Launcher Widget (AI Legal Desk Assistant) */}
      <div
        className={`fixed z-40 pointer-events-auto select-none transition-all duration-300 ${
          isBookingPage ? "bottom-4 right-4" : "bottom-5 right-5 sm:bottom-6 sm:right-6"
        }`}
      >
        {/* Primary AI Bot Trigger Button - Inspired by Dr. Sheth's Running Gold AI widget */}
        <motion.button
          onClick={handleOpen}
          aria-label={isOpen ? "Close AI Legal Assistant" : "Open AI Legal Assistant"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-full p-0 flex items-center justify-center cursor-pointer overflow-hidden border-[1.5px] border-[#eed593] shadow-xl group transition-transform"
          style={{
            boxShadow:
              "0 8px 25px rgba(203, 167, 88, 0.45), 0 3px 12px rgba(0, 0, 0, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
          }}
          title="Ask AI Legal Desk"
        >
          {/* Running Liquid Gold Animated Background */}
          <div className="absolute inset-0 gold-liquid-bg pointer-events-none" />

          {/* Running Dynamic Sheen Overlay */}
          <div className="absolute inset-0 gold-liquid-sheen opacity-40 pointer-events-none" />

          {/* 3D Vignette & Surface Specular Reflection */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 240, 180, 0.15) 50%, rgba(142, 104, 34, 0.35) 100%)",
            }}
          />

          {/* Center Badge: Close icon when open, ASK AI speech bubble when closed */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-badge"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-7 h-7 rounded-full bg-neutral-950/85 text-white flex items-center justify-center shadow-md border border-[#cba758]/50"
              >
                <X size={15} strokeWidth={2.8} className="text-[#fcecb0]" />
              </motion.div>
            ) : (
              <motion.div
                key="ask-ai-bubble"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 px-2.5 py-1 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)] flex items-center justify-center"
              >
                <span className="text-[10.5px] font-semibold text-neutral-900 tracking-normal leading-none select-none flex items-center gap-0.5">
                  <span>ASK</span>
                  <span className="font-black text-black text-[11px] ml-0.5">AI</span>
                </span>

                {/* Speech bubble tail pointing downwards-left */}
                <span
                  className="absolute -bottom-[3.5px] left-2.5 w-0 h-0 pointer-events-none"
                  style={{
                    borderTop: "5px solid #ffffff",
                    borderRight: "4px solid transparent",
                    borderLeft: "2px solid transparent",
                    filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread Counter Badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[82vh] h-[590px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--gold)]/40 bg-white"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(176, 138, 62, 0.2)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3.5 flex items-center justify-between text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
                borderBottom: "1px solid rgba(203, 167, 88, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--gold)]">
                  <Image
                    src={site.advocateDeskPhoto}
                    alt="Adv. Shareen Hussain"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#cba758] border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-[15px] leading-tight text-white">
                      Adv. Shareen Hussain
                    </h3>
                    <CheckCircle2 size={13} className="text-[var(--gold-light)]" />
                  </div>
                  <p className="text-[11px] text-[var(--gold-light)] font-medium">
                    AI Legal Desk Assistant · Nagpur Chambers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Reset conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <Link
                  href="/book"
                  className="px-3 py-1 text-xs font-bold rounded-md bg-[var(--gold)] text-black hover:bg-[var(--gold-light)] transition-colors shadow-sm"
                >
                  Book
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* High-Contrast Chamber Notice Banner */}
            <div className="bg-black border-b border-[var(--gold)]/30 px-3.5 py-2 flex items-center justify-between text-xs text-white">
              <span className="flex items-center gap-1.5 font-semibold text-[var(--gold-light)]">
                <Scale size={13} className="text-[var(--gold)]" />
                Nagpur High Court & District Court
              </span>
              <span className="font-bold text-[var(--gold-light)] text-[11px]">Private consultation</span>
            </div>

            {/* Chat Messages Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-[13.5px]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-black text-white font-medium rounded-tr-sm"
                        : "bg-white text-slate-900 font-normal border border-slate-200 rounded-tl-sm shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line text-[13px] leading-relaxed select-text">{msg.text}</p>
                    <span
                      className={`block mt-1 text-[10px] text-right ${
                        msg.sender === "user" ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {/* Quick Action Buttons rendered beneath bot response */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestedActions.map((action, i) => {
                        if (action.href) {
                          if (action.external) {
                            return (
                              <a
                                key={i}
                                href={action.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[var(--gold)] text-black hover:bg-black hover:text-white transition-all shadow-xs"
                              >
                                <span>{action.label}</span>
                                <ArrowUpRight size={12} />
                              </a>
                            );
                          }
                          return (
                            <Link
                              key={i}
                              href={action.href}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[var(--gold)] text-black hover:bg-black hover:text-white transition-all shadow-xs"
                            >
                              <span>{action.label}</span>
                              <ArrowUpRight size={12} />
                            </Link>
                          );
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              if (action.query) sendMessage(action.query);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs text-left"
                          >
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-700 bg-white px-3.5 py-2 rounded-xl w-fit border border-slate-200 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
                  <span>Adv. Shareen Hussain AI is preparing legal details...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Carousel */}
            <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => sendMessage("What are all the legal practice areas and services handled by Adv. Shareen Hussain?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                All Legal Services
              </button>
              <button
                onClick={() => sendMessage("Can you help with Court Marriage and Special Marriage Act procedure?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Court Marriage Help
              </button>
              <button
                onClick={() => sendMessage("I need Trademark and Company Registration for my startup.")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Trademark / Startup
              </button>
              <button
                onClick={() => sendMessage("How do I apply for Anticipatory Bail or Regular Bail in Nagpur?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Criminal & Bail
              </button>
              <button
                onClick={() => sendMessage("What property verification, title search, and sale deed services do you provide?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Property & Civil Suits
              </button>
              <button
                onClick={() => sendMessage("What are the walk-in chamber desk timings at Trisharan Square Nagpur?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Chamber Timings
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about love marriage, fees, trademarks..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-[var(--gold)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
