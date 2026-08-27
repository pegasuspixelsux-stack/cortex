export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Configuración
        </h1>
        <p className="text-foreground/50 text-sm">
          Preferencias del panel de administración.
        </p>
      </div>

      <div className="py-16 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm text-sm max-w-2xl">
        En desarrollo — próximamente: datos de la agencia, notificaciones y
        preferencias de la cuenta.
      </div>
    </div>
  );
}
