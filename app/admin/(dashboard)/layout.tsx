"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import FirebaseNotice from "@/components/admin/FirebaseNotice";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAdminAuth();

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
        <main className="flex-1 p-8 md:p-12">
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

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 md:p-12">{children}</main>
    </div>
  );
}
