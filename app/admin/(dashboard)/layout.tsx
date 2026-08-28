"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useAdminRole } from "@/lib/admin/useAdminRole";
import AdminSidebar from "@/components/admin/AdminSidebar";
import FirebaseNotice from "@/components/admin/FirebaseNotice";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, role, loading } = useAdminRole();

  useEffect(() => {
    if (isFirebaseConfigured && !loading && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  // Firebase isn't set up yet — let the dashboard render with a notice
  // instead of redirecting into a login page that can't authenticate
  // anyone either.
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-5 pt-20 pb-12 md:p-12">
          <FirebaseNotice />
        </main>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground/40">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  // Signed in, but no role profile — not an invited member. Don't leak
  // any of the dashboard; offer a way out.
  if (!role) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-8 w-8 text-danger" />
          <h1 className="font-serif text-xl font-light text-foreground">
            Sin acceso
          </h1>
          <p className="text-sm text-foreground/55">
            Tu cuenta no tiene un rol asignado en Cortex. Pedile a un
            administrador o manager que te invite al equipo.
          </p>
          <button
            onClick={async () => {
              if (auth) await signOut(auth);
              router.replace("/admin/login");
            }}
            className="mt-1 rounded-full border border-foreground/15 px-5 py-2 text-sm text-foreground/70 transition-colors hover:border-terracotta"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0 px-5 pt-20 pb-12 md:p-12">{children}</main>
    </div>
  );
}
