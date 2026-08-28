"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ZONES, PROPERTY_TYPES } from "@/lib/properties";
import {
  createProperty,
  updateProperty,
  OPERATION_TYPES,
  RENTAL_TERMS,
  type AdminPropertyInput,
  type AdminPropertyStatus,
  type OperationType,
  type RentalTerm,
} from "@/lib/admin/properties";
import PropertyMediaManager from "@/components/admin/PropertyMediaManager";

const inputClass =
  "w-full bg-transparent border-b border-foreground/15 focus:border-terracotta outline-none text-foreground placeholder:text-foreground/30 text-sm py-2.5 transition-colors";

interface PropertyFormProps {
  propertyId?: string;
  initialValues?: Partial<AdminPropertyInput>;
}

export default function PropertyForm({
  propertyId,
  initialValues,
}: PropertyFormProps) {
  const router = useRouter();
  const isEditing = Boolean(propertyId);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [price, setPrice] = useState(String(initialValues?.price ?? ""));
  const [zone, setZone] = useState(initialValues?.zone ?? ZONES[0]);
  const [type, setType] = useState(initialValues?.type ?? PROPERTY_TYPES[0]);
  const [sqm, setSqm] = useState(String(initialValues?.sqm ?? ""));
  const [beds, setBeds] = useState(String(initialValues?.beds ?? ""));
  const [baths, setBaths] = useState(String(initialValues?.baths ?? ""));
  const [images, setImages] = useState<string[]>(initialValues?.images ?? []);
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [status, setStatus] = useState<AdminPropertyStatus>(
    initialValues?.status ?? "Publicada",
  );
  const [operation, setOperation] = useState<OperationType>(
    initialValues?.operation ?? "Venta",
  );
  const [rentalTerms, setRentalTerms] = useState<RentalTerm[]>(
    initialValues?.rentalTerms ?? [],
  );

  function toggleTerm(term: RentalTerm) {
    setRentalTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term],
    );
  }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: AdminPropertyInput = {
      title,
      price: Number(price) || 0,
      zone,
      type,
      operation,
      rentalTerms: operation === "Alquiler" ? rentalTerms : [],
      sqm: Number(sqm) || 0,
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      images,
      description,
      status,
    };

    try {
      if (isEditing && propertyId) {
        await updateProperty(propertyId, payload);
      } else {
        await createProperty(payload);
      }
      router.push("/admin/properties");
    } catch {
      setError("No se pudo guardar la propiedad.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Título">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Residencia Océano"
            className={inputClass}
          />
        </Field>
        <Field label="Precio (USD)">
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1200000"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Zona">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className={inputClass}
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Operación">
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as OperationType)}
            className={inputClass}
          >
            {OPERATION_TYPES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        {operation === "Alquiler" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.12em] text-foreground/40">
              Períodos de alquiler
            </span>
            <div className="flex flex-wrap gap-2">
              {RENTAL_TERMS.map((term) => {
                const on = rentalTerms.includes(term);
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => toggleTerm(term)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      on
                        ? "bg-terracotta text-white border-terracotta"
                        : "border-foreground/15 text-foreground/60 hover:border-terracotta/60"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Field label="Metros cuadrados">
          <input
            required
            type="number"
            min={0}
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
            placeholder="320"
            className={inputClass}
          />
        </Field>
        <Field label="Dormitorios">
          <input
            type="number"
            min={0}
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            placeholder="4"
            className={inputClass}
          />
        </Field>
        <Field label="Baños">
          <input
            type="number"
            min={0}
            value={baths}
            onChange={(e) => setBaths(e.target.value)}
            placeholder="3"
            className={inputClass}
          />
        </Field>
        <Field label="Estado">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AdminPropertyStatus)}
            className={inputClass}
          >
            <option value="Publicada">Publicada</option>
            <option value="Borrador">Borrador</option>
          </select>
        </Field>
      </div>

      <PropertyMediaManager
        value={images}
        onChange={setImages}
        propertyId={propertyId}
      />

      <Field label="Descripción">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Descripción editorial de la propiedad..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      {error && <p className="text-danger text-sm">{error}</p>}

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group inline-flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white text-sm px-7 py-3.5 rounded-full transition-colors w-fit"
      >
        <span>
          {submitting
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Publicar propiedad"}
        </span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </motion.button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-[0.12em] text-foreground/40">
        {label}
      </label>
      {children}
    </div>
  );
}
