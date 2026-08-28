"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Check } from "lucide-react";
import {
  cachedSettings,
  subscribeSiteSettings,
  updateSiteSettings,
  LOGO_FONTS,
  DEFAULT_SITE_SETTINGS,
  type LogoFont,
  type LogoType,
  type SiteSettings,
} from "@/lib/siteSettings";
import { uploadImage } from "@/lib/admin/storage";
import { useAdminRole } from "@/lib/admin/useAdminRole";
import {
  subscribeFeatureFlags,
  updateFeatureFlags,
  FLAG_LABELS,
  DEFAULT_FLAGS,
  type FeatureFlags,
} from "@/lib/admin/featureFlags";
import SiteLogo from "@/components/SiteLogo";

const field =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";
const labelCls =
  "text-[11px] uppercase tracking-[0.12em] text-foreground/40";

export default function AdminSettingsPage() {
  const { isSuperAdmin } = useAdminRole();
  const [live, setLive] = useState<SiteSettings>(cachedSettings);
  const [form, setForm] = useState<SiteSettings>(cachedSettings);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(
    () =>
      subscribeSiteSettings((s) => {
        setLive(s);
        if (!hydrated.current) {
          setForm(s);
          hydrated.current = true;
        }
      }),
    [],
  );

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      set("logoImage", await uploadImage(file, "brand"));
      set("logoType", "image");
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
        logoType: form.logoType,
        logoImage: form.logoImage?.trim() ?? "",
        logoText: form.logoText.trim() || "Cortex",
        logoFont: form.logoFont,
        logoSize: form.logoSize,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        headingText: form.headingText.trim(),
        supportHeadingText: form.supportHeadingText.trim(),
        nosotrosText: form.nosotrosText.trim(),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("No se pudo guardar. ¿Tenés permisos suficientes?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-foreground">
          Configuración global
        </h1>
        <p className="text-foreground/50 text-sm">
          Identidad, contacto y textos del sitio público. Los cambios se
          aplican en vivo al guardar.
        </p>
      </div>

      {/* ---- Identidad y Logo ---- */}
      <section className="flex flex-col gap-5 rounded-sm border border-foreground/10 p-6">
        <h2 className="text-sm font-medium text-foreground">Identidad y logo</h2>

        <div className="flex gap-2">
          {(["text", "image"] as LogoType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("logoType", t)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                form.logoType === t
                  ? "border-terracotta bg-terracotta/10 text-terracotta"
                  : "border-foreground/15 text-foreground/60 hover:border-foreground/30"
              }`}
            >
              {t === "text" ? "Texto" : "Imagen"}
            </button>
          ))}
        </div>

        {form.logoType === "image" && (
          <div className="flex flex-col gap-2">
            <span className={labelCls}>Imagen del logo</span>
            <div className="flex gap-2">
              <input
                value={form.logoImage ?? ""}
                onChange={(e) => set("logoImage", e.target.value)}
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
            {form.logoImage && (
              <button
                type="button"
                onClick={() => set("logoImage", "")}
                className="w-fit text-xs text-foreground/40 hover:text-danger"
              >
                Quitar imagen
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className={labelCls}>Texto de la marca</span>
          <input
            value={form.logoText}
            onChange={(e) => set("logoText", e.target.value)}
            placeholder="Cortex"
            className={field}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className={labelCls}>Tipografía</span>
            <select
              value={form.logoFont}
              onChange={(e) => set("logoFont", e.target.value as LogoFont)}
              className={field}
              disabled={form.logoType === "image"}
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
              <span className="tabular-nums text-foreground/60">
                {form.logoSize}px
              </span>
            </span>
            <input
              type="range"
              min={12}
              max={40}
              value={form.logoSize}
              onChange={(e) => set("logoSize", Number(e.target.value))}
              className="accent-terracotta"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={labelCls}>Vista previa</span>
          <div className="flex flex-wrap gap-6 rounded-sm border border-foreground/10 p-4">
            <div className="rounded-sm bg-background p-3">
              <SiteLogo settings={form} variant="solid" />
            </div>
            <div className="rounded-sm bg-navy p-3">
              <SiteLogo settings={form} variant="footer" />
            </div>
          </div>
        </div>
      </section>

      {/* ---- Contacto ---- */}
      <section className="flex flex-col gap-5 rounded-sm border border-foreground/10 p-6">
        <h2 className="text-sm font-medium text-foreground">
          Información de contacto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Teléfono"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            placeholder="+598 42 00 0000"
          />
          <TextField
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            placeholder="+598 99 000 000"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(v) => set("email", v)}
            placeholder="contacto@cortex.com"
          />
          <TextField
            label="Dirección"
            value={form.address}
            onChange={(v) => set("address", v)}
            placeholder="Av. Roosevelt, Parada 5…"
          />
        </div>
      </section>

      {/* ---- Textos ---- */}
      <section className="flex flex-col gap-5 rounded-sm border border-foreground/10 p-6">
        <h2 className="text-sm font-medium text-foreground">
          Textos del sitio web
        </h2>
        <AreaField
          label="Titular principal (portada)"
          hint="Usá saltos de línea para separar las frases del titular."
          value={form.headingText}
          onChange={(v) => set("headingText", v)}
          rows={3}
        />
        <AreaField
          label="Subtítulo de la portada"
          value={form.supportHeadingText}
          onChange={(v) => set("supportHeadingText", v)}
          rows={3}
        />
        <AreaField
          label="Texto institucional (Nosotros)"
          value={form.nosotrosText}
          onChange={(v) => set("nosotrosText", v)}
          rows={5}
        />
      </section>

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

      <p className="text-xs text-foreground/35">
        En vivo ahora:{" "}
        {live.logoType === "image" && live.logoImage ? "logo imagen" : "logo texto"}{" "}
        · {live.phone}
      </p>

      {isSuperAdmin && <FeatureFlagsCard />}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelCls}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={field}
      />
    </label>
  );
}

function AreaField({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelCls}>{label}</span>
      {hint && <span className="text-[11px] text-foreground/35">{hint}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-sm border border-foreground/15 bg-transparent p-3 text-sm text-foreground outline-none transition-colors focus:border-terracotta"
      />
    </label>
  );
}

function FeatureFlagsCard() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [busy, setBusy] = useState<keyof FeatureFlags | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeFeatureFlags(setFlags), []);

  async function toggle(key: keyof FeatureFlags) {
    setBusy(key);
    setError(null);
    const next = !flags[key];
    setFlags((f) => ({ ...f, [key]: next }));
    try {
      await updateFeatureFlags({ [key]: next });
    } catch {
      setFlags((f) => ({ ...f, [key]: !next }));
      setError("No se pudo guardar el cambio.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="flex flex-col gap-5 rounded-sm border border-terracotta/25 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-foreground">
          Feature flags
          <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-terracotta">
            Super Admin
          </span>
        </h2>
        <p className="text-xs text-foreground/45">
          Activá o desactivá módulos globalmente. Los cambios se aplican en
          vivo para todo el equipo.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-foreground/10">
        {(Object.keys(FLAG_LABELS) as (keyof FeatureFlags)[]).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-foreground/80">
              {FLAG_LABELS[key]}
            </span>
            <button
              type="button"
              onClick={() => toggle(key)}
              disabled={busy === key}
              role="switch"
              aria-checked={flags[key]}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                flags[key] ? "bg-terracotta" : "bg-foreground/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  flags[key] ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-danger text-xs">{error}</p>}
    </section>
  );
}
