"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Building2,
  Users,
  ArrowLeft,
  Settings,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebase";

const TOP_ITEMS = [
  { label: "Panel de Control", href: "/admin", icon: LayoutDashboard },
  { label: "Propiedades", href: "/admin/properties", icon: Building2 },
  { label: "Usuarios", href: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (auth) await signOut(auth);
    router.push("/admin/login");
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <aside className="w-64 shrink-0 bg-navy min-h-screen flex flex-col justify-between px-5 py-8">
      <div className="flex flex-col gap-10">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-terracotta-dark"
          >
            <rect x="2" y="2" width="8" height="8" fill="currentColor" />
            <rect x="14" y="2" width="8" height="8" fill="currentColor" />
            <rect x="2" y="14" width="8" height="8" fill="currentColor" />
            <rect x="14" y="14" width="8" height="8" fill="currentColor" />
          </svg>
          <span className="text-cream text-base font-light tracking-wide">
            Cortex <span className="text-cream-soft/50 font-normal">Admin</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {TOP_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-white/10 text-cream"
                  : "text-cream-soft/70 hover:text-cream hover:bg-white/5"
              }`}
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
          className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
            isActive("/admin/settings")
              ? "bg-white/10 text-cream"
              : "text-cream-soft/70 hover:text-cream hover:bg-white/5"
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-cream-soft/70 hover:text-terracotta-dark hover:bg-white/5 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
