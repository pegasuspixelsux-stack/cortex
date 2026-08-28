"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowLeft, ArrowRight, X, Loader2 } from "lucide-react";
import {
  BUDGETS,
  CONTACT_PREFERENCES,
  CONTACT_WINDOWS,
  EMPTY_DRAFT,
  LEAD_PROPERTY_TYPES,
  OBSTACLES,
  TIMEFRAMES,
  TRANSACTION_TYPES,
  ZONES,
  createLead,
  type LeadDraft,
} from "@/lib/leads";
import ChoiceGroup from "@/components/agente/ChoiceGroup";
import ClosingCard from "@/components/agente/ClosingCard";
import { useFeatureFlags } from "@/lib/admin/featureFlags";

const STORAGE_KEY = "cortex.agente.v1";

type ProfileStep = {
  key: "transactionType" | "zones" | "propertyType" | "budget" | "timeframe" | "obstacles";
  question: string;
  help?: string;
  options: readonly string[];
  mode: "single" | "multi";
};

const PROFILE_STEPS: ProfileStep[] = [
  {
    key: "transactionType",
    question: "¿Qué tipo de operación tiene en mente?",
    options: TRANSACTION_TYPES,
    mode: "single",
  },
  {
    key: "zones",
    question: "¿Qué zonas le interesan?",
    help: "Puede elegir varias.",
    options: ZONES,
    mode: "multi",
  },
  {
    key: "propertyType",
    question: "¿Qué tipología está buscando?",
    options: LEAD_PROPERTY_TYPES,
    mode: "single",
  },
  {
    key: "budget",
    question: "¿Cuál es su rango de presupuesto?",
    help: "En dólares estadounidenses.",
    options: BUDGETS,
    mode: "single",
  },
  {
    key: "timeframe",
    question: "¿En qué plazo estima concretar?",
    options: TIMEFRAMES,
    mode: "single",
  },
  {
    key: "obstacles",
    question: "¿Hay algo a considerar para cerrar la operación?",
    help: 'Elija lo que corresponda, o "Ninguno".',
    options: OBSTACLES,
    mode: "multi",
  },
];

const TOTAL_STEPS = PROFILE_STEPS.length + 1; // + contact
const CONTACT_INDEX = PROFILE_STEPS.length;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Reads an in-progress conversation from sessionStorage (SSR-safe). */
function loadSaved(): { draft: LeadDraft; stepIndex: number } {
  const fallback = { draft: EMPTY_DRAFT, stepIndex: 0 };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as { draft?: LeadDraft; stepIndex?: number };
    return {
      draft: { ...EMPTY_DRAFT, ...saved.draft },
      stepIndex: Math.min(saved.stepIndex ?? 0, CONTACT_INDEX),
    };
  } catch {
    return fallback;
  }
}

const inputClass =
  "w-full border-b border-white/15 bg-transparent py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream-soft/40 focus:border-terracotta";

export default function AgenteConcierge() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { leadWidget } = useFeatureFlags();

  const [saved] = useState(loadSaved);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(saved.stepIndex);
  const [draft, setDraft] = useState<LeadDraft>(saved.draft);
  const [phase, setPhase] = useState<"flow" | "submitting" | "done" | "failed">(
    "flow",
  );

  // Persist an in-progress conversation so a reload doesn't lose it.
  useEffect(() => {
    if (phase === "done") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, stepIndex }));
    } catch {
      /* storage unavailable */
    }
  }, [draft, stepIndex, phase]);

  // Escape closes the panel; lock body scroll on mobile while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const setField = useCallback(
    (key: ProfileStep["key"], next: string[]) => {
      setDraft((d) => ({
        ...d,
        [key]:
          PROFILE_STEPS.find((s) => s.key === key)?.mode === "multi"
            ? next
            : (next[0] ?? undefined),
      }));
    },
    [],
  );

  const canAdvance = useMemo(() => {
    if (stepIndex === CONTACT_INDEX) {
      return (
        draft.name.trim().length > 0 &&
        isEmail(draft.email) &&
        !!draft.contactPreference &&
        !!draft.contactWindow
      );
    }
    const step = PROFILE_STEPS[stepIndex];
    const raw = draft[step.key];
    return Array.isArray(raw) ? raw.length > 0 : !!raw;
  }, [stepIndex, draft]);

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, CONTACT_INDEX));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canAdvance || phase === "submitting") return;
    setPhase("submitting");
    try {
      await createLead(draft);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setPhase("done");
    } catch {
      setPhase("failed");
    }
  }

  function reset() {
    setOpen(false);
    // Give the close animation a beat before wiping the panel content.
    window.setTimeout(() => {
      setDraft(EMPTY_DRAFT);
      setStepIndex(0);
      setPhase("flow");
    }, 300);
  }

  if (pathname?.startsWith("/admin")) return null;
  if (!leadWidget) return null;

  const showClosing = phase === "done" || phase === "failed";

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-navy px-4 py-3 text-cream shadow-lg shadow-black/20 ring-1 ring-white/10 transition-colors hover:bg-ink-soft sm:bottom-6 sm:right-6"
            aria-label="Abrir el Agente de Cortex"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta-dark opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta-dark" />
            </span>
            <span className="text-sm tracking-wide">Agente</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Agente de Cortex"
            className="fixed inset-x-4 bottom-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl bg-navy ring-1 ring-white/10 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 px-6 pb-4 pt-5">
              <div className="flex flex-col">
                <span className="font-serif text-lg font-light tracking-wide text-cream">
                  Agente
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-cream-soft/50">
                  Conserje privado · Cortex
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center text-cream-soft/70 transition-colors hover:text-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress */}
            {!showClosing && (
              <div className="flex items-center gap-3 px-6 py-3">
                <div className="h-px flex-1 bg-white/10">
                  <div
                    className="h-px bg-terracotta transition-all duration-300"
                    style={{
                      width: `${((stepIndex + 1) / TOTAL_STEPS) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-cream-soft/50">
                  {String(stepIndex + 1).padStart(2, "0")} / {TOTAL_STEPS}
                </span>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {showClosing ? (
                <ClosingCard draft={draft} failed={phase === "failed"} />
              ) : phase === "submitting" ? (
                <div className="flex h-full items-center justify-center text-cream-soft/60">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <div
                  key={stepIndex}
                  className={reduceMotion ? undefined : "agente-step-in"}
                >
                  {stepIndex === CONTACT_INDEX ? (
                    <ContactStep draft={draft} setDraft={setDraft} />
                  ) : (
                    <ProfileStepView
                      step={PROFILE_STEPS[stepIndex]}
                      draft={draft}
                      onChange={setField}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!showClosing && phase !== "submitting" && (
              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
                <button
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex items-center gap-1.5 text-sm text-cream-soft/60 transition-colors hover:text-cream disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Atrás
                </button>
                {stepIndex === CONTACT_INDEX ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm text-white transition-colors hover:bg-terracotta-hover disabled:opacity-40"
                  >
                    Enviar perfil
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm text-white transition-colors hover:bg-terracotta-hover disabled:opacity-40"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {showClosing && (
              <div className="border-t border-white/10 px-6 py-4">
                <button
                  onClick={reset}
                  className="text-sm text-cream-soft/60 transition-colors hover:text-cream"
                >
                  Cerrar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProfileStepView({
  step,
  draft,
  onChange,
}: {
  step: ProfileStep;
  draft: LeadDraft;
  onChange: (key: ProfileStep["key"], next: string[]) => void;
}) {
  const raw = draft[step.key];
  const value = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-xl font-light leading-snug text-cream">
          {step.question}
        </h3>
        {step.help && (
          <p className="text-xs text-cream-soft/50">{step.help}</p>
        )}
      </div>
      <ChoiceGroup
        options={step.options}
        value={value as string[]}
        onChange={(next) => onChange(step.key, next)}
        mode={step.mode}
      />
    </div>
  );
}

function ContactStep({
  draft,
  setDraft,
}: {
  draft: LeadDraft;
  setDraft: React.Dispatch<React.SetStateAction<LeadDraft>>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-xl font-light leading-snug text-cream">
          ¿A nombre de quién preparamos el análisis?
        </h3>
        <p className="text-xs text-cream-soft/50">
          Un socio senior revisa cada perfil de forma personal.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Nombre y apellido"
            className={inputClass}
            autoComplete="name"
          />
        </Field>
        <Field label="Correo electrónico">
          <input
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="nombre@correo.com"
            className={inputClass}
            autoComplete="email"
          />
        </Field>
        <Field label="Teléfono" hint="Opcional">
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="+598 99 000 000"
            className={inputClass}
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="¿Cómo prefiere que lo contactemos?">
        <ChoiceGroup
          options={CONTACT_PREFERENCES}
          value={draft.contactPreference ? [draft.contactPreference] : []}
          onChange={(next) =>
            setDraft((d) => ({
              ...d,
              contactPreference:
                (next[0] as LeadDraft["contactPreference"]) ?? undefined,
            }))
          }
        />
      </Field>

      <Field label="Horario de preferencia">
        <ChoiceGroup
          options={CONTACT_WINDOWS}
          value={draft.contactWindow ? [draft.contactWindow] : []}
          onChange={(next) =>
            setDraft((d) => ({
              ...d,
              contactWindow:
                (next[0] as LeadDraft["contactWindow"]) ?? undefined,
            }))
          }
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-cream-soft/50">
        {label}
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
