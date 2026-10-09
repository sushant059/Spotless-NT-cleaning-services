"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function OfferBanner({ id, text, href }: { id: string; text: string; href: string }) {
  const key = `snt-banner-${id}-${text}`;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(window.localStorage.getItem(key) !== "hidden");
  }, [key]);
  if (!visible || !text) return null;
  return (
    <div className="bg-teal-deep text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm md:text-base">
        <Link href={href || "/free-quote"} className="flex-1 font-semibold underline-offset-2 hover:underline">
          {text}
        </Link>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
          aria-label="Dismiss offer"
          onClick={() => {
            window.localStorage.setItem(key, "hidden");
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
