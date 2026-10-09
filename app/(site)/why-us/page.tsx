import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Pillars, TeamCard } from "@/components/content";
import { getDb } from "@/lib/store";

export const metadata: Metadata = {
  title: "Why us",
  description: "A local Darwin cleaning team with commercial extraction gear, fixed quotes, and products chosen with kids and pets in mind.",
};

export default async function WhyUsPage() {
  const db = await getDb();
  return (
    <>
      <PageHero eyebrow="Why us" title="Straight answers, then a careful clean" lede="Spotless NT is a Darwin cleaning business. We price the job before we start, and we tell you when a mark will not come out." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-6xl"><Pillars /></div>
      </section>
      <section className="bg-white px-4 py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
          <TeamCard photo={db.settings.teamPhoto} />
          <div>
            <h2 className="text-[28px] font-bold md:text-[36px]">You will know who is at the door</h2>
            <p className="mt-3 text-slate">The crew wears a teal shirt with the Spotless NT mark. If a photo of the real team is added in admin, it replaces this card.</p>
            {db.settings.stats.length > 0 && (
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {db.settings.stats.map((stat) => (
                  <div key={stat.label} className="rounded-card bg-sky p-4">
                    <dt className="text-sm text-slate">{stat.label}</dt>
                    <dd className="text-2xl font-bold">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href="/free-quote" className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-sun px-6 font-semibold text-ink">Get a free quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
