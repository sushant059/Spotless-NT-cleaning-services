import Link from "next/link";

export default function SiteNotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-deep">404</p>
      <h1 className="mt-3 text-4xl font-bold">That page is not here</h1>
      <p className="mt-3 text-slate">Try the services list or send a free quote and we will point you the right way.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/services" className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-sun px-6 font-semibold text-ink">Services</Link>
        <Link href="/free-quote" className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-teal-deep px-6 font-semibold text-teal-deep">Free quote</Link>
      </div>
    </section>
  );
}
