import Link from "next/link";
import { filled, safeHttpUrl } from "@/lib/utils";
import type { Settings, Service } from "@/lib/types";

export function Footer({ settings, services }: { settings: Settings; services: Service[] }) {
  const socials = [
    ["Facebook", settings.facebook],
    ["Instagram", settings.instagram],
    ["TikTok", settings.tiktok],
    ["Google", settings.google],
  ].filter((entry): entry is [string, string] => Boolean(safeHttpUrl(entry[1])));
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spotless-nt-logo.svg" alt="Spotless NT Cleaning Services" className="h-16 w-auto rounded-2xl bg-white p-2" />
          <p className="mt-4 text-sm text-white/80">Cleaner spaces. Healthier lives. Carpet, couch, mattress and bond cleaning around Darwin.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Services</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {services.filter((service) => service.visible).map((service) => (
              <li key={service.id}><Link className="hover:text-mint" href={`/services/${service.slug}`}>{service.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-mint" href="/why-us">Why us</Link></li>
            <li><Link className="hover:text-mint" href="/how-it-works">How it works</Link></li>
            <li><Link className="hover:text-mint" href="/results">Before and after</Link></li>
            <li><Link className="hover:text-mint" href="/faqs">FAQs</Link></li>
            <li><Link className="hover:text-mint" href="/booking">Book a clean</Link></li>
            <li><Link className="hover:text-mint" href="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-mint" href="/terms">Terms</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="hover:text-mint" href={`tel:${settings.phoneTel}`}>{settings.phoneDisplay}</a></li>
            <li><a className="hover:text-mint" href={settings.whatsappUrl}>WhatsApp</a></li>
            <li><a className="hover:text-mint" href={`mailto:${settings.email}`}>{settings.email}</a></li>
            {filled(settings.address) && <li>{settings.address}</li>}
            {filled(settings.abn) && <li>ABN {settings.abn}</li>}
            {filled(settings.licence) && <li>{settings.licence}</li>}
            {filled(settings.insurance) && <li>{settings.insurance}</li>}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {socials.map(([label, href]) => (
                <li key={label}><a className="underline decoration-mint underline-offset-4" href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-white/70">
        © {new Date().getFullYear()} {settings.businessName}
      </div>
    </footer>
  );
}
