"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import {
  listProperties,
  deleteProperty,
  type AdminProperty,
  type AdminPropertyStatus,
} from "@/lib/admin/properties";

const STATUS_FILTERS: Array<AdminPropertyStatus | "Todas"> = [
  "Todas",
  "Publicada",
  "Borrador",
];

const priceFormatter = new Intl.NumberFormat("es-UY", {
  maximumFractionDigits: 0,
});

/**
 * Whole days since the property was first created in Firestore. Internal
 * metric for the team — not surfaced on the public site. Returns null while
 * the serverTimestamp is still resolving.
 */
function daysOnMarket(createdAt: AdminProperty["createdAt"]): number | null {
  if (!createdAt) return null;
  return Math.max(0, Math.floor((Date.now() - createdAt.toMillis()) / 86_400_000));
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("Todas");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setProperties(await listProperties());
    } catch {
      setError("No se pudieron cargar las propiedades.");
    } finally {
      setLoading(false);
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
    } catch {
      setError("No se pudo eliminar la propiedad.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter !== "Todas" && p.status !== statusFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [properties, search, statusFilter]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
            Propiedades
          </h1>
          <p className="text-foreground/50 text-sm">
            {properties.length} propiedades en Firestore
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-5 py-2.5 rounded-full transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Nueva Propiedad
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 border-b border-foreground/15 focus-within:border-terracotta transition-colors py-2 sm:max-w-xs w-full">
          <Search className="w-4 h-4 text-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/30"
          />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3.5 py-2 rounded-full border transition-colors ${
                statusFilter === status
                  ? "bg-terracotta text-white border-terracotta"
                  : "border-foreground/15 text-foreground/60 hover:border-terracotta/60"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-terracotta-dark text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-foreground/40 text-sm py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando propiedades...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm text-sm">
          No hay propiedades que coincidan.
        </div>
      ) : (
        <div className="overflow-x-auto border border-foreground/10 rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 text-left text-foreground/40 text-xs uppercase tracking-[0.1em]">
                <th className="px-5 py-3.5 font-medium">Título</th>
                <th className="px-5 py-3.5 font-medium">Zona</th>
                <th className="px-5 py-3.5 font-medium">Precio</th>
                <th className="px-5 py-3.5 font-medium">Estado</th>
                <th
                  className="px-5 py-3.5 font-medium"
                  title="Días desde el alta en Firestore — uso interno"
                >
                  Días en mercado
                </th>
                <th className="px-5 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((property) => (
                <tr
                  key={property.id}
                  className="border-b border-foreground/5 last:border-b-0 hover:bg-foreground/[0.02]"
                >
                  <td className="px-5 py-4 text-foreground">{property.title}</td>
                  <td className="px-5 py-4 text-foreground/60">{property.zone}</td>
                  <td className="px-5 py-4 text-foreground/60">
                    USD {priceFormatter.format(property.price)}
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
                    {(() => {
                      const days = daysOnMarket(property.createdAt);
                      if (days === null)
                        return <span className="text-foreground/30">—</span>;
                      return (
                        <span
                          className={
                            days > 90
                              ? "text-terracotta-dark"
                              : "text-foreground/60"
                          }
                        >
                          {days} {days === 1 ? "día" : "días"}
                        </span>
                      );
                    })()}
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
                        className="text-foreground/50 hover:text-terracotta-dark transition-colors disabled:opacity-40"
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
  );
}
