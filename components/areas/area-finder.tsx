"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, MessageSquareText, Search, X } from "lucide-react";
import { REGION_LABEL, areaSlug, regionOf, type Region } from "@/lib/areas";
import { cn } from "@/lib/utils";

const TABS: { id: Region | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "city", label: "Darwin" },
  { id: "northern", label: "Northern suburbs" },
  { id: "palmerston", label: "Palmerston" },
  { id: "rural", label: "Rural" },
];

/** Search box + region tabs over every suburb we serve, so the long list stays tidy. */
export function AreaFinder({ areas }: { areas: string[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Region | "all">("all");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...areas].sort().filter((area) => (tab === "all" || regionOf(area) === tab) && (!q || area.toLowerCase().includes(q)));
  }, [areas, query, tab]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((item) => [item.id, item.id === "all" ? areas.length : areas.filter((area) => regionOf(area) === item.id).length])), [areas]);

  return (
    <div className="rounded-[28px] bg-white p-4 shadow-card ring-1 ring-line sm:p-6 md:p-8">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" aria-hidden />
        <label htmlFor="area-search" className="sr-only">Search your suburb</label>
        <input
          id="area-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type your suburb, e.g. Nightcliff"
          autoComplete="address-level2"
          className="min-h-14 w-full rounded-full border border-line bg-mist pl-12 pr-12 text-base text-ink transition focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate hover:bg-mist" aria-label="Clear search">
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Regions">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition", tab === item.id ? "bg-navy text-white shadow-card" : "bg-mist text-navy hover:bg-brand-light")}
          >
            {item.label}
            <span className={cn("rounded-full px-1.5 text-xs", tab === item.id ? "bg-white/20" : "bg-white text-slate")}>{counts[item.id]}</span>
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((area) => (
            <li key={area}>
              <Link href={`/areas/${areaSlug(area)}`} className="group flex min-h-12 items-center gap-2 rounded-2xl px-3 text-[15px] font-semibold text-navy ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-brand-light hover:ring-brand/30">
                <MapPin className="h-4 w-4 shrink-0 text-leaf-dark transition group-hover:scale-110" aria-hidden />
                <span className="min-w-0 py-2 leading-tight">{area}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl bg-mist p-6 text-center">
          <p className="font-bold text-navy">“{query}” isn’t on our list yet</p>
          <p className="mt-1 text-sm text-slate">We may still come to you. Ask us and we’ll let you know straight away.</p>
          <button type="button" data-open-chat className="press mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 font-bold text-white hover:bg-brand"><MessageSquareText className="h-5 w-5" aria-hidden /> Ask in the chat</button>
        </div>
      )}
      <p className="mt-5 text-center text-xs text-slate">{tab === "all" ? "Darwin, Palmerston & Litchfield" : REGION_LABEL[tab]} · {list.length} suburb{list.length === 1 ? "" : "s"}</p>
    </div>
  );
}
