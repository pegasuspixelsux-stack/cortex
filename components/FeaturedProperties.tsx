"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROPERTIES, type Property } from "@/lib/properties";
import PropertyCard from "@/components/PropertyCard";

const FEATURED = PROPERTIES.filter((property) => property.featured);

const PAGE_SIZE = 8;
const TOTAL_PAGES = Math.ceil(FEATURED.length / PAGE_SIZE);

// Visual-weight rhythm per page: a featured pair (6-6) followed by
// balanced trios (4-4-4) on a 12-column grid — always sums to 12/row.
const SPANS_PAGE_1 = [6, 6, 4, 4, 4, 4, 4, 4];
const SPANS_PAGE_2 = [6, 6, 6, 6];

export default function FeaturedProperties() {
  const [page, setPage] = useState(1);

  const start = (page - 1) * PAGE_SIZE;
  const listings = FEATURED.slice(start, start + PAGE_SIZE);
  const spans = page === 1 ? SPANS_PAGE_1 : SPANS_PAGE_2;

  return (
    <section id="propiedades" className="w-full bg-background scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
        {/* Section heading */}
        <div className="flex flex-col gap-2 mb-12 md:mb-16">
          <span className="text-terracotta-hover text-xs md:text-sm tracking-[0.3em] uppercase font-medium">
            Curated Portfolio
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
            Propiedades Seleccionadas
          </h2>
        </div>

        {/* Grid */}
        <div
          key={page}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10"
        >
          {listings.map((property, index) => (
            <FeaturedCard
              key={property.id}
              property={property}
              index={index}
              lgSpan={spans[index] ?? 4}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-16 md:mt-20 pt-8 border-t border-foreground/10">
          <p className="text-sm text-foreground/50">
            Mostrando {start + 1}–{start + listings.length} de{" "}
            {FEATURED.length} propiedades
          </p>

          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  aria-current={pageNumber === page ? "page" : undefined}
                  className={`h-10 w-10 rounded-full text-sm transition-colors border ${
                    pageNumber === page
                      ? "bg-terracotta text-white border-terracotta"
                      : "border-foreground/15 text-foreground/60 hover:border-terracotta/60 hover:text-foreground"
                  }`}
                >
                  {String(pageNumber).padStart(2, "0")}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Catalog CTA */}
        <div className="flex justify-center mt-14 md:mt-16">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-3 border border-foreground/15 hover:border-terracotta text-foreground text-sm px-7 py-3.5 rounded-full transition-colors group"
            >
              <span>Explorar catálogo completo</span>
              <ArrowRight className="w-4 h-4 text-terracotta-hover transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({
  property,
  index,
  lgSpan,
}: {
  property: Property;
  index: number;
  lgSpan: number;
}) {
  // Tailwind needs literal class names (not string interpolation) to
  // pick them up at build time, so the two allowed spans are spelled out.
  const spanClass = lgSpan === 6 ? "lg:col-span-6" : "lg:col-span-4";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: "easeOut" }}
      className={spanClass}
    >
      <PropertyCard property={property} />
    </motion.div>
  );
}
