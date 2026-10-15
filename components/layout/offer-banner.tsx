"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sparkle } from "@/components/art/sparkle";
import { SocialIcons } from "@/components/social";
import type { Settings } from "@/lib/types";

export function OfferBanner({ id, text, href, settings }: { id: string; text: string; href: string; settings: Settings }) {
  const key = `snt-banner-${id}-${text}`;
  const [visible, setVisible] = useState(true);
  const [tucked, setTucked] = useState(false);
  // Fold the bar away once the visitor starts reading, so it doesn't eat the small screen.
  useEffect(() => {
    const onScroll = () => setTucked(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(key) !== "hidden");
    } catch {
      setVisible(true);
    }
  }, [key]);
  if (!visible || !text) return null;
  return (
    <div className={`grid overflow-hidden bg-navy text-white transition-[grid-template-rows] duration-300 [&>*]:min-w-0 ${tucked ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
      <div className="container-x flex min-h-0 min-w-0 items-center gap-3 text-sm">
        <Sparkle className="my-2 h-4 w-4 shrink-0 text-sun" animated />
        {/* Phones: one line that glides along. Larger screens: the full sentence. */}
        <Link href={href || "/offers"} className="relative min-w-0 flex-1 overflow-hidden py-2 font-semibold underline-offset-4 hover:underline">
          <span className="sr-only sm:not-sr-only">{text} <span className="hidden text-sky-soft sm:inline">→ See offer</span></span>
          <span className="flex w-max animate-marquee gap-10 sm:hidden" style={{ animationDuration: "14s" }} aria-hidden>
            <span>{text} →</span>
            <span>{text} →</span>
          </span>
        </Link>
        <SocialIcons settings={settings} size="sm" className="hidden md:flex" />
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
          aria-label="Dismiss offer"
          onClick={() => {
            try {
              window.localStorage.setItem(key, "hidden");
            } catch {}
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
