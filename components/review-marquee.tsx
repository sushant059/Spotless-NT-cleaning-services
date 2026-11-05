"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/content";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Reviews gliding across the screen in an endless loop. Hover (or touch) pauses it so a review
 * can be read; with reduced motion it becomes a normal swipeable row.
 */
export function ReviewMarquee({ reviews, reverse = false }: { reviews: Review[]; reverse?: boolean }) {
  const [paused, setPaused] = useState(false);
  if (!reviews.length) return null;
  // Repeat short lists so the strip is always wider than the screen, then double it for a seamless loop.
  const base = Array.from({ length: Math.max(1, Math.ceil(8 / reviews.length)) }, () => reviews).flat();
  const track = [...base, ...base];
  const seconds = Math.max(30, base.length * 7);
  return (
    <div
      className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul
        className={cn("flex w-max gap-4 py-4 motion-safe:animate-marquee sm:gap-6", reverse && "[animation-direction:reverse]")}
        style={{ animationDuration: `${seconds}s`, animationPlayState: paused ? "paused" : "running" }}
      >
        {track.map((review, index) => (
          <li key={`${review.id}-${index}`} className="w-[290px] shrink-0 sm:w-[360px]" aria-hidden={index >= base.length || undefined}>
            <ReviewCard review={review} className="transition duration-300 hover:-translate-y-1 hover:shadow-lift [&_blockquote]:line-clamp-5 [&_blockquote]:text-[16px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
