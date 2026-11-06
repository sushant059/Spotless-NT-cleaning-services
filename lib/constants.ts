import type { IconName, ServiceCategory } from "@/lib/types";

export const SERVICE_CATEGORIES: { id: ServiceCategory; title: string; short: string; blurb: string; icon: IconName }[] = [
  { id: "carpet-and-rugs", title: "Carpet & Rugs", short: "Carpet", blurb: "Hot-water extraction that lifts Top End dust, traffic lanes and everyday spills.", icon: "layers" },
  { id: "upholstery-and-bedding", title: "Upholstery & Bedding", short: "Upholstery", blurb: "Lounges, chairs and mattresses refreshed without soaking the foam.", icon: "sofa" },
  { id: "bond-and-property", title: "Bond & Property", short: "Bond & office", blurb: "Inspection-ready rentals and tidy workplaces, with paperwork for the agent.", icon: "key" },
  { id: "specialty-and-urgent", title: "Specialty & Urgent", short: "Specialty", blurb: "Pet accidents, odours, floods and spills that cannot wait until next week.", icon: "siren" },
];

export const SERVICE_CATEGORY_IDS = SERVICE_CATEGORIES.map((category) => category.id);

export const JOB_STATUSES = [
  { id: "requested", label: "New request", tone: "bg-sun-soft text-[#8A5A00]" },
  { id: "scheduled", label: "Scheduled", tone: "bg-brand-light text-brand" },
  { id: "in-progress", label: "In progress", tone: "bg-[#FFE9D6] text-[#9A4A00]" },
  { id: "done", label: "Done", tone: "bg-leaf-soft text-leaf-dark" },
  { id: "complaint", label: "Complaint", tone: "bg-red-50 text-danger" },
  { id: "redo", label: "Redo booked", tone: "bg-[#F1E8FF] text-[#6B2FB3]" },
  { id: "cancelled", label: "Cancelled", tone: "bg-mist text-slate" },
] as const;

export const STATUS_OPTIONS = ["new", "contacted", "quoted", "booked", "completed", "lost"] as const;

export const TIME_WINDOWS = [
  { id: "7-10", label: "7:00am – 10:00am" },
  { id: "10-1", label: "10:00am – 1:00pm" },
  { id: "1-4", label: "1:00pm – 4:00pm" },
  { id: "4-6", label: "4:00pm – 6:00pm" },
] as const;

export const PREFERRED_TIMES = ["ASAP", "Today", "Tomorrow", "This week", "Next week", "Flexible"] as const;

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/results", label: "Before & after" },
  { href: "/offers", label: "Offers" },
  { href: "/reviews", label: "Reviews" },
  { href: "/why-us", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export type Field =
  | { kind: "stepper"; key: string; label: string; min: number; max: number; defaultValue: number; ask?: string }
  | { kind: "toggle"; key: string; label: string; ask?: string }
  | { kind: "choice"; key: string; label: string; options: string[]; ask?: string }
  /** Pick any number of options; stored as a comma-separated string ("None" when nothing applies). */
  | { kind: "multi"; key: string; label: string; options: string[]; ask?: string }
  | { kind: "text"; key: string; label: string; placeholder: string; ask?: string };

/** The question the chat assistant asks for a field. */
export function fieldQuestion(field: Field) {
  if (field.ask) return field.ask;
  if (field.kind === "stepper") return `How many ${field.label.toLowerCase()}?`;
  if (field.kind === "toggle") return `${field.label}?`;
  if (field.kind === "choice" || field.kind === "multi") return `${field.label}?`;
  return field.label;
}

/** How it looks now: the same four steps for every soft furnishing, so quoting stays consistent. */
const CONDITION = ["Fresh – just a refresh", "Lived-in – light marks", "Well-used – stains & traffic lanes", "Needs a rescue – heavy stains, pets or odour"];

export const SERVICE_FIELDS: Record<string, Field[]> = {
  "carpet-cleaning": [
    { kind: "stepper", key: "rooms", label: "Rooms", ask: "How many rooms or areas of carpet need cleaning?", min: 1, max: 20, defaultValue: 1 },
    { kind: "stepper", key: "carpetSmall", label: "Small rooms (up to 12 m², e.g. bedroom)", ask: "How many are SMALL? (up to 12 m², about 3 × 4 m, like a bedroom)", min: 0, max: 20, defaultValue: 0 },
    { kind: "stepper", key: "carpetMedium", label: "Medium rooms (12–20 m², e.g. lounge)", ask: "How many are MEDIUM? (12–20 m², about 4 × 5 m, like a lounge)", min: 0, max: 20, defaultValue: 0 },
    { kind: "stepper", key: "carpetLarge", label: "Large rooms (over 20 m², e.g. open-plan)", ask: "And how many are LARGE? (over 20 m², like an open-plan living area)", min: 0, max: 20, defaultValue: 0 },
    { kind: "choice", key: "carpetCondition", label: "Carpet condition", ask: "How is the carpet looking right now?", options: CONDITION },
    { kind: "toggle", key: "hallway", label: "Include the hallway", ask: "Should we include the hallway?" },
    { kind: "toggle", key: "stairs", label: "Include the stairs", ask: "Any carpeted stairs to include?" },
  ],
  "couch-and-sofa-cleaning": [
    { kind: "stepper", key: "couches", label: "Couches", ask: "How many couches or lounges need cleaning?", min: 1, max: 10, defaultValue: 1 },
    { kind: "multi", key: "couchTypes", label: "Type", ask: "What kind are they? Tap all that apply.", options: ["2-seater", "3-seater", "L-shape / modular", "Recliner", "Sofa bed", "Armchair", "Ottoman"] },
    { kind: "stepper", key: "seats", label: "Seats in total", ask: "How many seats altogether (count every seat across all couches)?", min: 1, max: 30, defaultValue: 3 },
    { kind: "choice", key: "couchFabric", label: "Material", ask: "What is it covered in?", options: ["Fabric", "Leather", "Suede / microfibre", "Not sure"] },
    { kind: "choice", key: "couchCondition", label: "Couch condition", ask: "How are they looking?", options: CONDITION },
    { kind: "multi", key: "couchExtras", label: "Couch add-ons", ask: "Any add-ons for the couches? Tap all that apply.", options: ["Fabric protection", "Pet hair & odour treatment", "Cushion covers washed", "Scotchgard after clean"] },
  ],
  "mattress-cleaning": [
    { kind: "stepper", key: "single", label: "Single mattresses", ask: "How many single mattresses?", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "double", label: "Double mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "queen", label: "Queen mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "stepper", key: "king", label: "King mattresses", min: 0, max: 8, defaultValue: 0 },
    { kind: "choice", key: "mattressCondition", label: "Mattress condition", ask: "Any stains or smells we should know about?", options: ["No – just a freshen-up", "A few marks", "Stains or odours (kids, pets, sweat)", "Urine or blood stains"] },
  ],
  "rug-cleaning": [
    { kind: "stepper", key: "rugs", label: "Rugs", ask: "How many rugs need cleaning?", min: 1, max: 20, defaultValue: 1 },
    { kind: "choice", key: "rugSize", label: "Rug size", ask: "About how big is the biggest rug?", options: ["Small – up to 1.5 × 1 m", "Medium – about 2 × 1.5 m", "Large – about 3 × 2 m", "Oversized – bigger than 3 × 2 m"] },
    { kind: "choice", key: "rugCondition", label: "Rug condition", ask: "And how is it looking?", options: CONDITION },
  ],
  "upholstery-cleaning": [
    { kind: "stepper", key: "items", label: "Items (chairs, cushions, ottomans)", ask: "How many items: chairs, ottomans, bed heads and so on?", min: 1, max: 20, defaultValue: 1 },
    { kind: "choice", key: "upholsteryCondition", label: "Condition", ask: "How are they looking?", options: CONDITION },
  ],
  "pet-stain-and-odour-removal": [
    { kind: "stepper", key: "areas", label: "Areas to treat", ask: "How many spots or areas need treating?", min: 1, max: 10, defaultValue: 1 },
    { kind: "choice", key: "petSurface", label: "Where", ask: "Where are the stains?", options: ["Carpet", "Couch", "Mattress", "Rug", "A mix"] },
    { kind: "choice", key: "petAge", label: "How old", ask: "How fresh are they?", options: ["Fresh – today or yesterday", "A few weeks", "Months old / set in"] },
  ],
  "emergency-and-urgent-cleaning": [
    { kind: "text", key: "what", label: "What happened?", ask: "Oh no! What happened? A quick description helps us bring the right gear.", placeholder: "For example: a drink spilled on the lounge carpet" },
  ],
  "end-of-lease-and-bond-cleaning": [
    { kind: "stepper", key: "properties", label: "Properties", ask: "How many properties need a bond clean?", min: 1, max: 10, defaultValue: 1 },
    { kind: "choice", key: "property", label: "Property type", ask: "What type of property is it? (If there's more than one, tell us about the main one.)", options: ["House", "Unit / apartment", "Townhouse"] },
    { kind: "choice", key: "storeys", label: "Levels", ask: "Single level or two storey?", options: ["Single level", "Two storey"] },
    { kind: "stepper", key: "bedrooms", label: "Bedrooms", ask: "How many bedrooms does the property have?", min: 0, max: 10, defaultValue: 2 },
    { kind: "stepper", key: "bathrooms", label: "Bathrooms", ask: "How many bathrooms?", min: 0, max: 8, defaultValue: 1 },
    { kind: "stepper", key: "toilets", label: "Separate toilets", ask: "Any separate toilets (not inside a bathroom)?", min: 0, max: 6, defaultValue: 0 },
    { kind: "stepper", key: "living", label: "Living areas", ask: "How many living areas (lounge, dining, family, study)?", min: 0, max: 8, defaultValue: 1 },
    { kind: "choice", key: "furnished", label: "Furniture", ask: "Will the place be empty when we clean?", options: ["Empty", "Some furniture left", "Fully furnished"] },
    { kind: "choice", key: "bondCondition", label: "Overall condition", ask: "How is the place looking overall?", options: ["Well kept – mostly tidy", "Average – normal wear", "Needs work – heavy grime or mould", "Big job – rubbish or neglect"] },
    { kind: "choice", key: "bondCarpet", label: "Carpet steam clean", ask: "Do the carpets need a steam clean for the bond?", options: ["Yes – carpets throughout", "Yes – some rooms", "No carpet / not needed"] },
    {
      kind: "multi",
      key: "bondExtras",
      label: "Extras",
      ask: "Anything extra, inside or outside? Tap all that apply.",
      options: ["Oven & stovetop", "Rangehood", "Fridge", "Inside windows & tracks", "Blinds", "Walls spot-clean", "Garage", "Balcony / patio", "Front yard tidy", "Backyard tidy", "Pressure wash outside", "Rubbish removal"],
    },
  ],
  "office-and-commercial-cleaning": [
    {
      kind: "choice",
      key: "size",
      label: "Approximate size",
      ask: "Roughly how big is the office?",
      options: ["Small (up to 80 m²)", "Medium (80–200 m²)", "Large (over 200 m²)"],
    },
    { kind: "choice", key: "officeFrequency", label: "How often", ask: "How often would you like us?", options: ["One-off clean", "Weekly", "Fortnightly", "Monthly", "Not sure yet"] },
    { kind: "multi", key: "officeExtras", label: "Extras", ask: "Any of these as well? Tap all that apply.", options: ["Carpet steam clean", "Kitchen & fridge", "Windows", "Pressure washing", "Couches & chairs"] },
  ],
  "something-else": [
    { kind: "text", key: "other", label: "Tell us what you need", ask: "No problem. What would you like cleaned?", placeholder: "A short description is enough" },
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
      if (field.kind === "choice" || field.kind === "multi") details[field.key] = "";
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
        if (value === undefined || value === "" || value === false || value === 0 || value === "None") return "";
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
    if (slug === "carpet-cleaning") {
      const rooms = Number(details.rooms || 0);
      const sized = ["carpetSmall", "carpetMedium", "carpetLarge"].reduce((sum, key) => sum + Number(details[key] || 0), 0);
      if (rooms && sized !== rooms) return `The room sizes add up to ${sized}, but you said ${rooms} room${rooms === 1 ? "" : "s"}. Let's check the sizes again.`;
    }
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
