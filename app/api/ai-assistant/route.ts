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
  const models = ["grok-2-latest", "grok-2", "grok-beta", "grok-2-1212"];

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

export async function POST(req: Request) {
  try {
    const { message, history, userName } = await req.json();
    const rawText = (message || "").trim();
    const query = rawText.toLowerCase();

    // 1. Detect if user introduced their actual name (strict pattern, never matches religion or statements)
    const extractedName = extractNameFromMessage(rawText);
    const sanitizedPassedName = sanitizeName(userName);
    const activeUserName = extractedName || sanitizedPassedName || "";

    // 2. CHECK GROK AI FIRST! (If API key is available in environment or request)
    const grokApiKey = (process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY || "").trim();
    if (grokApiKey) {
      const grokMessages = [
        { role: "system", content: LEGAL_SYSTEM_PROMPT },
      ];

      // Include recent conversation history
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          if (h.sender === "user") {
            grokMessages.push({ role: "user", content: h.text });
          } else if (h.sender === "bot") {
            grokMessages.push({ role: "assistant", content: h.text });
          }
        });
      }

      // Add user prompt with client name context
      const userPrompt = activeUserName && !rawText.toLowerCase().includes(activeUserName.toLowerCase())
        ? `[Client Name: ${activeUserName}] ${rawText}`
        : rawText;

      grokMessages.push({ role: "user", content: userPrompt });

      const grokReply = await callGrokAI(grokApiKey, grokMessages);
      if (grokReply) {
        const dynamicActions = [];
        const combined = (rawText + " " + grokReply).toLowerCase();
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
          reply: grokReply,
          userName: activeUserName,
          suggestedActions: dynamicActions.slice(0, 3),
        });
      }
    }

    // =========================================================================
    // 3. TRAINED LOCAL LEGAL RULE-ENGINE (High Performance Fallback)
    // Only runs when Grok API key is not configured or network call failed
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

    // 3J. Fallback: Concise legal overview covering all practices
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
