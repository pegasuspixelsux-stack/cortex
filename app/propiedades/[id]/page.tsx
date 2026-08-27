import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Bath,
  Ruler,
  LandPlot,
  Plane,
  Phone,
  MessageCircle,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PropertyInquiryForm from "@/components/PropertyInquiryForm";
import {
  PROPERTIES,
  getPropertyById,
  getPropertyGallery,
  getPropertySpecs,
  getPropertyBaths,
  formatPrice,
  displayZone,
} from "@/lib/properties";
import { getZoneInfo } from "@/lib/zones";
import { getAgentForProperty } from "@/lib/team";

export function generateStaticParams() {
  return PROPERTIES.map((property) => ({ id: String(property.id) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/propiedades/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = getPropertyById(Number(id));
  if (!property) return { title: "Propiedad | Cortex" };
  return {
    title: `${property.title} | Cortex`,
    description: `${property.title} en ${displayZone(property)} — ${formatPrice(property)}.`,
  };
}

const EXTRA_FEATURES = ["Calefacción central", "Estacionamiento privado"];

export default async function PropertyDetailPage({
  params,
}: PageProps<"/propiedades/[id]">) {
  const { id } = await params;
  const property = getPropertyById(Number(id));
  if (!property) notFound();

  const gallery = getPropertyGallery(property);
  const { coveredSqm, lotSqm } = getPropertySpecs(property);
  const baths = getPropertyBaths(property);
  const zoneInfo = getZoneInfo(property.zone);
  const agent = getAgentForProperty(property.id);
  const features = [...property.amenities, ...EXTRA_FEATURES];

  const whatsappMessage = encodeURIComponent(
    `Hola ${agent.name.split(" ")[0]}, me interesa la propiedad "${property.title}" (${displayZone(property)}).`,
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
                {property.transactionType}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="flex flex-col gap-2">
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
                  {property.title}
                </h1>
                <p className="text-foreground/50 text-sm md:text-base">
                  {displayZone(property)}, Punta del Este
                </p>
              </div>
              <span className="font-serif text-2xl md:text-3xl font-light text-foreground">
                {formatPrice(property)}
              </span>
            </div>
          </div>

          {/* Editorial gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:h-[560px] mb-16">
            <div className="relative w-full aspect-[4/3] lg:aspect-auto overflow-hidden rounded-sm lg:col-span-2 lg:row-span-2">
              <Image
                src={gallery[0]}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-square lg:aspect-auto overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image
                src={gallery[1]}
                alt={`${property.title} — interior`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-square lg:aspect-auto overflow-hidden rounded-sm lg:col-span-1 lg:row-span-1">
              <Image
                src={gallery[2]}
                alt={`${property.title} — exterior`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-[16/9] lg:aspect-auto overflow-hidden rounded-sm lg:col-span-2 lg:row-span-1">
              <Image
                src={gallery[3]}
                alt={`${property.title} — vista al mar`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
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
                <p className="text-foreground/65 text-base leading-relaxed">
                  {property.title} es una expresión de arquitectura
                  contemporánea en {displayZone(property)}, pensada para
                  quienes buscan un refugio de autor sin resignar cercanía al
                  mar. Los volúmenes limpios, la luz natural y la relación
                  directa con el paisaje definen un estilo de vida sereno,
                  discreto y profundamente conectado con la costa atlántica.
                  Cada ambiente fue proyectado para una convivencia fluida
                  entre interior y exterior, con materiales nobles y
                  terminaciones de alta gama en toda su superficie.
                </p>
              </div>

              {/* Specs */}
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-2xl font-light text-foreground">
                  Características técnicas
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-foreground/10">
                  {coveredSqm && (
                    <Spec icon={Ruler} label="m² cubiertos" value={`${coveredSqm} m²`} />
                  )}
                  <Spec icon={LandPlot} label="m² de terreno" value={`${lotSqm} m²`} />
                  {property.beds > 0 && (
                    <Spec icon={BedDouble} label="Dormitorios" value={String(property.beds)} />
                  )}
                  {baths > 0 && (
                    <Spec icon={Bath} label="Baños" value={String(baths)} />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs text-foreground/60 border border-foreground/15 px-3 py-1.5 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
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
                  <div className="flex items-center gap-4 p-5 border border-foreground/10 rounded-sm">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                      <Plane className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">
                        {zoneInfo.distanceLagunaDelSauceKm} km
                      </span>
                      <span className="text-foreground/50 text-xs">
                        Aeropuerto Internacional de Punta del Este (Laguna del
                        Sauce)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 border border-foreground/10 rounded-sm">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-terracotta/10 text-terracotta-hover shrink-0">
                      <Plane className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">
                        {zoneInfo.distanceCarrascoKm} km
                      </span>
                      <span className="text-foreground/50 text-xs">
                        Aeropuerto de Carrasco, Montevideo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — sticky */}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-6 lg:sticky lg:top-8">
                {/* Agent card */}
                <div className="border border-foreground/10 rounded-sm p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={agent.image}
                        alt={agent.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium text-sm">
                        {agent.name}
                      </span>
                      <span className="text-terracotta-hover text-xs uppercase tracking-[0.1em]">
                        {agent.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-5 py-3 rounded-full transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${agent.phone.replace(/\s/g, "")}`}
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
