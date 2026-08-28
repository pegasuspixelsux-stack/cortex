"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { digits } from "@/lib/siteSettings";

const INTERESTS = ["Comprar", "Vender", "Inversión", "Alquiler de Temporada"];

export default function ContactSection() {
  const { phone, whatsapp, email, address } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);

  const contactDetails = [
    { icon: MapPin, label: "Oficina Principal", value: address },
    {
      icon: Phone,
      label: "Teléfono",
      value: phone,
      href: `tel:+${digits(phone)}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp de Atención Directa",
      value: whatsapp,
      href: `https://wa.me/${digits(whatsapp)}`,
    },
    {
      icon: Mail,
      label: "Correo Electrónico",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: Clock,
      label: "Horarios",
      value: "Lunes a Viernes de 9:00 a 19:00 hs / Sábados con cita previa",
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No backend wired yet — this only gives local UI feedback.
    setSubmitted(true);
  }

  return (
    <section id="contacto" className="w-full bg-background scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            <div className="flex flex-col gap-5">
              <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
                Contacto
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-[1.15] tracking-tight text-foreground">
                ¿Listo para encontrar tu próximo espacio o iniciar el
                proceso? Comencemos hoy.
              </h2>
              <p className="text-foreground/60 text-sm md:text-base leading-relaxed max-w-md">
                Conversemos de forma directa y personalizada. Nuestro equipo
                responde cada consulta con la discreción y el criterio que
                una decisión de esta naturaleza merece.
              </p>
            </div>

            <ul className="flex flex-col gap-6">
              {contactDetails.map((detail) => (
                <li key={detail.label} className="flex items-start gap-4">
                  <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                    <detail.icon className="w-4 h-4" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-[0.15em] text-foreground/40">
                      {detail.label}
                    </span>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="text-foreground text-sm md:text-base hover:text-terracotta-hover transition-colors"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <span className="text-foreground text-sm md:text-base">
                        {detail.value}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right column — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="bg-ink rounded-sm p-8 md:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-terracotta/20 text-terracotta-dark">
                    <Check className="w-5 h-5" />
                  </span>
                  <h3 className="font-serif text-2xl font-light text-cream">
                    Mensaje recibido
                  </h3>
                  <p className="text-cream-soft text-sm max-w-sm">
                    Gracias por escribirnos. Un asesor de Cortex se pondrá en
                    contacto a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <Field label="Nombre y Apellido" htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Correo Electrónico" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Teléfono / WhatsApp" htmlFor="phone">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+598 ..."
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Interés principal" htmlFor="interest">
                    <select
                      id="interest"
                      name="interest"
                      defaultValue=""
                      required
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Seleccionar...
                      </option>
                      {INTERESTS.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Mensaje o consulta" htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Contanos qué estás buscando..."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center justify-center gap-3 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-7 py-3.5 rounded-full transition-colors w-fit self-start mt-2"
                  >
                    <span>Enviar consulta</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-cream-soft/25 focus:border-terracotta-dark outline-none text-cream placeholder:text-cream-soft/40 text-sm py-2.5 transition-colors";

function Field({
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
