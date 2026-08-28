"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";
import type { SiteSettings } from "@/lib/siteSettings";

/** Renders one editable copy field from global site settings. Lets server
 *  components (which can't use the hook) still show live-editable text. */
export default function SiteText({
  field,
  as: Tag = "p",
  className,
}: {
  field: keyof SiteSettings;
  as?: "p" | "span" | "h1" | "h2";
  className?: string;
}) {
  const settings = useSiteSettings();
  const value = settings[field];
  return (
    <Tag className={className} style={{ whiteSpace: "pre-line" }}>
      {typeof value === "string" ? value : ""}
    </Tag>
  );
}
