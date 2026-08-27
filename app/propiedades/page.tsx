import type { Metadata } from "next";
import Nav from "@/components/Nav";
import CatalogView from "@/components/CatalogView";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Nuestra Colección | Cortex",
  description:
    "Explorá el catálogo completo de propiedades de Cortex en Punta del Este: filtrá por zona, tipo de transacción, tipo de propiedad, precio y comodidades.",
};

export default function PropiedadesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="solid" />
      <CatalogView />
      <Footer />
    </div>
  );
}
