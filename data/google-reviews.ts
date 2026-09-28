export interface GoogleReviewItem {
  id: string;
  name: string;
  avatarText: string;
  location?: string;
  rating: number;
  timeAgo: string;
  serviceCategory: "All" | "Trademark & IP" | "Court Marriage & Family" | "Property & Wills" | "Corporate & Drafting";
  reviewCount?: number;
  isLocalGuide?: boolean;
  isNri?: boolean;
  content: string;
  highlight?: string;
  ownerReply?: {
    text: string;
    timeAgo: string;
  };
}

export const googleReviewsData: GoogleReviewItem[] = [
  {
    id: "rev-1",
    name: "Devashish Rathod",
    avatarText: "DR",
    rating: 5,
    timeAgo: "3 months ago",
    reviewCount: 3,
    serviceCategory: "Court Marriage & Family",
    content:
      "I had a telephonic consultation regarding a marriage-related matter, and I am extremely satisfied with the guidance provided. The advocate listened patiently, explained all legal aspects clearly, and answered all my queries in a very professional manner. Their advice was practical, detailed, and genuinely helpful. I truly appreciate the time and effort they took to assist me. Highly recommended for anyone seeking legal guidance and support. Thank you for your excellent service.",
    highlight: "Patiently explained all legal aspects, practical & detailed advice",
    ownerReply: {
      text: "Thank you Devashish for valuable feedback. Wishing you great success happiness and good health.",
      timeAgo: "3 months ago",
    },
  },
  {
    id: "rev-2",
    name: "Devesh Rathore",
    avatarText: "DR",
    location: "United States / Nagpur",
    rating: 5,
    timeAgo: "2 months ago",
    reviewCount: 1,
    isNri: true,
    serviceCategory: "Property & Wills",
    content:
      "Adv. Shareen helped me (NRI from US) get Wills drafted & registered at SRO office in Nagpur for both my elderly parents at super short notice. Her team was extremely efficient, responsive, and handled the entire sub-registrar registration seamlessly without any hassle.",
    highlight: "NRI from US: Seamless Will drafting & SRO registration at super short notice",
    ownerReply: {
      text: "Thank you so much Devesh sir for your thoughtful and heartfelt review. It was a pleasure to assist your family.",
      timeAgo: "2 months ago",
    },
  },
  {
    id: "rev-3",
    name: "Sibtain",
    avatarText: "S",
    location: "Nagpur",
    rating: 5,
    timeAgo: "6 months ago",
    reviewCount: 18,
    isLocalGuide: true,
    serviceCategory: "Corporate & Drafting",
    content:
      "I had an extremely urgent requirement for getting a notary and legal agreement done, and I'm truly grateful for the support I received from Advocate Ma'am. Despite the short notice, she ensured meticulous drafting and complete peace of mind. Exceptional commitment!",
    highlight: "Extremely urgent notary & drafting handled with meticulous care",
    ownerReply: {
      text: "Thank you Sibtain for trusting True Legal Advice. We are always committed to client relief.",
      timeAgo: "6 months ago",
    },
  },
  {
    id: "rev-4",
    name: "Ashley Joseph",
    avatarText: "AJ",
    rating: 5,
    timeAgo: "1 hour ago",
    reviewCount: 3,
    serviceCategory: "Trademark & IP",
    content:
      "I found Adv. Shareen to be quite professional. Very clear with trademark process and answered all questions with clarity. The brand clearance search was exhaustive and she gave concrete strategies for classification.",
    highlight: "Very clear with trademark process & concrete filing strategies",
  },
  {
    id: "rev-5",
    name: "Rajesh Kolarkar",
    avatarText: "RK",
    rating: 5,
    timeAgo: "6 days ago",
    reviewCount: 3,
    serviceCategory: "Property & Wills",
    content:
      "Excellent guidance on property documentation, title search, and sale deed verification in Nagpur. Very knowledgeable advocate and very polite staff. Saved us from potential title disputes.",
    highlight: "Excellent guidance on property documentation & sale deed verification",
  },
  {
    id: "rev-6",
    name: "Yash Bangre",
    avatarText: "YB",
    rating: 5,
    timeAgo: "1 week ago",
    reviewCount: 7,
    serviceCategory: "Trademark & IP",
    content:
      "Got my brand trademark filed smoothly with Adv Shareen Hussain. The search report was delivered within hours and application was filed the same day. 5-star service for any business owner in Maharashtra!",
    highlight: "Search report delivered within hours, trademark filed same day",
  },
  {
    id: "rev-7",
    name: "Pooja Deshmukh",
    avatarText: "PD",
    rating: 5,
    timeAgo: "3 weeks ago",
    reviewCount: 5,
    isLocalGuide: true,
    serviceCategory: "Court Marriage & Family",
    content:
      "Best legal consultant in Nagpur. Adv. Shareen Hussain helped us with our court marriage registration under Special Marriage Act. Process was completely transparent, safe, dignified, and respectful.",
    highlight: "Court marriage process was completely transparent, safe and respectful",
  },
  {
    id: "rev-8",
    name: "Amitabh Verma",
    avatarText: "AV",
    location: "Nagpur IT Park",
    rating: 5,
    timeAgo: "1 month ago",
    reviewCount: 4,
    serviceCategory: "Corporate & Drafting",
    content:
      "Adv. Shareen is our go-to legal counsel for startup compliance, trademark objections, Udyam MSME subsidies, and company contracts. Her attention to statutory details is unparalleled.",
    highlight: "Go-to legal counsel for startup compliance & trademark objections",
  },
];
