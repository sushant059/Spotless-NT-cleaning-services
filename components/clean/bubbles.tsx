import { cn } from "@/lib/utils";

// Fixed positions (no randomness) so the server and browser render the same bubbles.
const BUBBLES = [
  [6, 18, 0, 9], [14, 34, 2.4, 11], [22, 12, 5.1, 8], [31, 26, 1.2, 12], [40, 14, 3.6, 10],
  [48, 40, 6.2, 13], [57, 20, 0.8, 9], [65, 30, 4.4, 11], [73, 16, 2.0, 10], [81, 44, 5.6, 14],
  [88, 22, 1.6, 9], [94, 32, 3.0, 12],
] as const;

/** Soap bubbles drifting up behind a section. Purely decorative; still when motion is reduced. */
export function Bubbles({ className, count = 12 }: { className?: string; count?: number }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {BUBBLES.slice(0, count).map(([left, size, delay, duration], index) => (
        <span
          key={index}
          className="bubble absolute bottom-[-60px] rounded-full"
          style={{ left: `${left}%`, width: size, height: size, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
        />
      ))}
    </div>
  );
}
