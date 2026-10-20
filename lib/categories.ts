import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { Service, ServiceCategory } from "@/lib/types";

type ServiceRef = Pick<Service, "slug" | "title" | "category">;

/**
 * Works out which service categories a job or enquiry belongs to, from the service slugs it
 * lists and/or the service names written in its description ("Carpet Cleaning – 3 rooms…").
 */
export function categoriesFor(services: ServiceRef[], slugs: string[], text = ""): ServiceCategory[] {
  const lower = text.toLowerCase();
  const found = new Set<ServiceCategory>();
  for (const service of services) {
    const named = lower && (lower.includes(service.title.toLowerCase()) || lower.includes(service.slug.replace(/-/g, " ")));
    if (slugs.includes(service.slug) || named) found.add(service.category);
  }
  // Fall back to keywords for free-typed jobs ("couch", "bond clean"…).
  if (found.size === 0 && lower) {
    if (/carpet|rug/.test(lower)) found.add("carpet-and-rugs");
    if (/couch|sofa|lounge|mattress|uphol|chair/.test(lower)) found.add("upholstery-and-bedding");
    if (/bond|lease|vacate|office|commercial/.test(lower)) found.add("bond-and-property");
    if (/pet|odour|odor|urine|flood|urgent|emergency|spill/.test(lower)) found.add("specialty-and-urgent");
  }
  return SERVICE_CATEGORIES.map((category) => category.id).filter((id) => found.has(id));
}

export function categoryTitle(id: ServiceCategory) {
  return SERVICE_CATEGORIES.find((category) => category.id === id)?.short ?? id;
}
