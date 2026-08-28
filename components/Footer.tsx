"use client";

import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import {
  Camera,
  Briefcase,
  Video,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { ZONES } from "@/lib/zones";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { digits } from "@/lib/siteSettings";

const QUICK_LINKS = [
  { label: "Propiedades", href: "/#propiedades" },
  { label: "Colección", href: "/propiedades" },
  { label: "Inversiones", href: "/inversiones" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/#contacto" },
];

const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/privacy" },
  { label: "Términos de Uso", href: "/terms" },
  { label: "Política de Cookies", href: "/cookies" },
];

export default function Footer() {
  const { phone, whatsapp, address, email } = useSiteSettings();
  const socials = [
    { label: "Instagram", href: "https://instagram.com", icon: Camera },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Briefcase },
    { label: "YouTube", href: "https://youtube.com", icon: Video },
    {
      label: "WhatsApp",
      href: `https://wa.me/${digits(whatsapp)}`,
      icon: MessageCircle,
    },
  ];
  return (
    <footer className="w-full bg-navy">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-20 pb-12">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Marca */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="w-fit">
              <SiteLogo variant="footer" />
            </Link>
            <p className="text-cream-soft text-sm leading-relaxed max-w-xs">
              Agencia inmobiliaria de lujo especializada en propiedades de
              autor frente al mar en Punta del Este, Uruguay.
            </p>
            <p className="text-cream-soft/60 text-xs">{address}</p>
          </div>

          {/* Enlaces rápidos */}
          <div className="flex flex-col gap-4">
            <h3 className="text-cream text-sm font-medium tracking-wide">
              Enlaces rápidos
            </h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-cream-soft text-sm hover:text-terracotta-dark transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Zonas de influencia */}
          <div className="flex flex-col gap-4">
            <h3 className="text-cream text-sm font-medium tracking-wide">
              Zonas de Influencia
            </h3>
            <ul className="flex flex-col gap-3">
              {ZONES.map((zone) => (
                <li key={zone.name}>
                  <Link
                    href="/#zonas"
                    className="text-cream-soft text-sm hover:text-terracotta-dark transition-colors"
                  >
                    {zone.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-4">
            <h3 className="text-cream text-sm font-medium tracking-wide">
              Contacto
            </h3>
            <ul className="flex flex-col gap-3 text-cream-soft text-sm">
              <li>{address}</li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-terracotta-dark transition-colors"
                >
                  {email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${digits(phone)}`}
                  className="hover:text-terracotta-dark transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${digits(whatsapp)}`}
                  className="hover:text-terracotta-dark transition-colors"
                >
                  {whatsapp} (WhatsApp)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-12" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <span>© 2026 Cortex Real Estate. Todos los derechos reservados.</span>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="hover:text-white transition-colors"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
            <span className="w-px h-4 bg-white/15" />
            <Link
              href="/admin"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
