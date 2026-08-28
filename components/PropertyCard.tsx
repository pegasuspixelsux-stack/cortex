import Image from "next/image";
import { ArrowUpRight, BedDouble, Ruler } from "lucide-react";
import {
  coverImage,
  priceLabel,
  operationLabel,
  type PublicProperty,
} from "@/lib/publicProperties";

export default function PropertyCard({ property }: { property: PublicProperty }) {
  return (
    <a href={`/propiedades/${property.id}`} className="block group">
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm border border-foreground/10">
        <Image
          src={coverImage(property)}
          alt={`${property.title}, ${property.zone}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 text-xs tracking-[0.2em] uppercase bg-background/85 backdrop-blur-sm text-foreground/80 px-3 py-1.5 rounded-full">
          {property.zone}
        </span>
        <span className="absolute top-4 right-4 text-xs tracking-[0.15em] uppercase bg-ink/70 backdrop-blur-sm text-cream px-3 py-1.5 rounded-full">
          {property.type}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 mt-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-xl md:text-2xl font-light text-foreground">
            {property.title}
          </h3>
          <div className="flex items-center gap-4 text-foreground/50 text-xs">
            {property.beds > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5" />
                {property.beds} hab.
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              {property.sqm} m²
            </span>
            <span className="uppercase tracking-[0.12em]">
              {operationLabel(property)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm md:text-base text-foreground font-medium tracking-tight">
            {priceLabel(property)}
          </span>
          <ArrowUpRight className="w-4 h-4 text-terracotta-hover transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </a>
  );
}
