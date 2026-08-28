import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DevelopmentsSection from "@/components/DevelopmentsSection";
import { INVESTOR_DEVELOPMENTS } from "@/lib/developments";

export const metadata: Metadata = {
  title: "Desarrollos en Preventa | Cortex",
  description:
    "Seis desarrollos inmobiliarios en etapa de lanzamiento y pozo en Punta del Este y Maldonado, seleccionados para inversores: torres residenciales, complejos boutique y fraccionamientos en preventa.",
};

export default function DesarrollosPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="solid" />

      <main className="w-full">
        {/* Header */}
        <section className="relative w-full overflow-hidden bg-ink">
          <Image
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80&auto=format&fit=crop"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-20 flex flex-col gap-6">
            <span className="text-terracotta-dark text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Desarrollos
            </span>
            <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight max-w-3xl">
              Desarrollos destacados para inversores
            </h1>
            <p className="text-cream-soft text-base md:text-lg leading-relaxed max-w-2xl">
              Seis proyectos en etapa de inicio y pozo en Punta del Este y
              alrededores, con entrada temprana y planes de pago en preventa.
              Cortex acompaña cada operación desde el análisis del fideicomiso
              hasta la entrega de la unidad.
            </p>
          </div>
        </section>

        <DevelopmentsSection
          eyebrow="Pipeline de inversión"
          title="Seis oportunidades en preventa"
          developments={INVESTOR_DEVELOPMENTS}
        />

        {/* Back to the investment advisory */}
        <section className="w-full bg-ink">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-24 flex flex-col items-start gap-6">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-cream max-w-2xl leading-snug">
              ¿Querés analizar cuál de estos desarrollos se ajusta a tu
              horizonte de inversión?
            </h2>
            <Link
              href="/inversiones#contacto"
              className="group inline-flex items-center gap-3 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-7 py-3.5 rounded-full transition-colors"
            >
              <span>Agendar sesión estratégica</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
