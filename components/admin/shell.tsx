"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  ["/admin", "Dashboard"],
  ["/admin/leads", "Leads and bookings"],
  ["/admin/offers", "Offers"],
  ["/admin/services", "Services"],
  ["/admin/results", "Before and after"],
  ["/admin/media", "Gallery and media"],
  ["/admin/reviews", "Reviews"],
  ["/admin/faqs", "FAQs"],
  ["/admin/settings", "Settings"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-sky md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#d7ebee] bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/admin" className="font-bold text-ink">Spotless NT admin</Link>
          <button type="button" className="text-sm font-semibold text-teal-deep" onClick={async () => { await logoutAction(); router.push("/admin/login"); router.refresh(); }}>Log out</button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:px-3" aria-label="Admin">
          {LINKS.map(([href, label]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return <Link key={href} href={href} className={cn("block shrink-0 rounded-full px-3 py-2 text-sm font-semibold md:rounded-2xl", active ? "bg-teal text-white" : "text-ink hover:bg-sky")}>{label}</Link>;
          })}
          <Link href="/" className="block shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-teal-deep md:rounded-2xl">View site</Link>
        </nav>
      </aside>
      <div className="px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-card bg-white p-4 shadow-card md:p-6"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4">{children}</div></section>;
}
