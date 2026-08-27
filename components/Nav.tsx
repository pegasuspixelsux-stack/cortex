"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import SiteLogo from "@/components/SiteLogo";

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
  const [open, setOpen] = useState(false);
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
        <Link href="/">
          <SiteLogo variant={isOverlay ? "overlay" : "solid"} />
        </Link>

        {/* Center Navigation (desktop) */}
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

        {/* Right Side - Language & Contact (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
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

        {/* Hamburger toggle (mobile) */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className={`md:hidden flex items-center justify-center w-9 h-9 -mr-2 ${textColor}`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <div
              className={`mt-6 pt-6 flex flex-col gap-5 border-t ${
                isOverlay ? "border-white/15" : "border-foreground/10"
              }`}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    isOverlay
                      ? "text-white/90 text-base hover:text-white transition-colors"
                      : "text-foreground/80 text-base hover:text-foreground transition-colors"
                  }
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex items-center gap-3 pt-1">
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
                onClick={() => setOpen(false)}
                className={
                  isOverlay
                    ? "w-full text-center text-white text-sm px-5 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
                    : "w-full text-center text-foreground text-sm px-5 py-3 rounded-full border border-foreground/15 hover:border-terracotta hover:text-terracotta-hover transition-colors"
                }
              >
                Contacto
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
