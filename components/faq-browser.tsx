"use client";

import { useState } from "react";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FaqBrowser({ faqs }: { faqs: Faq[] }) {
  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));
  const [category, setCategory] = useState(categories[0] || "");
  const visible = faqs.filter((faq) => faq.category === category);
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4" role="tablist" aria-label="FAQ categories">
        {categories.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={category === item} className={cn("shrink-0 rounded-full px-4 py-2 font-semibold", category === item ? "bg-teal text-white" : "bg-white")} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="divide-y divide-[#d7ebee] rounded-card bg-white px-5 shadow-card">
        {visible.map((faq) => (
          <details key={faq.id} className="py-4">
            <summary className="cursor-pointer text-lg font-semibold">{faq.question}</summary>
            <p className="mt-2 text-slate">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
