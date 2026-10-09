"use client";

import { useState } from "react";
import { ChatWidget } from "@/components/chat/chat-widget";
import { FloatingActions } from "@/components/layout/floating";
import type { Faq, Settings } from "@/lib/types";

export function SiteWidgets({ settings, faqs }: { settings: Settings; faqs: Faq[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <FloatingActions settings={settings} onChat={() => setOpen(true)} />
      <ChatWidget settings={settings} faqs={faqs} open={open} onOpenChange={setOpen} />
    </>
  );
}
