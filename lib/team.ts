// Shared team roster used by the "Nosotros" page and the agent card on
// property detail pages.

export interface TeamMember {
  name: string;
  /** Role shown on the Nosotros page (e.g. "Socio Director"). */
  role: string;
  /** Title shown on the property-detail agent card (e.g. "Senior Partner"). */
  title: string;
  bio: string;
  email: string;
  phone: string;
  image: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Martín Ferreira",
    role: "Socio Director",
    title: "Senior Partner",
    bio: "Más de 15 años estructurando operaciones inmobiliarias de alto valor en la costa uruguaya.",
    email: "martin@cortexrealestate.com",
    phone: "+598 99 111 222",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Sofía Bianchi",
    role: "Directora de Ventas",
    title: "Senior Partner",
    bio: "Especialista en propiedades frente al mar y relación directa con inversores internacionales.",
    email: "sofia@cortexrealestate.com",
    phone: "+598 99 222 333",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Ignacio Larrañaga",
    role: "Director de Inversiones",
    title: "Senior Partner",
    bio: "Análisis financiero y estructuración de oportunidades para carteras patrimoniales.",
    email: "ignacio@cortexrealestate.com",
    phone: "+598 99 333 444",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Lucas Méndez",
    role: "Asesor de Arquitectura",
    title: "Senior Partner",
    bio: "Curaduría de proyectos de autor y acompañamiento técnico en cada operación.",
    email: "lucas@cortexrealestate.com",
    phone: "+598 99 444 555",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&auto=format&fit=crop",
  },
];

/** Deterministically assigns an agent to a property id. */
export function getAgentForProperty(propertyId: number): TeamMember {
  return TEAM[propertyId % TEAM.length];
}
