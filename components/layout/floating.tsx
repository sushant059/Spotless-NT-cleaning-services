"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import type { Settings } from "@/lib/types";

export function FloatingActions({ settings, onChat }: { settings: Settings; onChat: () => void }) {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 md:bottom-6">
        {showTop && (
          <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-card" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp aria-hidden />
          </button>
        )}
        <button type="button" className="grid h-14 w-14 place-items-center rounded-full bg-teal text-white shadow-soft" aria-label="Open chat" onClick={onChat}>
          <MessageCircle aria-hidden />
        </button>
        <a href={settings.whatsappUrl} className="grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-ink shadow-soft" aria-label="WhatsApp Spotless NT">
          <MessageCircle aria-hidden />
        </a>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#d7ebee] bg-white md:hidden" aria-label="Quick contact">
        <a href={`tel:${settings.phoneTel}`} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-ink">
          <Phone className="h-5 w-5 text-teal-deep" aria-hidden /> Call
        </a>
        <a href={settings.whatsappUrl} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-ink">
          <MessageCircle className="h-5 w-5 text-teal-deep" aria-hidden /> WhatsApp
        </a>
        <Link href="/free-quote" className="flex min-h-16 flex-col items-center justify-center gap-1 bg-sun text-xs font-semibold text-ink">
          Free Quote
        </Link>
      </nav>
    </>
  );
}
