import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand";
import { Sparkle } from "@/components/art/sparkle";
import { SocialIcons } from "@/components/social";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { areaSlug, mainAreas } from "@/lib/areas";
import type { Service, Settings } from "@/lib/types";
import { byOrder, filled } from "@/lib/utils";

export function Footer({ settings, services }: { settings: Settings; services: Service[] }) {
  const visible = byOrder(services).filter((service) => service.visible);
  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      <Sparkle className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 text-white/[0.03]" />
      <div className="container-x relative">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">Cleaner spaces. Healthier lives. Locally owned carpet, upholstery and bond cleaning for the Top End.</p>
            <SocialIcons settings={settings} className="mt-6" />
          </div>
          {SERVICE_CATEGORIES.slice(0, 2).map((category, index) => (
            <div key={category.id}>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky">{index === 0 ? "Services" : " "}</h3>
              {SERVICE_CATEGORIES.filter((_, i) => i % 2 === index).map((group) => (
                <div key={group.id} className="mt-4">
                  <Link href={`/services#${group.id}`} className="font-semibold text-white hover:text-sky">{group.title}</Link>
                  <ul className="mt-2 space-y-1.5 text-sm text-white/65">
                    {visible.filter((service) => service.category === group.id).map((service) => (
                      <li key={service.id}><Link className="hover:text-white" href={`/services/${service.slug}`}>{service.title}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a className="flex items-center gap-3 hover:text-sky" href={`tel:${settings.phoneTel}`}><Phone className="h-4 w-4 text-leaf" aria-hidden />{settings.phoneDisplay}</a></li>
              <li><a className="flex items-center gap-3 break-all hover:text-sky" href={`mailto:${settings.email}`}><Mail className="h-4 w-4 shrink-0 text-leaf" aria-hidden />{settings.email}</a></li>
              <li className="flex items-center gap-3 text-white/80"><MapPin className="h-4 w-4 text-leaf" aria-hidden />{filled(settings.address) ? settings.address : "Darwin & surrounds, NT"}</li>
            </ul>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/65">
              {[
                ["/how-it-works", "How it works"],
                ["/results", "Before & after"],
                ["/offers", "Offers"],
                ["/reviews", "Reviews"],
                ["/areas", "Areas we clean"],
                ["/faqs", "FAQs"],
                ["/booking", "Book a clean"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
              ].map(([href, label]) => (
                <li key={href}><Link className="hover:text-white" href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky">Areas we clean</p>
          <ul className="flex flex-wrap gap-2">
            {mainAreas(settings.serviceAreas).map((area) => (
              <li key={area.name}>
                <Link href={`/areas/${areaSlug(area.name)}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white">
                  <MapPin className="h-3.5 w-3.5 text-leaf" aria-hidden /> {area.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/areas" className="inline-flex min-h-10 items-center gap-1 rounded-full bg-leaf/90 px-4 text-sm font-bold text-white transition hover:bg-leaf">All areas →</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.businessName}{filled(settings.abn) ? ` · ABN ${settings.abn}` : ""}</p>
          <p>{[settings.licence, settings.insurance].filter(filled).join(" · ") || "Proudly serving the Top End"}</p>
        </div>
      </div>
    </footer>
  );
}
