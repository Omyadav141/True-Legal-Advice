import { NextResponse } from "next/server";
import { site } from "@/lib/site-config";

// Keyword-based intelligent legal triage engine + fallback
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const query = (message || "").toLowerCase().trim();

    // 1. Love Marriage / Court Marriage questions
    if (
      query.includes("love") ||
      query.includes("marriage") ||
      query.includes("nikah") ||
      query.includes("shaadi") ||
      query.includes("inter-caste") ||
      query.includes("inter-religion") ||
      query.includes("special marriage")
    ) {
      return NextResponse.json({
        reply: `Yes! Adv. Shareen Hussain specializes in Court Marriage, Love Marriage registrations, Special Marriage Act filings, and Muslim Law/Nikah advisory. 

We ensure confidential, 100% legal procedure with complete protection, documentation, and government marriage certificate issuance in Nagpur courts.

Would you like to book a confidential consultation or speak with the legal desk directly?`,
        suggestedActions: [
          { label: "Book Consultation (₹1,000)", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need confidential legal guidance regarding Court Marriage / Marriage Registration.")}`, external: true },
        ],
      });
    }

    // 2. Consultation fee & Booking questions
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
      query.includes("slot")
    ) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides dedicated, strategic legal consultations for both Online Video Call (Google Meet) and In-Office Walk-in consultations at Trisharan Square, Nagpur.

How Booking Works:
1. Visit our booking portal and select your preferred consultation format (Video or In-Chamber).
2. Choose your convenient date & available time slot.
3. Submit your details for instant WhatsApp confirmation from our chamber desk.`,
        suggestedActions: [
          { label: "Book Consultation Slot", href: "/book" },
          { label: "View Office Hours", href: "/contact" },
        ],
      });
    }

    // 3. Trademark / Copyright / Business / Startup questions
    if (
      query.includes("trademark") ||
      query.includes("brand") ||
      query.includes("copyright") ||
      query.includes("gst") ||
      query.includes("company") ||
      query.includes("pvt ltd") ||
      query.includes("startup") ||
      query.includes("gumasta") ||
      query.includes("msme") ||
      query.includes("fssai") ||
      query.includes("patent")
    ) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain is an officially certified Trade Mark Attorney and founder of True Legal Advice (www.securemybrand.in).

We provide end-to-end corporate and brand protection services:
• Trademark & Copyright Search & Registration
• Company Incorporation (Pvt Ltd, LLP, OPC)
• Gumasta / Shop Act & MSME Udyam
• GST Registration, ITR & TDS Compliance
• FSSAI Food License, IEC & ISO Certification`,
        suggestedActions: [
          { label: "Book Trademark Advisory", href: "/book" },
          { label: "WhatsApp for Brand Check", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I want to conduct a Trademark search & registration for my brand.")}`, external: true },
        ],
      });
    }

    // 4. Property, Sale Deed, Will, Agreements
    if (
      query.includes("property") ||
      query.includes("deed") ||
      query.includes("will") ||
      query.includes("title") ||
      query.includes("land") ||
      query.includes("flat") ||
      query.includes("rent agreement") ||
      query.includes("gift deed") ||
      query.includes("power of attorney")
    ) {
      return NextResponse.json({
        reply: `Adv. Shareen Hussain provides rigorous property title verification, search reports, and legal drafting for:
• Sale Deed, Gift Deed, Will drafting & registration
• Property Title Verification & Legal Opinion
• Rent / Lease Agreements & Stamp Paper services
• Family Settlements & Power of Attorney (PoA)`,
        suggestedActions: [
          { label: "Book Property Consultation", href: "/book" },
          { label: "WhatsApp Legal Desk", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need help with Property verification / Deed drafting.")}`, external: true },
        ],
      });
    }

    // 5. Divorce, Family, Domestic Violence, Maintenance
    if (
      query.includes("divorce") ||
      query.includes("domestic") ||
      query.includes("violence") ||
      query.includes("maintenance") ||
      query.includes("family") ||
      query.includes("custody") ||
      query.includes("muslim law")
    ) {
      return NextResponse.json({
        reply: `We handle family and matrimonial disputes with utmost discretion, empathy, and firm legal representation in Nagpur Family Courts:
• Mutual & Contested Divorce
• Maintenance, Alimony & Child Custody
• Domestic Violence (DV Act) protection
• Muslim Law & Family Settlement matters`,
        suggestedActions: [
          { label: "Book Private Consultation", href: "/book" },
          { label: "WhatsApp Confidentially", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I need private consultation regarding a family/matrimonial matter.")}`, external: true },
        ],
      });
    }

    // 6. Office location, Contact & Walk-in hours
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
      query.includes("number")
    ) {
      return NextResponse.json({
        reply: `Office & Chamber Details:
• Address: Trisharan Square, Nagpur - 440027, Maharashtra
• Phone/WhatsApp: +91 83296 31199
• Walk-in Desk Timings: 
  Morning: 9:30 AM – 11:00 AM
  Evening: 5:30 PM – 8:30 PM
• High Court & District Court Practice`,
        suggestedActions: [
          { label: "Directions / Contact Page", href: "/contact" },
          { label: "Book Online Slot", href: "/book" },
        ],
      });
    }

    // 7. General Fallback
    return NextResponse.json({
      reply: `Hello! I am Adv. Shareen Hussain's AI Legal Desk Assistant at True Legal Advice, Nagpur.

We assist clients across High Court & District Court Nagpur in:
1. Court Marriage & Love Marriage Legal Registration
2. Trademark & Startup Compliance (Pvt Ltd, GST, Gumasta)
3. Property Title Verification, Sale Deeds & Wills
4. Civil, Criminal, Divorce & Family Disputes
5. Legal Notices & Police Complaint / FIR Drafting

Consultation fee is ₹1,000 (Video or In-Chamber). How can we assist you today?`,
      suggestedActions: [
        { label: "Court Marriage Inquiry", query: "Can you help with love marriage and court marriage?" },
        { label: "Book ₹1,000 Consultation", href: "/book" },
        { label: "WhatsApp Advocate", href: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hello Adv. Shareen, I have a legal query.")}`, external: true },
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process query", reply: "I'm having trouble connecting right now. Please call or WhatsApp +91 83296 31199 directly for prompt assistance." },
      { status: 500 }
    );
  }
}
