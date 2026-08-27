"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { getProperty, type AdminProperty } from "@/lib/admin/properties";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProperty(params.id)
      .then((result) => {
        if (result) setProperty(result);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-foreground/40 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando propiedad...
      </div>
    );
  }

  if (notFound || !property) {
    return <p className="text-foreground/50 text-sm">Propiedad no encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Editar Propiedad
        </h1>
        <p className="text-foreground/50 text-sm">{property.title}</p>
      </div>
      <PropertyForm propertyId={property.id} initialValues={property} />
    </div>
  );
}
