import type { Metadata } from "next";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata: Metadata = {
  title: "Propiedad | Cortex",
  description:
    "Propiedad de autor en la costa atlántica de Punta del Este, gestionada por Cortex.",
};

export default async function PropertyDetailPage({
  params,
}: PageProps<"/propiedades/[id]">) {
  const { id } = await params;
  return <PropertyDetail id={id} />;
}
