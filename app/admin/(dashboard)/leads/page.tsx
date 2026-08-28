"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import {
  subscribeLeads,
  updateLeadStage,
  assignLead,
  staleness,
  timeAgo,
  STAGE_LABEL,
  type Lead,
  type LeadStage,
} from "@/lib/admin/leads";
import { listUsers, type AdminUser } from "@/lib/admin/users";
import { useAdminRole } from "@/lib/admin/useAdminRole";
import LeadKanban from "@/components/admin/LeadKanban";
import LeadDetailPanel from "@/components/admin/LeadDetailPanel";

export default function AdminLeadsPage() {
  const { user, role, isManager, loading: roleLoading } = useAdminRole();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [agents, setAgents] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mineOnly, setMineOnly] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => subscribeLeads(setLeads), []);

  useEffect(() => {
    if (!isManager) return;
    listUsers()
      .then(setAgents)
      .catch(() => setAgents([]));
  }, [isManager]);

  // The open lead is always derived from the live list, so realtime edits
  // (stage moves, reassignments, notes) show without extra wiring.
  const selected = (leads ?? []).find((l) => l.id === selectedId) ?? null;

  const visible = useMemo(() => {
    if (!leads) return [];
    if (mineOnly && user) return leads.filter((l) => l.assignedTo === user.uid);
    return leads;
  }, [leads, mineOnly, user]);

  const stale = useMemo(
    () =>
      visible
        .map((l) => ({ lead: l, s: staleness(l) }))
        .filter(({ s }) => s.level !== "ok")
        .sort((a, b) => b.s.sinceMs - a.s.sinceMs),
    [visible],
  );

  const currentUser = user
    ? {
        uid: user.uid,
        name: agents.find((a) => a.uid === user.uid)?.name || user.email || "Agente",
      }
    : null;

  if (roleLoading || leads === null) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-foreground/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando pipeline…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Pipeline de Leads
          </h1>
          <p className="text-sm text-foreground/50">
            {visible.length} leads · {stale.length} necesitan atención
            {isManager && " · vista gerencial"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={() => setMineOnly((v) => !v)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                mineOnly
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-foreground/15 text-foreground/60 hover:border-terracotta/60"
              }`}
            >
              {mineOnly ? "Mis leads" : "Todo el equipo"}
            </button>
          )}
        </div>
      </div>

      {/* SLA alerts */}
      {stale.length > 0 && (
        <div className="rounded-sm border border-amber-400/40 bg-amber-400/5">
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-700"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">
              {stale.length} lead{stale.length > 1 ? "s" : ""} sin movimiento
            </span>
            <ChevronRight
              className={`ml-auto h-4 w-4 transition-transform ${
                showAlerts ? "rotate-90" : ""
              }`}
            />
          </button>
          {showAlerts && (
            <ul className="flex flex-col divide-y divide-amber-400/20 border-t border-amber-400/20">
              {stale.slice(0, 8).map(({ lead, s }) => (
                <li key={lead.id}>
                  <button
                    onClick={() => setSelectedId(lead.id)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-xs hover:bg-amber-400/10"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        s.level === "crit" ? "bg-danger" : "bg-amber-500"
                      }`}
                    />
                    <span className="text-foreground/80">{lead.name}</span>
                    <span className="text-foreground/40">
                      {STAGE_LABEL[lead.stage]}
                    </span>
                    <span className="ml-auto text-foreground/40">
                      {timeAgo(lead.lastStageChangeAt)}
                    </span>
                    {lead.assignedToName && (
                      <span className="text-foreground/50">
                        · {lead.assignedToName}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-sm border border-dashed border-foreground/15 py-16 text-center text-sm text-foreground/50">
          Todavía no hay leads. El widget “Agente” del sitio los crea.
        </div>
      ) : (
        <LeadKanban
          leads={visible}
          agents={agents}
          isManager={isManager}
          onOpen={(lead) => setSelectedId(lead.id)}
          onStageChange={updateLeadStage}
          onAssign={assignLead}
        />
      )}

      <AnimatePresence>
        {selected && currentUser && (
          <LeadDetailPanel
            lead={selected}
            currentUser={currentUser}
            agents={agents}
            isManager={isManager}
            onClose={() => setSelectedId(null)}
            onStageChange={updateLeadStage}
            onAssign={assignLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
