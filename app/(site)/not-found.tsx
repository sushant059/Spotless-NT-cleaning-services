import Link from "next/link";
import { Sparkle } from "@/components/art/sparkle";

export default function SiteNotFound() {
  return (
    <section className="container-x py-24 text-center">
      <Sparkle className="mx-auto h-12 w-12 text-sky" animated />
      <p className="mt-6 font-display text-7xl font-extrabold text-navy">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-navy">This page has been cleaned away.</h1>
      <p className="mx-auto mt-3 max-w-md text-slate">The link may be old. Try our services, or get a free quote and we’ll point you the right way.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/services" className="inline-flex min-h-12 items-center justify-center rounded-full bg-navy px-6 font-bold text-white">Our services</Link>
        <Link href="/free-quote" className="inline-flex min-h-12 items-center justify-center rounded-full bg-leaf-dark px-6 font-bold text-white">Free quote</Link>
      </div>
    </section>
  );
}
