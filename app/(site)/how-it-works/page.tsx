import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero, SectionHeading, Steps } from "@/components/content";
import { getDb } from "@/lib/store";

export const metadata: Metadata = {
  title: "How it works",
  description: "Get a quote, we clean, you get a fresh result. See the process and honest drying times for Darwin weather.",
};

const DRYING = [
  ["Carpet", "4–8 hours", "Longer in the wet season or in closed rooms."],
  ["Rugs", "6–12 hours", "Thick wool needs airflow underneath."],
  ["Upholstery", "Same day", "Thick cushions can take a little longer."],
  ["Mattresses", "A few hours", "Sleep on it once it feels dry to touch."],
];

export default async function HowItWorksPage() {
  const db = await getDb();
  return (
    <>
      <PageHero eyebrow="How it works" title="Simple to book. Careful on the day." lede="No mystery packages. You ask, we price it, we clean, and we tell you when the room is ready to use." crumbs={[{ href: "/how-it-works", label: "How it works" }]} />
      <section className="section pt-12">
        <div className="container-x"><Steps /></div>
      </section>
      <section className="section bg-mist">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="On the day" title="What happens when we arrive" />
            <ol className="mt-8 space-y-5">
              {[
                ["Access", "A park close by, a working tap and small items cleared from the floor where you can."],
                ["Inspect", "We check the fibre, stains, loose dye and anything that shouldn’t get wet."],
                ["Pre-treat & extract", "Soil goes into our tank, not back into the pile."],
                ["Groom & explain", "We set the pile and give you a drying time for that day’s weather."],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-display font-bold text-white">{index + 1}</span>
                  <div><h3 className="font-display text-lg font-bold text-navy">{title}</h3><p className="text-slate">{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading eyebrow="Drying times" title="Typical drying in Darwin" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {DRYING.map(([item, time, note]) => (
                <div key={item} className="card p-5">
                  <p className="text-sm font-semibold text-slate">{item}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-navy">{time}</p>
                  <p className="mt-1 text-sm text-slate">{note}</p>
                </div>
              ))}
            </div>
            <Link href="/booking" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-leaf-dark px-6 font-bold text-white hover:bg-[#1d6a19]">Request a time</Link>
          </div>
        </div>
      </section>
      <CtaBand settings={db.settings} />
    </>
  );
}
