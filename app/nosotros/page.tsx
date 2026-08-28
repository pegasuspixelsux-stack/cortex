import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteText from "@/components/SiteText";
import { TEAM } from "@/lib/team";

export const metadata: Metadata = {
  title: "Nosotros | Cortex",
  description:
    "Conocé al equipo detrás de Cortex: arquitectura, visión y exclusividad en la costa atlántica de Punta del Este.",
};

export default function NosotrosPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="solid" />

      <main className="w-full">
        <div className="max-w-[790px] mx-auto px-6 py-20">
          {/* Opening manifesto */}
          <div className="flex flex-col gap-8 mb-16">
            <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Nosotros
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-extralight leading-[1.15] tracking-tight text-foreground">
              Arquitectura, visión y exclusividad en la costa atlántica
            </h1>
            <SiteText
              field="nosotrosText"
              className="text-foreground/60 text-base md:text-lg leading-relaxed"
            />
          </div>

          {/* Main photo block */}
          <figure className="flex flex-col gap-3 mb-24">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-sm">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80&auto=format&fit=crop"
                alt="Equipo de Cortex trabajando en oficina"
                fill
                sizes="(min-width: 790px) 790px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="text-foreground/40 text-xs md:text-sm">
              Nuestro equipo en el estudio de Punta del Este, definiendo la
              próxima propuesta de inversión.
            </figcaption>
          </figure>

          {/* Team */}
          <div className="flex flex-col gap-12">
            <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight text-foreground">
              Nuestro Equipo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
              {TEAM.map((member) => (
                <div key={member.name} className="flex flex-col gap-4">
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm grayscale">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(min-width: 640px) 380px, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-xl font-light text-foreground">
                      {member.name}
                    </h3>
                    <span className="text-terracotta-hover text-xs uppercase tracking-[0.15em]">
                      {member.role}
                    </span>
                  </div>

                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-foreground/70 hover:text-terracotta-hover text-sm transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </a>
                    <a
                      href={`tel:${member.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-foreground/70 hover:text-terracotta-hover text-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {member.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
