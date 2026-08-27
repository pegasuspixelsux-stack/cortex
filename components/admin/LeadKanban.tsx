"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Clock, User } from "lucide-react";
import {
  LEAD_STAGES,
  leadPriority,
  staleness,
  timeAgo,
  type Lead,
  type LeadStage,
} from "@/lib/admin/leads";
import type { AdminUser } from "@/lib/admin/users";

interface LeadKanbanProps {
  leads: Lead[];
  agents: AdminUser[];
  isManager: boolean;
  onOpen: (lead: Lead) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAssign: (id: string, uid: string | null, name: string | null) => void;
}

const STALE_RING: Record<string, string> = {
  ok: "",
  warn: "ring-2 ring-amber-400/70",
  crit: "ring-2 ring-danger",
};

export default function LeadKanban({
  leads,
  agents,
  isManager,
  onOpen,
  onStageChange,
  onAssign,
}: LeadKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const lead = leads.find((l) => l.id === String(active.id));
    const stage = String(over.id) as LeadStage;
    if (lead && LEAD_STAGES.some((s) => s.key === stage) && lead.stage !== stage) {
      onStageChange(lead.id, stage);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage, si) => (
          <Column
            key={stage.key}
            stage={stage.key}
            label={stage.label}
            tone={stage.tone}
            leads={leads.filter((l) =>
              LEAD_STAGES.some((s) => s.key === l.stage)
                ? l.stage === stage.key
                : si === 0,
            )}
            agents={agents}
            isManager={isManager}
            onOpen={onOpen}
            onStageChange={onStageChange}
            onAssign={onAssign}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="w-64 rotate-2 rounded-sm border border-terracotta bg-background p-3 shadow-lg">
            <p className="text-sm text-foreground">{activeLead.name}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  stage,
  label,
  tone,
  leads,
  agents,
  isManager,
  onOpen,
  onStageChange,
  onAssign,
}: {
  stage: LeadStage;
  label: string;
  tone: "neutral" | "won" | "lost";
  leads: Lead[];
  agents: AdminUser[];
  isManager: boolean;
  onOpen: (lead: Lead) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAssign: (id: string, uid: string | null, name: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const accent =
    tone === "won"
      ? "text-terracotta-hover"
      : tone === "lost"
        ? "text-foreground/40"
        : "text-foreground/60";

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col gap-2 rounded-sm border p-2.5 transition-colors ${
        isOver ? "border-terracotta bg-terracotta/5" : "border-foreground/10"
      }`}
    >
      <div className="flex items-center justify-between px-1 py-1">
        <span
          className={`text-xs font-medium uppercase tracking-[0.1em] ${accent}`}
        >
          {label}
        </span>
        <span className="text-xs tabular-nums text-foreground/40">
          {leads.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            agents={agents}
            isManager={isManager}
            onOpen={() => onOpen(lead)}
            onStageChange={onStageChange}
            onAssign={onAssign}
          />
        ))}
        {leads.length === 0 && (
          <p className="px-1 py-4 text-center text-[11px] text-foreground/25">
            Sin leads
          </p>
        )}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  agents,
  isManager,
  onOpen,
  onStageChange,
  onAssign,
}: {
  lead: Lead;
  agents: AdminUser[];
  isManager: boolean;
  onOpen: () => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAssign: (id: string, uid: string | null, name: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });
  const stale = staleness(lead);
  const priority = leadPriority(lead.score);
  const scoreTone =
    priority === "Alta"
      ? "bg-terracotta/10 text-terracotta-hover"
      : priority === "Media"
        ? "bg-foreground/5 text-foreground/60"
        : "bg-foreground/5 text-foreground/40";

  return (
    <div
      className={`rounded-sm border border-foreground/10 bg-background p-3 ${
        STALE_RING[stale.level]
      } ${isDragging ? "opacity-30" : ""}`}
    >
      {/* drag + open target */}
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen()}
        className="flex cursor-pointer items-start gap-2.5"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums ${scoreTone}`}
        >
          {lead.score}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{lead.name}</p>
          <p className="truncate text-[11px] text-foreground/45">
            {lead.budget ?? "—"} · {lead.timeframe ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span
          className={`flex items-center gap-1 text-[11px] ${
            stale.level === "crit"
              ? "text-danger"
              : stale.level === "warn"
                ? "text-amber-600"
                : "text-foreground/40"
          }`}
        >
          <Clock className="h-3 w-3" />
          {timeAgo(lead.lastStageChangeAt)}
        </span>

        {isManager ? (
          <select
            value={lead.assignedTo ?? ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const uid = e.target.value || null;
              const name =
                agents.find((a) => a.uid === uid)?.name ?? null;
              onAssign(lead.id, uid, name);
            }}
            className="max-w-[110px] truncate rounded-full border border-foreground/15 bg-transparent px-2 py-0.5 text-[11px] text-foreground/70 outline-none focus:border-terracotta"
          >
            <option value="">Sin asignar</option>
            {agents.map((a) => (
              <option key={a.uid} value={a.uid}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-foreground/45">
            <User className="h-3 w-3" />
            {lead.assignedToName ?? "Sin asignar"}
          </span>
        )}
      </div>

      <select
        value={lead.stage}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStageChange(lead.id, e.target.value as LeadStage)}
        className="mt-2 w-full rounded-sm border border-foreground/12 bg-transparent px-2 py-1 text-[11px] text-foreground/60 outline-none focus:border-terracotta"
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
