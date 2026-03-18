import { Download } from "lucide-react";

import type { SceneBreakdown } from "@/lib/types";

type BreakdownTableProps = {
  rows: SceneBreakdown[];
  isExporting: boolean;
  onExport: () => void;
};

/**
 * Professional scene breakdown table with category tags and CSV export.
 *
 * Args:
 *   rows: Fully analyzed scene breakdown rows.
 *   isExporting: Whether the export action is currently running.
 *   onExport: Callback triggered when the user requests a CSV download.
 *
 * Returns:
 *   The smart breakdown results table.
 */
export function BreakdownTable({
  rows,
  isExporting,
  onExport,
}: BreakdownTableProps) {
  const hasRows = rows.length > 0;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Smart Breakdown
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Production elements by scene
          </h2>
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={!hasRows || isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Preparing CSV..." : "Download CSV"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Scene
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Cast
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Props
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Wardrobe
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                VFX
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((scene) => (
              <tr key={scene.id} className="align-top transition-colors hover:bg-slate-50">
                <td className="w-72 px-4 py-4 font-medium text-slate-900">
                  <div className="space-y-2">
                    <p>{scene.title}</p>
                    <p className="text-xs leading-5 text-slate-500">
                      {scene.content.slice(0, 160)}
                      {scene.content.length > 160 ? "..." : ""}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <TagGroup items={scene.cast} className="bg-orange-100 text-orange-700" />
                </td>
                <td className="px-4 py-4">
                  <TagGroup items={scene.props} className="bg-blue-100 text-blue-700" />
                </td>
                <td className="px-4 py-4">
                  <TagGroup
                    items={scene.wardrobe}
                    className="bg-purple-100 text-purple-700"
                  />
                </td>
                <td className="px-4 py-4">
                  <TagGroup items={scene.vfx} className="bg-green-100 text-green-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type TagGroupProps = {
  items: string[];
  className: string;
};

function TagGroup({ items, className }: TagGroupProps) {
  if (items.length === 0) {
    return <span className="text-xs text-slate-400">None identified</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
