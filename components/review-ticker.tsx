"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

/** Compact, endlessly scrolling review quotes for the hero. Pauses on hover or touch. */
export function ReviewTicker({ reviews }: { reviews: Pick<Review, "id" | "name" | "text" | "rating" | "suburb">[] }) {
  const [paused, setPaused] = useState(false);
  if (!reviews.length) return null;
  const base = Array.from({ length: Math.max(1, Math.ceil(6 / reviews.length)) }, () => reviews).flat();
  const track = [...base, ...base];
  const short = (text: string) => (text.length > 90 ? `${text.slice(0, 88).trimEnd()}…` : text);
  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:overflow-x-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul className="flex w-max gap-3 py-1 motion-safe:animate-marquee" style={{ animationDuration: `${Math.max(28, base.length * 7)}s`, animationPlayState: paused ? "paused" : "running" }}>
        {track.map((review, index) => (
          <li key={`${review.id}-${index}`} aria-hidden={index >= base.length || undefined} className="w-[260px] shrink-0 rounded-2xl bg-white/95 p-3.5 text-ink shadow-card sm:w-[300px]">
            <span className="flex text-[#F5A623]" aria-label={`${review.rating} stars`}>{Array.from({ length: Math.max(1, Math.min(5, review.rating)) }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />)}</span>
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug">“{short(review.text)}”</p>
            <p className="mt-1.5 truncate text-xs font-semibold text-slate">{review.name}{review.suburb ? ` · ${review.suburb}` : ""}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
