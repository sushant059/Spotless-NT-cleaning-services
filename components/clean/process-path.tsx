"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { CalendarCheck, MessageSquareText, PhoneCall, Sparkles } from "lucide-react";

const STEPS = [
  { icon: MessageSquareText, title: "Tell us what needs cleaning", text: "Use the quote form, the chat or WhatsApp. Photos help us price it right." },
  { icon: PhoneCall, title: "Get a fixed price", text: "We call or message back with a firm price. No call-out fee for a quote." },
  { icon: CalendarCheck, title: "Pick a time", text: "Choose a day and time window. We confirm and remind you the day before." },
  { icon: Sparkles, title: "Enjoy the clean", text: "A uniformed local crew arrives on time, cleans, and talks you through drying." },
];

/** "How it works" as a path that draws itself as you scroll, lighting up each step on the way. */
export function ProcessPath() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <ol ref={ref} className="relative grid gap-6 pl-14 md:pl-16 lg:grid-cols-4 lg:gap-6 lg:pl-0 lg:pt-16">
      {/* The path: vertical on phones, horizontal on desktop */}
      <span className="absolute bottom-6 left-[22px] top-6 w-1 rounded-full bg-white/15 md:left-[26px] lg:hidden" aria-hidden />
      <motion.span className="absolute left-[22px] top-6 w-1 origin-top rounded-full bg-gradient-to-b from-sky to-leaf md:left-[26px] lg:hidden" style={{ scaleY: draw, bottom: 24 }} aria-hidden />
      <span className="absolute left-8 right-8 top-[26px] hidden h-1 rounded-full bg-white/15 lg:block" aria-hidden />
      <motion.span className="absolute left-8 right-8 top-[26px] hidden h-1 origin-left rounded-full bg-gradient-to-r from-sky to-leaf lg:block" style={{ scaleX: draw }} aria-hidden />
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.li key={step.title} className="relative" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -15% 0px" }} transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
            <motion.span className="absolute -left-14 top-0 grid h-12 w-12 place-items-center rounded-2xl bg-leaf text-white shadow-[0_10px_24px_-8px_rgba(59,169,53,.8)] md:-left-16 md:h-14 md:w-14 lg:static lg:-mt-[70px] lg:mb-5" initial={{ scale: 0.4, rotate: -20 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true, margin: "0px 0px -15% 0px" }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 + index * 0.08 }}>
              <Icon className="h-6 w-6" aria-hidden />
            </motion.span>
            <div className="rounded-[22px] bg-white/[0.07] p-5 ring-1 ring-white/10 backdrop-blur">
              <span className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-sky">Step {index + 1}</span>
              <h3 className="mt-1 font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-white/75">{step.text}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
