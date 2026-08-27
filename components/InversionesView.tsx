"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import {
  TreePine,
  Building2,
  Home,
  Building,
  ShieldCheck,
  Scale,
  Workflow,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Check,
} from "lucide-react";

const PILLARS = [
  {
    icon: TreePine,
    title: "Fraccionamientos y Chacras Marítimas",
    description:
      "Grandes extensiones de tierra y desarrollos rurales exclusivos en Maldonado y José Ignacio.",
  },
  {
    icon: Building2,
    title: 'Desarrollos "En el Pozo"',
    description:
      "Oportunidades de entrada temprana en edificios residenciales de pozo con alta plusvalía proyectada.",
  },
  {
    icon: Home,
    title: "Construcción Residencial",
    description:
      "Gestión integral de proyectos de construcción de casas de autor para renta o reventa.",
  },
  {
    icon: Building,
    title: "Edificios de Apartamentos",
    description:
      "Inversión institucional y participación en desarrollos inmobiliarios verticales completos.",
  },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Conocimiento local profundo",
    description:
      "Dominio técnico y legal del mercado de Maldonado, con relaciones directas con desarrolladores, estudios y escribanías de la zona.",
  },
  {
    icon: Scale,
    title: "Seguridad jurídica y fiscal",
    description:
      "Asistencia en estructuración corporativa, exoneraciones fiscales para viviendas promovidas y radicación fiscal en Uruguay.",
  },
  {
    icon: Workflow,
    title: "Gestión de punta a punta",
    description:
      "Desde la identificación de la oportunidad hasta la administración del activo o su reventa.",
  },
];

const PROJECTS = [
  {
    title: "Torre Marena",
    subtitle: "Inversión en Pozo",
    zone: "Península, Punta del Este",
    assetType: "Edificio residencial",
    returnLabel: "Retorno proyectado",
    returnValue: "+22% en pozo",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    title: "Chacras del Este",
    subtitle: "Fraccionamiento",
    zone: "José Ignacio, Maldonado",
    assetType: "Tierra / chacras",
    returnLabel: "Plusvalía estimada",
    returnValue: "+15% anual",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80&auto=format&fit=crop",
  },
  {
    title: "Residencial Brava",
    subtitle: "Edificio Boutique",
    zone: "Playa Brava, Punta del Este",
    assetType: "Apartamentos",
    returnLabel: "Renta anual estimada",
    returnValue: "6–8% en USD",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&q=80&auto=format&fit=crop",
  },
];

const INVESTMENT_RANGES = [
  "USD 200.000 – 500.000",
  "USD 500.000 – 1.000.000",
  "USD 1.000.000 – 5.000.000",
  "Más de USD 5.000.000",
];

export default function InversionesView() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative w-full min-h-[70vh] overflow-hidden bg-ink flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&auto=format&fit=crop"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,13,24,0.55) 0%, rgba(8,13,24,0.65) 50%, rgba(8,13,24,0.92) 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-16 pb-20 pt-32 flex flex-col gap-6"
        >
          <span className="text-terracotta-dark text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
            Inversiones
          </span>
          <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight max-w-3xl">
            Inversiones Inmobiliarias Estratégicas en Punta del Este
          </h1>
          <p className="text-cream-soft text-base md:text-lg leading-relaxed max-w-2xl">
            Asesoramiento integral y llave en mano para inversores
            internacionales que buscan capitalizar oportunidades de alta
            rentabilidad en la costa esteña de Uruguay.
          </p>
        </motion.div>
      </section>

      {/* Investment pillars */}
      <section className="w-full bg-background">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
          <div className="flex flex-col gap-2 mb-14">
            <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Oportunidades
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Líneas de inversión
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="flex flex-col gap-5 p-7 border border-foreground/10 rounded-sm hover:border-terracotta/50 transition-colors"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-terracotta/10 text-terracotta-hover">
                  <pillar.icon className="w-5 h-5" />
                </span>
                <h3 className="font-serif text-lg font-light text-foreground leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-foreground/55 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiduciary advisory — two columns */}
      <section className="w-full bg-ink-soft">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col gap-5"
            >
              <span className="text-terracotta-dark text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
                Por qué Cortex
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-light leading-[1.2] tracking-tight text-cream">
                Asesoramiento fiduciario y navegación de mercado
              </h2>
              <p className="text-cream-soft text-sm md:text-base leading-relaxed max-w-md">
                Los inversores extranjeros eligen Cortex porque convertimos la
                complejidad regulatoria y de mercado de Maldonado en un
                proceso claro, seguro y rentable.
              </p>
            </motion.div>

            <div className="lg:col-span-7 flex flex-col gap-10">
              {ADVANTAGES.map((advantage, index) => (
                <motion.div
                  key={advantage.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex items-start gap-5"
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-terracotta/15 text-terracotta-dark shrink-0">
                    <advantage.icon className="w-5 h-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-cream text-base md:text-lg font-medium">
                      {advantage.title}
                    </h3>
                    <p className="text-cream-soft/80 text-sm leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured investment projects */}
      <section className="w-full bg-background">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
          <div className="flex flex-col gap-2 mb-14">
            <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
              Casos modelo
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-foreground">
              Desarrollos destacados para inversores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROJECTS.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
                className="group flex flex-col gap-4"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 text-xs tracking-[0.2em] uppercase bg-background/85 backdrop-blur-sm text-foreground/80 px-3 py-1.5 rounded-full">
                    {project.zone}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-serif text-xl font-light text-foreground">
                      {project.title}
                    </h3>
                    <span className="text-terracotta-hover text-xs uppercase tracking-[0.15em]">
                      {project.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-foreground/10 text-sm">
                    <span className="text-foreground/50">
                      {project.assetType}
                    </span>
                    <span className="text-foreground font-medium">
                      {project.returnValue}
                    </span>
                  </div>
                  <span className="text-foreground/40 text-xs">
                    {project.returnLabel}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor CTA */}
      <section className="w-full bg-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col gap-8"
            >
              <div className="flex flex-col gap-5">
                <span className="text-terracotta-dark text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
                  Próximo paso
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-light leading-[1.2] tracking-tight text-cream">
                  Agende una sesión estratégica con nuestros socios
                </h2>
                <p className="text-cream-soft text-sm md:text-base leading-relaxed max-w-md">
                  Conversemos sobre su horizonte de inversión. Un socio de
                  Cortex diseñará una propuesta a medida de su capital y
                  objetivos.
                </p>
              </div>

              <ul className="flex flex-col gap-5">
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span className="text-cream text-sm md:text-base">
                    Av. Roosevelt, Parada 5, Punta del Este, Uruguay
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                    <Phone className="w-4 h-4" />
                  </span>
                  <a
                    href="tel:+59842000000"
                    className="text-cream text-sm md:text-base hover:text-terracotta-dark transition-colors"
                  >
                    +598 42 00 0000
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <a
                    href="mailto:inversiones@cortexrealestate.com"
                    className="text-cream text-sm md:text-base hover:text-terracotta-dark transition-colors"
                  >
                    inversiones@cortexrealestate.com
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <div className="bg-ink-soft rounded-sm p-8 md:p-10">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/20 text-terracotta-dark">
                      <Check className="w-5 h-5" />
                    </span>
                    <h3 className="font-serif text-2xl font-light text-cream">
                      Solicitud recibida
                    </h3>
                    <p className="text-cream-soft text-sm max-w-sm">
                      Un socio de Cortex se comunicará para coordinar la
                      sesión estratégica.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <InvestorField label="Nombre y Apellido" htmlFor="inv-name">
                      <input
                        id="inv-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        className={inputClass}
                      />
                    </InvestorField>

                    <InvestorField label="Correo Electrónico" htmlFor="inv-email">
                      <input
                        id="inv-email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className={inputClass}
                      />
                    </InvestorField>

                    <InvestorField label="Teléfono / WhatsApp" htmlFor="inv-phone">
                      <input
                        id="inv-phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 ..."
                        className={inputClass}
                      />
                    </InvestorField>

                    <InvestorField
                      label="Monto estimado a invertir"
                      htmlFor="inv-range"
                    >
                      <select
                        id="inv-range"
                        name="range"
                        defaultValue=""
                        required
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Seleccionar...
                        </option>
                        {INVESTMENT_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </InvestorField>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group inline-flex items-center justify-center gap-3 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-7 py-3.5 rounded-full transition-colors w-fit self-start mt-2"
                    >
                      <span>Agendar sesión</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-cream-soft/25 focus:border-terracotta-dark outline-none text-cream placeholder:text-cream-soft/40 text-sm py-2.5 transition-colors";

function InvestorField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.15em] text-cream-soft/60"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
