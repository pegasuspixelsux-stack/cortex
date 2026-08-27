import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Publicar Nueva Propiedad
        </h1>
        <p className="text-foreground/50 text-sm">
          Se guarda en Firestore y queda disponible en el listado de
          propiedades del admin.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
