"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  ArrowLeft,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const TOP_ITEMS = [
  { label: "Panel de Control", href: "/admin", icon: LayoutDashboard },
  { label: "Propiedades", href: "/admin/properties", icon: Building2 },
  { label: "Usuarios", href: "/admin/users", icon: Users },
];

function BrandMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-terracotta-dark shrink-0"
    >
      <rect x="2" y="2" width="8" height="8" fill="currentColor" />
      <rect x="14" y="2" width="8" height="8" fill="currentColor" />
      <rect x="2" y="14" width="8" height="8" fill="currentColor" />
      <rect x="14" y="14" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the drawer is open on mobile, lock body scroll and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    if (auth) await signOut(auth);
    router.push("/admin/login");
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
      active
        ? "bg-white/10 text-cream"
        : "text-cream-soft/70 hover:text-cream hover:bg-white/5"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-navy border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-cream text-sm font-light tracking-wide">
            Cortex <span className="text-cream-soft/50 font-normal">Admin</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="flex items-center justify-center w-9 h-9 -mr-1 text-cream"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Backdrop (mobile only) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — static column on md+, slide-in drawer on mobile */}
      <aside
        id="admin-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-navy min-h-screen flex flex-col justify-between px-5 py-8 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between gap-2">
            <Link href="/admin" className="flex items-center gap-2.5 px-2">
              <BrandMark />
              <span className="text-cream text-base font-light tracking-wide">
                Cortex{" "}
                <span className="text-cream-soft/50 font-normal">Admin</span>
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="md:hidden flex items-center justify-center w-8 h-8 text-cream-soft/70 hover:text-cream"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {TOP_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(isActive(item.href))}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-cream-soft/70 hover:text-cream hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>
          <Link
            href="/admin/settings"
            className={linkClass(isActive("/admin/settings"))}
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-cream-soft/70 hover:text-danger-bright hover:bg-white/5 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
