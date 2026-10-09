"use client";

import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { SceneArt } from "@/components/scene-art";
import { matchSuburb } from "@/lib/validators";
import type { Service } from "@/lib/types";

export function SuburbChecker({ areas }: { areas: string[] }) {
  const [value, setValue] = useState("");
  const result = useMemo(() => matchSuburb(value, areas), [value, areas]);
  return (
    <form className="rounded-card bg-white p-5 shadow-card" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="suburb-check" className="font-semibold">Check your suburb</label>
      <input id="suburb-check" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Start typing, e.g. Parap" className="mt-3 min-h-[52px] w-full rounded-input border border-[#c5dde2] px-4" />
      <div className="mt-3 text-sm" aria-live="polite">
        {!value.trim() && <p className="text-slate">We cover Darwin and the surrounding suburbs.</p>}
        {value.trim() && result.match && <p className="font-semibold text-teal-deep">Yes — we cover {result.match}.</p>}
        {value.trim() && !result.match && result.suggestions.length > 0 && <p>Did you mean {result.suggestions.join(", ")}?</p>}
        {value.trim() && !result.match && result.suggestions.length === 0 && <p>{"We mainly cover Darwin and surrounding suburbs. Send a quote and we'll confirm if we can reach you."}</p>}
      </div>
    </form>
  );
}

export function VideoShowcase({ services }: { services: Service[] }) {
  const items = services.filter((service) => service.visible);
  if (!items.length) return null;
  return (
    <Tabs.Root defaultValue={items[0].slug}>
      <Tabs.List className="flex gap-2 overflow-x-auto pb-3" aria-label="Service videos">
        {items.map((service) => (
          <Tabs.Trigger key={service.slug} value={service.slug} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink data-[state=active]:bg-teal data-[state=active]:text-white">
            {service.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((service) => (
        <Tabs.Content key={service.slug} value={service.slug} className="overflow-hidden rounded-card bg-white shadow-card">
          <div className="relative aspect-video">
            {service.videoUrl ? (
              <video className="h-full w-full object-cover" controls preload="none" poster={service.image || undefined}>
                <source src={service.videoUrl} />
              </video>
            ) : (
              <>
                <SceneArt scene={service.slug} clean alt="" />
                <div className="shine-bar pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/30" />
              </>
            )}
          </div>
          <p className="px-4 py-3 text-sm text-slate">{service.videoUrl ? service.summary : "Illustrative preview. Replace it with a real job video from the admin gallery."}</p>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

