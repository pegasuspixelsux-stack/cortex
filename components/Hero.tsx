"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-terracotta">
      {/* Background photo — aerial view of the José Ignacio lighthouse */}
      <Image
        src="/hero_images/jose-ignacio-faro.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark navy scrim over the photo so nav/type stay legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,16,28,0.6) 0%, rgba(15,30,52,0.55) 45%, rgba(8,13,24,0.78) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,0.08) 0%, rgba(15,30,52,0) 45%), radial-gradient(140% 100% at 100% 100%, rgba(0,0,0,0.3) 0%, rgba(15,30,52,0) 55%)",
        }}
      />

      <div className="relative z-10">
        <Nav variant="overlay" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-16 md:pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end min-h-[60vh]">
            {/* Left Column - Title */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pb-12 lg:pb-24"
            >
              <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.1] tracking-tight whitespace-pre-line">
                {"Redefiniendo el espacio,\nelevando la experiencia\nen Punta del Este"}
              </h1>
            </motion.div>

            {/* Right Column - Description & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pb-12 lg:pb-24 flex flex-col gap-8"
            >
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-md">
                Conectamos exclusividad, arquitectura de autor y oportunidades
                únicas frente al mar en los destinos más codiciados de
                Uruguay.
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-fit"
              >
                <Link
                  href="/portafolio"
                  className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm px-6 py-3 rounded-full transition-all border border-white/20"
                >
                  <span>Explorar Portafolio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
