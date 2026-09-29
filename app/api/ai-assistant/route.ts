import { NextResponse } from "next/server";
import { site } from "@/lib/site-config";

// Comprehensive blacklist of words that must NEVER be treated as a person's name
const NAME_BLACKLIST = new Set([
  "now", "here", "there", "not", "ready", "happy", "sad", "good", "fine", "ok", "okay",
  "married", "single", "divorced", "facing", "looking", "seeking", "asking", "having",
  "trying", "calling", "writing", "living", "working", "stuck", "student", "citizen",
  "indian", "adult", "boy", "girl", "man", "woman", "guy", "person", "human", "someone",
  "anyone", "nobody", "new", "old", "from", "with", "just", "also", "very", "so", "too",
  "sure", "yes", "no", "legal", "client", "friend", "brother", "sister", "father", "mother",
  "hindu", "muslim", "christian", "sikh", "jain", "buddhist", "jew", "parsi", "islam", "jainism",
  "hinduism", "christianity", "sikhism", "buddhism", "true", "false", "null", "undefined",
  "advocate", "lawyer", "judge", "court", "police", "fir", "bail", "pocso", "case", "help"
]);

// Helper: strictly sanitize and validate a name string
export function sanitizeName(name: unknown): string {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!/^[a-zA-Z]{2,20}$/.test(trimmed)) return "";
  const lower = trimmed.toLowerCase();
  if (NAME_BLACKLIST.has(lower)) return "";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Helper: Extract user's name ONLY when explicitly introduced, e.g. "My name is Faiez"
function extractNameFromMessage(text: string): string {
  const clean = text.trim();

  // If message contains numbers, questions, or legal/religious words, never extract name
  if (
    clean.includes("?") ||
    /\d/.test(clean) ||
    /\b(can|could|how|what|where|when|why|should|would|will|do|does|want|need|help|marry|marriage|shaadi|nikah|bail|case|court|lawyer|advocate|fee|charge|cost|divorce|property|police|fir|age|years?|old|sex|girl|boy|minor|pocso|hindu|muslim|christian|sikh|jain|buddhist|now|today|tomorrow)\b/i.test(clean)
  ) {
    return "";
  }

  // Strictly ONLY match explicit "my name is <Name>" or "call me <Name>"
  const match =
    clean.match(/^(?:hi|hello|hey|namaste)?[\s,]*my name is\s+([a-zA-Z]{2,20})\.?$/i) ||
    clean.match(/^(?:hi|hello|hey|namaste)?[\s,]*call me\s+([a-zA-Z]{2,20})\.?$/i);

  if (match && match[1]) {
    return sanitizeName(match[1]);
  }

  return "";
}

// Master System Prompt for Grok AI (xAI)
const LEGAL_SYSTEM_PROMPT = `You are the official, elite AI Legal Desk Counsel for Advocate Shareen Hussain (B.Com, M.Com, LL.B), practicing at the Bombay High Court (Nagpur Bench), District & Sessions Courts, and Family Courts, under the chamber True Legal Advice (Nagpur, Maharashtra, India).

CHAMBER INFORMATION:
- Advocate: Adv. Shareen Hussain (B.Com, M.Com, LL.B)
- Chamber Location: Trisharan Square, Nagpur - 440027, Maharashtra, India
- Practice: Bombay High Court (Nagpur Bench), District & Sessions Courts, Family Courts, Consumer Forums, Revenue Courts, NCLT
- Phone / WhatsApp: +91 83296 31199
- Website: True Legal Advice (www.securemybrand.in)
- Walk-in Chamber Hours: Morning: 9:30 AM – 11:00 AM | Evening: 5:30 PM – 8:30 PM (Monday to Saturday)
- Consultations: Online Video Call (Google Meet) & In-Person Chamber Visit (Booking available at /book)

CORE PRINCIPLES & LEGAL INTELLIGENCE (INDIAN LAW):
1. DEEP CONTEXT UNDERSTANDING - NEVER CONFUSE STATEMENTS OR RELIGION WITH NAMES:
   - When a user states their religion or identity (e.g. "I am Christian", "I am Jain", "I am Hindu", "I am Muslim", "I am Sikh"), this is their RELIGION or COMMUNITY, NEVER a person's name!
   - ABSOLUTE PROHIBITION: NEVER address or greet the user as "Christian", "Jain", "Hindu", "Muslim", etc. (e.g. NEVER say "Christian, advocate...", "Yeah Jain, thank you for coming", "Hi Hindu!").
   - Address their legal situation respectfully with statutory precision:
     • Christianity: Explain the Indian Christian Marriage Act, 1872 (church ceremony or registrar solemnization under Part V), Indian Divorce Act, 1869 (Section 10A mutual consent divorce), and the Special Marriage Act, 1954 for civil court marriage without religious conversion.
     • Jainism: Explain legal rights under the Hindu Marriage Act, 1955 and Hindu Succession Act, 1956 (which legally encompass Jains under Section 2), and the Special Marriage Act, 1954.
     • Hinduism: Explain the Hindu Marriage Act, 1955, Hindu Succession Act, 1956 (ancestral property and daughters' equal coparcenary share), and the Special Marriage Act, 1954.
     • Islam: Explain secular court marriage under the Special Marriage Act, 1954 (confidential registration, Article 21 police protection), or Dissolution of Muslim Marriages Act, 1939.
     • Inter-faith / Inter-caste: Detail the Special Marriage Act, 1954 (100% legal, confidential, no conversion required, Article 21 police protection).

2. CRIMINAL LAW & POCSO ACT, 2012 (AGE OF CONSENT IN INDIA):
   - If anyone inquires about sexual activity, physical intimacy, or marriage with someone aged 17, 16, or any age under 18:
   - State UNEQUIVOCALLY and IMMEDIATELY that this is strictly illegal and a heinous criminal offense in India.
   - Statutory Law: Under the Protection of Children from Sexual Offences (POCSO) Act, 2012 and Section 63 of Bharatiya Nyaya Sanhita (BNS) / Section 375 IPC, the legal age of consent in India is STRICTLY 18 YEARS.
   - Consent Void: Any sexual relationship with a minor (under 18)—even with mutual consent—is classified as statutory rape / aggravated penetrative sexual assault. Under Indian law, a minor's consent is completely null and void.
   - Severity: Non-bailable, cognizable offense carrying mandatory rigorous imprisonment of 10 to 20 years or life imprisonment. Adv. Shareen Hussain provides defense counsel and POCSO representation at the Sessions Courts and Bombay High Court.

3. COURT MARRIAGE AGE:
   - Legal age of marriage in India: Groom (Male) must be 21+ years old, Bride (Female) must be 18+ years old under the Special Marriage Act, 1954.
   - Consenting adults of legal age have the fundamental right under Article 21 of the Constitution to marry of their own free will without parental consent or societal interference.

4. WE DO ALL LEGAL SERVICES:
   Adv. Shareen Hussain provides representation, counseling, and drafting for:
   - High Court Litigation: Writ Petitions (Articles 226/227), Criminal & Civil Appeals, Revisions, Stay Orders at Bombay High Court (Nagpur Bench).
   - Criminal Defense: Anticipatory Bail (Sec 438), Regular Bail (Sec 439), FIR Quashing (Sec 482 CrPC), Cheque Bounce (Sec 138 NI Act), Cyber Crime, Police Harassment Protection.
   - Civil & Property Law: 30-Year Property Title Search, Due Diligence, Sale Deed, Gift Deed, Will drafting & registration, Partition Suits, Injunctions, Eviction, RERA.
   - Family Law & Matrimonial: Mutual Consent Divorce, Contested Divorce, Child Custody, Maintenance (Sec 125 CrPC), Domestic Violence (DV Act).
   - Corporate, Trademark & Startup Compliance: Trademark Search, Filing & Objection Hearings (Classes 1–45), Copyright, Company Registration (Pvt Ltd, LLP, OPC), GST, Gumasta / Shop Act, MSME Udyam, FSSAI Food Licenses, NDAs & Commercial Contracts.
   - Drafting: Affidavits, Legal Notices, Power of Attorney, Deeds.

5. TONE, STYLE & ACTIONABILITY:
   - Clear, reassuring, professional, and distinctly authoritative under Indian law.
   - Avoid generic fluff. Answer the user's specific question directly with legal grounding.
   - Always encourage them to book a consultation slot or contact Adv. Shareen Hussain's legal desk for document review or representation.`;

// Helper: Call xAI Grok API across supported models with automatic fallback
async function callGrokAI(apiKey: string, messages: any[]): Promise<string | null> {
  const models = ["grok-4.7", "grok-2-latest", "grok-2", "grok-beta", "grok-2-1212"];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          console.log(`[AI Desk] Successfully generated response using Grok model: ${model}`);
          return text;
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Desk] Grok model ${model} returned ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[AI Desk] Error calling Grok model ${model}:`, err);
    }
  }

  return null;
}

// Helper: Call Google Gemini API (Free tier supported via Google AI Studio)
async function callGeminiAI(apiKey: string, userMessage: string, history: any[], clientName: string): Promise<string | null> {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach((h: any) => {
      contents.push({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      });
    });
  }

  const promptText = clientName && !userMessage.toLowerCase().includes(clientName.toLowerCase())
    ? `[Client Name: ${clientName}] ${userMessage}`
    : userMessage;

  contents.push({
    role: "user",
    parts: [{ text: promptText }],
  });

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: LEGAL_SYSTEM_PROMPT }] },
          generationConfig: { maxOutputTokens: 600, temperature: 0.3 },
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          console.log(`[AI Desk] Successfully generated response using Gemini model: ${model}`);
          return text;
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Desk] Gemini model ${model} returned ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[AI Desk] Error calling Gemini model ${model}:`, err);
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const { message, history, userName } = await req.json();
    const rawText = (message || "").trim();
    const query = rawText.toLowerCase();

    // 1. Detect if user introduced their actual name (strict pattern, never matches religion or statements)
    const extractedName = extractNameFromMessage(rawText);
    const sanitizedPassedName = sanitizeName(userName);
    const activeUserName = extractedName || sanitizedPassedName || "";

    // 2. CHECK GROK AI & GEMINI AI FIRST!
    const grokApiKey = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY || "").trim();
    const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();

    let aiReply: string | null = null;

    if (grokApiKey) {
      const grokMessages = [
        { role: "system", content: LEGAL_SYSTEM_PROMPT },
      ];

      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          if (h.sender === "user") {
            grokMessages.push({ role: "user", content: h.text });
          } else if (h.sender === "bot") {
            grokMessages.push({ role: "assistant", content: h.text });
          }
        });
      }

      const userPrompt = activeUserName && !rawText.toLowerCase().includes(activeUserName.toLowerCase())
        ? `[Client Name: ${activeUserName}] ${rawText}`
        : rawText;

      grokMessages.push({ role: "user", content: userPrompt });
      aiReply = await callGrokAI(grokApiKey, grokMessages);
    }

    // Fallback to Google Gemini AI if Grok is not configured or failed
    if (!aiReply && geminiApiKey) {
      aiReply = await callGeminiAI(geminiApiKey, rawText, history, activeUserName);
    }

    if (aiReply) {
      const dynamicActions = [];
      const combined = (rawText + " " + aiReply).toLowerCase();
      if (combined.includes("marriage") || combined.includes("marry") || combined.includes("shaadi") || combined.includes("nikah") || combined.includes("pocso")) {
        dynamicActions.push({ label: "Court Marriage Help", href: "/court-marriage" });
      }
      if (combined.includes("trademark") || combined.includes("brand") || combined.includes("startup") || combined.includes("company")) {
        dynamicActions.push({ label: "Trademark Services", href: "/trademark-registration" });
      }
      dynamicActions.push({ label: "Book Consultation Slot", href: "/book" });
      dynamicActions.push({
        label: "WhatsApp Legal Desk",
        href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(`Hello Adv. Shareen, I have an inquiry regarding: ${rawText.slice(0, 80)}`)}`,
        external: true,
      });

      return NextResponse.json({
        reply: aiReply,
        userName: activeUserName,
        suggestedActions: dynamicActions.slice(0, 3),
      });
    }

    // =========================================================================
    // 3. TRAINED LOCAL LEGAL RULE-ENGINE (High Performance Fallback)
    // Only runs when AI API keys are not configured or network calls failed
    // =========================================================================

    // 3A. POCSO Act & Age of Consent under Indian Law (Strict Criminal Protection)
    if (
      (query.includes("sex") || query.includes("sexual") || query.includes("physical") || query.includes("intimate") || query.includes("sleep with") || query.includes("intercourse") || query.includes("relation")) &&
      (query.includes("17") || query.includes("16") || query.includes("15") || query.includes("14") || query.includes("13") || query.includes("under 18") || query.includes("below 18") || query.includes("minor") || query.includes("underage"))
    ) {
      return NextResponse.json({
        reply: `⚠️ NO. Under Indian criminal law, this is strictly illegal and a serious, non-bailable criminal offense.

🚨 Legal Age of Consent in India is 18 Years:
• Protection of Children from Sexual Offences (POCSO) Act, 2012: The legal age of consent in India is strictly 18 years. Anyone below 18 is legally defined as a child/minor.
• Statutory Rape / Sexual Assault: Under the POCSO Act, 2012 and Section 63 of Bharatiya Nyaya Sanhita (BNS) / Section 375 IPC, any sexual act with a person under 18 years of age is classified as statutory rape / penetrative sexual assault.
• Minor Consent Has Zero Legal Validity: Under Indian law, mutual consent of a 17-year-old has NO legal defense. Even if consensual, it is prosecuted as a heinous criminal offense.
• Severe Penal Consequences: These are non-bailable, cognizable offenses carrying mandatory rigorous imprisonment of 10 to 20 years or life imprisonment.

Adv. Shareen Hussain represents clients in Criminal Defense and POCSO matters across Sessions Courts and the Bombay High Court (Nagpur Bench). If you are facing an FIR, police inquiry, or legal notice, immediate legal counsel is essential.`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Urgent Legal Consultation", href: "/book" },
          { label: "Emergency Criminal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need urgent legal guidance regarding a criminal / POCSO matter.")}`, external: true },
        ],
      });
    }

    // 3B. Christianity & Indian Christian Marriage / Divorce Laws
    if (query.includes("christian")) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides experienced counsel under Christian Personal Laws and the Special Marriage Act:

✝️ Christian Marriage & Family Legal Framework in India:
• Indian Christian Marriage Act, 1872: Solemnization and registration of Christian marriages through licensed ministers or before the Marriage Registrar under Part V.
• Indian Divorce Act, 1869 (Amended 2001): Mutual consent divorce under Section 10A, dissolution of marriage, restitution of conjugal rights, and permanent alimony.
• Special Marriage Act, 1954: Civil court marriage between a Christian and a person of any other faith without requiring religious conversion.
• Indian Succession Act, 1925: Property inheritance, testamentary succession, drafting of Wills, and Letters of Administration / Probate for Christian estates.

How can Adv. Shareen Hussain assist you with your specific legal matter or documentation?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Help", href: "/court-marriage" },
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Property & Succession", href: "/legal-services" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need legal guidance regarding Christian personal law / Court Marriage.")}`, external: true },
        ],
      });
    }

    // 3C. Jainism & Jain Personal Law / Succession
    if (query.includes("jain")) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides experienced counsel under Jain Personal Rights and Indian Statutory Law:

🌿 Legal Framework for the Jain Community in India:
• Marriage Laws: In India, marriages within the Jain community are legally governed under the Hindu Marriage Act, 1955 (Section 2 includes Jains, Buddhists, and Sikhs), or through the Special Marriage Act, 1954 for civil court registration.
• Succession & Property Rights: Property inheritance and partition are governed by the Hindu Succession Act, 1956 (Amended 2005) and customary Jain practices, ensuring equal inheritance rights for daughters and coparcenary claims.
• Inter-faith Court Marriage: Secular, 100% confidential registration under the Special Marriage Act, 1954 without religious conversion.
• Trust & Institutional Matters: Registration and management of Jain religious and charitable trusts under the Maharashtra Public Trusts Act.

How can Adv. Shareen Hussain assist you with your specific legal matter or documentation?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Help", href: "/court-marriage" },
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Property & Succession", href: "/legal-services" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need legal guidance regarding Jain personal law / Court Marriage.")}`, external: true },
        ],
      });
    }

    // 3D. Hinduism & Hindu Personal Law
    if (query.includes("hindu")) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides experienced counsel under Hindu Personal Law and the Special Marriage Act:

🕉️ Under Hindu Personal Law & Indian Statutory Law:
• Hindu Marriage Act, 1955: Traditional ceremony registration, restitution of conjugal rights, and fast-track mutual consent divorce (Sec 13B).
• Special Marriage Act, 1954: Secular court marriage between two consenting adults of different religions or castes without requiring religious conversion.
• Hindu Succession Act, 1956 (Amended 2005): Ancestral property inheritance, equal coparcenary rights for daughters, partition suits, and legal heir certificates.
• Hindu Adoption and Maintenance Act, 1956: Lawful adoption procedures and spousal/child maintenance rights.

How can Adv. Shareen Hussain assist you with your specific legal matter or documentation?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Help", href: "/court-marriage" },
          { label: "Book Consultation Slot", href: "/book" },
          { label: "Property & Succession", href: "/legal-services" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need legal guidance regarding Hindu law / Special Marriage Act.")}`, external: true },
        ],
      });
    }

    // 3E. Islam & Special Marriage Act
    if (query.includes("muslim")) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain specializes in confidential legal advisory and court marriages under Indian Law:

• Special Marriage Act, 1954: Secular civil marriage between consenting adults of different religions without requiring conversion, with complete Article 21 constitutional security and police protection.
• Dissolution of Muslim Marriages Act, 1939: Legal dissolution, custody rights, and maintenance advisory.
• Document Drafting: Registration of marriage, affidavits, and notarized declarations.

How can Adv. Shareen Hussain assist you with your specific legal matter?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Help", href: "/court-marriage" },
          { label: "Book Consultation Slot", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage.")}`, external: true },
        ],
      });
    }

    // 3F. Marriage Age & Court Marriage Eligibility (e.g. "I am now 21 can I marry", "can I marry at 21")
    if (
      (query.includes("21") || query.includes("18") || query.includes("age") || query.includes("eligible") || query.includes("can i marry") || query.includes("can we marry")) &&
      (query.includes("marry") || query.includes("marriage") || query.includes("shaadi") || query.includes("nikah") || query.includes("court marriage") || query.includes("special marriage"))
    ) {
      return NextResponse.json({
        reply: `Yes, absolutely! Under Indian law (Special Marriage Act, 1954 and Hindu Marriage Act, 1955):

✅ Legal Age of Marriage in India:
• Groom (Male): Minimum 21 years of age completed.
• Bride (Female): Minimum 18 years of age completed.

Since you are 21, you have legally reached the age of majority and are fully entitled to marry. Under Article 21 of the Constitution of India, two consenting adults have the fundamental legal right to marry of their own free will without requiring parental consent.

📋 Essential Requirements for Court Marriage in Nagpur:
1. Valid Age & Identity Proof (Aadhaar Card, PAN Card, Birth Certificate or 10th School Leaving Certificate)
2. Address Proof & Passport-size photographs of both bride and groom
3. 3 adult witnesses (any friends, colleagues, or relatives) with their Aadhaar/voter ID
4. Affidavits regarding age, marital status, and free consent

Adv. Shareen Hussain provides complete, 100% confidential legal guidance from drafting notice & affidavits to direct registrar appearance and government marriage certificate issuance.

Would you like to review the step-by-step document checklist or book a private consultation?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Court Marriage Checklist", href: "/court-marriage" },
          { label: "Book Marriage Consultation", href: "/book" },
          { label: "Confidential WhatsApp (+91 83296 31199)", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I am 21 years old and need guidance regarding Court Marriage registration.")}`, external: true },
        ],
      });
    }

    // 3G. Actual Name Introduction Handling (e.g. "My name is Faiez")
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

    // 3H. Polite "How are you" / "I am good"
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

    // 3I. Short, Natural Greetings ("hi", "hello", "hey", "namaste", "good morning", etc.)
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

    // 3J. Indian Contract Act, 1872 & Commercial Agreements (e.g. "valid contract", "requirements for a contract")
    if (
      query.includes("contract") ||
      query.includes("agreement") ||
      query.includes("section 10") ||
      query.includes("breach") ||
      query.includes("consideration") ||
      query.includes("consent") ||
      query.includes("offer and acceptance") ||
      query.includes("competency") ||
      query.includes("nda") ||
      query.includes("memorandum")
    ) {
      return NextResponse.json({
        reply: `Under the Indian Contract Act, 1872 (specifically Section 10), all agreements are enforceable contracts if entered into with the following essential legal requirements:

📜 Essential Elements of a Valid Contract in India:
1. Offer & Acceptance (Sections 2(a) & 2(b)): Lawful proposal communicated by one party and absolute, unqualified acceptance by the other.
2. Free Consent (Sections 13 & 14): Mutual consent (*consensus ad idem*) free from Coercion (Sec 15), Undue Influence (Sec 16), Fraud (Sec 17), Misrepresentation (Sec 18), or Bilateral Mistake (Sec 20).
3. Competency / Capacity to Contract (Section 11): Both parties must have attained the age of majority (18+ years), be of sound mind, and not be disqualified by any law.
4. Lawful Consideration & Object (Section 23): The exchange must have real legal value and cannot be unlawful, fraudulent, injurious to person/property, or opposed to public policy.
5. Intention to Create Legal Relations: Express or implied mutual intention that breach will give rise to legal consequences.
6. Not Expressly Declared Void: Agreements in restraint of marriage (Sec 26), trade (Sec 27), or legal proceedings (Sec 28) are void ab initio.
7. Stamp Duty & Registration: Certain agreements (real estate transfer, lease >1 yr, arbitration clauses) must be executed on requisite non-judicial stamp paper under the Maharashtra Stamp Act and registered under the Registration Act, 1908.

Adv. Shareen Hussain provides end-to-end legal drafting, contract vetting, non-disclosure agreements (NDAs), and breach of contract litigation at Nagpur District Courts & High Court.`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Contract Advisory", href: "/book" },
          { label: "Draft Legal Agreements", href: "/legal-services" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with Contract drafting / Agreement review.")}`, external: true },
        ],
      });
    }

    // 3K. Criminal Law, Bail (438/439 CrPC), FIR Quashing (482), Cheque Bounce (138 NI Act)
    if (
      query.includes("bail") ||
      query.includes("anticipatory") ||
      query.includes("arrest") ||
      query.includes("fir") ||
      query.includes("police") ||
      query.includes("criminal") ||
      query.includes("quashing") ||
      query.includes("cheque bounce") ||
      query.includes("138") ||
      query.includes("ni act") ||
      query.includes("cyber") ||
      query.includes("498a")
    ) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides experienced criminal defense representation across Sessions Courts and Bombay High Court (Nagpur Bench):
• Anticipatory Bail (Sec 438 CrPC / Sec 482 BNSS) & Regular Bail (Sec 439 CrPC / Sec 483 BNSS)
• FIR Quashing Petitions & Police Harassment Protection under Section 482 CrPC / Article 226
• Cheque Bounce Cases (Section 138 NI Act) — Statutory legal notices & trial representation
• Cyber Crime, Financial Fraud & Defamation defense
• Criminal trial representation & witness cross-examination

For urgent arrest or bail matters, immediate consultation is recommended.`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Urgent Bail Consultation", href: "/book" },
          { label: "Emergency WhatsApp Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have an urgent Criminal / Bail legal matter.")}`, external: true },
        ],
      });
    }

    // 3L. Civil Litigation, Property Disputes, Deeds, Wills, Land Title
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
• Comprehensive 30-Year Property Title Search & Due Diligence Search Reports
• Drafting & Government Registration of Sale Deeds, Gift Deeds, Release Deeds & Registered Wills
• Partition Suits, Property Ownership Disputes & Declaration of Title
• Permanent Injunctions, Tenant Eviction Suits & Commercial Leases
• Succession Certificates, Legal Heir Certificates & Power of Attorney (PoA)

Would you like Adv. Shareen to inspect your property documents?`,
        userName: activeUserName,
        suggestedActions: [
          { label: "Book Property Consultation", href: "/book" },
          { label: "WhatsApp Document Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need assistance with Property verification / Deed drafting.")}`, external: true },
        ],
      });
    }

    // 3M. Court Marriage & Special Marriage Act
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

    // 3N. Divorce, Family Disputes, Maintenance, Child Custody, DV Act
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

    // 3O. Trademark, Copyright, Startup & Corporate Compliance
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

    // 3P. Legal Documentation, Drafting, Notices, Affidavits
    if (
      query.includes("draft") ||
      query.includes("notice") ||
      query.includes("affidavit") ||
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

    // 3Q. Fees, Consultation Charges & Booking Process
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

    // 3R. Office Location, Timings, Nagpur Chamber
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

    // 3S. Fallback: Concise legal overview covering all practices
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
