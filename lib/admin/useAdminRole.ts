"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import {
  ROLE_RANK,
  canManageUsers,
  type UserRole,
} from "@/lib/admin/users";

/** The signed-in admin's role, read from their users/{uid} profile. */
export function useAdminRole() {
  const { user, loading: authLoading } = useAdminAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      setRole(null);
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        setRole(snap.exists() ? ((snap.data().role as UserRole) ?? null) : null);
        setLoading(false);
      })
      .catch(() => {
        setRole(null);
        setLoading(false);
      });
  }, [user, authLoading]);

  const rank = role ? ROLE_RANK[role] : 0;

  return {
    user,
    role,
    loading: authLoading || loading,
    isSuperAdmin: role === "super_admin",
    /** admin or above — full platform control. */
    isAdmin: rank >= ROLE_RANK.admin,
    /** manager or above — gerencial pipeline view, team supervision. */
    isManager: rank >= ROLE_RANK.manager,
    /** may open the user-management area. */
    canManageUsers: canManageUsers(role),
  };
}
