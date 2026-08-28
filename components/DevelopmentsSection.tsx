"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { Development } from "@/lib/developments";

interface DevelopmentsSectionProps {
  developments: Development[];
  eyebrow?: string;
  title?: string;
  /** Optional footer link, e.g. to the full /desarrollos page. */
  cta?: { href: string; label: string };
  /** Wrap in a <section> with padding (default) or render the grid bare. */
  bare?: boolean;
}

/**
 * The investor "Desarrollos destacados" grid, shared by /inversiones (3
 * model cases) and /desarrollos (6 launch-stage projects).
 */
export default function DevelopmentsSection({
  developments,
  eyebrow = "Casos modelo",
  title = "Desarrollos destacados para inversores",
  cta,
  bare = false,
}: DevelopmentsSectionProps) {
  const grid = (
    <>
      <div className="flex flex-col gap-2 mb-14">
        <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
          {eyebrow}
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-foreground">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {developments.map((dev, index) => (
          <motion.article
            key={dev.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: (index % 3) * 0.12,
              ease: "easeOut",
            }}
            className="group flex flex-col gap-4"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={dev.image}
                alt={dev.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 text-xs tracking-[0.2em] uppercase bg-background/85 backdrop-blur-sm text-foreground/80 px-3 py-1.5 rounded-full">
                {dev.location}
              </span>
              {dev.stageTag && (
                <span className="absolute top-4 right-4 text-[11px] tracking-[0.15em] uppercase bg-terracotta text-white px-3 py-1.5 rounded-full font-medium">
                  {dev.stageTag}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-serif text-xl font-light text-foreground">
                  {dev.name}
                </h3>
                <span className="text-terracotta-hover text-xs uppercase tracking-[0.15em]">
                  {dev.opportunityType}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3 pt-2 border-t border-foreground/10">
                <span className="text-foreground/40 text-xs uppercase tracking-[0.12em]">
                  Rango estimado
                </span>
                <span className="text-foreground font-medium text-sm">
                  {dev.priceRange}
                </span>
              </div>

              {dev.metricValue && (
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-foreground/40 text-xs">
                    {dev.metricLabel}
                  </span>
                  <span className="text-foreground/70">{dev.metricValue}</span>
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      {cta && (
        <div className="mt-14 flex justify-center">
          <Link
            href={cta.href}
            className="group inline-flex items-center gap-3 border border-foreground/15 hover:border-terracotta text-foreground text-sm px-7 py-3.5 rounded-full transition-colors"
          >
            <span>{cta.label}</span>
            <ArrowRight className="w-4 h-4 text-terracotta-hover transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </>
  );

  if (bare) return grid;

  return (
    <section className="w-full bg-background">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
        {grid}
      </div>
    </section>
  );
}
