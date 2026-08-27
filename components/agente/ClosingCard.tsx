"use client";

import { Check, MessageCircle, AlertTriangle } from "lucide-react";
import type { LeadDraft } from "@/lib/leads";
import { buildWhatsappUrl } from "@/lib/leads";

/**
 * Concierge-style sign-off shown once the flow completes. `failed` renders
 * the degraded variant when the lead could not be saved — the visitor is
 * pointed straight at WhatsApp so nothing is lost.
 */
export default function ClosingCard({
  draft,
  failed,
}: {
  draft: LeadDraft;
  failed: boolean;
}) {
  const method = draft.contactPreference ?? "el medio indicado";
  const firstName = draft.name.trim().split(/\s+/)[0] || "";

  return (
    <div className="flex flex-col items-start gap-5 px-2 py-6">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          failed
            ? "bg-danger/15 text-danger-bright"
            : "bg-terracotta/20 text-terracotta-dark"
        }`}
      >
        {failed ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        )}
      </span>

      {failed ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-xl font-light text-cream">
            No pudimos registrar su consulta
          </h3>
          <p className="text-sm leading-relaxed text-cream-soft">
            Escríbanos directamente y un socio senior de Cortex lo atiende de
            inmediato.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-xl font-light leading-snug text-cream">
            Gracias{firstName && `, ${firstName}`}.
          </h3>
          <p className="text-sm leading-relaxed text-cream-soft">
            Un socio senior de Cortex analizará su perfil y se pondrá en
            contacto con usted por{" "}
            <span className="text-cream">{method}</span>
            {draft.contactWindow && (
              <>
                {" "}
                en el horario{" "}
                <span className="text-cream">
                  {draft.contactWindow.toLowerCase()}
                </span>
              </>
            )}
            .
          </p>
        </div>
      )}

      <a
        href={buildWhatsappUrl(draft)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm text-white transition-colors hover:bg-terracotta-hover"
      >
        <MessageCircle className="h-4 w-4" />
        {failed ? "Escribir por WhatsApp" : "Continuar por WhatsApp"}
      </a>
    </div>
  );
}
