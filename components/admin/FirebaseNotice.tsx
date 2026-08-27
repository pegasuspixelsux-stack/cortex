import { AlertTriangle } from "lucide-react";

export default function FirebaseNotice() {
  return (
    <div className="flex items-start gap-3 border border-terracotta/30 bg-terracotta/5 rounded-sm p-5 text-sm">
      <AlertTriangle className="w-4 h-4 text-terracotta-hover mt-0.5 shrink-0" />
      <p className="text-foreground/70">
        Firebase no está configurado todavía. Completá las variables{" "}
        <code className="text-foreground/90">NEXT_PUBLIC_FIREBASE_*</code> en{" "}
        <code className="text-foreground/90">.env.local</code> (ver{" "}
        <code className="text-foreground/90">.env.example</code>) para
        habilitar el acceso, la carga de propiedades y la gestión de
        usuarios.
      </p>
    </div>
  );
}
