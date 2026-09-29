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

function getInstantLegalResponse(text: string) {
  const query = text.toLowerCase().trim();

  // 1. Friendly Greetings & Salutations (e.g. "hi", "hello", "namaste", "good morning")
  const greetingWords = [
    "hi",
    "hello",
    "hey",
    "hiya",
    "namaste",
    "namaskar",
    "good morning",
    "good afternoon",
    "good evening",
    "salam",
    "assalam",
    "salaam",
    "adaab",
    "pranam",
    "hussain",
    "advocate",
    "lawyer",
    "shareen",
  ];
  const isDirectGreeting =
    greetingWords.includes(query) ||
    query.startsWith("hi ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query.startsWith("good morning") ||
    query.startsWith("good evening") ||
    query === "help" ||
    query === "can you help me";

  if (isDirectGreeting) {
    return {
      text: `Hello and welcome to True Legal Advice — Chamber of Adv. Shareen Hussain (B.Com, M.Com, LL.B), practicing at the Bombay High Court (Nagpur Bench) and District Courts.

How can I assist you with your legal matter today? You can inquire about:
• Court Marriage & Special Marriage Act registration (confidential)
• Trademark Search, Filing & Startup IP protection (Class 1-45)
• Property Title Search, Sale Deeds, Gift Deeds & Wills
• Walk-in Chamber desk timings or booking a private consultation`,
      suggestedActions: [
        { label: "Court Marriage Help", href: "/court-marriage" },
        { label: "Trademark Services", href: "/trademark-registration" },
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Office Timings & Location", query: "What are your chamber office timings and address in Nagpur?" },
      ],
    };
  }

  // 2. Consultation booking process & appointment inquiries (No "₹1,000" or "Time is Money" spam)
  if (
    query.includes("fee") ||
    query.includes("charge") ||
    query.includes("rate") ||
    query.includes("cost") ||
    query.includes("price") ||
    query.includes("1000") ||
    query.includes("rupee") ||
    query.includes("consultation") ||
    query.includes("book") ||
    query.includes("appointment") ||
    query.includes("slot") ||
    query.includes("process")
  ) {
    return {
      text: `Adv. Shareen Hussain provides dedicated, private legal consultations for both Video Consultation (Google Meet) and Office Visit sessions at Trisharan Square, Nagpur.

📋 How to Book Your Slot:
1. Tap "Book a Consultation Slot" below to view live calendar availability
2. Choose between Online Video Call or In-Person Office Visit
3. Select your preferred date & time slot
4. Provide your contact details & brief overview of your case
5. Instant WhatsApp confirmation from our legal desk`,
      suggestedActions: [
        { label: "Book a Consultation Slot", href: "/book" },
        { label: "WhatsApp Legal Desk (+91 83296 31199)", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to book a legal consultation session.")}`, external: true },
        { label: "View Chamber Timings", query: "What are your chamber office timings and address in Nagpur?" },
      ],
    };
  }

  // 3. Love Marriage / Court Marriage / Special Marriage Act
  if (
    query.includes("love") ||
    query.includes("marriage") ||
    query.includes("court marriage") ||
    query.includes("nikah") ||
    query.includes("shaadi") ||
    query.includes("inter-caste") ||
    query.includes("inter-religion") ||
    query.includes("special marriage") ||
    query.includes("arya samaj") ||
    query.includes("protection")
  ) {
    return {
      text: `Adv. Shareen Hussain specializes in Court Marriage, Love Marriage registrations, and Special Marriage Act (1954) advisory with 100% confidentiality.

💍 Key Highlights:
• Complete lawful procedure under Special Marriage Act, 1954 or Hindu Marriage Act, 1955
• Protection of consenting adult rights (Article 21 legal security & police protection)
• Age verification (Boy: 21+, Girl: 18+) & preparation of all legal affidavits
• Mandatory 3 witness arrangement guidance & registrar representation
• Official Government Marriage Certificate issued directly by the Registrar

Would you like to review the step-by-step document checklist or schedule a private consultation?`,
      suggestedActions: [
        { label: "Court Marriage Guide & Docs", href: "/court-marriage" },
        { label: "Book Private Marriage Advisory", href: "/book" },
        { label: "Confidential WhatsApp Inquiry", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage.")}`, external: true },
      ],
    };
  }

  // 4. Trademark / Startup / Corporate / Intellectual Property
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
    query.includes("patent") ||
    query.includes("logo") ||
    query.includes("ip")
  ) {
    return {
      text: `Adv. Shareen Hussain is an officially certified Trade Mark Attorney (B.Com, M.Com, LL.B) and founder of True Legal Advice (www.securemybrand.in).

🚀 Brand & Business Solutions:
• Trademark & Brand Name Comprehensive Search, Filing & Objection handling
• Copyright Registration for logos, software & artistic works
• Company Registration (Pvt Ltd, LLP, One Person Company)
• GUMASTA / Shop Act License & MSME (Udyam) Registration
• GST Registration, Return Filing & FSSAI Food Licenses
• Legal Notices, Licensing Contracts, NDAs & Partnership Deeds`,
      suggestedActions: [
        { label: "Explore Trademark Practice", href: "/trademark-registration" },
        { label: "Book Trademark Advisory", href: "/book" },
        { label: "WhatsApp for Brand Clearance", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with Trademark Search and Brand Registration.")}`, external: true },
      ],
    };
  }

  // 5. Office location / Walk-in hours / Nagpur chambers
  if (
    query.includes("where") ||
    query.includes("address") ||
    query.includes("location") ||
    query.includes("nagpur") ||
    query.includes("timing") ||
    query.includes("time") ||
    query.includes("walk in") ||
    query.includes("office") ||
    query.includes("phone") ||
    query.includes("chamber") ||
    query.includes("reach") ||
    query.includes("contact")
  ) {
    return {
      text: `Adv. Shareen Hussain Chamber Details:

📍 Address:
Trisharan Square, Nagpur - 440027, Maharashtra, India
(Practice at Bombay High Court, Nagpur Bench & District Courts)

⏰ Walk-in Desk Hours:
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

  // 6. Property / Agreements / Divorce / Civil / Criminal / Court Litigation
  if (
    query.includes("property") ||
    query.includes("deed") ||
    query.includes("will") ||
    query.includes("divorce") ||
    query.includes("family") ||
    query.includes("agreement") ||
    query.includes("mact") ||
    query.includes("accident") ||
    query.includes("criminal") ||
    query.includes("civil") ||
    query.includes("bail") ||
    query.includes("court") ||
    query.includes("litigation") ||
    query.includes("notice") ||
    query.includes("case") ||
    query.includes("police")
  ) {
    return {
      text: `Adv. Shareen Hussain provides dedicated representation across High Court & District Courts Nagpur for:

📄 Documentation & Deeds:
• Sale Deeds, Gift Deeds, Wills & Lease Agreements
• Property Title Search & Legal Due Diligence Reports

⚖️ Litigation & Advisory:
• Mutual & Contested Divorce, Maintenance & Child Custody
• Matrimonial Settlement & Mediation Advisory
• Motor Accident Claims (MACT) & Consumer Disputes
• Bail, Criminal Revision, Writs & Legal Notices`,
      suggestedActions: [
        { label: "View All Legal Services", href: "/legal-services" },
        { label: "Book Private Consultation", href: "/book" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with legal documentation / court representation.")}`, external: true },
      ],
    };
  }

  // 7. Off-Topic / Unrelated Queries Fallback
  return {
    text: `I am specialized exclusively as Adv. Shareen Hussain's AI Legal Desk Assistant at True Legal Advice, Nagpur.

I can only assist with legal matters, court documentation, and chamber consultations under Indian law. Your question appears to be outside our chamber practice domain.

Please feel free to ask about any of our legal practice areas:
• Court Marriage & Special Marriage Act registration
• Trademark, Copyright & Business Registration
• Property Title Verification, Sale Deeds & Wills
• Matrimonial, Divorce & Family Court litigation
• Office Visit & Online Consultation appointments`,
    suggestedActions: [
      { label: "Court Marriage Information", href: "/court-marriage" },
      { label: "Trademark Practice", href: "/trademark-registration" },
      { label: "Book Consultation Slot", href: "/book" },
      { label: "WhatsApp Chamber Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal query.")}`, external: true },
    ],
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "bot",
    text: `Hello! I am Adv. Shareen Hussain's AI Legal Desk Assistant at True Legal Advice.

How can I help you today? You can ask about:
• Court Marriage & Love Marriage procedure
• Trademark & Business Startup compliance
• Property verification, Sale Deeds & Wills
• Booking a private consultation`,
    time: "Just now",
    suggestedActions: [
      { label: "Love / Court Marriage Help", query: "Can you help with love marriage and court marriage in Nagpur?" },
      { label: "Book a Consultation", href: "/book" },
      { label: "Trademark & Startup Help", query: "How do I register a trademark and business with Adv. Shareen?" },
      { label: "Office Timings & Location", query: "What are your chamber office timings and address in Nagpur?" },
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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore chat messages and open state from localStorage across page navigation
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
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {}
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Instant local triage engine with short realistic thinking delay for natural feel
    setTimeout(() => {
      const instantAnswer = getInstantLegalResponse(userText);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: instantAnswer.text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: instantAnswer.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Launcher Widget (AI Legal Desk Assistant) */}
      <div
        className={`fixed z-40 pointer-events-auto select-none transition-all duration-300 ${
          isBookingPage ? "bottom-4 right-4" : "bottom-5 right-5 sm:bottom-6 sm:right-6"
        }`}
      >
        {/* Primary AI Bot Trigger Button */}
        <motion.button
          onClick={handleOpen}
          aria-label={isOpen ? "Close AI Legal Assistant" : "Open AI Legal Assistant"}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center shadow-xl transition-all duration-300 cursor-pointer ${
            isBookingPage && !isOpen
              ? "h-11 w-11 p-0 justify-center rounded-full border border-[var(--gold)]/80 bg-gradient-to-br from-[#09090b] to-[#18181b] hover:border-[var(--gold)]"
              : "gap-2 px-3 py-2 rounded-full border border-[var(--gold)]/70 hover:border-[var(--gold)] bg-gradient-to-r from-[#09090b] via-[#121214] to-[#18181b]"
          }`}
          style={{
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(203, 167, 88, 0.2)",
          }}
          title="Ask AI Legal Desk"
        >
          {/* Avatar Thumbnail */}
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[var(--gold)] flex-shrink-0">
            <Image
              src={site.advocateDeskPhoto}
              alt="Adv. Shareen Hussain"
              fill
              className="object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#cba758] border border-black" />
          </div>

          {/* Label: Hidden on booking page when closed to stay compact and unobtrusive */}
          {(!isBookingPage || isOpen) && (
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--gold-light)] flex items-center gap-1 leading-none">
                <Sparkles size={9} /> AI Legal Desk
              </span>
              <span className="text-[12px] font-bold text-white leading-tight mt-0.5 whitespace-nowrap">
                Ask Legal AI
              </span>
            </div>
          )}

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}

          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[var(--gold-light)] shrink-0">
            {isOpen ? <X size={12} /> : <MessageSquare size={12} />}
          </div>
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
                onClick={() => sendMessage("What are the consultation charges and booking process?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Consultation details
              </button>
              <button
                onClick={() => sendMessage("Can you help with Love Marriage and Court Marriage?")}
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
                onClick={() => sendMessage("What are the walk-in chamber timings at Trisharan Square Nagpur?")}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:border-black hover:text-black transition-all shadow-xs"
              >
                Nagpur Office Timings
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
