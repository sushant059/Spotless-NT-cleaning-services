import { slugify } from "@/lib/utils";

export type Region = "city" | "northern" | "palmerston" | "rural";

const PALMERSTON = ["Palmerston City", "Driver", "Gray", "Moulden", "Woodroffe", "Durack", "Rosebery", "Bakewell", "Gunn", "Farrar", "Johnston", "Zuccoli", "Bellamack", "Mitchell", "Yarrawonga", "Pinelands", "Marlow Lagoon", "Palmerston"];
const RURAL = ["Holtze", "Howard Springs", "Virginia", "Coolalinga", "Humpty Doo", "McMinns Lagoon", "Berry Springs", "Noonamah", "Girraween", "Bees Creek", "Knuckey Lagoon", "Herbert", "Acacia Hills", "Livingstone", "Lambells Lagoon", "Gunn Point"];
const NORTHERN = ["Nightcliff", "Rapid Creek", "Millner", "Jingili", "Alawa", "Moil", "Nakara", "Brinkin", "Tiwi", "Wanguri", "Casuarina", "Lyons", "Muirhead", "Leanyer", "Woodleigh Gardens", "Karama", "Malak", "Anula", "Wulagi", "Wagaman", "Marrara", "Coconut Grove"];

export function regionOf(suburb: string): Region {
  if (PALMERSTON.includes(suburb)) return "palmerston";
  if (RURAL.includes(suburb)) return "rural";
  if (NORTHERN.includes(suburb)) return "northern";
  return "city";
}

export const REGION_LABEL: Record<Region, string> = {
  city: "Darwin city & inner suburbs",
  northern: "Darwin northern suburbs",
  palmerston: "Palmerston",
  rural: "Litchfield & the rural area",
};

/** A line of local colour for each region, so suburb pages don't all read the same. */
export const REGION_NOTE: Record<Region, string> = {
  city: "Apartments, units and older homes close to the CBD see heavy foot traffic, sea air and humidity. Quick-drying methods matter when there's nowhere to put the furniture.",
  northern: "Family homes in the northern suburbs collect red dust, sand from the beach and the odd pet accident. We bring commercial machines that lift the grit out, not just the surface.",
  palmerston: "Palmerston's newer estates and busy family homes mean high-traffic carpets, kids' couches and plenty of rentals changing over. Bond cleans are a big part of what we do here.",
  rural: "Out in the rural area, bore water, red dirt and long driveways are part of life. We come to you with everything we need, including our own water and power where it's required.",
};

export function areaSlug(suburb: string) {
  return slugify(suburb);
}

export function findArea(areas: string[], slug: string) {
  return areas.find((area) => areaSlug(area) === slug);
}

export function nearbyAreas(areas: string[], suburb: string, count = 6) {
  const region = regionOf(suburb);
  const same = areas.filter((area) => area !== suburb && regionOf(area) === region);
  const index = Math.max(0, same.findIndex((area) => area.localeCompare(suburb) > 0));
  return [...same.slice(index), ...same.slice(0, index)].slice(0, count);
}

/** The handful of suburbs we lead with: one or two per region, the names people search for. */
export const MAIN_AREAS: { name: string; blurb: string }[] = [
  { name: "Darwin City", blurb: "CBD apartments, units & offices" },
  { name: "Palmerston City", blurb: "Family homes & rentals" },
  { name: "Casuarina", blurb: "Northern suburbs hub" },
  { name: "Nightcliff", blurb: "Beachside homes" },
  { name: "Howard Springs", blurb: "Rural blocks & acreage" },
  { name: "Humpty Doo", blurb: "Litchfield & the rural area" },
];

export function mainAreas(areas: string[]) {
  return MAIN_AREAS.filter((area) => areas.includes(area.name));
}
