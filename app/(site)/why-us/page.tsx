import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CtaBand, PageHero, Pillars, SectionHeading, TeamVisual } from "@/components/content";
import { UniformMockup } from "@/components/art/people";
import { getDb } from "@/lib/store";

export const metadata: Metadata = {
  title: "About us",
  description: "A local Darwin cleaning team with commercial extraction gear, fixed quotes, and products chosen with kids and pets in mind.",
};

export default async function WhyUsPage() {
  const db = await getDb();
  const s = db.settings;
  return (
    <>
      <PageHero eyebrow="About Spotless NT" title="Cleaner spaces. Healthier lives." lede="We’re a locally owned Darwin cleaning business. We price the job before we start and tell you honestly what a clean can and can’t do." crumbs={[{ href: "/why-us", label: "About" }]} />
      <section className="section pt-12">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <TeamVisual photo={s.teamPhoto} />
          <div>
            <SectionHeading eyebrow="The team" title="You’ll know exactly who’s at the door." lede="Our crew wears navy Spotless NT shirts with the logo on the chest and back, and arrives in a sign-written vehicle with commercial gear." />
            <ul className="mt-6 space-y-3">
              {["Friendly, uniformed technicians", "Trained on fibre, fabric and stain types", "Careful with furniture, floors and pets", "Clear drying advice before we leave"].map((item) => (
                <li key={item} className="flex items-center gap-3 font-semibold text-navy"><CheckCircle2 className="h-5 w-5 text-leaf-dark" aria-hidden /> {item}</li>
              ))}
            </ul>
            {s.stats.length > 0 && (
              <dl className="mt-8 grid grid-cols-3 gap-3">
                {s.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-brand-light p-4">
                    <dd className="font-display text-3xl font-extrabold text-navy">{stat.value}</dd>
                    <dt className="text-sm text-slate">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>
      <section className="section bg-mist">
        <div className="container-x">
          <SectionHeading eyebrow="Our uniform" title="Look for the logo." lede="Every technician wears the Spotless NT shirt, so you can spot us before we knock." align="center" />
          <div className="mx-auto mt-10 max-w-3xl rounded-card bg-white p-6 shadow-card md:p-10"><UniformMockup phone={s.phoneDisplay} className="w-full" /></div>
        </div>
      </section>
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Our promise" title="Why Darwin homes choose us" />
          <div className="mt-10"><Pillars /></div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/how-it-works" className="inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-bold text-white hover:bg-navy-deep">How it works</Link>
            <Link href="/results" className="inline-flex min-h-12 items-center rounded-full border-2 border-line px-6 font-bold text-navy hover:border-brand">See our results</Link>
          </div>
        </div>
      </section>
      <CtaBand settings={s} />
    </>
  );
}
