import type { Metadata } from "next";
import Nav from "@/components/Nav";
import InversionesView from "@/components/InversionesView";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Inversiones | Cortex",
  description:
    "Asesoramiento integral y llave en mano para inversores internacionales que buscan capitalizar oportunidades de alta rentabilidad en Punta del Este y Maldonado.",
};

export default function InversionesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="solid" />
      <InversionesView />
      <Footer />
    </div>
  );
}
