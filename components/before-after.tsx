"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { SceneArt } from "@/components/scene-art";

function Visual({ src, scene, clean, alt }: { src?: string; scene: string; clean: boolean; alt: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
        unoptimized={src.startsWith("http") || src.startsWith("/uploads")}
      />
    );
  }
  return <SceneArt scene={scene} clean={clean} alt={alt} />;
}

export function BeforeAfter({
  beforeSrc,
  afterSrc,
  scene,
  beforeAlt,
  afterAlt,
}: {
  beforeSrc?: string;
  afterSrc?: string;
  scene: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  const [value, setValue] = useState(54);
  const ref = useRef<HTMLDivElement>(null);

  function setFromClientX(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.min(90, Math.max(10, next)));
  }

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-card bg-white shadow-card"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromClientX(event.clientX);
      }}
    >
      <div className="absolute inset-0">
        <Visual src={afterSrc} scene={scene} clean alt={afterAlt} />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
        <Visual src={beforeSrc} scene={scene} clean={false} alt={beforeAlt} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${value}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white" />
        <button
          type="button"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-label="Drag to compare before and after"
          className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sun text-ink shadow-card"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setValue((current) => Math.max(10, current - 4));
            if (event.key === "ArrowRight") setValue((current) => Math.min(90, current + 4));
          }}
        >
          <ChevronsLeftRight aria-hidden />
        </button>
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">Before</span>
      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">After</span>
    </div>
  );
}
