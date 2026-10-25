import Image from "next/image";
import { Photo } from "@/components/photo";
import { sceneStock } from "@/lib/stock";
import { cn } from "@/lib/utils";

function Shot({ src, alt, label, tone }: { src: string; alt: string; label: string; tone: string }) {
  return (
    <div className="relative min-w-0 overflow-hidden">
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 360px" className="object-cover transition duration-700 group-hover:scale-105" unoptimized={src.startsWith("http") || src.startsWith("/uploads")} />
      <span className={cn("absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white", tone)}>{label}</span>
    </div>
  );
}

/**
 * Real job photos side by side (before | after). Until both photos are added in the admin,
 * a clean photo of the service is shown instead, with no before/after labels.
 */
export function BeforeAfter({ beforeSrc, afterSrc, scene, beforeAlt, afterAlt, className }: { beforeSrc?: string; afterSrc?: string; scene: string; beforeAlt: string; afterAlt: string; className?: string }) {
  const real = Boolean(beforeSrc && afterSrc);
  return (
    <div className={cn("group relative aspect-[4/3] w-full overflow-hidden rounded-card bg-mist shadow-card ring-1 ring-line", className)}>
      {real ? (
        <div className="absolute inset-0 grid grid-cols-2 gap-1 bg-white">
          <Shot src={beforeSrc!} alt={beforeAlt} label="Before" tone="bg-navy/85" />
          <Shot src={afterSrc!} alt={afterAlt} label="After" tone="bg-leaf-dark" />
        </div>
      ) : (
        <Photo stock={sceneStock(scene)} alt={afterAlt.replace(/^After:\s*/, "")} fill sizes="(max-width: 768px) 100vw, 720px" className="transition duration-700 group-hover:scale-105" />
      )}
    </div>
  );
}
