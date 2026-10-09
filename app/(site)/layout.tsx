import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { OfferBanner } from "@/components/layout/offer-banner";
import { SiteWidgets } from "@/components/layout/site-widgets";
import { getDb } from "@/lib/store";
import { filled, siteUrl } from "@/lib/utils";
import { isOfferLive } from "@/lib/validators";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const banner = db.offers.find((offer) => offer.showOnBanner && isOfferLive(offer) && offer.bannerText);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: db.settings.businessName,
    telephone: db.settings.phoneTel,
    email: db.settings.email,
    url: siteUrl(),
    image: `${siteUrl()}/spotless-nt-mark.png`,
    areaServed: "Darwin, Northern Territory",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Darwin",
      addressRegion: "NT",
      addressCountry: "AU",
      ...(filled(db.settings.address) ? { streetAddress: db.settings.address } : {}),
    },
  };
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-sun focus:px-4 focus:py-3 focus:text-ink">Skip to content</a>
      <div className="sticky top-0 z-40">
        {banner && <OfferBanner id={banner.id} text={banner.bannerText} href={banner.href || "/free-quote"} />}
        <Header />
      </div>
      <main id="content" className="pb-24 md:pb-0">{children}</main>
      <Footer settings={db.settings} services={db.services} />
      <SiteWidgets settings={db.settings} faqs={db.faqs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
