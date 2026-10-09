import type { Metadata } from "next";
import { PageHero } from "@/components/content";
import { ContactForm } from "@/components/forms/contact-form";
import { getDb } from "@/lib/store";
import { filled, safeHttpUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, WhatsApp or email Spotless NT Cleaning Services in Darwin on 0401 647 545.",
};

export default async function ContactPage() {
  const db = await getDb();
  const settings = db.settings;
  const socials = [
    ["Facebook", settings.facebook],
    ["Instagram", settings.instagram],
    ["TikTok", settings.tiktok],
    ["Google", settings.google],
  ].filter((entry): entry is [string, string] => Boolean(safeHttpUrl(entry[1])));
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us" lede="Call, WhatsApp or send a note. Quote and booking forms are quicker if you already know the job." />
      <section className="bg-cream px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-card bg-white p-6 shadow-card">
            <h2 className="text-2xl font-bold">Reach Spotless NT</h2>
            <ul className="mt-4 space-y-3">
              <li><a className="font-semibold text-teal-deep" href={`tel:${settings.phoneTel}`}>{settings.phoneDisplay}</a></li>
              <li><a className="font-semibold text-teal-deep" href={settings.whatsappUrl}>WhatsApp</a></li>
              <li><a className="font-semibold text-teal-deep" href={`mailto:${settings.email}`}>{settings.email}</a></li>
              {filled(settings.address) && <li>{settings.address}</li>}
            </ul>
            <h3 className="mt-6 font-bold">Opening hours</h3>
            <ul className="mt-2 space-y-1 text-slate">{settings.openingHours.map((hour) => <li key={hour.day} className="flex justify-between gap-4"><span>{hour.day}</span><span>{hour.hours}</span></li>)}</ul>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-3">{socials.map(([label, href]) => <li key={label}><a className="font-semibold text-teal-deep" href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
            )}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
