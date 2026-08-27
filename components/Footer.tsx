import Link from "next/link";

const QUICK_LINKS = [
  { label: "Residencias", href: "/propiedades/residencias" },
  { label: "Penthouses", href: "/propiedades/penthouses" },
  { label: "Lotes exclusivos", href: "/propiedades/lotes" },
  { label: "Inversiones comerciales", href: "/inversiones/comercial" },
];

const DESTINATIONS = [
  { label: "La Barra", href: "/destinos/la-barra" },
  { label: "Manantiales", href: "/destinos/manantiales" },
  { label: "José Ignacio", href: "/destinos/jose-ignacio" },
  { label: "Peninsula", href: "/destinos/peninsula" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-ink-soft px-6 md:px-12 lg:px-16 py-16 md:py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Marca */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-terracotta-dark"
            >
              <rect x="2" y="2" width="8" height="8" fill="currentColor" />
              <rect x="14" y="2" width="8" height="8" fill="currentColor" />
              <rect x="2" y="14" width="8" height="8" fill="currentColor" />
              <rect x="14" y="14" width="8" height="8" fill="currentColor" />
            </svg>
            <span className="text-cream text-lg font-light tracking-wide">
              Cortex
            </span>
          </Link>
          <p className="text-cream-soft text-sm leading-relaxed max-w-xs">
            Agencia inmobiliaria de lujo especializada en propiedades de autor
            frente al mar en Punta del Este, Uruguay.
          </p>
          <p className="text-cream-soft/60 text-xs mt-2">
            © {new Date().getFullYear()} Cortex. Todos los derechos
            reservados.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cream text-sm font-medium tracking-wide">
            Enlaces rápidos
          </h3>
          <ul className="flex flex-col gap-3">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-cream-soft text-sm hover:text-terracotta-dark transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Punta del Este */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cream text-sm font-medium tracking-wide">
            Punta del Este
          </h3>
          <ul className="flex flex-col gap-3">
            {DESTINATIONS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-cream-soft text-sm hover:text-terracotta-dark transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="flex flex-col gap-4">
          <h3 className="text-cream text-sm font-medium tracking-wide">
            Contacto
          </h3>
          <ul className="flex flex-col gap-3 text-cream-soft text-sm">
            <li>Avenida Roosevelt, Punta del Este, Uruguay</li>
            <li>
              <a
                href="mailto:contacto@cortex.com.uy"
                className="hover:text-terracotta-dark transition-colors"
              >
                contacto@cortex.com.uy
              </a>
            </li>
            <li>
              <a
                href="tel:+59842000000"
                className="hover:text-terracotta-dark transition-colors"
              >
                +598 4200 0000
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
