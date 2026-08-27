"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Check } from "lucide-react";
import {
  cachedSettings,
  subscribeSiteSettings,
  updateSiteSettings,
  LOGO_FONTS,
  type LogoFont,
  type SiteSettings,
} from "@/lib/siteSettings";
import { uploadImage } from "@/lib/admin/storage";
import SiteLogo from "@/components/SiteLogo";

const field =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings);
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFont, setLogoFont] = useState<LogoFont>("sans");
  const [logoSize, setLogoSize] = useState(18);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(
    () =>
      subscribeSiteSettings((s) => {
        setSettings(s);
        if (!hydrated.current) {
          setLogoText(s.logoText);
          setLogoUrl(s.logoUrl ?? "");
          setLogoFont(s.logoFont);
          setLogoSize(s.logoSize);
          hydrated.current = true;
        }
      }),
    [],
  );

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      setLogoUrl(await uploadImage(file, "brand"));
    } catch {
      setError("No se pudo subir el logo.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSiteSettings({
        logoText: logoText.trim() || "Cortex",
        logoUrl: logoUrl.trim(),
        logoFont,
        logoSize,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No se pudo guardar. ¿Tenés permisos de editor/admin?");
    } finally {
      setSaving(false);
    }
  }

  const preview: SiteSettings = {
    logoText: logoText || "Cortex",
    logoUrl: logoUrl || undefined,
    logoFont,
    logoSize,
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Configuración
        </h1>
        <p className="text-foreground/50 text-sm">
          Ajustes del sitio público. Los cambios se aplican en vivo.
        </p>
      </div>

      <section className="flex flex-col gap-5 rounded-sm border border-foreground/10 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-foreground">Logo del sitio</h2>
          <p className="text-xs text-foreground/45">
            Usado en el header, el footer y como fallback en los reels. PNG/SVG
            con transparencia. Sin imagen se muestra la marca + el texto.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
            Imagen
          </label>
          <div className="flex gap-2">
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="URL, o subí un archivo"
              className={field}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1.5 text-xs text-foreground/70 hover:border-terracotta"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Subir
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/svg+xml,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
          {logoUrl && (
            <button
              type="button"
              onClick={() => setLogoUrl("")}
              className="w-fit text-xs text-foreground/40 hover:text-danger"
            >
              Quitar imagen
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
            Texto de la marca
          </label>
          <input
            value={logoText}
            onChange={(e) => setLogoText(e.target.value)}
            placeholder="Cortex"
            className={field}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
              Tipografía
            </label>
            <select
              value={logoFont}
              onChange={(e) => setLogoFont(e.target.value as LogoFont)}
              className={field}
              disabled={!!logoUrl}
            >
              {LOGO_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="flex justify-between text-[11px] text-foreground/40">
              <span className="uppercase tracking-[0.12em]">Tamaño</span>
              <span className="tabular-nums text-foreground/60">{logoSize}px</span>
            </span>
            <input
              type="range"
              min={12}
              max={40}
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className="accent-terracotta"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.12em] text-foreground/40">
            Vista previa
          </span>
          <div className="flex flex-wrap gap-6 rounded-sm border border-foreground/10 p-4">
            <div className="rounded-sm bg-background p-3">
              <SiteLogo settings={preview} variant="solid" />
            </div>
            <div className="rounded-sm bg-navy p-3">
              <SiteLogo settings={preview} variant="footer" />
            </div>
          </div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-sm text-white transition-colors hover:bg-terracotta-hover disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "Guardado" : "Guardar cambios"}
        </button>
      </section>

      <p className="text-xs text-foreground/35">
        En vivo ahora: {settings.logoUrl ? "imagen" : "texto"} · {settings.logoText}
      </p>
    </div>
  );
}
