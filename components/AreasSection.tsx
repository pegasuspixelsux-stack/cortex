"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ZONES as AREAS } from "@/lib/zones";

export default function AreasSection() {
  return (
    <section id="zonas" className="w-full bg-background scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-24">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-2xl mb-14 md:mb-16 flex flex-col gap-5"
        >
          <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
            Nuestras Zonas
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
            Territorios Exclusivos
          </h2>
          <p className="text-foreground/60 text-sm md:text-base leading-relaxed">
            Operamos en los enclaves más codiciados de la costa atlántica,
            curando propiedades únicas donde la arquitectura de autor se
            fusiona con el paisaje natural.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {AREAS.map((area, index) => (
            <motion.div
              key={area.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: (index % 3) * 0.12,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-[3/4] w-full overflow-hidden rounded-sm cursor-pointer"
            >
              <Image
                src={area.image}
                alt={area.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />

              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-7">
                <h3 className="font-serif text-2xl md:text-3xl font-light text-cream">
                  {area.name}
                </h3>
                <p className="mt-2 text-cream-soft text-sm leading-relaxed">
                  {area.tagline}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
