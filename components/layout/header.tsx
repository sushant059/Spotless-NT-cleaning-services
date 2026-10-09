"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="border-b border-white/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="Spotless NT Cleaning Services, home">
          {/* SVG logo artwork is served directly so the wordmark stays sharp. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spotless-nt-icon.svg" alt="" className="h-12 w-12 shrink-0 md:hidden" />
          <span className="leading-none md:hidden">
            <span className="block text-lg font-bold text-ink">Spotless NT</span>
            <span className="block text-[11px] font-semibold tracking-[0.14em] text-teal-deep">CLEANING SERVICES</span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spotless-nt-logo.svg" alt="Spotless NT Cleaning Services" className="hidden h-14 w-auto md:block" />
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-sky", pathname.startsWith(link.href) && "bg-sky text-teal-deep")}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/free-quote" className="ml-auto inline-flex min-h-[52px] items-center rounded-full bg-sun px-4 text-sm font-semibold text-ink lg:ml-3 lg:px-5 lg:text-base">
          Free Quote
        </Link>
        <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-sky text-ink lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" className="border-t border-sky bg-white px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-2xl px-3 py-3 text-lg font-semibold text-ink hover:bg-sky">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="block rounded-2xl px-3 py-3 text-lg font-semibold text-teal-deep hover:bg-sky">
                Book a clean
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
