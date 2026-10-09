export function Wave({ fill = "#FFFBF0", className = "" }: { fill?: string; className?: string }) {
  return (
    <svg viewBox="0 0 1440 80" className={`block h-12 w-full md:h-16 ${className}`} preserveAspectRatio="none" aria-hidden>
      <path fill={fill} d="M0 36c160 32 320-28 520-12s360 40 560 8 240-36 360-16v64H0Z" />
    </svg>
  );
}

export function SunRays() {
  return (
    <svg className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 opacity-80 md:h-[420px] md:w-[420px]" viewBox="0 0 200 200" aria-hidden>
      {Array.from({ length: 12 }).map((_, index) => (
        <path key={index} d="M100 100 L106 18 L94 18 Z" fill="#FFC531" opacity="0.45" transform={`rotate(${index * 30} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="26" fill="#FFC531" />
    </svg>
  );
}
