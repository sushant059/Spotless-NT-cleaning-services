function Floor({ dirty, children }: { dirty: boolean; children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 640 480" className="h-full w-full" role="img" aria-hidden>
      <rect width="640" height="480" fill="#f3fbfd" />
      <rect x="430" y="36" width="120" height="90" rx="8" fill="#d7f1f5" stroke="#ffffff" strokeWidth="8" />
      <path d="M0 210 H640 V480 H0 Z" fill={dirty ? "#b7aaa0" : "#d5e4ea"} />
      <path d="M0 250 H640" stroke={dirty ? "#a8988c" : "#c5d7df"} strokeWidth="10" />
      <path d="M0 310 H640" stroke={dirty ? "#a8988c" : "#c5d7df"} strokeWidth="10" />
      <path d="M0 370 H640" stroke={dirty ? "#a8988c" : "#c5d7df"} strokeWidth="10" />
      {!dirty && <path d="M40 250 H360 V430 H40 Z" fill="#eef8f6" opacity="0.85" />}
      {children}
      {!dirty && (
        <g fill="#ffc531">
          <path d="M520 70 l8 16 16 8 -16 8 -8 16 -8 -16 -16 -8 16 -8 z" />
          <path d="M575 120 l5 10 10 5 -10 5 -5 10 -5 -10 -10 -5 10 -5 z" />
        </g>
      )}
    </svg>
  );
}

export function SceneArt({ scene, clean, alt }: { scene: string; clean: boolean; alt: string }) {
  const key = scene.includes("couch") || scene.includes("sofa") || scene.includes("uphol")
    ? "couch"
    : scene.includes("mattress")
      ? "mattress"
      : scene.includes("rug")
        ? "rug"
        : scene.includes("pet")
          ? "pet"
          : scene.includes("bond") || scene.includes("lease")
            ? "bond"
            : scene.includes("office")
              ? "office"
              : scene.includes("emergency")
                ? "emergency"
                : "carpet";
  return (
    <div className="relative h-full w-full bg-sky" aria-label={alt} role="img">
      {key === "carpet" && (
        <Floor dirty={!clean}>
          {!clean && <ellipse cx="180" cy="340" rx="70" ry="28" fill="#8c7364" opacity="0.7" />}
          {!clean && <ellipse cx="300" cy="390" rx="40" ry="16" fill="#6f5a4d" opacity="0.55" />}
          <rect x="360" y="150" width="210" height="90" rx="28" fill={clean ? "#7aa7c4" : "#8d97a1"} />
          <rect x="390" y="126" width="70" height="40" rx="16" fill={clean ? "#9ec3d6" : "#a3aab1"} />
        </Floor>
      )}
      {key === "couch" && (
        <Floor dirty={!clean}>
          <rect x="90" y="168" width="420" height="150" rx="36" fill={clean ? "#f4e7d4" : "#c3b29a"} />
          <rect x="120" y="150" width="90" height="70" rx="18" fill={clean ? "#fff6ea" : "#d9c7ae"} />
          <rect x="230" y="150" width="90" height="70" rx="18" fill={clean ? "#fff6ea" : "#b7a48c"} />
          {!clean && <ellipse cx="250" cy="250" rx="46" ry="18" fill="#8d6b4a" opacity="0.45" />}
        </Floor>
      )}
      {key === "mattress" && (
        <svg viewBox="0 0 640 480" className="h-full w-full" aria-hidden>
          <rect width="640" height="480" fill="#f7fbfc" />
          <rect x="70" y="80" width="500" height="320" rx="28" fill={clean ? "#ffffff" : "#efe2c4"} stroke="#d5e4ea" strokeWidth="8" />
          <path d="M70 150 H570" stroke="#d5e4ea" strokeWidth="6" />
          {!clean && <ellipse cx="250" cy="250" rx="80" ry="36" fill="#e2c98a" />}
          {clean && <path d="M120 180 H520" stroke="#7ed9c6" strokeWidth="28" opacity="0.8" />}
        </svg>
      )}
      {key === "rug" && (
        <Floor dirty={false}>
          <rect x="80" y="230" width="460" height="190" rx="8" fill={clean ? "#0e7490" : "#8d8478"} />
          <rect x="110" y="255" width="400" height="140" fill={clean ? "#f4d35e" : "#a3988c"} opacity="0.85" />
          <circle cx="310" cy="325" r="36" fill={clean ? "#09808f" : "#7d736a"} />
        </Floor>
      )}
      {key === "pet" && (
        <Floor dirty={!clean}>
          {!clean && <ellipse cx="230" cy="360" rx="54" ry="22" fill="#c4a15a" />}
          {clean && <ellipse cx="470" cy="360" rx="46" ry="22" fill="#17343c" opacity="0.15" />}
          <ellipse cx="500" cy="330" rx="36" ry="22" fill="#d9b48a" />
          <circle cx="530" cy="300" r="16" fill="#d9b48a" />
        </Floor>
      )}
      {key === "bond" && (
        <Floor dirty={!clean}>
          {!clean && <rect x="80" y="300" width="70" height="40" fill="#8d6b4a" />}
          {!clean && <circle cx="420" cy="360" r="16" fill="#6f5a4d" />}
          {clean && <rect x="250" y="300" width="140" height="8" fill="#ffffff" opacity="0.7" />}
        </Floor>
      )}
      {key === "office" && (
        <Floor dirty={!clean}>
          <rect x="70" y="150" width="220" height="16" fill="#8fb8c4" />
          <rect x="80" y="166" width="12" height="70" fill="#17343c" />
          <rect x="260" y="166" width="12" height="70" fill="#17343c" />
          <rect x="360" y="180" width="70" height="80" rx="10" fill={clean ? "#09808f" : "#7d8b92"} />
        </Floor>
      )}
      {key === "emergency" && (
        <Floor dirty={!clean}>
          {!clean && <path d="M60 300 C180 260 220 420 360 340 C460 290 520 400 620 330 V480 H0 V320 Z" fill="#7eb7d4" opacity="0.85" />}
          {clean && <path d="M80 360 H520" stroke="#ffffff" strokeWidth="8" />}
        </Floor>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">Illustrative</span>
    </div>
  );
}
