"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MessageSquare, Eye, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  listProperties,
  deleteProperty,
  type AdminProperty,
} from "@/lib/admin/properties";
import { listLeads } from "@/lib/admin/leads";

const priceFormatter = new Intl.NumberFormat("es-UY", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function AdminDashboardPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [newLeads, setNewLeads] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setProperties(await listProperties());
    } finally {
      setLoading(false);
    }
    try {
      const leads = await listLeads();
      setNewLeads(leads.filter((l) => l.status === "nuevo").length);
    } catch {
      setNewLeads(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const latest = properties.slice(0, 5);

  const kpis: Array<{
    label: string;
    value: string;
    icon: typeof Building2;
    live: boolean;
    href?: string;
  }> = [
    {
      label: "Propiedades publicadas",
      value: loading ? "..." : String(properties.length),
      icon: Building2,
      live: true,
    },
    {
      label: "Leads sin contactar",
      value: newLeads === null ? "--" : String(newLeads),
      icon: MessageSquare,
      live: newLeads !== null,
      href: "/admin/leads",
    },
    { label: "Visitas al portal (mes)", value: "--", icon: Eye, live: false },
    { label: "Propiedades destacadas", value: "--", icon: Star, live: false },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Panel de Control
        </h1>
        <p className="text-foreground/50 text-sm">Resumen general de Cortex.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const inner = (
            <>
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-terracotta/10 text-terracotta-hover">
                <kpi.icon className="w-4 h-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className={`font-serif text-3xl font-light ${
                    kpi.live ? "text-foreground" : "text-foreground/30"
                  }`}
                >
                  {kpi.value}
                </span>
                <span className="text-foreground/45 text-xs">{kpi.label}</span>
              </div>
            </>
          );
          const cardClass =
            "flex flex-col gap-4 p-6 border border-foreground/10 rounded-sm transition-colors";
          return kpi.href ? (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`${cardClass} hover:border-terracotta/40`}
            >
              {inner}
            </Link>
          ) : (
            <div key={kpi.label} className={cardClass}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* Latest properties */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-light text-foreground">
            Últimas Propiedades Publicadas
          </h2>
          <Link
            href="/admin/properties"
            className="text-xs text-terracotta-hover hover:text-terracotta transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-foreground/40 text-sm py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando...
          </div>
        ) : latest.length === 0 ? (
          <div className="py-16 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm text-sm">
            Todavía no hay propiedades cargadas.{" "}
            <Link href="/admin/properties/new" className="text-terracotta-hover">
              Publicar la primera
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto border border-foreground/10 rounded-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-left text-foreground/40 text-xs uppercase tracking-[0.1em]">
                  <th className="px-5 py-3.5 font-medium">Título</th>
                  <th className="px-5 py-3.5 font-medium">Zona</th>
                  <th className="px-5 py-3.5 font-medium">Precio</th>
                  <th className="px-5 py-3.5 font-medium">Fecha</th>
                  <th className="px-5 py-3.5 font-medium">Estado</th>
                  <th className="px-5 py-3.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-foreground/5 last:border-b-0 hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4 text-foreground">{property.title}</td>
                    <td className="px-5 py-4 text-foreground/60">{property.zone}</td>
                    <td className="px-5 py-4 text-foreground/60">
                      USD {priceFormatter.format(property.price)}
                    </td>
                    <td className="px-5 py-4 text-foreground/60">
                      {property.createdAt
                        ? dateFormatter.format(property.createdAt.toDate())
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          property.status === "Publicada"
                            ? "bg-terracotta/10 text-terracotta-hover"
                            : "bg-foreground/5 text-foreground/50"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="text-foreground/50 hover:text-terracotta-hover transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deletingId === property.id}
                          className="text-foreground/50 hover:text-danger transition-colors disabled:opacity-40"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
