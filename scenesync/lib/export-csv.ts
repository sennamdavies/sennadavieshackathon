import { json2csv } from "json-2-csv";

import type { SceneBreakdown } from "./types";

/**
 * Prefixes spreadsheet-formula characters so CSV cells stay inert when opened
 * in Excel or similar tools.
 *
 * Args:
 *   value: Cell value to sanitize.
 *
 * Returns:
 *   A spreadsheet-safe string.
 */
function sanitizeSpreadsheetValue(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

/**
 * Joins one production category into a spreadsheet-friendly string.
 *
 * Args:
 *   values: List of category values.
 *   prefix: Optional label added to each entry.
 *
 * Returns:
 *   A comma-separated category cell value.
 */
function joinValues(values: string[], prefix = ""): string {
  return sanitizeSpreadsheetValue(
    values.map((value) => `${prefix}${value}`).join(", ")
  );
}

/**
 * Downloads the full scene breakdown as a CSV file.
 *
 * Args:
 *   rows: Scene breakdown rows to export.
 */
export async function downloadBreakdownCsv(
  rows: SceneBreakdown[]
): Promise<void> {
  const exportRows = rows.map((scene) => ({
    Scene: sanitizeSpreadsheetValue(scene.title),
    Characters: joinValues(scene.cast),
    Props: joinValues(scene.props),
    "Wardrobe/VFX": joinValues(scene.wardrobe, "Wardrobe: ").concat(
      scene.wardrobe.length && scene.vfx.length ? ", " : "",
      joinValues(scene.vfx, "VFX: ")
    ),
  }));

  const csv = await json2csv(exportRows);
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Use a temporary anchor so the browser treats the CSV as a download.
  link.href = url;
  link.download = "scene-breakdown.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
