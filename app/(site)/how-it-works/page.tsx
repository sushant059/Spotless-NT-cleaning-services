import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Steps } from "@/components/content";

export const metadata: Metadata = {
  title: "How it works",
  description: "Get a quote, we clean, you get a fresh result. See the process and honest drying times for Darwin weather.",
};

const DRYING = [
  ["Carpet", "Usually 4–8 hours to walk on. Longer in the wet season or in closed rooms."],
  ["Rugs", "Often 6–12 hours. Thick wool needs airflow underneath."],
  ["Upholstery", "Many pieces are usable the same day. Thick cushions take longer."],
  ["Mattresses", "A few hours is typical. Sleep on it once it feels dry."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Three steps, then a dry floor" lede="No mystery package. You ask, we price it, we clean, and we tell you when the room is ready to use." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto max-w-6xl"><Steps /></div>
      </section>
      <section className="bg-white px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-bold md:text-[36px]">On the day</h2>
            <ol className="mt-4 space-y-4 text-slate">
              <li><strong className="text-ink">1. Access.</strong> We need a park, a working tap and the rooms cleared of small items where we can.</li>
              <li><strong className="text-ink">2. Inspect.</strong> Fibre, stains, loose dye and anything that should not get wet.</li>
              <li><strong className="text-ink">3. Pre-treat and extract.</strong> Soil goes into the tank, not back into the pile.</li>
              <li><strong className="text-ink">4. Groom and explain.</strong> We set the pile and tell you the drying time for that weather.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-[28px] font-bold">Drying times</h2>
            <table className="mt-4 w-full text-left">
              <caption className="sr-only">Typical drying times</caption>
              <tbody>
                {DRYING.map(([item, time]) => (
                  <tr key={item} className="border-b border-[#d7ebee]"><th className="py-3 pr-4 align-top">{item}</th><td className="py-3 text-slate">{time}</td></tr>
                ))}
              </tbody>
            </table>
            <Link href="/booking" className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-sun px-6 font-semibold text-ink">Request a time</Link>
          </div>
        </div>
      </section>
    </>
  );
}
