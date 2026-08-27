"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import {
  listUsers,
  createUser,
  updateUserRole,
  deleteUserProfile,
  ROLE_LABELS,
  type AdminUser,
  type UserRole,
} from "@/lib/admin/users";

const inputClass =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
    try {
      await updateUserRole(uid, role);
    } catch {
      setError("No se pudo actualizar el rol.");
      load();
    }
  }

  async function handleDelete(uid: string) {
    try {
      await deleteUserProfile(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch {
      setError("No se pudo eliminar el perfil.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
            Usuarios
          </h1>
          <p className="text-foreground/50 text-sm">
            Gestión de accesos y privilegios del equipo Cortex.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm px-5 py-2.5 rounded-full transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      {error && <p className="text-terracotta-dark text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-foreground/40 text-sm py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm text-sm">
          Todavía no hay usuarios cargados.
        </div>
      ) : (
        <div className="overflow-x-auto border border-foreground/10 rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 text-left text-foreground/40 text-xs uppercase tracking-[0.1em]">
                <th className="px-5 py-3.5 font-medium">Nombre</th>
                <th className="px-5 py-3.5 font-medium">Correo</th>
                <th className="px-5 py-3.5 font-medium">Rol</th>
                <th className="px-5 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.uid}
                  className="border-b border-foreground/5 last:border-b-0 hover:bg-foreground/[0.02]"
                >
                  <td className="px-5 py-4 text-foreground">{user.name}</td>
                  <td className="px-5 py-4 text-foreground/60">{user.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.uid, e.target.value as UserRole)
                      }
                      className="bg-transparent text-foreground/80 text-sm border border-foreground/15 rounded-full px-3 py-1.5 outline-none focus:border-terracotta transition-colors"
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(user.uid)}
                        className="text-foreground/50 hover:text-terracotta-dark transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <AddUserModal
            onClose={() => setModalOpen(false)}
            onCreated={() => {
              setModalOpen(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createUser({ name, email, tempPassword, role });
      onCreated();
    } catch {
      setError("No se pudo crear el usuario. Verificá el email y la contraseña (mínimo 6 caracteres).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-background rounded-sm p-8 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-light text-foreground">
            Agregar Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Nombre
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Contraseña temporal
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputClass}
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-terracotta-dark text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white text-sm px-6 py-3 rounded-full transition-colors mt-1"
          >
            {submitting ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
