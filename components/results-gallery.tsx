"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/before-after";
import type { ResultPair, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ResultsGallery({ results, services }: { results: ResultPair[]; services: Service[] }) {
  const [filter, setFilter] = useState("all");
  const visible = results.filter((item) => filter === "all" || item.serviceSlug === filter);
  const chips = [{ slug: "all", title: "All" }, ...services.filter((service) => results.some((item) => item.serviceSlug === service.slug)).map((service) => ({ slug: service.slug, title: service.title }))];
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4" role="toolbar" aria-label="Filter results">
        {chips.map((chip) => (
          <button key={chip.slug} type="button" aria-pressed={filter === chip.slug} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", filter === chip.slug ? "bg-teal text-white" : "bg-white text-ink")} onClick={() => setFilter(chip.slug)}>
            {chip.title}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((item) => (
          <figure key={item.id}>
            <BeforeAfter scene={item.scene || item.serviceSlug} beforeSrc={item.beforeImage} afterSrc={item.afterImage} beforeAlt={`Before: ${item.caption}`} afterAlt={`After: ${item.caption}`} />
            <figcaption className="mt-3 text-sm">
              <span className="font-semibold">{item.caption}.</span>{" "}
              {item.illustrative && <span className="text-slate">Illustrative — replace with a real job photo.</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {visible.length === 0 && <p className="rounded-card bg-white p-6 text-slate">No results in this filter yet.</p>}
    </div>
  );
}
