"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Loader2, Download, GripVertical, Film, Upload } from "lucide-react";
import {
  listProperties,
  formatSpecsLine,
  formatOperationLine,
  type AdminProperty,
} from "@/lib/admin/properties";
import { uploadImage } from "@/lib/admin/storage";
import { PropertyReelTemplate } from "@/remotion/PropertyReelTemplate";
import "@/remotion/fonts";
import {
  ANIMATIONS,
  ASPECT_RATIOS,
  DEFAULT_REEL_PROPS,
  FONT_KEYS,
  FPS,
  LINE_IDS,
  LINE_LABEL,
  MAX_REEL_PHOTOS,
  REEL_CONTENT_TYPES,
  TRANSITIONS,
  TRANSITION_LABEL,
  reelDuration,
  type AnimKind,
  type AspectRatioKey,
  type LineId,
  type LogoConfig,
  type OverlayConfig,
  type PropertyReelProps,
  type ReelContentType,
  type TextLine,
} from "@/remotion/constants";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { useFeatureFlags } from "@/lib/admin/featureFlags";
import ContentPresetPanel from "@/components/admin/ContentPresetPanel";
import { applyConfig } from "@/lib/admin/contentPresets";

const priceFmt = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 });

const DIACRITICS = /[̀-ͯ]/g;
const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "reel";

export default function AdminContentPage() {
  const { user } = useAdminAuth();
  const { reelGenerator } = useFeatureFlags();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [reel, setReel] = useState<PropertyReelProps>(DEFAULT_REEL_PROPS);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    listProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  const ar = ASPECT_RATIOS[reel.aspectRatio];
  const photoCount = Math.min(reel.photos.length, MAX_REEL_PHOTOS);
  const durationInFrames = useMemo(
    () => reelDuration(photoCount, reel.transition),
    [photoCount, reel.transition],
  );
  const pool = useMemo(
    () => properties.find((p) => p.id === poolId)?.images ?? [],
    [properties, poolId],
  );
  const readyToRender = reel.photos.length === MAX_REEL_PHOTOS;

  function togglePhoto(url: string) {
    setReel((r) => {
      if (r.photos.includes(url)) {
        return { ...r, photos: r.photos.filter((u) => u !== url) };
      }
      if (r.photos.length >= MAX_REEL_PHOTOS) return r;
      return { ...r, photos: [...r.photos, url] };
    });
  }

  /* --- mutations --- */
  function set<K extends keyof PropertyReelProps>(k: K, v: PropertyReelProps[K]) {
    setReel((r) => ({ ...r, [k]: v }));
  }
  function setLine(id: LineId, patch: Partial<TextLine>) {
    setReel((r) => ({
      ...r,
      lines: r.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }
  function setLogo(patch: Partial<LogoConfig>) {
    setReel((r) => ({ ...r, logo: { ...r.logo, ...patch } }));
  }
  function setOverlay(edge: "topOverlay" | "bottomOverlay", patch: Partial<OverlayConfig>) {
    setReel((r) => ({ ...r, [edge]: { ...r[edge], ...patch } }));
  }

  function loadProperty(id: string) {
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    const rental = p.operation === "Alquiler";
    const terms = p.rentalTerms ?? [];
    const cta = reel.lines.find((l) => l.id === "cta")?.text ?? "";
    const custom = reel.lines.find((l) => l.id === "custom")?.text ?? "";
    const text: Record<LineId, string> = {
      zone: p.zone,
      title: p.title,
      price: rental
        ? `USD ${priceFmt.format(p.price)}${terms.includes("Por Mes") || terms.includes("Alquiler Anual") ? " / período" : ""}`
        : `USD ${priceFmt.format(p.price)}`,
      specs: formatSpecsLine(p),
      operation: formatOperationLine(p),
      custom: rental && !custom
        ? terms.length > 1
          ? "Consulte precios por quincena"
          : (terms[0] ?? "Consultar disponibilidad")
        : custom,
      cta,
    };
    setPoolId(id);
    setReel((r) => ({
      ...r,
      contentType: rental ? "Alquiler" : "Venta",
      // Pre-select the first 4 as a starting sequence; the agent can swap
      // and reorder them below.
      photos: (p.images ?? []).slice(0, MAX_REEL_PHOTOS),
      lines: r.lines.map((l) => ({ ...l, text: text[l.id] })),
    }));
  }


  async function handleLogoFile(file: File) {
    setUploadingLogo(true);
    setError(null);
    try {
      // Logos keep transparency — upload as-is, no JPEG optimizer.
      const url = await uploadImage(file, "brand");
      setLogo({ url });
    } catch {
      setError("No se pudo subir el logo.");
    } finally {
      setUploadingLogo(false);
    }
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
      const title = reel.lines.find((l) => l.id === "title")?.text ?? "reel";
      a.download = `cortex-${slug(title)}.mp4`;
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

  if (!reelGenerator) {
    return (
      <div className="max-w-md py-8 text-sm text-foreground/55">
        <h1 className="mb-2 font-serif text-2xl font-light text-foreground">
          Módulo desactivado
        </h1>
        El generador de reels está desactivado por configuración. Un super
        admin puede reactivarlo en Configuración → Feature flags.
      </div>
    );
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        {/* --- preview column --- */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Group label="Formato">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((k) => (
                  <Chip
                    key={k}
                    active={reel.aspectRatio === k}
                    onClick={() => set("aspectRatio", k)}
                  >
                    {ASPECT_RATIOS[k].label}
                  </Chip>
                ))}
              </div>
            </Group>
            <Group label="Transición entre fotos">
              <div className="flex flex-wrap gap-2">
                {TRANSITIONS.map((t) => (
                  <Chip
                    key={t}
                    active={reel.transition === t}
                    onClick={() => set("transition", t)}
                  >
                    {TRANSITION_LABEL[t]}
                  </Chip>
                ))}
              </div>
            </Group>
          </div>

          {/* photo selection: pick exactly 4 from the property's uploads */}
          <Group
            label={`Fotos — elegí ${MAX_REEL_PHOTOS} (${reel.photos.length}/${MAX_REEL_PHOTOS})`}
          >
            {pool.length === 0 ? (
              <p className="text-sm text-foreground/40">
                Elegí una propiedad para traer sus fotos.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {pool.map((url) => {
                  const seq = reel.photos.indexOf(url);
                  const selected = seq !== -1;
                  const full = reel.photos.length >= MAX_REEL_PHOTOS;
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => togglePhoto(url)}
                      disabled={!selected && full}
                      className={`relative aspect-square overflow-hidden rounded-sm border-2 transition-colors ${
                        selected
                          ? "border-terracotta"
                          : full
                            ? "cursor-not-allowed border-transparent opacity-40"
                            : "border-transparent hover:border-foreground/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-medium text-white">
                          {seq + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Group>

          {/* sequence: reorder the chosen 4 */}
          {reel.photos.length > 0 && (
            <Group label="Secuencia del reel">
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
                      <Thumb
                        key={url}
                        url={url}
                        seq={i + 1}
                        onRemove={() =>
                          set("photos", reel.photos.filter((u) => u !== url))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <p className="mt-1 text-[11px] text-foreground/40">
                Slides 1–{MAX_REEL_PHOTOS} + slide final de marca ={" "}
                {MAX_REEL_PHOTOS + 1} en total. Arrastrá para reordenar.
              </p>
            </Group>
          )}
        </div>

        {/* --- editor panel --- */}
        <div className="flex flex-col gap-4">
          <Group label="Propiedad">
            <select
              defaultValue=""
              onChange={(e) => loadProperty(e.target.value)}
              className={field}
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
          </Group>

          <Group label="Tipo de contenido">
            <div className="flex gap-2">
              {REEL_CONTENT_TYPES.map((t) => (
                <Chip
                  key={t}
                  active={reel.contentType === t}
                  onClick={() => set("contentType", t)}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </Group>

          <ContentPresetPanel
            reel={reel}
            uid={user?.uid ?? null}
            onApply={(config) => setReel((r) => applyConfig(r, config))}
          />

          {LINE_IDS.map((id) => {
            const l = reel.lines.find((x) => x.id === id)!;
            return (
              <Section key={id} title={LINE_LABEL[id]} defaultOpen={id === "title"}>
                {(id === "specs" || id === "operation") && (
                  <p className="text-[11px] text-foreground/40">
                    Se completa sola al elegir una propiedad. Podés editar el
                    texto acá si querés.
                  </p>
                )}
                <input
                  value={l.text}
                  onChange={(e) => setLine(id, { text: e.target.value })}
                  className={field}
                  placeholder="Texto de la línea"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLine(id, { bold: !l.bold })}
                    aria-pressed={l.bold}
                    className={`h-8 w-9 rounded-sm border text-sm font-bold transition-colors ${
                      l.bold
                        ? "border-terracotta bg-terracotta/10 text-terracotta"
                        : "border-foreground/15 text-foreground/60 hover:border-foreground/30"
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setLine(id, { italic: !l.italic })}
                    aria-pressed={l.italic}
                    className={`h-8 w-9 rounded-sm border text-sm italic transition-colors ${
                      l.italic
                        ? "border-terracotta bg-terracotta/10 text-terracotta"
                        : "border-foreground/15 text-foreground/60 hover:border-foreground/30"
                    }`}
                  >
                    I
                  </button>
                </div>
                <Row2>
                  <Pick
                    label="Tipografía"
                    value={l.fontFamily}
                    options={FONT_KEYS}
                    onChange={(v) => setLine(id, { fontFamily: v })}
                  />
                  <Pick
                    label="Alineación"
                    value={l.align}
                    options={["left", "center", "right"] as const}
                    onChange={(v) => setLine(id, { align: v })}
                  />
                </Row2>
                <Slider
                  label="Tamaño"
                  value={l.fontSize}
                  min={12}
                  max={140}
                  onChange={(v) => setLine(id, { fontSize: v })}
                />
                <Row2>
                  <Slider
                    label="Posición X"
                    value={l.x}
                    min={0}
                    max={100}
                    onChange={(v) => setLine(id, { x: v })}
                  />
                  <Slider
                    label="Posición Y"
                    value={l.y}
                    min={0}
                    max={100}
                    onChange={(v) => setLine(id, { y: v })}
                  />
                </Row2>
                <Row2>
                  <Pick
                    label="Entrada"
                    value={l.enter}
                    options={ANIMATIONS}
                    onChange={(v) => setLine(id, { enter: v })}
                  />
                  <Pick
                    label="Salida"
                    value={l.exit}
                    options={ANIMATIONS}
                    onChange={(v) => setLine(id, { exit: v })}
                  />
                </Row2>
                <input
                  type="color"
                  value={/^#/.test(l.color) ? l.color : "#ffffff"}
                  onChange={(e) => setLine(id, { color: e.target.value })}
                  className="h-8 w-full rounded-sm bg-transparent"
                />
              </Section>
            );
          })}

          <Section title="Logo">
            <div className="flex gap-2">
              <input
                value={reel.logo.url ?? ""}
                onChange={(e) => setLogo({ url: e.target.value || undefined })}
                placeholder="URL, o subí un PNG/SVG"
                className={field}
              />
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1.5 text-xs text-foreground/70 hover:border-terracotta"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={logoInput}
                type="file"
                accept="image/png,image/svg+xml,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {!reel.logo.url && (
              <>
                <p className="text-[11px] text-foreground/35">
                  Sin imagen: se usa el texto de abajo (o la marca Cortex si
                  está vacío).
                </p>
                <input
                  value={reel.logo.text}
                  onChange={(e) => setLogo({ text: e.target.value })}
                  placeholder="Texto del logo, ej. Cortex"
                  className={field}
                />
                <Pick
                  label="Tipografía del logo"
                  value={reel.logo.font}
                  options={FONT_KEYS}
                  onChange={(v) => setLogo({ font: v })}
                />
              </>
            )}
            <Slider
              label="Tamaño"
              value={reel.logo.size}
              min={16}
              max={180}
              onChange={(v) => setLogo({ size: v })}
            />
            <Pick
              label="Posición"
              value={reel.logo.position}
              options={
                ["top-left", "top-right", "bottom-left", "bottom-right", "custom"] as const
              }
              onChange={(v) => setLogo({ position: v })}
            />
            {reel.logo.position === "custom" && (
              <Row2>
                <Slider label="X" value={reel.logo.x} min={0} max={100} onChange={(v) => setLogo({ x: v })} />
                <Slider label="Y" value={reel.logo.y} min={0} max={100} onChange={(v) => setLogo({ y: v })} />
              </Row2>
            )}
            <Slider
              label="Opacidad"
              value={Math.round(reel.logo.opacity * 100)}
              min={0}
              max={100}
              onChange={(v) => setLogo({ opacity: v / 100 })}
            />
            <Row2>
              <Pick label="Entrada" value={reel.logo.enter} options={ANIMATIONS} onChange={(v) => setLogo({ enter: v })} />
              <Pick label="Salida" value={reel.logo.exit} options={ANIMATIONS} onChange={(v) => setLogo({ exit: v })} />
            </Row2>
          </Section>

          {(["topOverlay", "bottomOverlay"] as const).map((edge) => {
            const o = reel[edge];
            return (
              <Section
                key={edge}
                title={edge === "topOverlay" ? "Overlay superior" : "Overlay inferior"}
              >
                <label className="flex items-center gap-2 text-xs text-foreground/70">
                  <input
                    type="checkbox"
                    checked={o.enabled}
                    onChange={(e) => setOverlay(edge, { enabled: e.target.checked })}
                  />
                  Activado
                </label>
                {o.enabled && (
                  <>
                    <Row2>
                      <Pick
                        label="Tipo"
                        value={o.kind}
                        options={["gradient", "solid"] as const}
                        onChange={(v) => setOverlay(edge, { kind: v })}
                      />
                      <div className="flex flex-col gap-1">
                        <span className={lbl}>Color</span>
                        <input
                          type="color"
                          value={/^#/.test(o.color) ? o.color : "#060a1c"}
                          onChange={(e) => setOverlay(edge, { color: e.target.value })}
                          className="h-8 w-full rounded-sm bg-transparent"
                        />
                      </div>
                    </Row2>
                    <Slider
                      label="Opacidad"
                      value={Math.round(o.opacity * 100)}
                      min={0}
                      max={100}
                      onChange={(v) => setOverlay(edge, { opacity: v / 100 })}
                    />
                    <Slider
                      label="Altura (%)"
                      value={o.size}
                      min={0}
                      max={100}
                      onChange={(v) => setOverlay(edge, { size: v })}
                    />
                  </>
                )}
              </Section>
            );
          })}

          <Section title="Film Burn (light leak)">
            <label className="flex items-center gap-2 text-xs text-foreground/70">
              <input
                type="checkbox"
                checked={reel.filmBurn.enabled}
                onChange={(e) =>
                  set("filmBurn", { ...reel.filmBurn, enabled: e.target.checked })
                }
              />
              Destello analógico cálido en cada corte
            </label>
            {reel.filmBurn.enabled && (
              <Slider
                label="Intensidad"
                value={Math.round(reel.filmBurn.intensity * 100)}
                min={0}
                max={100}
                onChange={(v) =>
                  set("filmBurn", { ...reel.filmBurn, intensity: v / 100 })
                }
              />
            )}
          </Section>

          {error && <p className="text-danger text-sm">{error}</p>}

          {!readyToRender && (
            <p className="text-[11px] text-foreground/45">
              Elegí exactamente {MAX_REEL_PHOTOS} fotos para poder exportar.
            </p>
          )}

          <button
            onClick={exportMp4}
            disabled={rendering || !readyToRender}
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
          <p className="flex items-center gap-1.5 text-[11px] text-foreground/35">
            <Film className="h-3 w-3" />
            {(durationInFrames / FPS).toFixed(1)}s · {ar.width}×{ar.height}
            {rendering && " · la primera exportación tarda"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  primitives                                                         */
/* ------------------------------------------------------------------ */

const field =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2 transition-colors";
const lbl = "text-[11px] uppercase tracking-[0.1em] text-foreground/40";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={lbl}>{label}</span>
      {children}
    </div>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-sm border border-foreground/10 [&_summary]:list-none"
    >
      <summary className="cursor-pointer select-none px-3.5 py-2.5 text-sm text-foreground/80">
        {title}
      </summary>
      <div className="flex flex-col gap-3 border-t border-foreground/10 px-3.5 py-3.5">
        {children}
      </div>
    </details>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-terracotta bg-terracotta text-white"
          : "border-foreground/15 text-foreground/60 hover:border-terracotta/60"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-[11px] text-foreground/40">
        <span className="uppercase tracking-[0.1em]">{label}</span>
        <span className="tabular-nums text-foreground/60">{Math.round(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-terracotta"
      />
    </label>
  );
}

function Pick<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={lbl}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-sm border border-foreground/15 bg-transparent px-2 py-1.5 text-xs text-foreground outline-none focus:border-terracotta"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Thumb({
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
