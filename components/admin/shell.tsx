"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgePercent, Briefcase, Menu, Receipt, X, CalendarDays, ExternalLink, Images, Inbox, LayoutDashboard, ListChecks, LogOut, MessageSquareQuote, MoreHorizontal, Send, Settings, Sparkles, SquareStack, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand";
import { logoutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

type NavLink = readonly [string, string, LucideIcon];

const GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Work",
    links: [
      ["/admin", "Dashboard", LayoutDashboard],
      ["/admin/leads", "New enquiries", Inbox],
      ["/admin/jobs", "Jobs", Briefcase],
      ["/admin/calendar", "Calendar", CalendarDays],
      ["/admin/customers", "Customers", Users],
      ["/admin/invoices", "Invoices", Receipt],
    ],
  },
  {
    title: "Marketing",
    links: [
      ["/admin/messages", "Send offers", Send],
      ["/admin/offers", "Offers & promos", BadgePercent],
      ["/admin/reviews", "Reviews", MessageSquareQuote],
    ],
  },
  {
    title: "Website",
    links: [
      ["/admin/services", "Services", SquareStack],
      ["/admin/results", "Before & after", Sparkles],
      ["/admin/media", "Gallery & media", Images],
      ["/admin/faqs", "FAQs", ListChecks],
      ["/admin/settings", "Settings", Settings],
    ],
  },
];

const LINKS: NavLink[] = GROUPS.flatMap((group) => group.links);

/** The four things used every day, in a bar at the bottom of the phone screen. */
const TABS: NavLink[] = [
  ["/admin", "Home", LayoutDashboard],
  ["/admin/leads", "Enquiries", Inbox],
  ["/admin/jobs", "Jobs", Briefcase],
  ["/admin/customers", "Customers", Users],
];

export function AdminShell({ children, badges = {} }: { children: React.ReactNode; badges?: Record<string, number> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current = LINKS.find(([href]) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)));
  const totalBadges = Object.values(badges).reduce((sum, value) => sum + (value || 0), 0);

  const nav = (
    <nav className="space-y-1 px-3 pb-6" aria-label="Admin">
      {GROUPS.map((group) => (
        <div key={group.title} className="pb-2">
          <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate/80">{group.title}</p>
          {group.links.map(([href, label, Icon]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            const badge = badges[href];
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition md:text-sm", active ? "bg-navy text-white" : "text-navy hover:bg-mist")}>
                <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> {label}
                {badge ? <span className="ml-auto rounded-full bg-sun px-2 text-xs font-bold text-navy">{badge}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="border-t border-line pt-2" />
      <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-brand hover:bg-mist md:text-sm"><ExternalLink className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> View website</Link>
      <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-slate hover:bg-mist md:text-sm" onClick={async () => { await logoutAction(); router.push("/admin/login"); router.refresh(); }}><LogOut className="h-5 w-5 md:h-4 md:w-4" aria-hidden /> Log out</button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-mist md:grid md:grid-cols-[260px_1fr]">
      {/* Phone: top bar with a menu button */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-white px-4 md:hidden">
        <button type="button" onClick={() => setOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full bg-navy text-white" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="h-5 w-5" aria-hidden />
          {totalBadges > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-[11px] font-bold text-navy">{totalBadges}</span>}
        </button>
        <span className="min-w-0 truncate font-display text-lg font-bold text-navy">{current?.[1] ?? "Admin"}</span>
        <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-navy-deep/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,86vw)] flex-col bg-white shadow-soft">
            <div className="flex items-center justify-between gap-2 px-4 py-4">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-mist text-navy" aria-label="Close menu"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">{nav}</div>
          </div>
        </div>
      )}
      {/* Tablet and desktop: fixed sidebar */}
      <aside className="hidden border-r border-line bg-white md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
        <div className="px-4 py-4"><Logo /></div>
        {nav}
      </aside>
      <div className="min-w-0 px-4 pb-28 pt-6 md:px-8 md:py-8">{children}</div>

      {/* Phone: bottom tab bar for the everyday pages */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Quick">
        {TABS.map(([href, label, Icon]) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const badge = badges[href];
          return (
            <Link key={href} href={href} className={cn("relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", active ? "text-brand" : "text-slate")}>
              <Icon className="h-5 w-5" aria-hidden />
              {label}
              {badge ? <span className="absolute right-[calc(50%-20px)] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-sun px-1 text-[10px] font-bold text-navy">{badge}</span> : null}
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-brand" />}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate" aria-label="More admin pages">
          <MoreHorizontal className="h-5 w-5" aria-hidden /> More
        </button>
      </nav>
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-card bg-white p-4 shadow-card md:p-6"><h2 className="text-xl font-bold text-navy">{title}</h2><div className="mt-4">{children}</div></section>;
}
