import type { Metadata } from "next";
import Link from "next/link";
import { CategoryShowcase, CtaBand, PageHero } from "@/components/content";
import { ServiceIcon } from "@/components/icons";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cleaning services",
  description: "Carpet, rug, couch, upholstery, mattress, bond, office, pet stain and emergency cleaning across Darwin and Palmerston.",
};

export default async function ServicesPage() {
  const db = await getDb();
  const services = byOrder(db.services).filter((service) => service.visible);
  return (
    <>
      <PageHero eyebrow="Services" title="Everything we clean, sorted by category." lede="Choose a category, then a service, to see what’s included, the process, videos, photos and real before-and-afters." crumbs={[{ href: "/services", label: "Services" }]}>
        <div className="mt-8 flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map((category) => (
            <Link key={category.id} href={`#${category.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white hover:text-navy">
              <ServiceIcon name={category.icon} className="h-4 w-4" /> {category.title}
            </Link>
          ))}
        </div>
      </PageHero>
      <section className="section pt-12">
        <div className="container-x"><CategoryShowcase services={services} /></div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
