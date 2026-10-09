export type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed" | "lost";
export type LeadSource = "quote" | "chat" | "contact";
export type IconName = "layers" | "sofa" | "bed" | "rug" | "armchair" | "paw" | "siren" | "key" | "building";

export type ServiceProcess = { title: string; detail: string };
export type ServiceFaq = { question: string; answer: string };

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  included: string[];
  bestFor: string[];
  process: ServiceProcess[];
  faqs: ServiceFaq[];
  icon: IconName;
  image: string;
  videoUrl: string;
  order: number;
  visible: boolean;
  related: string[];
};

export type OpeningHour = { day: string; hours: string };
export type TrustStat = { value: string; label: string };

export type Settings = {
  businessName: string;
  shortName: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsappUrl: string;
  email: string;
  notificationEmail: string;
  address: string;
  serviceAreas: string[];
  facebook: string;
  instagram: string;
  tiktok: string;
  google: string;
  abn: string;
  licence: string;
  insurance: string;
  openingHours: OpeningHour[];
  seoTitle: string;
  seoDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  heroVideo: string;
  teamPhoto: string;
  ogImage: string;
  stats: TrustStat[];
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  bannerText: string;
  href: string;
  image: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  showOnBanner: boolean;
  order: number;
};

export type Promo = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  amount: number;
  message: string;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export type DetailValue = string | number | boolean;

export type Lead = {
  id: string;
  reference: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  services: string[];
  details: Record<string, DetailValue>;
  summary: string;
  notes: string;
  internalNotes: string;
  promoCode: string;
  promoMessage: string;
  photos: string[];
  message: string;
  preferredTime: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  reference: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  services: string[];
  details: Record<string, DetailValue>;
  summary: string;
  date: string;
  timeWindow: string;
  address: string;
  suburb: string;
  notes: string;
  internalNotes: string;
  createdAt: string;
};

export type ResultPair = {
  id: string;
  serviceSlug: string;
  caption: string;
  scene: string;
  beforeImage: string;
  afterImage: string;
  illustrative: boolean;
  order: number;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  service: string;
  rating: number;
  date: string;
  source: "sample" | "manual" | "google";
  visible: boolean;
  order: number;
};

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
};

export type BlockedDate = { id: string; date: string; reason: string };

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video";
  slot: string;
  createdAt: string;
};

export type Database = {
  version: 1;
  settings: Settings;
  services: Service[];
  offers: Offer[];
  promos: Promo[];
  leads: Lead[];
  bookings: Booking[];
  results: ResultPair[];
  reviews: Review[];
  faqs: Faq[];
  blockedDates: BlockedDate[];
  media: MediaItem[];
};

export type ActionResult =
  | { ok: true; reference?: string; emailed?: boolean; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> };
