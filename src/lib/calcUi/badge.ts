// Client-side type badge.
//
// A JS twin of src/components/TypeBadge.astro. The Astro component can't be used here for two
// reasons: it's build-time only (there's no way to instantiate it from client JS), and it imports
// src/lib/data.ts, which would drag ~5.4 MB of JSON into the browser bundle.
//
// typeColors.ts and typeIcons.ts are safe to share verbatim - they have no imports of their own.
// Only the German type name has to come from the calculator's own payload instead.
import { mixColor, textColorFor, typeColor } from "../typeColors.ts";
import { typeIcon } from "../typeIcons.ts";
import { typeName } from "../calc/data.ts";

/** Same markup and inline-style recipe as TypeBadge.astro, so badges look identical site-wide. */
export function typeBadgeHtml(type: string): string {
  const color = typeColor(type);
  const ink = textColorFor(type);
  const textShadow = ink === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.45)" : "0 1px 0 rgba(255,255,255,0.35)";
  const style =
    `background:linear-gradient(155deg, ${mixColor(color, 25)}, ${mixColor(color, -35)}); ` +
    `box-shadow: 0 4px 14px -3px ${color}99, inset 0 1px 0 rgba(255,255,255,0.14); ` +
    `color: ${ink}; text-shadow: ${textShadow};`;
  return (
    `<span class="badge badge-type" style="${style}">` +
    `<svg class="badge-type-icon" viewBox="0 0 14 14" aria-hidden="true">${typeIcon(type)}</svg>` +
    `${escapeHtml(typeName(type))}</span>`
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
