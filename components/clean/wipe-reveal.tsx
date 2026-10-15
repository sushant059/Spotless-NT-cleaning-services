"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, useMotionTemplate } from "motion/react";
import { useRef, useState } from "react";
import { ArrowRight, Droplets, Sparkles, SprayCan, Wind } from "lucide-react";
import { SceneArt } from "@/components/scene-art";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "carpet", label: "Carpet" },
  { id: "couch", label: "Sofa" },
  { id: "mattress", label: "Mattress" },
  { id: "rug", label: "Rug" },
];

const STAGES = [
  { at: 0, icon: SprayCan, title: "Pre-treat", text: "Spots and traffic lanes get a fabric-safe pre-spray." },
  { at: 0.34, icon: Droplets, title: "Hot-water extraction", text: "Hot water rinses the fibres; the dirt is pulled straight out." },
  { at: 0.67, icon: Wind, title: "Groom & dry", text: "Fibres are groomed and fans set up. Dry in 4–8 hours." },
];

/**
 * "Watch it come clean": as you scroll, a cleaning wand sweeps across a grubby room and leaves it
 * spotless behind it, with a live % clean and the three steps of the job. Tap a tab to switch rooms.
 */
export function WipeReveal() {
  const ref = useRef<HTMLElement>(null);
  const [scene, setScene] = useState("carpet");
  const [percent, setPercent] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const reveal = useTransform(p, [0.05, 0.9], [0, 100]);
  const clip = useMotionTemplate`inset(0 ${useTransform(reveal, (value) => 100 - value)}% 0 0)`;
  const wandX = useMotionTemplate`${reveal}%`;
  const glow = useTransform(p, [0.85, 0.95], [0, 1]);
  useMotionValueEvent(reveal, "change", (value) => setPercent(Math.round(Math.max(0, Math.min(100, value)))));
  const stage = STAGES.reduce((current, item, index) => (percent / 100 >= item.at ? index : current), 0);

  return (
    <section ref={ref} className="relative h-[260vh] bg-gradient-to-b from-mist to-white" aria-label="Watch a clean happen">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-6">
        <div className="container-x grid items-center gap-5 lg:grid-cols-[1fr_1.25fr] lg:gap-12 [&>*]:min-w-0">
          <div>
            <p className="eyebrow"><Sparkles className="h-3.5 w-3.5 text-leaf" /> Watch it come clean</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold leading-[1.05] text-navy sm:text-4xl md:text-5xl">Scroll, and see what a Spotless clean does.</h2>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Choose a room">
              {SCENES.map((item) => (
                <button key={item.id} type="button" role="tab" aria-selected={scene === item.id} onClick={() => setScene(item.id)} className={cn("min-h-10 rounded-full px-4 text-sm font-bold transition active:scale-95", scene === item.id ? "bg-navy text-white shadow-card" : "bg-white text-navy ring-1 ring-line hover:ring-brand")}>
                  {item.label}
                </button>
              ))}
            </div>
            <ol className="mt-5 hidden gap-3 lg:grid">
              {STAGES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className={cn("flex gap-3 rounded-2xl p-3 transition duration-500", index === stage ? "bg-white shadow-card ring-1 ring-brand/20" : "opacity-45")}>
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl transition", index <= stage ? "bg-leaf text-white" : "bg-brand-light text-brand")}><Icon className="h-5 w-5" aria-hidden /></span>
                    <span><span className="block font-display font-bold text-navy">{item.title}</span><span className="text-sm text-slate">{item.text}</span></span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-soft ring-1 ring-line md:rounded-[32px]">
              <div className="absolute inset-0"><SceneArt scene={scene} clean={false} alt="Before cleaning (illustration)" label={false} /></div>
              <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
                <SceneArt scene={scene} clean alt="After cleaning (illustration)" label={false} />
              </motion.div>
              {/* The cleaning wand riding the edge between dirty and clean */}
              <motion.div className="pointer-events-none absolute inset-y-0 w-0" style={{ left: wandX }} aria-hidden>
                <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_18px_6px_rgba(46,155,234,.55)]" />
                <div className="absolute bottom-[10%] -left-7 h-6 w-14 rounded-lg bg-brand shadow-card" />
                <div className="absolute bottom-[calc(10%+22px)] left-0 h-[45%] w-1.5 -translate-x-1/2 rotate-[8deg] rounded-full bg-gradient-to-b from-slate/30 to-slate/80" />
                {[0, 1, 2].map((i) => (
                  <span key={i} className="bubble-pop absolute bottom-[14%] h-3 w-3 rounded-full border border-white/90 bg-white/40" style={{ left: 6 + i * 8, animationDelay: `${i * 0.35}s` }} />
                ))}
              </motion.div>
              {/* Sparkle burst when it's done */}
              <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glow }} aria-hidden>
                {[[18, 22], [62, 18], [80, 46], [34, 58], [52, 70]].map(([x, y], i) => (
                  <svg key={i} viewBox="0 0 24 24" className="absolute h-7 w-7 animate-twinkle text-white drop-shadow-[0_0_8px_rgba(46,155,234,.9)]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.3}s` }}><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" /></svg>
                ))}
              </motion.div>
              {/* The wand moves left to right: clean behind it, still dirty ahead of it */}
              <span className="absolute left-3 top-3 rounded-full bg-leaf px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Clean</span>
              <span className="absolute right-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Before</span>
              <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate">Illustration</span>
            </div>

            {/* Progress: % clean and the current step (phones see the step here) */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white p-3 shadow-card ring-1 ring-line md:p-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center">
                <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E8F2FB" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3BA935" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(percent / 100) * 97.4} 97.4`} />
                </svg>
                <span className="font-display text-base font-extrabold tabular-nums text-navy" aria-live="off">{percent}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf-dark">Step {stage + 1} of 3 · {percent >= 100 ? "Spotless!" : "cleaning"}</p>
                <p className="font-display text-lg font-bold leading-tight text-navy">{STAGES[stage].title}</p>
                <p className="truncate text-sm text-slate lg:hidden">{STAGES[stage].text}</p>
              </div>
              <Link href="/free-quote" className="hidden min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-leaf-dark px-4 text-sm font-bold text-white hover:bg-[#1d6a19] sm:inline-flex">Get a quote <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
