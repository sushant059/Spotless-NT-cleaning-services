import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/content";
import { REGION_LABEL, areaSlug, regionOf, type Region } from "@/lib/areas";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Areas we clean – Darwin, Palmerston & rural NT",
  description: "Territory Spotless cleans carpets, couches, mattresses, bond and offices across Darwin, the northern suburbs, Palmerston, Litchfield and the rural area. Find your suburb.",
  alternates: { canonical: "/areas" },
};

export default async function AreasPage() {
  const db = await getDb();
  const groups: Region[] = ["city", "northern", "palmerston", "rural"];
  return (
    <>
      <PageHero image={STOCK.living} eyebrow="Service areas" title="Darwin, Palmerston and the rural area." lede="We come to you. Find your suburb for local info, or just ask for a free quote." crumbs={[{ href: "/areas", label: "Areas" }]} />
      <section className="section">
        <div className="container-x grid gap-8 md:grid-cols-2">
          {groups.map((group) => {
            const list = db.settings.serviceAreas.filter((area) => regionOf(area) === group).sort();
            if (!list.length) return null;
            return (
              <div key={group} className="card p-6">
                <h2 className="text-xl font-bold text-navy">{REGION_LABEL[group]}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {list.map((area) => <Link key={area} href={`/areas/${areaSlug(area)}`} className="rounded-full bg-mist px-3.5 py-2 text-sm font-semibold text-navy ring-1 ring-line transition hover:bg-brand-light">{area}</Link>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
