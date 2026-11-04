import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { AreaFinder } from "@/components/areas/area-finder";
import { CtaBand, PageHero } from "@/components/content";
import { Photo } from "@/components/photo";
import { REGION_LABEL, areaSlug, mainAreas, regionOf } from "@/lib/areas";
import { getDb } from "@/lib/store";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Areas we clean – Darwin, Palmerston & rural NT",
  description: "Territory Spotless cleans carpets, couches, mattresses, bond and offices across Darwin, the northern suburbs, Palmerston, Litchfield and the rural area. Find your suburb.",
  alternates: { canonical: "/areas" },
};

const PHOTOS = [STOCK.living, STOCK.cosy, STOCK.carpet, STOCK.sofa, STOCK.hero, STOCK.rug];

export default async function AreasPage() {
  const db = await getDb();
  const main = mainAreas(db.settings.serviceAreas);
  return (
    <>
      <PageHero image={STOCK.living} eyebrow="Service areas" title="We come to you." lede="Darwin, Palmerston and the rural area. Pick your suburb, or just ask for a free quote." crumbs={[{ href: "/areas", label: "Areas" }]}>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium text-white/85">
          {["No call-out fee to quote", "Same team, every suburb", "Fixed price before we start"].map((item) => (
            <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-leaf" aria-hidden /> {item}</li>
          ))}
        </ul>
      </PageHero>

      <section className="section">
        <div className="container-x">
          <p className="eyebrow">Main areas</p>
          <h2 className="h-section mt-3">Where we clean most</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {main.map((area, index) => (
              <li key={area.name} className="min-w-0">
                <Link href={`/areas/${areaSlug(area.name)}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-navy shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:aspect-[4/3]">
                  <Photo stock={PHOTOS[index % PHOTOS.length]} fill sizes="(max-width: 640px) 50vw, 33vw" className="transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent" aria-hidden />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-navy backdrop-blur sm:left-4 sm:top-4">{REGION_LABEL[regionOf(area.name)].split(" ")[0]}</span>
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-leaf text-white opacity-0 transition group-hover:opacity-100 sm:right-4 sm:top-4"><ArrowUpRight className="h-5 w-5" aria-hidden /></span>
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                    <span className="flex items-center gap-1.5 text-lg font-extrabold leading-tight sm:text-2xl"><MapPin className="h-4 w-4 shrink-0 text-leaf sm:h-5 sm:w-5" aria-hidden /> {area.name}</span>
                    <span className="mt-1 block text-xs text-white/75 sm:text-sm">{area.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-x max-w-5xl">
          <div className="text-center">
            <p className="eyebrow justify-center">Every suburb</p>
            <h2 className="h-section mt-3">Find your suburb</h2>
            <p className="lede mx-auto">Search or browse by region. Not listed? Ask us, we probably still come to you.</p>
          </div>
          <div className="mt-8"><AreaFinder areas={db.settings.serviceAreas} /></div>
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
