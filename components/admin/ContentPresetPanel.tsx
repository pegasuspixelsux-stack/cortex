"use client";

import { useEffect, useState } from "react";
import { Save, Check, Pencil, Trash2, Copy, X, Loader2 } from "lucide-react";
import {
  loadPresets,
  savePreset,
  renamePreset,
  deletePreset,
  extractConfig,
  type SavedPreset,
  type ContentPresetConfig,
} from "@/lib/admin/contentPresets";
import type { PropertyReelProps } from "@/remotion/constants";

interface Props {
  reel: PropertyReelProps;
  uid: string | null;
  onApply: (config: ContentPresetConfig) => void;
}

export default function ContentPresetPanel({ reel, uid, onApply }: Props) {
  const [presets, setPresets] = useState<SavedPreset[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [namingSave, setNamingSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    loadPresets(uid).then(setPresets).catch(() => setPresets([]));
  }, [uid]);

  async function refresh() {
    setPresets(await loadPresets(uid).catch(() => []));
  }

  async function doSave() {
    if (saving) return;
    setSaving(true);
    try {
      await savePreset(uid, saveName || "Mi preset", extractConfig(reel));
      setSaveName("");
      setNamingSave(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function doClone(p: SavedPreset) {
    await savePreset(uid, `${p.name} (copia)`, p.config);
    await refresh();
  }

  async function doRename(id: string) {
    await renamePreset(uid, id, renameValue);
    setRenamingId(null);
    await refresh();
  }

  async function doDelete(p: SavedPreset) {
    if (!window.confirm(`¿Eliminar el preset "${p.name}"?`)) return;
    await deletePreset(uid, p.id);
    await refresh();
  }

  const system = (presets ?? []).filter((p) => p.system);
  const mine = (presets ?? []).filter((p) => !p.system);

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-foreground/10 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.1em] text-foreground/40">
          Mis Presets
        </span>
        {namingSave ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSave()}
              placeholder="Nombre del preset"
              className="w-40 border-b border-foreground/20 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/30"
            />
            <button
              onClick={doSave}
              disabled={saving}
              className="text-terracotta-hover"
              aria-label="Guardar"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setNamingSave(false)}
              className="text-foreground/40"
              aria-label="Cancelar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setNamingSave(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-2.5 py-1 text-[11px] text-foreground/70 hover:border-terracotta"
          >
            <Save className="h-3 w-3" />
            Guardar configuración
          </button>
        )}
      </div>

      {presets === null ? (
        <p className="text-xs text-foreground/40">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-foreground/30">
              Del sistema
            </span>
            {system.map((p) => (
              <Row
                key={p.id}
                name={p.name}
                onApply={() => onApply(p.config)}
                extra={
                  <button
                    onClick={() => doClone(p)}
                    className="text-foreground/40 hover:text-terracotta-hover"
                    aria-label="Clonar"
                    title="Clonar como preset propio"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-foreground/30">
              Guardados ({mine.length})
            </span>
            {mine.length === 0 && (
              <p className="text-xs text-foreground/35">
                Guardá la configuración actual para reutilizarla.
              </p>
            )}
            {mine.map((p) =>
              renamingId === p.id ? (
                <div key={p.id} className="flex items-center gap-1 py-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doRename(p.id)}
                    className="flex-1 border-b border-foreground/20 bg-transparent text-xs text-foreground outline-none"
                  />
                  <button onClick={() => doRename(p.id)} className="text-terracotta-hover">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setRenamingId(null)} className="text-foreground/40">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Row
                  key={p.id}
                  name={p.name}
                  onApply={() => onApply(p.config)}
                  extra={
                    <>
                      <button
                        onClick={() => {
                          setRenamingId(p.id);
                          setRenameValue(p.name);
                        }}
                        className="text-foreground/40 hover:text-terracotta-hover"
                        aria-label="Renombrar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => doDelete(p)}
                        className="text-foreground/40 hover:text-danger"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  }
                />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  name,
  onApply,
  extra,
}: {
  name: string;
  onApply: () => void;
  extra: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <button
        onClick={onApply}
        className="flex-1 truncate text-left text-xs text-foreground/80 hover:text-terracotta-hover"
      >
        {name}
      </button>
      <div className="flex items-center gap-1.5">{extra}</div>
    </div>
  );
}
