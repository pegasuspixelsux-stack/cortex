"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Propiedades", href: "/propiedades" },
  { label: "Desarrollos", href: "/desarrollos" },
  { label: "Inversiones", href: "/inversiones" },
  { label: "Nosotros", href: "/nosotros" },
];

const LANGUAGE_OPTIONS = ["ES", "EN"];

/**
 * `variant="overlay"` sits transparently on top of a photo/hero (white
 * type, no border). `variant="solid"` is for interior pages — a plain
 * header with the brand background and a hairline border.
 */
export default function Nav({
  variant = "solid",
}: {
  variant?: "overlay" | "solid";
}) {
  const isOverlay = variant === "overlay";
  const textColor = isOverlay ? "text-white" : "text-foreground";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`w-full px-6 md:px-12 lg:px-16 py-6 ${
        isOverlay
          ? "relative z-10"
          : "relative bg-background border-b border-foreground/10"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isOverlay ? "text-white" : "text-terracotta"}
          >
            <rect x="2" y="2" width="8" height="8" fill="currentColor" />
            <rect x="14" y="2" width="8" height="8" fill="currentColor" />
            <rect x="2" y="14" width="8" height="8" fill="currentColor" />
            <rect x="14" y="14" width="8" height="8" fill="currentColor" />
          </svg>
          <span className={`text-lg font-light tracking-wide ${textColor}`}>
            Cortex
          </span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                isOverlay
                  ? "text-white/90 text-sm hover:text-white transition-colors"
                  : "text-foreground/70 text-sm hover:text-foreground transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side - Language & Contact */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang}
                className={`text-sm transition-colors ${
                  isOverlay
                    ? lang === "ES"
                      ? "text-white font-medium"
                      : "text-white/60 hover:text-white"
                    : lang === "ES"
                      ? "text-foreground font-medium"
                      : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <Link
            href="/contacto"
            className={
              isOverlay
                ? "text-white text-sm px-5 py-2 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                : "text-foreground text-sm px-5 py-2 rounded-full border border-foreground/15 hover:border-terracotta hover:text-terracotta-hover transition-colors"
            }
          >
            Contacto
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
