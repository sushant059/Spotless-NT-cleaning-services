import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { getDb } from "@/lib/store";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#0B2F5E" };

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDb();
  const image = db.settings.ogImage || "/spotless-nt-mark.png";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: db.settings.seoTitle, template: `%s | ${db.settings.shortName}` },
    description: db.settings.seoDescription,
    applicationName: db.settings.businessName,
    openGraph: {
      title: db.settings.seoTitle,
      description: db.settings.seoDescription,
      type: "website",
      locale: "en_AU",
      siteName: db.settings.businessName,
      images: [{ url: image, alt: db.settings.businessName }],
    },
    twitter: { card: "summary_large_image", title: db.settings.seoTitle, description: db.settings.seoDescription, images: [image] },
    icons: { icon: "/spotless-nt-icon.svg", apple: "/spotless-nt-mark.png" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
