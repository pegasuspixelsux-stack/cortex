"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";

const inputClass =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";

export default function PropertyInquiryForm({
  propertyTitle,
}: {
  propertyTitle: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 text-terracotta-hover">
          <Check className="w-4 h-4" />
        </span>
        <p className="text-foreground text-sm font-medium">
          Consulta enviada
        </p>
        <p className="text-foreground/50 text-xs max-w-[220px]">
          El agente a cargo de {propertyTitle} se pondrá en contacto a la
          brevedad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pi-name"
          className="text-xs uppercase tracking-[0.12em] text-foreground/40"
        >
          Nombre
        </label>
        <input
          id="pi-name"
          name="name"
          type="text"
          required
          placeholder="Tu nombre"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pi-email"
          className="text-xs uppercase tracking-[0.12em] text-foreground/40"
        >
          Email
        </label>
        <input
          id="pi-email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pi-phone"
          className="text-xs uppercase tracking-[0.12em] text-foreground/40"
        >
          Teléfono
        </label>
        <input
          id="pi-phone"
          name="phone"
          type="tel"
          placeholder="+598 ..."
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pi-message"
          className="text-xs uppercase tracking-[0.12em] text-foreground/40"
        >
          Mensaje
        </label>
        <textarea
          id="pi-message"
          name="message"
          rows={3}
          defaultValue={`Me interesa recibir más información sobre ${propertyTitle}.`}
          className={`${inputClass} resize-none`}
        />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-6 py-3 rounded-full transition-colors mt-1"
      >
        <span>Enviar consulta</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.button>
    </form>
  );
}
