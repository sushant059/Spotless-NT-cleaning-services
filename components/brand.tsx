import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className, compact = false }: { tone?: "dark" | "light"; className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Territory Spotless Cleaning Services home">
      <Image src={tone === "dark" ? "/territory-spotless-mark.svg" : "/territory-spotless-mark-white.svg"} alt="" width={48} height={48} priority className="h-12 w-12 shrink-0 transition group-hover:rotate-[-4deg]" />
      {!compact && (
        <span className="whitespace-nowrap leading-none">
          <span className={cn("block text-[9.5px] font-extrabold uppercase tracking-[0.32em]", tone === "dark" ? "text-leaf" : "text-[#5ED184]")}>Territory</span>
          <span className={cn("mt-0.5 block font-display text-[23px] font-extrabold tracking-tight", tone === "dark" ? "text-navy" : "text-white")}>Spotless</span>
          <span className={cn("mt-1 block text-[8.5px] font-bold uppercase tracking-[0.3em]", tone === "dark" ? "text-brand" : "text-sky-soft")}>Cleaning Services</span>
        </span>
      )}
    </Link>
  );
}
