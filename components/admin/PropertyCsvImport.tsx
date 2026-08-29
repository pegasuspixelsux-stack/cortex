"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  resolveHeaders,
  normalizeRow,
  validateRow,
  csvTemplate,
  CSV_TEMPLATE_HEADERS,
  type HeaderResolution,
  type RowResult,
  type CanonicalColumn,
} from "@/lib/admin/propertyImport";
import { importProperties, type ImportOutcome } from "@/lib/admin/importProperties";

type Stage = "idle" | "review" | "importing" | "done";

function downloadCsv(name: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PropertyCsvImport({
  onImported,
}: {
  /** Called after an import finishes so the caller can refresh its list. */
  onImported?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [headerRes, setHeaderRes] = useState<HeaderResolution | null>(null);
  const [results, setResults] = useState<RowResult[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [summary, setSummary] = useState<ImportOutcome | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const valid = useMemo(() => results.filter((r) => r.ok), [results]);
  const invalid = useMemo(() => results.filter((r) => !r.ok), [results]);
  const validLines = useMemo(() => valid.map((r) => r.line), [valid]);

  const shownColumns = useMemo<CanonicalColumn[]>(() => {
    if (!headerRes) return [];
    const present = new Set(headerRes.map.values());
    return CSV_TEMPLATE_HEADERS.filter((c) => present.has(c));
  }, [headerRes]);

  function reset() {
    setStage("idle");
    setFileName("");
    setHeaderRes(null);
    setResults([]);
    setParseError(null);
    setProgress(null);
    setSummary(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  /** Feed parsed headers + rows through the shared validation pipeline. */
  function ingest(headers: string[], rawRows: Record<string, unknown>[]) {
    const cleanHeaders = headers.map((h) => String(h ?? "").trim()).filter(Boolean);
    if (cleanHeaders.length === 0) {
      setParseError(
        "No se detectaron columnas. ¿La primera fila tiene los encabezados?",
      );
      return;
    }
    const hr = resolveHeaders(cleanHeaders);
    const rows = rawRows.filter((r) =>
      Object.values(r).some((v) => String(v ?? "").trim() !== ""),
    );
    const parsed = rows.map((raw, i) =>
      validateRow(normalizeRow(raw, hr), i + 2),
    );
    setHeaderRes(hr);
    setResults(parsed);
    setStage("review");
  }

  async function handleFile(file: File) {
    setParseError(null);
    const isExcel = /\.xlsx?$/i.test(file.name);
    const isCsv = /\.csv$/i.test(file.name);
    if (!isCsv && !isExcel) {
      setParseError("El archivo debe ser .csv, .xlsx o .xls");
      return;
    }
    setFileName(file.name);

    if (isExcel) {
      try {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        if (!sheet) {
          setParseError("El archivo no tiene hojas.");
          return;
        }
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          blankrows: false,
          defval: "",
        });
        const headers = (aoa[0] ?? []).map((h) => String(h));
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: false,
          blankrows: false,
        });
        ingest(headers, rows);
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : "No se pudo leer el Excel.",
        );
      }
      return;
    }

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (res) => ingest(res.meta.fields ?? [], res.data),
      error: (err) => setParseError(err.message),
    });
  }

  async function startImport() {
    setStage("importing");
    setProgress({ done: 0, total: valid.length });
    const outcome = await importProperties(
      valid.map((r) => r.value),
      (done, total) => setProgress({ done, total }),
    );
    setSummary(outcome);
    setStage("done");
    onImported?.();
  }

  function downloadErrors() {
    const cols = shownColumns;
    const header = [...cols, "_fila", "_errores"];
    const lines = invalid.map((r) => {
      const row = results.find((x) => x.line === r.line);
      const errs = !row || row.ok ? "" : row.errors.map((e) => `${e.field}: ${e.message}`).join(" | ");
      return [...cols.map(() => ""), String(r.line), errs];
    });
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = [header, ...lines].map((l) => l.map(esc).join(",")).join("\r\n");
    downloadCsv("propiedades-con-errores.csv", csv);
  }

  /* ---- render ---- */

  if (stage === "idle") {
    return (
      <div className="flex flex-col gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileInput.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-terracotta bg-terracotta/5"
              : "border-foreground/20 hover:border-terracotta/50"
          }`}
        >
          <Upload className="h-7 w-7 text-foreground/40" />
          <p className="text-sm text-foreground/70">
            Arrastrá un archivo{" "}
            <span className="font-medium">.csv, .xlsx o .xls</span> o hacé clic
            para elegirlo
          </p>
          <p className="text-xs text-foreground/40">
            Columnas: {CSV_TEMPLATE_HEADERS.join(", ")}
          </p>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {parseError && <p className="text-danger text-sm">{parseError}</p>}

        <button
          type="button"
          onClick={() => downloadCsv("plantilla-propiedades.csv", csvTemplate())}
          className="inline-flex w-fit items-center gap-2 text-sm text-foreground/60 hover:text-terracotta transition-colors"
        >
          <Download className="h-4 w-4" />
          Descargar plantilla de ejemplo
        </button>
      </div>
    );
  }

  if (stage === "review" && headerRes) {
    const blocked = headerRes.missingRequired.length > 0;
    const previewRows = results.slice(0, 5);
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <FileSpreadsheet className="h-4 w-4 text-foreground/40" />
          {fileName}
          <button
            onClick={reset}
            className="ml-auto text-foreground/40 hover:text-foreground"
            aria-label="Quitar archivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {blocked && (
          <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Faltan columnas obligatorias:{" "}
              <span className="font-medium">
                {headerRes.missingRequired.join(", ")}
              </span>
              . Corregí el CSV y volvé a subirlo.
            </span>
          </div>
        )}

        {headerRes.unknown.length > 0 && (
          <p className="text-xs text-foreground/45">
            Columnas ignoradas: {headerRes.unknown.join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {valid.length} válidas
          </span>
          {invalid.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-danger">
              <AlertTriangle className="h-4 w-4" />
              {invalid.length} con errores
            </span>
          )}
        </div>

        {/* Preview */}
        <div className="overflow-x-auto rounded-sm border border-foreground/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-foreground/10 text-left text-foreground/40 uppercase tracking-[0.08em]">
                <th className="px-3 py-2 font-medium">Fila</th>
                {shownColumns.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">
                    {c}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((r) => {
                return (
                  <tr key={r.line} className="border-b border-foreground/5 last:border-0">
                    <td className="px-3 py-2 text-foreground/50">{r.line}</td>
                    {shownColumns.map((c) => (
                      <td key={c} className="px-3 py-2 max-w-[180px] truncate text-foreground/80">
                        {cellValue(r, c)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {r.ok ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-danger">✕ {r.errors.length}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {results.length > 5 && (
          <p className="-mt-3 text-xs text-foreground/40">
            Mostrando 5 de {results.length} filas.
          </p>
        )}

        {/* Errors */}
        {invalid.length > 0 && (
          <div className="max-h-56 overflow-y-auto rounded-sm border border-foreground/10 divide-y divide-foreground/5">
            {invalid.map(
              (r) =>
                !r.ok && (
                  <div key={r.line} className="p-3 text-xs">
                    <span className="font-medium text-foreground/80">
                      Fila {r.line}
                    </span>
                    <ul className="mt-1 list-disc pl-4 text-danger">
                      {r.errors.map((e, i) => (
                        <li key={i}>
                          <span className="text-foreground/50">{e.field}</span> —{" "}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={blocked || valid.length === 0}
            onClick={startImport}
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-sm text-white transition-colors hover:bg-terracotta-hover disabled:opacity-50"
          >
            Importar {valid.length} propiedad{valid.length === 1 ? "" : "es"}
          </button>
          {invalid.length > 0 && (
            <button
              type="button"
              onClick={downloadErrors}
              className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-terracotta"
            >
              <Download className="h-4 w-4" />
              Descargar errores ({invalid.length})
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-sm text-foreground/50 hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (stage === "importing" && progress) {
    const pct = progress.total
      ? Math.round((progress.done / progress.total) * 100)
      : 0;
    return (
      <div className="flex flex-col gap-4 py-6">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importando… {progress.done} / {progress.total}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full bg-terracotta transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (stage === "done" && summary) {
    const failedLines = summary.failed.map((f) => ({
      line: validLines[f.index] ?? f.index + 2,
      error: f.error,
    }));
    return (
      <div className="flex flex-col gap-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-foreground">
            {summary.succeeded} propiedad{summary.succeeded === 1 ? "" : "es"}{" "}
            importada{summary.succeeded === 1 ? "" : "s"}
            {failedLines.length > 0 &&
              ` · ${failedLines.length} fallaron`}
          </span>
        </div>

        {failedLines.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-sm border border-foreground/10 divide-y divide-foreground/5 text-xs">
            {failedLines.map((f, i) => (
              <div key={i} className="p-3">
                <span className="font-medium text-foreground/80">Fila {f.line}</span>{" "}
                <span className="text-danger">— {f.error}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={reset}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/15 px-5 py-2 text-sm text-foreground/70 hover:border-terracotta"
        >
          Importar otro archivo
        </button>
      </div>
    );
  }

  return null;
}

function cellValue(r: RowResult, col: CanonicalColumn): string {
  if (r.ok) {
    const v = r.value[col as keyof typeof r.value];
    if (Array.isArray(v)) return v.join("; ");
    return v == null ? "" : String(v);
  }
  // invalid row — surface this field's error, if any
  const e = r.errors.find((x) => x.field === col);
  return e ? `⚠ ${e.message}` : "";
}
