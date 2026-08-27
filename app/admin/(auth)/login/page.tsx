"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import FirebaseNotice from "@/components/admin/FirebaseNotice";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) return;
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-8 flex flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white">
          <LayoutGrid className="w-5 h-5" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-2xl font-light text-white">
            Cortex Admin
          </h1>
          <p className="text-white/60 text-sm">
            Acceso exclusivo para el equipo Cortex.
          </p>
        </div>
      </div>

      {!isFirebaseConfigured ? (
        <FirebaseNotice />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-[0.12em] text-white/50"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cortexrealestate.com"
              className="w-full bg-transparent border-b border-white/25 focus:border-terracotta-dark outline-none text-white placeholder:text-white/30 text-sm py-2.5 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-[0.12em] text-white/50"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-white/25 focus:border-terracotta-dark outline-none text-white placeholder:text-white/30 text-sm py-2.5 transition-colors"
            />
          </div>

          {error && <p className="text-terracotta-dark text-xs">{error}</p>}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white text-sm px-6 py-3 rounded-full transition-colors mt-2"
          >
            <span>{submitting ? "Ingresando..." : "Ingresar"}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </form>
      )}
    </motion.div>
  );
}
