import type { IconName } from "@/lib/types";

export const STATUS_OPTIONS = ["new", "contacted", "quoted", "booked", "completed", "lost"] as const;

export const TIME_WINDOWS = [
  { id: "7-10", label: "7:00am – 10:00am" },
  { id: "10-1", label: "10:00am – 1:00pm" },
  { id: "1-4", label: "1:00pm – 4:00pm" },
  { id: "4-6", label: "4:00pm – 6:00pm" },
] as const;

export const PREFERRED_TIMES = ["ASAP", "Today", "Tomorrow", "This week"] as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/why-us", label: "Why us" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/results", label: "Results" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export type Field =
  | { kind: "stepper"; key: string; label: string; min: number; max: number; defaultValue: number }
  | { kind: "toggle"; key: string; label: string }
  | { kind: "choice"; key: string; label: string; options: string[] }
  | { kind: "text"; key: string; label: string; placeholder: string };

export const SERVICE_FIELDS: Record<string, Field[]> = {
  "carpet-cleaning": [
    { kind: "stepper", key: "rooms", label: "Rooms", min: 1, max: 20, defaultValue: 1 },
    { kind: "toggle", key: "hallway", label: "Include the hallway" },
    { kind: "toggle", key: "stairs", label: "Include the stairs" },
  ],
  "couch-and-sofa-cleaning": [
    { kind: "stepper", key: "seats", label: "Seats", min: 1, max: 20, defaultValue: 3 },
  ],
  "mattress-cleaning": [
    { kind: "stepper", key: "single", label: "Single mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "double", label: "Double mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "queen", label: "Queen mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "king", label: "King mattresses", min: 0, max: 8, defaultValue: 0 },
  ],
  "rug-cleaning": [{ kind: "stepper", key: "rugs", label: "Rugs", min: 1, max: 20, defaultValue: 1 }],
  "upholstery-cleaning": [
    { kind: "stepper", key: "items", label: "Items (chairs, cushions, ottomans)", min: 1, max: 20, defaultValue: 1 },
  ],
  "pet-stain-and-odour-removal": [
    { kind: "stepper", key: "areas", label: "Areas to treat", min: 1, max: 10, defaultValue: 1 },
  ],
  "emergency-and-urgent-cleaning": [
    { kind: "text", key: "what", label: "What happened?", placeholder: "For example: a drink spilled on the lounge carpet" },
  ],
  "end-of-lease-and-bond-cleaning": [
    { kind: "stepper", key: "bedrooms", label: "Bedrooms", min: 0, max: 10, defaultValue: 2 },
    { kind: "stepper", key: "bathrooms", label: "Bathrooms", min: 0, max: 8, defaultValue: 1 },
    { kind: "choice", key: "property", label: "Property type", options: ["House", "Unit", "Townhouse"] },
  ],
  "office-and-commercial-cleaning": [
    {
      kind: "choice",
      key: "size",
      label: "Approximate size",
      options: ["Small (up to 80 m²)", "Medium (80–200 m²)", "Large (over 200 m²)"],
    },
  ],
  "something-else": [
    { kind: "text", key: "other", label: "Tell us what you need", placeholder: "A short description is enough" },
  ],
};

export const CHAT_OPTIONS: { slug: string; label: string; icon: IconName }[] = [
  { slug: "carpet-cleaning", label: "Carpet", icon: "layers" },
  { slug: "couch-and-sofa-cleaning", label: "Sofa / Couch", icon: "sofa" },
  { slug: "mattress-cleaning", label: "Mattress", icon: "bed" },
  { slug: "rug-cleaning", label: "Rug", icon: "rug" },
  { slug: "upholstery-cleaning", label: "Upholstery", icon: "armchair" },
  { slug: "pet-stain-and-odour-removal", label: "Pet stain and odour", icon: "paw" },
  { slug: "end-of-lease-and-bond-cleaning", label: "End of lease / bond", icon: "key" },
  { slug: "office-and-commercial-cleaning", label: "Office cleaning", icon: "building" },
  { slug: "emergency-and-urgent-cleaning", label: "Emergency / urgent", icon: "siren" },
  { slug: "something-else", label: "Something else", icon: "layers" },
];

export const SERVICE_TITLES: Record<string, string> = {
  "carpet-cleaning": "Carpet cleaning",
  "couch-and-sofa-cleaning": "Couch and sofa cleaning",
  "mattress-cleaning": "Mattress cleaning",
  "rug-cleaning": "Rug cleaning",
  "upholstery-cleaning": "Upholstery cleaning",
  "pet-stain-and-odour-removal": "Pet stain and odour removal",
  "emergency-and-urgent-cleaning": "Emergency and urgent cleaning",
  "end-of-lease-and-bond-cleaning": "End of lease and bond cleaning",
  "office-and-commercial-cleaning": "Office and commercial cleaning",
  "something-else": "Something else",
};

export function defaultDetails(slugs: string[]) {
  const details: Record<string, string | number | boolean> = {};
  for (const slug of slugs) {
    for (const field of SERVICE_FIELDS[slug] ?? []) {
      if (field.kind === "stepper") details[field.key] = field.defaultValue;
      if (field.kind === "toggle") details[field.key] = false;
      if (field.kind === "choice") details[field.key] = "";
      if (field.kind === "text") details[field.key] = "";
    }
  }
  return details;
}

export function summariseJob(slugs: string[], details: Record<string, string | number | boolean>) {
  return slugs.map((slug) => {
    const parts = (SERVICE_FIELDS[slug] ?? [])
      .map((field) => {
        const value = details[field.key];
        if (value === undefined || value === "" || value === false || value === 0) return "";
        if (typeof value === "boolean") return field.label;
        return `${field.label}: ${value}`;
      })
      .filter(Boolean);
    const title = SERVICE_TITLES[slug] ?? slug;
    return parts.length ? `${title} — ${parts.join(", ")}` : title;
  });
}

export function validateDetails(slugs: string[], details: Record<string, string | number | boolean>) {
  for (const slug of slugs) {
    if (slug === "mattress-cleaning") {
      const total = ["single", "double", "queen", "king"].reduce((sum, key) => sum + Number(details[key] || 0), 0);
      if (total < 1) return "Add at least one mattress.";
    }
    if (slug === "emergency-and-urgent-cleaning" && String(details.what || "").trim().length < 3) {
      return "Tell us what happened so we can bring the right gear.";
    }
    if (slug === "something-else" && String(details.other || "").trim().length < 3) {
      return "Tell us what you need cleaned.";
    }
    if (slug === "office-and-commercial-cleaning" && !details.size) return "Choose an approximate office size.";
    if (slug === "end-of-lease-and-bond-cleaning" && !details.property) return "Choose the property type.";
  }
  return null;
}

export function timeWindowLabel(id: string) {
  return TIME_WINDOWS.find((window) => window.id === id)?.label ?? id;
}
