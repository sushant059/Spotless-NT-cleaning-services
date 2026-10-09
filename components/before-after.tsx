"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { SceneArt } from "@/components/scene-art";
import { cn } from "@/lib/utils";

function Visual({ src, scene, clean, alt }: { src?: string; scene: string; clean: boolean; alt: string }) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" unoptimized={src.startsWith("http") || src.startsWith("/uploads")} />;
  }
  return <SceneArt scene={scene} clean={clean} alt={alt} />;
}

export function BeforeAfter({ beforeSrc, afterSrc, scene, beforeAlt, afterAlt, className }: { beforeSrc?: string; afterSrc?: string; scene: string; beforeAlt: string; afterAlt: string; className?: string }) {
  const [value, setValue] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  function setFromClientX(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setValue(Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div
      ref={ref}
      className={cn("group relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line", className)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId) || event.pointerType === "mouse") setFromClientX(event.clientX);
      }}
    >
      <div className="absolute inset-0"><Visual src={afterSrc} scene={scene} clean alt={afterAlt} /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Visual src={beforeSrc} scene={scene} clean={false} alt={beforeAlt} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${value}%` }}>
        <div className="absolute inset-y-0 -ml-[2px] w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,.25)]" />
        <button
          type="button"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-label="Drag to compare before and after"
          className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-soft ring-4 ring-white/40 transition group-hover:scale-110"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setValue((current) => Math.max(4, current - 5));
            if (event.key === "ArrowRight") setValue((current) => Math.min(96, current + 5));
          }}
        >
          <ChevronsLeftRight aria-hidden />
        </button>
      </div>
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Before</span>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-leaf-dark px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">After</span>
    </div>
  );
}
