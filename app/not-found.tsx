import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getDb } from "@/lib/store";

export default async function NotFound() {
  const db = await getDb();
  return (
    <>
      <Header />
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-deep">404</p>
        <h1 className="mt-3 text-4xl font-bold">That page is not here</h1>
        <p className="mt-3 text-slate">The link may be old. The quote form and the service list are the quickest ways back.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-sun px-6 font-semibold text-ink">Home</Link>
          <Link href="/free-quote" className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-teal-deep px-6 font-semibold text-teal-deep">Free quote</Link>
        </div>
      </main>
      <Footer settings={db.settings} services={db.services} />
    </>
  );
}
