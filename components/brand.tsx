import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className, compact = false }: { tone?: "dark" | "light"; className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Spotless NT Cleaning Services home">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-card ring-1 ring-line transition group-hover:rotate-[-4deg]">
        <Image src="/spotless-nt-mark.png" alt="" width={44} height={44} priority />
      </span>
      {!compact && (
        <span className="whitespace-nowrap leading-none">
          <span className={cn("block font-display text-[22px] font-extrabold tracking-tight", tone === "dark" ? "text-navy" : "text-white")}>
            Spotless <span className={tone === "dark" ? "text-leaf" : "text-leaf"}>NT</span>
          </span>
          <span className={cn("mt-1 block text-[10px] font-bold uppercase tracking-[0.24em]", tone === "dark" ? "text-brand" : "text-sky-soft")}>Cleaning Services</span>
        </span>
      )}
    </Link>
  );
}
