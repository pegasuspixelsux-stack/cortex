import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import About from "@/components/About";
import AreasSection from "@/components/AreasSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Hero />
      <FeaturedProperties />
      <About />
      <AreasSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
