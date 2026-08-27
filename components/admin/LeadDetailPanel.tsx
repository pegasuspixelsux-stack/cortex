"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X, MessageCircle, Mail, Phone, Send } from "lucide-react";
import {
  LEAD_STAGES,
  STAGE_LABEL,
  subscribeLeadNotes,
  addLeadNote,
  timeAgo,
  leadPriority,
  type Lead,
  type LeadNote,
  type LeadStage,
} from "@/lib/admin/leads";
import { isPlausiblePhone } from "@/lib/leads";
import type { AdminUser } from "@/lib/admin/users";

interface Props {
  lead: Lead;
  currentUser: { uid: string; name: string };
  agents: AdminUser[];
  isManager: boolean;
  onClose: () => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAssign: (id: string, uid: string | null, name: string | null) => void;
}

export default function LeadDetailPanel({
  lead,
  currentUser,
  agents,
  isManager,
  onClose,
  onStageChange,
  onAssign,
}: Props) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeLeadNotes(lead.id, setNotes), [lead.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submitNote() {
    const body = draft.trim();
    if (!body || saving) return;
    setSaving(true);
    try {
      await addLeadNote(lead.id, {
        body,
        authorUid: currentUser.uid,
        authorName: currentUser.name,
      });
      setDraft("");
    } finally {
      setSaving(false);
    }
  }

  const waHref =
    lead.phone && isPlausiblePhone(lead.phone)
      ? `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`
      : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-foreground/10 px-6 py-5">
          <div>
            <h2 className="font-serif text-xl font-light text-foreground">
              {lead.name}
            </h2>
            <p className="text-xs text-foreground/50">
              Score {lead.score} · Prioridad {leadPriority(lead.score)} · alta{" "}
              {timeAgo(lead.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-foreground/40 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* controls */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.1em] text-foreground/40">
              Etapa
              <select
                value={lead.stage}
                onChange={(e) =>
                  onStageChange(lead.id, e.target.value as LeadStage)
                }
                className="rounded-sm border border-foreground/15 bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-terracotta"
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.1em] text-foreground/40">
              Asignado a
              <select
                value={lead.assignedTo ?? ""}
                disabled={!isManager}
                onChange={(e) => {
                  const uid = e.target.value || null;
                  onAssign(
                    lead.id,
                    uid,
                    agents.find((a) => a.uid === uid)?.name ?? null,
                  );
                }}
                className="rounded-sm border border-foreground/15 bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-terracotta disabled:opacity-60"
              >
                <option value="">Sin asignar</option>
                {agents.map((a) => (
                  <option key={a.uid} value={a.uid}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* contact actions */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-terracotta-hover hover:text-terracotta"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            )}
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-terracotta-hover hover:text-terracotta"
            >
              <Mail className="h-3.5 w-3.5" />
              {lead.email}
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-terracotta-hover hover:text-terracotta"
              >
                <Phone className="h-3.5 w-3.5" />
                {lead.phone}
              </a>
            )}
          </div>

          {/* profile */}
          <dl className="mt-5 grid grid-cols-1 gap-2 border-t border-foreground/10 pt-4 text-sm">
            <Row label="Operación" value={lead.transactionType} />
            <Row label="Zonas" value={lead.zones.join(", ")} />
            <Row label="Tipología" value={lead.propertyType} />
            <Row label="Presupuesto" value={lead.budget} />
            <Row label="Plazo" value={lead.timeframe} />
            <Row label="Obstáculos" value={lead.obstacles.join(", ")} />
            <Row
              label="Contacto"
              value={[lead.contactPreference, lead.contactWindow]
                .filter(Boolean)
                .join(" · ")}
            />
          </dl>

          {/* notes */}
          <div className="mt-6 border-t border-foreground/10 pt-4">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
              Bitácora ({notes.length})
            </h3>

            <div className="mt-3 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Registrar una llamada, WhatsApp, visita…"
                className="flex-1 resize-none rounded-sm border border-foreground/15 bg-transparent px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-terracotta"
              />
              <button
                onClick={submitNote}
                disabled={!draft.trim() || saving}
                className="self-end rounded-full bg-terracotta p-2 text-white transition-colors hover:bg-terracotta-hover disabled:opacity-40"
                aria-label="Agregar nota"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-4">
              {notes.map((note) => (
                <li key={note.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2 text-[11px] text-foreground/40">
                    <span className="text-foreground/70">{note.authorName}</span>
                    <span>{timeAgo(note.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground/80">
                    {note.body}
                  </p>
                </li>
              ))}
              {notes.length === 0 && (
                <li className="text-sm text-foreground/35">
                  Sin registros todavía.
                </li>
              )}
            </ul>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-foreground/40">{label}</dt>
      <dd className="text-right text-foreground/80">{value || "—"}</dd>
    </div>
  );
}
