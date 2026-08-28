"use client";

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Upload,
  Camera,
  Trash2,
  GripVertical,
  Check,
  Loader2,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { optimizeImage } from "@/utils/imageOptimizer";
import { uploadImage, deleteImageByUrl } from "@/lib/admin/storage";

export const MAX_PHOTOS = 12;

type PhotoItem = {
  id: string;
  url: string;
  selected: boolean;
  /** Set while the file is being optimized/uploaded; `url` is a local preview. */
  pending?: boolean;
};

interface PropertyMediaManagerProps {
  /** Initial selected image URLs, in order. Treated as defaultValue. */
  value: string[];
  onChange: (next: string[]) => void;
  /** When editing, scopes uploads to properties/<id>/. */
  propertyId?: string;
  max?: number;
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function PropertyMediaManager({
  value,
  onChange,
  propertyId,
  max = MAX_PHOTOS,
}: PropertyMediaManagerProps) {
  const [items, setItems] = useState<PhotoItem[]>(() =>
    value.map((url) => ({ id: uid(), url, selected: true })),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const selectedCount = items.filter((i) => i.selected).length;
  const atCap = items.length >= max;
  const folder = propertyId ? `properties/${propertyId}` : "properties";

  /** Single place that writes items AND notifies the parent form. */
  const commit = useCallback(
    (next: PhotoItem[]) => {
      setItems(next);
      onChange(next.filter((i) => i.selected && i.url).map((i) => i.url));
    },
    [onChange],
  );

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const slots = max - items.length;
      if (slots <= 0) {
        flash(`El límite máximo es de ${max} fotografías por propiedad.`);
        return;
      }
      const accepted = files
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, slots);
      if (files.length > accepted.length) {
        flash(
          `Solo se agregaron ${accepted.length}: el límite es de ${max} fotografías por propiedad.`,
        );
      }

      const staged: PhotoItem[] = accepted.map((file) => ({
        id: uid(),
        url: URL.createObjectURL(file),
        selected: true,
        pending: true,
      }));
      // Use functional form so parallel uploads don't clobber each other.
      setItems((prev) => [...prev, ...staged]);

      await Promise.all(
        accepted.map(async (file, i) => {
          const stagedId = staged[i].id;
          try {
            const optimized = await optimizeImage(file);
            const url = await uploadImage(optimized.file, folder);
            setItems((prev) => {
              const next = prev.map((it) =>
                it.id === stagedId
                  ? { ...it, url, pending: false }
                  : it,
              );
              onChange(next.filter((it) => it.selected && it.url && !it.pending).map((it) => it.url));
              return next;
            });
          } catch (err) {
            setItems((prev) => prev.filter((it) => it.id !== stagedId));
            flash(
              err instanceof Error
                ? err.message
                : "No se pudo procesar una imagen.",
            );
          }
        }),
      );
    },
    [items.length, max, folder, flash, onChange],
  );

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      flash("Pegá una URL válida (https://…).");
      return;
    }
    if (atCap) {
      flash(`El límite máximo es de ${max} fotografías por propiedad.`);
      return;
    }
    commit([...items, { id: uid(), url, selected: true }]);
    setUrlDraft("");
  }

  function toggle(id: string) {
    commit(
      items.map((it) =>
        it.id === id ? { ...it, selected: !it.selected } : it,
      ),
    );
  }

  function remove(id: string) {
    const target = items.find((it) => it.id === id);
    if (target && !target.pending) void deleteImageByUrl(target.url);
    commit(items.filter((it) => it.id !== id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((it) => it.id === active.id);
    const to = items.findIndex((it) => it.id === over.id);
    if (from < 0 || to < 0) return;
    commit(arrayMove(items, from, to));
  }

  // Sequence number among the *selected* photos, in list order.
  const sequence = new Map<string, number>();
  let n = 0;
  for (const it of items) if (it.selected) sequence.set(it.id, ++n);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.12em] text-foreground/40">
          Fotografías
        </span>
        <span
          className={`text-xs tabular-nums ${
            selectedCount >= max ? "text-terracotta-hover" : "text-foreground/50"
          }`}
        >
          Seleccionadas: {selectedCount} / {max}
        </span>
      </div>

      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((it) => it.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((it) => (
                <PhotoCard
                  key={it.id}
                  item={it}
                  seq={sequence.get(it.id)}
                  onToggle={() => toggle(it.id)}
                  onRemove={() => remove(it.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-sm border border-dashed px-4 py-6 text-center transition-colors ${
          atCap
            ? "border-foreground/10 opacity-50"
            : "border-foreground/20 hover:border-terracotta/50"
        }`}
      >
        <p className="text-xs text-foreground/50">
          {atCap
            ? `Alcanzaste el máximo de ${max} fotografías. Eliminá una para agregar otra.`
            : "Arrastrá imágenes aquí, o"}
        </p>
        {!atCap && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-2 text-xs text-foreground/70 transition-colors hover:border-terracotta"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir fotos
            </button>
            <button
              type="button"
              onClick={() => cameraInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-2 text-xs text-foreground/70 transition-colors hover:border-terracotta"
            >
              <Camera className="h-3.5 w-3.5" />
              Cámara
            </button>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {!atCap && (
        <div className="flex items-center gap-2 border-b border-foreground/15 py-1.5 focus-within:border-terracotta">
          <Link2 className="h-3.5 w-3.5 text-foreground/40" />
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="…o pegá una URL de imagen (Unsplash)"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/30"
          />
          {urlDraft && (
            <button
              type="button"
              onClick={addUrl}
              className="text-xs text-terracotta-hover hover:text-terracotta"
            >
              Agregar
            </button>
          )}
        </div>
      )}

      {notice && (
        <p className="flex items-center gap-2 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      )}

      <p className="text-[11px] text-foreground/35">
        Las imágenes se optimizan (máx. 2048px, &lt;5&nbsp;MB) antes de subirse.
        El orden define la secuencia en la galería y en los reels.
      </p>
    </div>
  );
}

function PhotoCard({
  item,
  seq,
  onToggle,
  onRemove,
}: {
  item: PhotoItem;
  seq?: number;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative aspect-square overflow-hidden rounded-sm border ${
        item.selected ? "border-terracotta" : "border-foreground/15"
      } ${isDragging ? "z-10 opacity-80 shadow-lg" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.url}
        alt=""
        className={`h-full w-full object-cover transition-opacity ${
          item.selected ? "" : "opacity-40"
        }`}
      />

      {item.pending && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/60 text-[10px] text-cream">
          <Loader2 className="h-4 w-4 animate-spin" />
          Optimizando…
        </div>
      )}

      {/* sequence badge */}
      {item.selected && seq != null && (
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-medium tabular-nums text-white">
          {seq}
        </span>
      )}

      {/* drag handle */}
      <button
        type="button"
        className="absolute left-1/2 top-1.5 -translate-x-1/2 cursor-grab rounded bg-ink/50 p-0.5 text-cream/80 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* delete */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-cream opacity-0 transition-opacity hover:bg-danger group-hover:opacity-100"
        aria-label="Eliminar foto"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* select toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.selected}
        aria-label={item.selected ? "Quitar de la selección" : "Agregar a la selección"}
        className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full border bg-ink/60 text-white transition-colors data-[on=true]:border-terracotta data-[on=true]:bg-terracotta"
        data-on={item.selected}
      >
        {item.selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
    </div>
  );
}
