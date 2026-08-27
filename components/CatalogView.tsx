"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import {
  PROPERTIES,
  ZONES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  AMENITIES,
  type Zone,
  type PropertyType,
  type TransactionType,
} from "@/lib/properties";
import PropertyCard from "@/components/PropertyCard";

const PAGE_SIZE = 9;

export default function CatalogView() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  const filtered = useMemo(() => {
    return PROPERTIES.filter((property) => {
      if (zones.length && !zones.includes(property.zone)) return false;
      if (types.length && !types.includes(property.type)) return false;
      if (
        transactions.length &&
        !transactions.includes(property.transactionType)
      )
        return false;
      if (
        amenities.length &&
        !amenities.every((a) => property.amenities.includes(a))
      )
        return false;
      if (min !== undefined && property.price < min) return false;
      if (max !== undefined && property.price > max) return false;
      return true;
    });
  }, [zones, types, transactions, amenities, min, max]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const results = filtered.slice(start, start + PAGE_SIZE);

  function toggle<T>(list: T[], value: T, setList: (v: T[]) => void) {
    setPage(1);
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function clearFilters() {
    setZones([]);
    setTypes([]);
    setTransactions([]);
    setAmenities([]);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  const hasFilters =
    zones.length > 0 ||
    types.length > 0 ||
    transactions.length > 0 ||
    amenities.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
          Nuestra Colección
        </h1>
        <p className="text-foreground/50 text-sm md:text-base">
          {filtered.length}{" "}
          {filtered.length === 1
            ? "propiedad encontrada"
            : "propiedades encontradas"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Filters */}
        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-10 lg:sticky lg:top-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.2em] text-foreground/40 font-medium">
                Filtros
              </h2>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs text-terracotta-hover hover:text-terracotta transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpiar
                </button>
              )}
            </div>

            <FilterGroup title="Zona / Ubicación">
              {ZONES.map((zone) => (
                <Checkbox
                  key={zone}
                  label={zone}
                  checked={zones.includes(zone)}
                  onChange={() => toggle(zones, zone, setZones)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Tipo de transacción">
              {TRANSACTION_TYPES.map((transaction) => (
                <Checkbox
                  key={transaction}
                  label={transaction}
                  checked={transactions.includes(transaction)}
                  onChange={() =>
                    toggle(transactions, transaction, setTransactions)
                  }
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Tipo de propiedad">
              {PROPERTY_TYPES.map((type) => (
                <Checkbox
                  key={type}
                  label={type}
                  checked={types.includes(type)}
                  onChange={() => toggle(types, type, setTypes)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Rango de precio (USD)">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Mínimo"
                  value={minPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMinPrice(e.target.value);
                  }}
                  className="w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2 transition-colors"
                />
                <span className="text-foreground/30 text-sm">–</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Máximo"
                  value={maxPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMaxPrice(e.target.value);
                  }}
                  className="w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2 transition-colors"
                />
              </div>
            </FilterGroup>

            <FilterGroup title="Comodidades">
              {AMENITIES.map((amenity) => (
                <Checkbox
                  key={amenity}
                  label={amenity}
                  checked={amenities.includes(amenity)}
                  onChange={() => toggle(amenities, amenity, setAmenities)}
                />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-8">
          {results.length > 0 ? (
            <div
              key={`${currentPage}-${filtered.length}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
            >
              {results.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 9) * 0.06,
                    ease: "easeOut",
                  }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm">
              Ninguna propiedad coincide con estos filtros.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-foreground/10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    className={`h-10 w-10 rounded-full text-sm transition-colors border ${
                      pageNumber === currentPage
                        ? "bg-terracotta text-white border-terracotta"
                        : "border-foreground/15 text-foreground/60 hover:border-terracotta/60 hover:text-foreground"
                    }`}
                  >
                    {String(pageNumber).padStart(2, "0")}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pb-8 border-b border-foreground/10 last:border-b-0 last:pb-0">
      <h3 className="text-xs uppercase tracking-[0.15em] text-foreground/40 font-medium">
        {title}
      </h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-sm border transition-colors ${
          checked
            ? "bg-terracotta border-terracotta"
            : "border-foreground/25 group-hover:border-terracotta/60"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors">
        {label}
      </span>
    </label>
  );
}
