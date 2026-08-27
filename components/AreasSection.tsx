"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface Area {
  name: string;
  description: string;
  image: string;
}

const AREAS: Area[] = [
  {
    name: "La Barra",
    description:
      "Vida social vibrante, playas bravas y una escena gastronómica que no descansa.",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Manantiales",
    description:
      "Arquitectura contemporánea entre médanos y pinares, a pasos del océano.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "José Ignacio",
    description:
      "Sofisticación rústica, atardeceres oceánicos y exclusividad absoluta.",
    image:
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Playa Brava",
    description:
      "Olas imponentes y horizonte infinito frente a la avenida más icónica de Punta del Este.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Playa Mansa",
    description:
      "Aguas calmas, atardeceres de bahía y el pulso urbano a un paso de la costa.",
    image:
      "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Península",
    description:
      "El corazón histórico y cosmopolita de Punta del Este, entre el mar y la bahía.",
    image:
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80&auto=format&fit=crop",
  },
];

export default function AreasSection() {
  return (
    <section className="w-full bg-background">
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
                  {area.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
