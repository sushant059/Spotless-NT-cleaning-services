import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ tone = "dark", className, compact = false }: { tone?: "dark" | "light"; className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Territory Spotless Cleaning Services home">
      <Image src={tone === "dark" ? "/territory-spotless-mark-animated.svg" : "/territory-spotless-mark-white.svg"} unoptimized alt="" width={48} height={48} priority className="h-12 w-12 shrink-0 transition group-hover:rotate-[-4deg]" />
      {!compact && (
        <span className="whitespace-nowrap leading-none">
          <span className={cn("block font-display text-[17px] font-extrabold tracking-[0.01em] sm:text-[19px]", tone === "dark" ? "text-navy" : "text-white")}>
            TERRITORY <span className={tone === "dark" ? "text-brand" : "text-[#8CC4F2]"}>SPOTLESS</span>
          </span>
          <span className={cn("mt-1.5 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.36em] sm:text-[9.5px]", tone === "dark" ? "text-leaf-dark" : "text-[#5ED184]")}>
            <span className="h-px flex-1 bg-current opacity-50" aria-hidden />Cleaning Services<span className="h-px flex-1 bg-current opacity-50" aria-hidden />
          </span>
        </span>
      )}
    </Link>
  );
}
