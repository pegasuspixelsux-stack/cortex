"use client";

import { useEffect, useMemo, useState } from "react";
import { Player } from "@remotion/player";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, Download, GripVertical, Film } from "lucide-react";
import { listProperties, type AdminProperty } from "@/lib/admin/properties";
import { PropertyReelTemplate } from "@/remotion/PropertyReelTemplate";
import {
  ASPECT_RATIOS,
  DEFAULT_REEL_PROPS,
  FPS,
  reelDurationInFrames,
  type AspectRatioKey,
  type PropertyReelProps,
} from "@/remotion/constants";

const priceFmt = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 });
const fieldClass =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2 transition-colors";

const DIACRITICS = /[̀-ͯ]/g;
const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "reel";

export default function AdminContentPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [reel, setReel] = useState<PropertyReelProps>(DEFAULT_REEL_PROPS);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    listProperties()
      .then(setProperties)
      .catch(() => setProperties([]));
  }, []);

  const ar = ASPECT_RATIOS[reel.aspectRatio];
  const durationInFrames = useMemo(
    () => reelDurationInFrames(reel.photos.length),
    [reel.photos.length],
  );

  function set<K extends keyof PropertyReelProps>(
    key: K,
    value: PropertyReelProps[K],
  ) {
    setReel((r) => ({ ...r, [key]: value }));
  }

  function loadProperty(id: string) {
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    setReel((r) => ({
      ...r,
      title: p.title,
      zone: p.zone,
      price: `USD ${priceFmt.format(p.price)}`,
      photos: (p.images ?? []).slice(0, 10),
    }));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = reel.photos.indexOf(String(active.id));
    const to = reel.photos.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    set("photos", arrayMove(reel.photos, from, to));
  }

  async function exportMp4() {
    setRendering(true);
    setError(null);
    try {
      const res = await fetch("/api/render-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reel),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "No se pudo renderizar el video.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cortex-${slug(reel.title)}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al exportar.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Generador de Reels
        </h1>
        <p className="text-foreground/50 text-sm">
          Armá un video de la propiedad para redes y descargalo en MP4.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Preview */}
        <div className="flex flex-col gap-4">
          <div
            className="mx-auto w-full overflow-hidden rounded-sm border border-foreground/10 bg-ink"
            style={{ maxWidth: reel.aspectRatio === "vertical" ? 360 : "100%" }}
          >
            <Player
              component={PropertyReelTemplate}
              inputProps={reel}
              durationInFrames={durationInFrames}
              compositionWidth={ar.width}
              compositionHeight={ar.height}
              fps={FPS}
              style={{ width: "100%" }}
              controls
              loop
            />
          </div>

          {/* Aspect ratio */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((key) => (
              <button
                key={key}
                onClick={() => set("aspectRatio", key)}
                className={`flex flex-col items-start rounded-sm border px-3.5 py-2 text-left transition-colors ${
                  reel.aspectRatio === key
                    ? "border-terracotta bg-terracotta/5"
                    : "border-foreground/15 hover:border-terracotta/50"
                }`}
              >
                <span className="text-xs text-foreground/80">
                  {ASPECT_RATIOS[key].label}
                </span>
                <span className="text-[11px] text-foreground/40">
                  {ASPECT_RATIOS[key].width}×{ASPECT_RATIOS[key].height} ·{" "}
                  {ASPECT_RATIOS[key].platform}
                </span>
              </button>
            ))}
          </div>

          {/* Photo sequence */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Secuencia ({reel.photos.length})
            </span>
            {reel.photos.length === 0 ? (
              <p className="text-sm text-foreground/40">
                Elegí una propiedad para traer sus fotos.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={reel.photos}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {reel.photos.map((url, i) => (
                      <ReelThumb
                        key={url}
                        url={url}
                        seq={i + 1}
                        onRemove={() =>
                          set(
                            "photos",
                            reel.photos.filter((u) => u !== url),
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex flex-col gap-5 rounded-sm border border-foreground/10 p-5">
          <Field label="Propiedad">
            <select
              defaultValue=""
              onChange={(e) => loadProperty(e.target.value)}
              className={fieldClass}
            >
              <option value="" disabled>
                Elegir del catálogo…
              </option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Título">
            <input
              value={reel.title}
              onChange={(e) => set("title", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Zona">
            <input
              value={reel.zone}
              onChange={(e) => set("zone", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Precio">
            <input
              value={reel.price}
              onChange={(e) => set("price", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Agente / inmobiliaria">
            <input
              value={reel.agent}
              onChange={(e) => set("agent", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Contacto (cierre)">
            <input
              value={reel.contact}
              onChange={(e) => set("contact", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Logo (URL, opcional)">
            <input
              value={reel.logoUrl ?? ""}
              onChange={(e) => set("logoUrl", e.target.value || undefined)}
              placeholder="Marca Cortex por defecto"
              className={fieldClass}
            />
          </Field>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            onClick={exportMp4}
            disabled={rendering || reel.photos.length === 0}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm text-white transition-colors hover:bg-terracotta-hover disabled:opacity-50"
          >
            {rendering ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renderizando…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar y descargar MP4
              </>
            )}
          </button>
          {rendering && (
            <p className="text-[11px] text-foreground/40">
              La primera exportación puede tardar (descarga el motor de video).
            </p>
          )}
          <p className="flex items-center gap-1.5 text-[11px] text-foreground/35">
            <Film className="h-3 w-3" />
            {(durationInFrames / FPS).toFixed(1)}s · {ar.width}×{ar.height}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReelThumb({
  url,
  seq,
  onRemove,
}: {
  url: string;
  seq: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-foreground/15 ${
        isDragging ? "z-10 opacity-80" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-medium text-white">
        {seq}
      </span>
      <button
        {...attributes}
        {...listeners}
        className="absolute inset-x-0 top-0 flex justify-center bg-ink/40 py-0.5 text-cream/80 opacity-0 group-hover:opacity-100"
        aria-label="Reordenar"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button
        onClick={onRemove}
        className="absolute bottom-1 right-1 rounded-full bg-ink/60 px-1 text-[10px] text-cream opacity-0 hover:bg-danger group-hover:opacity-100"
        aria-label="Quitar"
      >
        ✕
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
        {label}
      </label>
      {children}
    </div>
  );
}
