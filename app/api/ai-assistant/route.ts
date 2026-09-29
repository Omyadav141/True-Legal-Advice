import { NextResponse } from "next/server";
import { site } from "@/lib/site-config";

// Helper: Extract user's name if introduced in the message
function extractNameFromMessage(text: string): string | null {
  const clean = text.trim();

  // Pattern 1: "my name is Faiez", "i am Faiez", "i'm Faiez", "this is Faiez", "myself Faiez", "call me Faiez"
  const introMatch = clean.match(/(?:my name is|i am|i'm|this is|myself|call me)\s+([a-zA-Z]{2,20})/i);
  if (introMatch && introMatch[1]) {
    const raw = introMatch[1].trim();
    // Ignore false positives like "i am looking", "i am facing", "i am married", "i am having"
    const commonVerbs = ["looking", "facing", "having", "married", "seeking", "asking", "interested", "confused", "worried", "going", "trying", "calling", "writing", "a", "an", "the"];
    if (!commonVerbs.includes(raw.toLowerCase())) {
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    }
  }

  // Pattern 2: "Faiez here"
  const hereMatch = clean.match(/^([a-zA-Z]{2,20})\s+here$/i);
  if (hereMatch && hereMatch[1]) {
    const raw = hereMatch[1].trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  return null;
}

// Helper: Detect purely non-legal conversational topics (entertainment, coding, cooking, homework, sports, etc.)
function isNonLegalQuery(text: string): boolean {
  const q = text.toLowerCase();
  const nonLegalKeywords = [
    "recipe", "cook", "biryani", "pizza", "burger", "cake", "food menu",
    "python", "javascript", "react", "html", "css", "coding", "software bug", "programming", "java", "c++",
    "weather today", "temperature today", "rain today",
    "cricket score", "ipl", "football match", "fifa", "messi", "ronaldo",
    "movie", "song", "lyrics", "singer", "actor", "actress", "bollywood", "hollywood", "netflix",
    "math homework", "solve equation", "physics problem", "chemistry problem",
    "tell me a joke", "tell me a funny story", "sing a song",
  ];
  return nonLegalKeywords.some((k) => q.includes(k));
}

// Helper: Detect overly deep / high-risk / contested litigation strategy or illegal attempts
function isOverlyDeepOrComplex(text: string): boolean {
  const q = text.toLowerCase();
  const deepTriggers = [
    "guarantee i will win", "can you guarantee a win", "guarantee my case", "promise win",
    "how to bribe", "give money to judge", "forge", "fake certificate", "fake document",
    "how to hide money from wife", "hide assets from court", "escape police without bail",
    "exact settlement amount", "calculate my exact alimony", "how to beat the judge",
    "hack", "illegal bypass",
  ];
  return deepTriggers.some((t) => q.includes(t));
}

// Master System Prompt for LLM (Grok AI)
const LEGAL_SYSTEM_PROMPT = `You are the official AI Legal Desk Assistant for Advocate Shareen Hussain (B.Com, M.Com, LL.B), practicing at the Bombay High Court (Nagpur Bench) and District & Sessions Courts, under the chamber True Legal Advice (Nagpur, Maharashtra).

CHAMBER INFORMATION:
- Advocate: Adv. Shareen Hussain (B.Com, M.Com, LL.B)
- Chamber: Trisharan Square, Nagpur - 440027, Maharashtra, India
- Practice: Bombay High Court (Nagpur Bench), District & Sessions Courts, Family Courts, Consumer Forums, Revenue Courts, NCLT
- Phone / WhatsApp: +91 83296 31199
- Website: True Legal Advice (www.securemybrand.in)
- Walk-in Chamber Hours: Morning: 9:30 AM – 11:00 AM | Evening: 5:30 PM – 8:30 PM (Monday to Saturday)
- Consultations: Video Consultation (Google Meet) & In-Person Office Visit (Booking at /book)

CORE BEHAVIORAL RULES:
1. GREETINGS & INTRODUCTIONS:
   - When the user says "hi", "hello", "hey", or simple salutations, KEEP IT BRIEF AND WARM. Do NOT dump long lists of services or walls of text.
     Example: "Hello! Welcome to True Legal Advice. I am the AI assistant of Adv. Shareen Hussain. How can I help you today?"
   - When the user introduces their name (e.g., "My name is Faiez", "I am Rahul"):
     Example: "Hi Faiez! How are you doing today? How can Adv. Shareen Hussain's chamber assist you with your legal matter?"
   - When the user asks "How are you?":
     Example: "I am doing well, thank you! How can I assist you with your legal case or documentation today?"

2. WE DO ALL LEGAL SERVICES:
   Adv. Shareen Hussain provides counsel, litigation, and documentation for ALL legal areas:
   - High Court Practice: Writ Petitions (Art 226/227), Criminal & Civil Appeals, Revisions, Stay Orders at Bombay High Court (Nagpur Bench).
   - Criminal Defense & Bail: Anticipatory Bail (Sec 438), Regular Bail (Sec 439), FIR Quashing (Sec 482 CrPC), Cheque Bounce (Sec 138 NI Act), Cyber Crime, Police Complaints, 498A defense.
   - Civil & Property Law: Property Title Search (30-year report), Sale Deed, Gift Deed, Will & Testament, Partition Suits, Injunctions, Possession, Eviction, RERA, Land Mutation.
   - Court Marriage & Family Law: Special Marriage Act 1954 (confidential adult love marriage registration, Article 21 police protection), Mutual Consent Divorce, Contested Divorce, Child Custody, Maintenance (Sec 125 CrPC), Domestic Violence (DV Act).
   - Corporate, Trademark & Startup Compliance: Trademark Search, Filing & Objection Hearings (Class 1-45), Copyright, Company Registration (Pvt Ltd, LLP, OPC), GST, Gumasta / Shop Act, MSME Udyam, FSSAI Food Licenses, NDAs & Commercial Contracts.
   - Legal Drafting: Affidavits, Legal Notices, Agreements, Power of Attorney (PoA), Deeds.

3. STRICT PROFESSIONAL GUARDRAILS:
   - If the user asks non-legal questions (cooking, programming, entertainment, sports, homework):
     Politely decline: "I can only assist with legal matters of the court, legal advice, and legal documentation for Adv. Shareen Hussain's chambers. How can I help you with a legal question?"
   - DEEP / HIGH-RISK CASE STRATEGY:
     If the user asks for guarantees of winning, deep litigation tactics, or complex disputed facts:
     Stop there and guide them to book a consultation: "Because this matter involves specific case facts, evidence, and critical court proceedings, Adv. Shareen Hussain needs to review your case documents in a private consultation. We recommend booking an in-person or video consultation so Adv. Shareen can examine your case details directly."

4. TONE & STYLE:
   - Clear, reassuring, professional, and distinctly legal.
   - Avoid long walls of text. Be concise and conversational.`;

export async function POST(req: Request) {
  try {
    const { message, history, userName } = await req.json();
    const rawText = (message || "").trim();
    const query = rawText.toLowerCase();

    // 1. Detect if the user introduced their name in this message
    const extractedName = extractNameFromMessage(rawText);
    const activeUserName = extractedName || userName || "";

    // 2. Guardrail: Purely non-legal queries (cooking, coding, sports, movies, etc.)
    if (isNonLegalQuery(rawText)) {
      return NextResponse.json({
        reply: `I can only assist with legal matters of the court, legal advice, and legal documentation for Adv. Shareen Hussain's chambers.

How can I assist you with a legal question today?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "View Legal Services", href: "/legal-services" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal query.")}`, external: true },
        ],
      });
    }

    // 3. Guardrail: Overly deep / high-risk / guarantee litigation questions
    if (isOverlyDeepOrComplex(rawText)) {
      const greeting = activeUserName ? `${activeUserName}, ` : "";
      return NextResponse.json({
        reply: `${greeting}because this matter involves specific case facts, evidence examination, and critical court proceedings, Adv. Shareen Hussain needs to review your case documents directly in a private consultation.

Indian courts decide cases strictly based on evidence, statutory law, and judicial precedents. Adv. Shareen will review your documents and provide a direct legal evaluation.

Would you like to schedule an in-person chamber consultation at Trisharan Square, Nagpur or an online video session?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "WhatsApp Legal Desk (+91 83296 31199)", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need a consultation regarding a complex court litigation matter.")}`, external: true },
          { label: "View Chamber Timings", href: "/contact" },
        ],
      });
    }

    // 4. If Grok AI (xAI) API Key is configured in environment, call Grok AI!
    const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (grokApiKey) {
      try {
        const grokMessages = [
          { role: "system", content: LEGAL_SYSTEM_PROMPT },
        ];

        // Include recent conversation history (up to last 6 messages)
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-6).forEach((h: any) => {
            if (h.sender === "user") {
              grokMessages.push({ role: "user", content: h.text });
            } else if (h.sender === "bot") {
              grokMessages.push({ role: "assistant", content: h.text });
            }
          });
        }

        // Add current user message with context of user name
        const userPrompt = activeUserName && !rawText.toLowerCase().includes(activeUserName.toLowerCase())
          ? `[Client Name: ${activeUserName}] ${rawText}`
          : rawText;

        grokMessages.push({ role: "user", content: userPrompt });

        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${grokApiKey}`,
          },
          body: JSON.stringify({
            model: "grok-2-latest",
            messages: grokMessages,
            temperature: 0.3,
            max_tokens: 450,
          }),
        });

        if (grokRes.ok) {
          const grokData = await grokRes.json();
          const grokReply = grokData.choices?.[0]?.message?.content?.trim();
          if (grokReply) {
            // Attach intelligent suggested actions based on context
            const dynamicActions = [];
            const rLower = grokReply.toLowerCase() + " " + query;
            if (rLower.includes("marriage") || rLower.includes("nikah") || rLower.includes("shaadi")) {
              dynamicActions.push({ label: "Court Marriage Guide", href: "/court-marriage" });
            }
            if (rLower.includes("trademark") || rLower.includes("brand") || rLower.includes("startup") || rLower.includes("company")) {
              dynamicActions.push({ label: "Trademark Services", href: "/trademark-registration" });
            }
            dynamicActions.push({ label: "Book Consultation Slot", href: "/book" });
            dynamicActions.push({
              label: "WhatsApp Legal Desk",
              href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(`Hello Adv. Shareen, I have an inquiry regarding: ${rawText.slice(0, 80)}`)}`,
              external: true,
            });

            return NextResponse.json({
              reply: grokReply,
              userName: activeUserName,
              suggestedActions: dynamicActions.slice(0, 3),
            });
          }
        }
      } catch (e) {
        console.error("Grok AI API call failed, falling back to trained rule engine:", e);
      }
    }

    // 5. TRAINED LOCAL LEGAL RULE-ENGINE (High Performance Fallback)
    // 5A. Name Introduction Handling (e.g. "My name is Faiez", "I am Faiez")
    if (extractedName) {
      return NextResponse.json({
        reply: `Hi ${extractedName}! How are you doing today?

How can Adv. Shareen Hussain's chamber assist you with your legal case or documentation?`,
        userName: extractedName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Explore Legal Services", href: "/legal-services" },
          { label: "Court Marriage Guidance", href: "/court-marriage" },
          { label: "Trademark / Startup Help", href: "/trademark-registration" },
        ],
      });
    }

    // 5B. Polite "How are you" / "I am good"
    if (
      query.includes("how are you") ||
      query.includes("how r u") ||
      query === "i am good" ||
      query === "i'm good" ||
      query === "i am fine" ||
      query === "i'm fine" ||
      query === "all good"
    ) {
      const namePart = activeUserName ? ` ${activeUserName}` : "";
      return NextResponse.json({
        reply: `I am doing well, thank you${namePart}!

How can I assist you with your legal case, court matter, or documentation today?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Court Marriage Guidance", href: "/court-marriage" },
          { label: "Trademark Registration", href: "/trademark-registration" },
          { label: "Office Timings & Location", href: "/contact" },
        ],
      });
    }

    // 5C. Short, Natural Greetings ("hi", "hello", "hey", "namaste", "good morning", etc.)
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
      const greeting = activeUserName
        ? `Hello ${activeUserName}! Welcome back to True Legal Advice.`
        : `Hello! Welcome to True Legal Advice. I am the AI assistant of Adv. Shareen Hussain.`;

      return NextResponse.json({
        reply: `${greeting} How can I help you today?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Explore Legal Services", href: "/legal-services" },
          { label: "Chamber Timings & Location", href: "/contact" },
        ],
      });
    }

    // 5D. High Court Practice (Bombay High Court Nagpur Bench, Writ, Appeals, Revisions)
    if (
      query.includes("high court") ||
      query.includes("writ") ||
      query.includes("bombay high court") ||
      query.includes("appeal") ||
      query.includes("revision") ||
      query.includes("stay order") ||
      query.includes("article 226") ||
      query.includes("article 227") ||
      query.includes("quashing")
    ) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain actively practices at the Bombay High Court (Nagpur Bench), handling:
• Writ Petitions under Article 226 & 227 of the Constitution
• Criminal & Civil Appeals, Revisions & Stay Applications
• Section 482 CrPC FIR Quashing & High Court Bail Petitions
• Challenging arbitrary government orders, tender disputes & tribunal appeals

Would you like to schedule an urgent consultation to review your court case records?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book High Court Consultation", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need legal representation at the Bombay High Court (Nagpur Bench).")}`, external: true },
          { label: "Chamber Address & Timings", href: "/contact" },
        ],
      });
    }

    // 5E. Criminal Defense, Bail, Police Complaints, FIR, Cheque Bounce
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides experienced criminal defense representation across Sessions Courts and High Court:
• Anticipatory Bail (Sec 438) & Regular Bail (Sec 439)
• FIR Quashing & Police Harassment Protection
• Cheque Bounce Cases (Section 138 NI Act) — Legal notice drafting & court trial
• Cyber Crime, Financial Fraud & Defamation cases
• Criminal trial defense & witness examination

For urgent arrest or bail matters, immediate consultation is recommended.`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Urgent Bail Consultation", href: "/book" },
          { label: "Emergency WhatsApp Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have an urgent Criminal / Bail legal matter.")}`, external: true },
        ],
      });
    }

    // 5F. Civil Litigation, Property Disputes, Deeds, Wills, Land Title
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain handles complete Civil & Real Estate Property matters in Nagpur District & Civil Courts:
• Comprehensive 30-Year Property Title Search & Due Diligence Reports
• Drafting & Government Registration of Sale Deeds, Gift Deeds, Release Deeds & Wills
• Partition Suits, Property Ownership Disputes & Declaration of Title
• Permanent Injunctions, Tenant Eviction Suits & Lease Agreements
• Succession Certificates, Legal Heir Certificates & Power of Attorney (PoA)

Would you like Adv. Shareen to inspect your property documents?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Property Consultation", href: "/book" },
          { label: "WhatsApp Document Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with Property verification / Deed drafting.")}`, external: true },
        ],
      });
    }

    // 5G. Court Marriage & Special Marriage Act
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain specializes in Court Marriage, Love Marriage registrations, and Special Marriage Act (1954) filings with 100% confidentiality.

💍 Key Highlights:
• Lawful procedure under Special Marriage Act, 1954 or personal marriage laws
• Legal security & police protection under Article 21 for consenting adults
• Age verification (Boy: 21+, Girl: 18+) & preparation of affidavits & notices
• Guidance on 3 witnesses & registrar representation in Nagpur
• Official Government Marriage Certificate issued directly by the Registrar`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Guide & Checklist", href: "/court-marriage" },
          { label: "Book Private Marriage Advisory", href: "/book" },
          { label: "Confidential WhatsApp Inquiry", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage.")}`, external: true },
        ],
      });
    }

    // 5H. Divorce, Family Disputes, Maintenance, Child Custody, DV Act
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
      return NextResponse.json({
        reply: `We handle family and matrimonial disputes with utmost sensitivity, confidentiality, and firm legal representation in Nagpur Family Courts:
• Mutual Consent Divorce (Fast-track cooling period waiver) & Contested Divorce
• Maintenance & Interim Alimony under Section 125 CrPC & Personal Laws
• Child Custody, Visitation Rights & Guardianship petitions
• Domestic Violence Protection Orders & Residence Rights under DV Act
• Formal Matrimonial Settlement Agreements & Mediation`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Confidential Consultation", href: "/book" },
          { label: "WhatsApp Advocate Confidentially", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need private consultation regarding a Family / Matrimonial matter.")}`, external: true },
        ],
      });
    }

    // 5I. Trademark, Copyright, Startup & Corporate Compliance
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain is an officially certified Trade Mark Attorney (B.Com, M.Com, LL.B) and founder of True Legal Advice (www.securemybrand.in).

🚀 Brand & Corporate Solutions:
• Trademark Search, Filing & Objection Hearings across all Classes (1–45)
• Copyright Registration for logos, software & creative works
• Company Incorporation (Pvt Ltd, LLP, One Person Company)
• GUMASTA / Shop Act License & MSME Udyam Registration
• GST Registration, Monthly Returns & FSSAI Food Licenses
• Commercial Contracts, NDAs, Service Level Agreements & Vendor Contracts`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Explore Trademark Practice", href: "/trademark-registration" },
          { label: "Book Trademark Advisory", href: "/book" },
          { label: "WhatsApp for Brand Clearance", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I want to conduct a Trademark search & registration.")}`, external: true },
        ],
      });
    }

    // 5J. Legal Documentation, Drafting, Notices, Affidavits
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides expert legal drafting and vetted documentation:
• Formal Legal Notices (Recovery of money, breach of contract, defamation, 138 NI Act)
• Affidavits for court, name change, passport, and government departments
• General & Special Power of Attorney (PoA)
• Commercial Contracts, Partnership Deeds, NDAs & Employment Agreements
• Rent / Lease Agreements on official Stamp Paper with notary & registration`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Drafting Consultation", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need help drafting a Legal Notice / Agreement / Affidavit.")}`, external: true },
        ],
      });
    }

    // 5K. Fees, Consultation Charges & Booking Process
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides dedicated, strategic legal consultations for both Online Video Call (Google Meet) and In-Office Walk-in sessions at Trisharan Square, Nagpur.

📋 How to Book Your Slot:
1. Tap "Book Consultation Slot" below to view live calendar availability
2. Choose between Online Video Call or In-Person Office Visit
3. Select your preferred date & time slot
4. Provide your contact details & brief overview of your case
5. Instant WhatsApp confirmation from our legal desk`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "WhatsApp Legal Desk (+91 83296 31199)", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I would like to book a legal consultation session.")}`, external: true },
          { label: "View Chamber Timings", href: "/contact" },
        ],
      });
    }

    // 5L. Office Location, Timings, Nagpur Chamber
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
      return NextResponse.json({
        reply: `Adv. Shareen Hussain Chamber Details:

📍 Address:
Trisharan Square, Nagpur - 440027, Maharashtra, India
(Practice at Bombay High Court, Nagpur Bench & District Courts)

⏰ Walk-in Chamber Desk Hours:
• Morning Walk-in: 9:30 AM – 11:00 AM
• Evening Walk-in: 5:30 PM – 8:30 PM
• Online Video Consultations: Monday to Saturday by scheduled appointment

📞 Direct Chamber Contact:
• Phone & WhatsApp: +91 83296 31199`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Get Chamber Directions", href: site.googleMapsUrl, external: true },
          { label: "Contact Page", href: "/contact" },
        ],
      });
    }

    // 5M. Fallback: Concise legal overview covering all practices
    const namePrefix = activeUserName ? `${activeUserName}, ` : "";
    return NextResponse.json({
      reply: `${namePrefix}Adv. Shareen Hussain practices across Bombay High Court (Nagpur Bench) and District Courts, handling all legal matters including:

• High Court Litigation & Writ Petitions
• Criminal Defense, Bail & 138 NI Act Cheque Bounce
• Civil Suits, Property Title Search & Deeds/Wills
• Court Marriage & Special Marriage Act (Confidential)
• Family Law, Divorce, Child Custody & Maintenance
• Trademark, Copyright & Business Startup Compliance

How can we assist you with your specific legal matter today?`,
      userName: activeUserName,
      suggestedActions: [
        { label: "Book Consultation Slot", href: "/book" },
        { label: "Court Marriage Help", href: "/court-marriage" },
        { label: "Trademark Services", href: "/trademark-registration" },
        { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal inquiry.")}`, external: true },
      ],
    });
  } catch (err: any) {
    console.error("AI Assistant API error:", err);
    return NextResponse.json(
      {
        error: "Failed to process query",
        reply: "I am ready to assist you. Please share your legal query, or contact Adv. Shareen Hussain's chamber directly on WhatsApp at +91 83296 31199.",
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal query.")}`, external: true },
        ],
      },
      { status: 200 }
    );
  }
}
