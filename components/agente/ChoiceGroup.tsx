"use client";

import { Check } from "lucide-react";

/**
 * The option list used by every profile step of the Agente widget. Single
 * mode behaves like radios, multi mode like checkboxes. Styling is tuned
 * for the dark concierge panel.
 */
export default function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
  mode = "single",
}: {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  mode?: "single" | "multi";
}) {
  function toggle(option: T) {
    if (mode === "single") {
      onChange([option]);
      return;
    }
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={selected}
            className={`group flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
              selected
                ? "border-terracotta bg-terracotta/15 text-cream"
                : "border-white/12 text-cream-soft hover:border-white/30 hover:text-cream"
            }`}
          >
            <span>{option}</span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                selected
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-white/25 group-hover:border-white/50"
              }`}
            >
              {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
