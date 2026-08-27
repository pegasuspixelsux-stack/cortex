import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import AgenteConcierge from "@/components/AgenteConcierge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Cortex | Real Estate Punta del Este",
  description:
    "Cortex conecta exclusividad, arquitectura de autor y oportunidades únicas frente al mar en los destinos más codiciados de Uruguay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <AgenteConcierge />
      </body>
    </html>
  );
}
