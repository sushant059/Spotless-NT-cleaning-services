/*
 * Free stock photos and video from Pexels (pexels.com/license: free for commercial use, no attribution needed).
 * They fill every spot until the owner uploads real job photos in Admin, which always take priority.
 * Each spot lists a few photos: if one fails to load, the next one is used, then a brand gradient.
 */

const PEXELS = "https://images.pexels.com/photos";

export type StockImage = { id: number; alt: string };

/** One Pexels photo at a given width. */
export function pexelsUrl(id: number, width = 1280) {
  return `${PEXELS}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export function pexelsSrcSet(id: number) {
  return [480, 800, 1280, 1920].map((width) => `${pexelsUrl(id, width)} ${width}w`).join(", ");
}

const img = (id: number, alt: string): StockImage => ({ id, alt });

export const STOCK = {
  hero: [img(6195125, "Cleaners getting a living room ready with a vacuum and mop"), img(6196677, "Cleaners arriving with their equipment")],
  team: [img(6195121, "A friendly cleaning crew in uniform"), img(6195125, "A cleaning crew in a living room")],
  crew: [img(6196677, "Cleaners walking in with their equipment"), img(6197123, "A cleaner in work overalls")],
  carpet: [img(4107278, "Vacuuming a patterned carpet"), img(9462139, "Vacuuming a carpet"), img(3867613, "Vacuuming a lounge room carpet")],
  carpetAlt: [img(9462139, "Vacuuming a carpet up close"), img(3867613, "Vacuuming a lounge room carpet")],
  sofa: [img(4401538, "Vacuuming a fabric sofa chair"), img(1841143, "A sofa in a bright living room")],
  mattress: [img(3682240, "Fresh white pillows on a bed"), img(3030684, "A freshly made bed")],
  rug: [img(16822721, "A patterned rug on a timber floor"), img(2029683, "A living room with a rug")],
  upholstery: [img(5793547, "A sunlit living room with a fabric sofa"), img(4846450, "A sofa and side table")],
  pet: [img(1750378, "A puppy lying on the carpet"), img(12907063, "A dog resting on a patterned carpet")],
  urgent: [img(6195273, "A cleaner vacuuming in a hurry"), img(4107275, "A cleaner holding a vacuum")],
  bond: [img(7031599, "An empty apartment room ready for inspection"), img(6835103, "An empty living room"), img(5353880, "An empty home interior")],
  office: [img(8606292, "A modern office interior"), img(7534216, "An office with desks and chairs")],
  living: [img(6782353, "A spacious, clean living room"), img(2029683, "A tidy living room")],
  cosy: [img(5998040, "A cosy living room with a sofa and table"), img(15580493, "A cosy living room")],
} satisfies Record<string, StockImage[]>;

export type StockKey = keyof typeof STOCK;

const SERVICE_STOCK: Record<string, StockKey> = {
  "carpet-cleaning": "carpet",
  "couch-and-sofa-cleaning": "sofa",
  "mattress-cleaning": "mattress",
  "rug-cleaning": "rug",
  "upholstery-cleaning": "upholstery",
  "pet-stain-and-odour-removal": "pet",
  "emergency-and-urgent-cleaning": "urgent",
  "end-of-lease-and-bond-cleaning": "bond",
  "office-and-commercial-cleaning": "office",
};

const CATEGORY_STOCK: Record<string, StockKey> = {
  "carpet-and-rugs": "carpet",
  "upholstery-and-bedding": "sofa",
  "bond-and-property": "bond",
  "specialty-and-urgent": "pet",
};

export function stockFor(key: StockKey) {
  return STOCK[key];
}

export function serviceStock(slug: string): StockImage[] {
  return STOCK[SERVICE_STOCK[slug] ?? "living"];
}

export function categoryStock(id: string): StockImage[] {
  return STOCK[CATEGORY_STOCK[id] ?? "living"];
}

/** Photos for a service's gallery: its own stock plus a couple of related shots. */
export function serviceGalleryStock(slug: string): StockImage[] {
  const own = serviceStock(slug);
  const extra = slug.includes("bond") || slug.includes("office") ? STOCK.crew : STOCK.living;
  const seen = new Set<number>();
  return [...own, ...extra, ...STOCK.carpetAlt].filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true))).slice(0, 5);
}

/*
 * Stock video clips. Pexels file names vary by frame rate and size, so each clip lists the likely
 * files: the browser tries each <source> in turn and the poster photo stays if none play.
 */
export type StockClip = { id: number; title: string; poster: number; sources: string[] };

const clipSources = (id: number, sizes: string[]) =>
  sizes.flatMap((size) => ["25fps", "30fps", "24fps"].map((fps) => `https://videos.pexels.com/video-files/${id}/${id}-${size}_${fps}.mp4`));

export const STOCK_CLIPS: StockClip[] = [
  { id: 7351719, title: "Vacuuming the floor", poster: 9462139, sources: clipSources(7351719, ["hd_1920_1080", "hd_1280_720", "sd_960_540"]) },
  { id: 6195513, title: "A crew cleaning a home", poster: 6195125, sources: clipSources(6195513, ["hd_1080_1920", "uhd_2160_3840", "sd_540_960"]) },
  { id: 7641376, title: "Cleaning around the house", poster: 6195273, sources: clipSources(7641376, ["hd_1920_1080", "uhd_2560_1440", "sd_960_540"]) },
];

export function clipFor(slug: string) {
  const index = Object.keys(SERVICE_STOCK).indexOf(slug);
  return STOCK_CLIPS[(index < 0 ? 0 : index) % STOCK_CLIPS.length];
}
