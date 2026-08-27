"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import {
  listLeads,
  updateLeadStatus,
  leadPriority,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadStatus,
} from "@/lib/admin/leads";
import { isPlausiblePhone } from "@/lib/leads";

const STATUS_FILTERS: Array<LeadStatus | "todos"> = [
  "todos",
  "nuevo",
  "contactado",
  "descartado",
];

const dateFmt = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setLeads(await listLeads());
      } catch {
        setError("No se pudieron cargar los leads.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleStatus(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
    try {
      await updateLeadStatus(id, status);
    } catch {
      setError("No se pudo actualizar el estado.");
    }
  }

  const filtered = useMemo(
    () =>
      statusFilter === "todos"
        ? leads
        : leads.filter((l) => l.status === statusFilter),
    [leads, statusFilter],
  );

  const newCount = leads.filter((l) => l.status === "nuevo").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Leads
        </h1>
        <p className="text-foreground/50 text-sm">
          {leads.length} en total · {newCount} sin contactar · ordenados por
          prioridad
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-xs px-3.5 py-2 rounded-full border transition-colors capitalize ${
              statusFilter === status
                ? "bg-terracotta text-white border-terracotta"
                : "border-foreground/15 text-foreground/60 hover:border-terracotta/60"
            }`}
          >
            {status === "todos" ? "Todos" : LEAD_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-foreground/40 text-sm py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando leads...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-foreground/50 border border-dashed border-foreground/15 rounded-sm text-sm">
          No hay leads que coincidan.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              expanded={expandedId === lead.id}
              onToggle={() =>
                setExpandedId((id) => (id === lead.id ? null : lead.id))
              }
              onStatus={handleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  expanded,
  onToggle,
  onStatus,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (id: string, status: LeadStatus) => void;
}) {
  const priority = leadPriority(lead.score);
  const priorityClass =
    priority === "Alta"
      ? "bg-terracotta/10 text-terracotta-hover"
      : priority === "Media"
        ? "bg-foreground/5 text-foreground/60"
        : "bg-foreground/5 text-foreground/40";

  const waHref =
    lead.phone && isPlausiblePhone(lead.phone)
      ? `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`
      : null;

  return (
    <div className="border border-foreground/10 rounded-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-foreground/[0.02]"
      >
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium tabular-nums shrink-0 ${priorityClass}`}
        >
          {lead.score}
        </span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-foreground text-sm truncate">{lead.name}</span>
          <span className="text-foreground/50 text-xs truncate">
            {lead.transactionType ?? "—"}
            {lead.budget ? ` · ${lead.budget}` : ""}
            {lead.timeframe ? ` · ${lead.timeframe}` : ""}
          </span>
        </div>
        <span className="hidden sm:block text-xs text-foreground/40 shrink-0">
          {lead.createdAt ? dateFmt.format(lead.createdAt.toDate()) : ""}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
            lead.status === "nuevo"
              ? "bg-terracotta/10 text-terracotta-hover"
              : "bg-foreground/5 text-foreground/50"
          }`}
        >
          {LEAD_STATUS_LABELS[lead.status]}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-foreground/10 px-5 py-5 flex flex-col gap-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <Detail label="Zonas" value={lead.zones.join(", ") || "—"} />
            <Detail label="Tipología" value={lead.propertyType ?? "—"} />
            <Detail
              label="Obstáculos"
              value={lead.obstacles.join(", ") || "—"}
            />
            <Detail
              label="Contacto preferido"
              value={
                [lead.contactPreference, lead.contactWindow]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
            <Detail label="Email" value={lead.email} />
            <Detail label="Teléfono" value={lead.phone ?? "—"} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
              Desglose del score
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
              {Object.entries(lead.scoreBreakdown).map(([k, v]) => (
                <span key={k}>
                  {k}: <span className="text-foreground/90 tabular-nums">{v}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-terracotta-hover hover:text-terracotta transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-terracotta-hover hover:text-terracotta transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs text-terracotta-hover hover:text-terracotta transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamar
              </a>
            )}

            <select
              value={lead.status}
              onChange={(e) =>
                onStatus(lead.id, e.target.value as LeadStatus)
              }
              className="ml-auto bg-transparent text-foreground/80 text-xs border border-foreground/15 rounded-full px-3 py-1.5 outline-none focus:border-terracotta transition-colors"
            >
              {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
        {label}
      </span>
      <span className="text-foreground/80">{value}</span>
    </div>
  );
}
