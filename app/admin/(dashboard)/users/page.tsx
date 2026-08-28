"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Loader2, X, RefreshCw, ShieldAlert } from "lucide-react";
import {
  listUsers,
  createUser,
  updateUserRole,
  deleteUserProfile,
  sendPasswordSetupEmail,
  assignableRoles,
  outranks,
  ROLE_LABELS,
  type AdminUser,
  type UserRole,
} from "@/lib/admin/users";
import { useAdminRole } from "@/lib/admin/useAdminRole";

const inputClass =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";

function randomPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from(
    { length: 14 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default function AdminUsersPage() {
  const { role: myRole, canManageUsers, loading: roleLoading } = useAdminRole();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canAssign = assignableRoles(myRole);

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
    if (roleLoading || !canManageUsers) return;
    load();
  }, [roleLoading, canManageUsers]);

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

  if (roleLoading) {
    return (
      <div className="flex items-center gap-2 text-foreground/40 text-sm py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando...
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="flex max-w-md flex-col items-start gap-3 py-8">
        <ShieldAlert className="h-7 w-7 text-danger" />
        <h1 className="font-serif text-2xl font-light text-foreground">
          Sección restringida
        </h1>
        <p className="text-sm text-foreground/55">
          La gestión de usuarios está disponible solo para managers y
          administradores.
        </p>
      </div>
    );
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
          Invitar Usuario
        </button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

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
              {users.map((user) => {
                const editable = outranks(myRole, user.role);
                return (
                  <tr
                    key={user.uid}
                    className="border-b border-foreground/5 last:border-b-0 hover:bg-foreground/[0.02]"
                  >
                    <td className="px-5 py-4 text-foreground">{user.name}</td>
                    <td className="px-5 py-4 text-foreground/60">{user.email}</td>
                    <td className="px-5 py-4">
                      {editable ? (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.uid,
                              e.target.value as UserRole,
                            )
                          }
                          className="bg-transparent text-foreground/80 text-sm border border-foreground/15 rounded-full px-3 py-1.5 outline-none focus:border-terracotta transition-colors"
                        >
                          {/* keep the current value selectable even if it
                              sits outside what this actor can newly assign */}
                          {Array.from(
                            new Set<UserRole>([user.role, ...canAssign]),
                          ).map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-foreground/60 text-sm">
                          {ROLE_LABELS[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        {editable ? (
                          <button
                            onClick={() => handleDelete(user.uid)}
                            className="text-foreground/50 hover:text-danger transition-colors"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-foreground/25 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <AddUserModal
            roleOptions={canAssign}
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
  roleOptions,
  onClose,
  onCreated,
}: {
  roleOptions: UserRole[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState(randomPassword);
  const [role, setRole] = useState<UserRole>(
    roleOptions[roleOptions.length - 1] ?? "agent",
  );
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createUser({ name, email, tempPassword, role });
      if (sendEmail) {
        try {
          await sendPasswordSetupEmail(email);
        } catch {
          // account exists — the invite still worked, just flag it
          setError(
            "Usuario creado, pero no se pudo enviar el email para configurar contraseña. Pasale la contraseña temporal.",
          );
        }
      }
      onCreated();
    } catch {
      setError(
        "No se pudo crear el usuario. Verificá el email y la contraseña (mínimo 6 caracteres).",
      );
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
            Crear Nuevo Miembro
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
            <div className="flex items-center gap-2">
              <input
                required
                type="text"
                minLength={6}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setTempPassword(randomPassword())}
                className="shrink-0 text-foreground/40 hover:text-terracotta transition-colors"
                aria-label="Generar otra"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
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
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-foreground/60 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="mt-0.5 accent-terracotta"
            />
            Enviar email para que configure su propia contraseña
          </label>

          {error && <p className="text-danger text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white text-sm px-6 py-3 rounded-full transition-colors mt-1"
          >
            {submitting ? "Creando..." : "Crear miembro"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
