"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Hand, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { SceneArt } from "@/components/scene-art";
import { cn } from "@/lib/utils";

const ROOMS = [
  { id: "carpet", label: "Carpet" },
  { id: "couch", label: "Sofa" },
  { id: "mattress", label: "Mattress" },
  { id: "rug", label: "Rug" },
];

const DONE_AT = 0.9;

/** Same "random" grime every time for a room, so it looks deliberate rather than noisy. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

type Bubble = { id: number; x: number; y: number; size: number };

/**
 * "Your turn": a grimy film over a clean room. Rub it with a finger or the mouse and it comes
 * clean under a soapy sponge, with a live % meter. Hits 90% and the whole room sparkles.
 */
export function ScrubGame() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const bubbleId = useRef(0);
  const sampleTimer = useRef(0);
  const [room, setRoom] = useState("carpet");
  const [percent, setPercent] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [sponge, setSponge] = useState<{ x: number; y: number } | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  /** Paints the dirt: a brownish film, darker stains and a speckle of grit. */
  const paintGrime = useCallback(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = box.clientWidth;
    const height = box.clientHeight;
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const random = seeded(ROOMS.findIndex((item) => item.id === room) * 97 + 13);
    const film = ctx.createLinearGradient(0, 0, width, height);
    film.addColorStop(0, "rgba(120, 98, 72, 0.80)");
    film.addColorStop(1, "rgba(98, 80, 60, 0.86)");
    ctx.fillStyle = film;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 14; i++) {
      const x = random() * width;
      const y = height * 0.35 + random() * height * 0.6;
      const r = 14 + random() * width * 0.09;
      const stain = ctx.createRadialGradient(x, y, 0, x, y, r);
      stain.addColorStop(0, "rgba(70, 52, 34, 0.75)");
      stain.addColorStop(1, "rgba(70, 52, 34, 0)");
      ctx.fillStyle = stain;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.4, r, random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(60, 45, 30, 0.35)";
    for (let i = 0; i < 900; i++) ctx.fillRect(random() * width, random() * height, 1.6, 1.6);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = `600 ${Math.max(13, width * 0.032)}px var(--font-body), sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Grubby! Scrub me clean ✨", width / 2, height * 0.16);
    setPercent(0);
    setDone(false);
    setStarted(false);
  }, [room]);

  useEffect(() => {
    paintGrime();
    const onResize = () => paintGrime();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paintGrime]);

  /** How much of the film is gone, sampled on a coarse grid so it's cheap. */
  const measure = useCallback(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const { data } = ctx.getImageData(0, 0, el.width, el.height);
    let clear = 0;
    let total = 0;
    const stepX = Math.max(1, Math.floor(el.width / 48));
    const stepY = Math.max(1, Math.floor(el.height / 36));
    for (let y = 0; y < el.height; y += stepY) {
      for (let x = 0; x < el.width; x += stepX) {
        total++;
        if (data[(y * el.width + x) * 4 + 3] < 40) clear++;
      }
    }
    const share = clear / total;
    setPercent(Math.round(share * 100));
    if (share >= DONE_AT && !done) {
      ctx.clearRect(0, 0, el.width, el.height);
      setPercent(100);
      setDone(true);
    }
  }, [done]);

  function scrub(x: number, y: number) {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || done) return;
    const radius = Math.max(18, el.clientWidth * 0.065);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = radius * 2;
    ctx.beginPath();
    const from = last.current ?? { x, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    last.current = { x, y };
    if (!started) setStarted(true);
    // A few soap bubbles trail the sponge.
    if (Math.random() < 0.35) {
      const id = ++bubbleId.current;
      setBubbles((list) => [...list.slice(-14), { id, x: x + (Math.random() - 0.5) * radius, y: y + (Math.random() - 0.5) * radius, size: 6 + Math.random() * 12 }]);
      window.setTimeout(() => setBubbles((list) => list.filter((item) => item.id !== id)), 1000);
    }
    window.clearTimeout(sampleTimer.current);
    sampleTimer.current = window.setTimeout(measure, 120);
  }

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  /** For anyone who'd rather watch: the sponge sweeps the room clean by itself. */
  function autoClean() {
    const el = canvas.current;
    if (!el || done) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const rows = 6;
    let step = 0;
    const total = rows * 24;
    last.current = null;
    const timer = window.setInterval(() => {
      const row = Math.floor(step / 24);
      const along = (step % 24) / 23;
      const x = row % 2 === 0 ? along * width : (1 - along) * width;
      const y = ((row + 0.5) / rows) * height;
      if (step % 24 === 0) last.current = null;
      scrub(x, y);
      setSponge({ x, y });
      step++;
      if (step >= total) {
        window.clearInterval(timer);
        setSponge(null);
        last.current = null;
        measure();
      }
    }, 18);
  }

  return (
    <section className="section relative overflow-hidden bg-gradient-to-b from-white to-mist" aria-label="Scrub it clean">
      <div className="container-x grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14 [&>*]:min-w-0">
        <div>
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5 text-leaf" /> Your turn</p>
          <h2 className="mt-2 font-display text-[30px] font-extrabold leading-[1.05] text-navy sm:text-4xl md:text-5xl">Scrub it clean.</h2>
          <p className="mt-3 max-w-md text-lg text-slate">Rub the grubby room with your finger or mouse and watch it come up like new. (We use a truck-mounted extractor, not a sponge.)</p>
          <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose a room">
            {ROOMS.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={room === item.id} onClick={() => setRoom(item.id)} className={cn("min-h-11 rounded-full px-4 text-sm font-bold transition active:scale-95", room === item.id ? "bg-navy text-white shadow-card" : "bg-white text-navy ring-1 ring-line hover:ring-brand")}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-6 hidden items-center gap-4 lg:flex">
            <Meter percent={percent} done={done} />
            <p className="text-slate">{done ? "Spotless! That’s what we do for real homes." : started ? "Keep going, nearly there…" : "Start scrubbing anywhere on the room."}</p>
          </div>
        </div>

        <div>
          <div ref={wrap} className={cn("relative aspect-[4/3] select-none overflow-hidden rounded-[24px] shadow-soft ring-1 ring-line md:rounded-[32px]", done && "ring-4 ring-leaf/60")}>
            <div className="absolute inset-0"><SceneArt scene={room} clean alt="A clean room (illustration)" label={false} /></div>
            <canvas
              ref={canvas}
              className="absolute inset-0 h-full w-full cursor-none touch-none"
              aria-label="Grime to scrub away. Use the Clean it for me button if you can't drag."
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                last.current = null;
                const p = point(event);
                setSponge(p);
                scrub(p.x, p.y);
              }}
              onPointerMove={(event) => {
                const p = point(event);
                setSponge(p);
                if (event.buttons || event.pointerType === "touch") scrub(p.x, p.y);
              }}
              onPointerUp={() => {
                last.current = null;
                measure();
              }}
              onPointerLeave={() => {
                last.current = null;
                setSponge(null);
              }}
            />
            {/* Soap bubbles and the sponge */}
            {bubbles.map((bubble) => (
              <span key={bubble.id} className="bubble-pop pointer-events-none absolute rounded-full border border-white/90 bg-white/40" style={{ left: bubble.x, top: bubble.y, width: bubble.size, height: bubble.size }} aria-hidden />
            ))}
            {sponge && !done && (
              <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: sponge.x, top: sponge.y }} aria-hidden>
                <span className="block h-10 w-14 rotate-[-12deg] rounded-xl bg-gradient-to-b from-sun to-[#F59E0B] shadow-card ring-2 ring-white">
                  <span className="block h-3 rounded-t-xl bg-leaf" />
                </span>
              </span>
            )}
            {/* First-time hint */}
            {!started && !done && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
                <span className="flex animate-floaty items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-bold text-navy shadow-card"><Hand className="h-5 w-5 text-brand" /> Scrub here</span>
              </span>
            )}
            {/* Finished */}
            {done && (
              <span className="pointer-events-none absolute inset-0" aria-hidden>
                {[[12, 18], [70, 12], [84, 52], [28, 60], [52, 36], [40, 80], [88, 82]].map(([x, y], i) => (
                  <svg key={i} viewBox="0 0 24 24" className="absolute h-8 w-8 animate-twinkle text-white drop-shadow-[0_0_10px_rgba(46,155,234,.9)]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.2}s` }}><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" /></svg>
                ))}
              </span>
            )}
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate">Illustration</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-line">
            <div className="lg:hidden"><Meter percent={percent} done={done} /></div>
            <p className="min-w-0 flex-1 text-sm font-semibold text-navy lg:hidden">{done ? "Spotless!" : started ? "Keep going…" : "Scrub the room"}</p>
            {done ? (
              <Link href="/free-quote" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-leaf-dark px-5 text-sm font-bold text-white hover:bg-[#1d6a19]">Get the real thing <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            ) : (
              <button type="button" onClick={autoClean} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark active:scale-95"><Wand2 className="h-4 w-4" aria-hidden /> Clean it for me</button>
            )}
            <button type="button" onClick={paintGrime} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-mist px-4 text-sm font-bold text-navy hover:bg-brand-light active:scale-95 lg:ml-auto"><RotateCcw className="h-4 w-4" aria-hidden /> Make it dirty</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meter({ percent, done }: { percent: number; done: boolean }) {
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center" role="img" aria-label={`${percent}% clean`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E8F2FB" strokeWidth="3.5" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={done ? "#3BA935" : "#2E9BEA"} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(percent / 100) * 97.4} 97.4`} className="transition-[stroke-dasharray] duration-300" />
      </svg>
      <span className="font-display text-base font-extrabold tabular-nums text-navy">{percent}%</span>
    </div>
  );
}
