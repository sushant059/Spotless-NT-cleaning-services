"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PenLine, Star, X } from "lucide-react";
import { BrandIcon } from "@/components/social";
import { cn } from "@/lib/utils";

/**
 * Always-visible review button (bottom left). One tap opens the two ways to review:
 * on our website (approved by the team) or straight on Google.
 */
export function ReviewDock({ googleUrl, hidden }: { googleUrl: string; hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setNudge(true), 1800);
    const stop = window.setTimeout(() => setNudge(false), 7000);
    function onDown(event: MouseEvent) {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const onOpen = () => setOpen(true);
    window.addEventListener("open-review", onOpen);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(stop);
      window.removeEventListener("open-review", onOpen);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={box} className={cn("fixed bottom-[4.75rem] right-3 z-50 md:bottom-6 md:left-6 md:right-auto", hidden && "hidden md:block")}>
      {open && (
        <div className="absolute bottom-full right-0 mb-3 w-[min(19rem,calc(100vw-1.5rem))] md:left-0 md:right-auto animate-rise rounded-[26px] bg-white p-3 shadow-soft ring-1 ring-line" role="dialog" aria-label="Leave a review">
          <p className="px-2 pb-2 pt-1 text-sm font-bold text-navy">Loved your clean? Tell us! 💚</p>
          <Link href="/reviews#write" onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 rounded-2xl px-3 transition hover:bg-mist">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark"><PenLine className="h-5 w-5" aria-hidden /></span>
            <span className="leading-tight"><span className="block font-bold text-navy">Leave a review</span><span className="text-xs text-slate">On our website · takes 1 minute</span></span>
          </Link>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 rounded-2xl px-3 transition hover:bg-mist">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAF1FE]"><BrandIcon name="google" className="h-5 w-5 text-[#4285F4]" /></span>
            <span className="leading-tight"><span className="block font-bold text-navy">Google review</span><span className="text-xs text-slate">Helps Darwin locals find us</span></span>
          </a>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close review options" : "Leave a review"}
        onClick={() => { setOpen((value) => !value); setNudge(false); }}
        className={cn("press group hidden h-14 items-center gap-2 rounded-full bg-white py-2 pl-2 pr-5 font-bold text-navy shadow-soft ring-1 ring-line transition hover:ring-sun md:flex", nudge && !open && "animate-pop")}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFC93C] to-[#F5A623] text-white shadow-[0_4px_14px_rgba(245,166,35,.45)]">
          {open ? <X className="h-5 w-5" aria-hidden /> : <Star className="h-5 w-5 fill-white" aria-hidden />}
        </span>
        <span className="text-[15px]">Review us</span>
      </button>
    </div>
  );
}
