"use client";

import { useEffect, useState } from "react";
import ProtectedImage from "@/components/ProtectedImage";
import {
  BedDouble,
  Bath,
  Ruler,
  Plane,
  Phone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PropertyInquiryForm from "@/components/PropertyInquiryForm";
import {
  getProperty,
  galleryImages,
  priceLabel,
  operationLabel,
  type PublicProperty,
} from "@/lib/publicProperties";
import { estimateBaths } from "@/lib/admin/properties";
import { getZoneInfo } from "@/lib/zones";
import type { Zone } from "@/lib/properties";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { digits } from "@/lib/siteSettings";

export default function PropertyDetail({ id }: { id: string }) {
  const [property, setProperty] = useState<PublicProperty | null | undefined>(
    undefined,
  );
  const site = useSiteSettings();

  useEffect(() => {
    getProperty(id)
      .then((p) => setProperty(p))
      .catch(() => setProperty(null));
  }, [id]);

  if (property === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-foreground/40">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (property === null) {
    return (
      <div className="flex flex-col flex-1">
        <Nav variant="solid" />
        <main className="max-w-2xl mx-auto px-6 py-32 text-center flex flex-col gap-4">
          <h1 className="font-serif text-3xl font-light text-foreground">
            Propiedad no encontrada
          </h1>
          <p className="text-foreground/55 text-sm">
            Puede que se haya despublicado. Explorá el resto de la colección.
          </p>
          <a
            href="/propiedades"
            className="mx-auto mt-2 w-fit rounded-full border border-foreground/15 px-5 py-2 text-sm text-foreground/70 hover:border-terracotta"
          >
            Ver colección
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = galleryImages(property);
  const baths = estimateBaths(property);
  const zoneInfo = getZoneInfo(property.zone as Zone);
  const agentName = property.agentName?.trim() || site.logoText;
  const waNumber = digits(site.whatsapp);
  const telNumber = digits(site.phone);
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa la propiedad "${property.title}" (${property.zone}).`,
  );

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="solid" />

      <main className="w-full bg-background">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs tracking-[0.15em] uppercase bg-terracotta/10 text-terracotta-hover px-3 py-1.5 rounded-full">
                {property.type}
              </span>
              <span className="text-xs tracking-[0.15em] uppercase bg-foreground/5 text-foreground/60 px-3 py-1.5 rounded-full">
                {operationLabel(property)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="flex flex-col gap-2">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
                  {property.title}
                </h1>
                <p className="text-foreground/50 text-sm md:text-base">
                  {property.zone}, Punta del Este
                </p>
              </div>
              <span className="font-serif text-2xl md:text-3xl font-light text-foreground">
                {priceLabel(property)}
              </span>
            </div>
          </div>

          {/* Editorial gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:h-[560px] mb-16">
            <div className="relative w-full aspect-[4/3] lg:aspect-auto overflow-hidden rounded-sm lg:col-span-2 lg:row-span-2">
              <ProtectedImage
                src={gallery[0]}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`relative w-full overflow-hidden rounded-sm ${
                  i === 3
                    ? "aspect-[16/9] lg:aspect-auto lg:col-span-2 lg:row-span-1"
                    : "aspect-square lg:aspect-auto lg:col-span-1 lg:row-span-1"
                }`}
              >
                <ProtectedImage
                  src={gallery[i % gallery.length]}
                  alt={`${property.title} — foto ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main content — 8/4 grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left column */}
            <div className="lg:col-span-8 flex flex-col gap-16">
              {/* Description */}
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  Descripción
                </h2>
                <p className="text-foreground/65 text-base leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Specs */}
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  Características técnicas
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-foreground/10">
                  {property.sqm > 0 && (
                    <Spec
                      icon={Ruler}
                      label="Superficie"
                      value={`${property.sqm.toLocaleString("es-UY")} m²`}
                    />
                  )}
                  {property.beds > 0 && (
                    <Spec
                      icon={BedDouble}
                      label="Dormitorios"
                      value={String(property.beds)}
                    />
                  )}
                  {baths > 0 && (
                    <Spec icon={Bath} label="Baños" value={String(baths)} />
                  )}
                  {property.operation === "Alquiler" &&
                    (property.rentalTerms?.length ?? 0) > 0 && (
                      <Spec
                        icon={Ruler}
                        label="Períodos"
                        value={`${property.rentalTerms.length}`}
                      />
                    )}
                </div>

                {property.operation === "Alquiler" &&
                  (property.rentalTerms?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {property.rentalTerms.map((term) => (
                        <span
                          key={term}
                          className="text-xs text-foreground/60 border border-foreground/15 px-3 py-1.5 rounded-full"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Location context */}
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  {property.zone}: contexto y ubicación
                </h2>
                <p className="text-foreground/65 text-base leading-relaxed">
                  {zoneInfo.profile}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {[
                    {
                      km: zoneInfo.distanceLagunaDelSauceKm,
                      label:
                        "Aeropuerto Internacional de Punta del Este (Laguna del Sauce)",
                    },
                    {
                      km: zoneInfo.distanceCarrascoKm,
                      label: "Aeropuerto de Carrasco, Montevideo",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-4 p-5 border border-foreground/10 rounded-sm"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                        <Plane className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm font-medium">
                          {row.km} km
                        </span>
                        <span className="text-foreground/50 text-xs">
                          {row.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — sticky */}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-6 lg:sticky lg:top-8">
                {/* Contact card */}
                <div className="border border-foreground/10 rounded-sm p-6 flex flex-col gap-5">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium text-sm">
                      {agentName}
                    </span>
                    <span className="text-terracotta-hover text-xs uppercase tracking-[0.1em]">
                      Asesor a cargo
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={`https://wa.me/${waNumber}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-5 py-3 rounded-full transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:+${telNumber}`}
                      className="flex items-center justify-center gap-2 border border-foreground/15 hover:border-terracotta text-foreground text-sm px-5 py-3 rounded-full transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </a>
                  </div>
                </div>

                {/* Inquiry form */}
                <div className="border border-foreground/10 rounded-sm p-6">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-foreground/40 mb-5">
                    Consulta rápida
                  </h3>
                  <PropertyInquiryForm propertyTitle={property.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ruler;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Icon className="w-4 h-4 text-terracotta-hover" />
      <span className="text-foreground text-sm font-medium">{value}</span>
      <span className="text-foreground/45 text-xs">{label}</span>
    </div>
  );
}
