"use client";

import { motion } from "motion/react";
import { useSiteSettings } from "@/lib/useSiteSettings";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const line = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function About() {
  const { nosotrosText } = useSiteSettings();
  return (
    <section className="w-full bg-navy px-6 md:px-12 py-28 md:py-40">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={container}
        className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8"
      >
        <motion.span
          variants={line}
          className="text-terracotta-dark text-xs md:text-sm tracking-[0.3em] uppercase font-medium"
        >
          Nosotros
        </motion.span>

        <motion.p
          variants={line}
          className="font-serif text-cream text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed md:leading-relaxed whitespace-pre-line"
        >
          {nosotrosText}
        </motion.p>
      </motion.div>
    </section>
  );
}
