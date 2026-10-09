"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BadgePercent, ExternalLink, Images, LayoutDashboard, ListChecks, LogOut, MessageSquareQuote, Settings, Sparkles, SquareStack, Inbox } from "lucide-react";
import { Logo } from "@/components/brand";
import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/leads", "Leads & bookings", Inbox],
  ["/admin/reviews", "Reviews", MessageSquareQuote],
  ["/admin/services", "Services", SquareStack],
  ["/admin/results", "Before & after", Sparkles],
  ["/admin/media", "Gallery & media", Images],
  ["/admin/offers", "Offers & promos", BadgePercent],
  ["/admin/faqs", "FAQs", ListChecks],
  ["/admin/settings", "Settings", Settings],
] as const;

export function AdminShell({ children, badges = {} }: { children: React.ReactNode; badges?: Record<string, number> }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-mist md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Logo />
          <span className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1" aria-label="Admin">
          {LINKS.map(([href, label, Icon]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            const badge = badges[href];
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-navy text-white" : "text-navy hover:bg-mist")}>
                <Icon className="h-4 w-4" aria-hidden /> {label}
                {badge ? <span className="ml-auto rounded-full bg-sun px-2 text-xs font-bold text-navy">{badge}</span> : null}
              </Link>
            );
          })}
          <div className="hidden border-t border-line pt-2 md:block" />
          <Link href="/" target="_blank" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand hover:bg-mist"><ExternalLink className="h-4 w-4" aria-hidden /> View website</Link>
          <button type="button" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate hover:bg-mist md:w-full" onClick={async () => { await logoutAction(); router.push("/admin/login"); router.refresh(); }}><LogOut className="h-4 w-4" aria-hidden /> Log out</button>
        </nav>
      </aside>
      <div className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-card bg-white p-4 shadow-card md:p-6"><h2 className="text-xl font-bold text-navy">{title}</h2><div className="mt-4">{children}</div></section>;
}
