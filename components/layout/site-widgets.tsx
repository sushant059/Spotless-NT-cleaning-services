"use client";

import { useEffect, useState } from "react";
import { ChatWidget } from "@/components/chat/chat-widget";
import { FloatingActions } from "@/components/layout/floating";
import { ReviewDock } from "@/components/layout/review-dock";
import { safeHttpUrl } from "@/lib/utils";
import type { Service, Settings } from "@/lib/types";

export function SiteWidgets({ settings, services }: { settings: Settings; services: Pick<Service, "slug" | "title" | "icon" | "category">[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Any element with data-open-chat opens the assistant, so pages can link to it.
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest("[data-open-chat]");
      if (target) {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <>
      <FloatingActions settings={settings} onChat={() => setOpen(true)} chatOpen={open} />
      <ReviewDock hidden={open} googleUrl={safeHttpUrl(settings.google) || `https://www.google.com/maps/search/${encodeURIComponent(`${settings.businessName} Darwin`)}`} />
      <ChatWidget settings={settings} services={services} open={open} onOpenChange={setOpen} />
    </>
  );
}
