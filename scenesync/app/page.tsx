"use client";

import { json2csv } from "json-2-csv";

type SceneBreakdown = {
  sceneTitle: string;
  cast?: string[];
  props?: string[];
  wardrobe?: string[];
  vfx?: string[];
};

const sampleScenes: SceneBreakdown[] = [
  {
    sceneTitle: "Scene 1 - Coffee Shop Reveal",
    cast: ["MAYA", "JORDAN"],
    props: ["Laptop", "Storyboard", "Coffee Cups"],
    wardrobe: ["Red Jacket", "Denim Shirt"],
    vfx: ["Window rain enhancement"],
  },
  {
    sceneTitle: "Scene 2 - Alley Chase",
    cast: ["MAYA", "STUNT DOUBLE"],
    props: ["Flashlight", "Backpack"],
    wardrobe: ["Running Shoes"],
    vfx: ["Muzzle flash", "Neon sign cleanup"],
  },
  {
    sceneTitle: "Scene 3 - Dream Sequence",
    cast: ["MAYA"],
    props: ["Pendant"],
    wardrobe: ["Silk Robe"],
    vfx: ["Particle shimmer", "Sky replacement"],
  },
];

function sanitizeSpreadsheetValue(value: string) {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

function joinValues(values: string[], prefix = "") {
  return sanitizeSpreadsheetValue(
    values.map((value) => `${prefix}${value}`).join(", ")
  );
}

function buildExportRows(data: SceneBreakdown[]) {
  return data.map((scene) => ({
    Scene: sanitizeSpreadsheetValue(scene.sceneTitle),
    Characters: joinValues(scene.cast ?? []),
    Props: joinValues(scene.props ?? []),
    "Wardrobe/VFX": joinValues(scene.wardrobe ?? [], "Wardrobe: ").concat(
      scene.wardrobe?.length && scene.vfx?.length ? ", " : "",
      joinValues(scene.vfx ?? [], "VFX: ")
    ),
  }));
}

function BreakdownTable({ data }: { data: SceneBreakdown[] }) {
  const hasRows = data.length > 0;

  async function handleExport() {
    const exportRows = buildExportRows(data);
    const csv = await json2csv(exportRows);
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "scene-breakdown.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Scene Breakdown
          </h2>
          <p className="text-sm text-gray-600">
            Export the AI-generated breakdown to your production spreadsheet.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!hasRows}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-900">
                Scene
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-900">
                Characters
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-900">
                Props
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-900">
                Wardrobe/VFX
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((scene, index) => (
              <tr key={index} className="transition-colors hover:bg-gray-50">
                <td className="w-1/4 break-words px-4 py-4 font-medium text-blue-600">
                  {scene.sceneTitle}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {scene.cast?.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-orange-100 px-2 py-1 text-xs font-bold uppercase text-orange-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {scene.props?.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {scene.wardrobe?.map((item) => (
                      <span
                        key={item}
                        className="rounded-md border border-purple-200 px-2 py-1 text-xs text-purple-600"
                      >
                        👗 {item}
                      </span>
                    ))}
                    {scene.vfx?.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700"
                      >
                        🪄 {item}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 font-sans">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="space-y-4">
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            SceneSync
          </span>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-950">
              Turn AI scene analysis into a producer-friendly breakdown.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-gray-600">
              Review cast, props, wardrobe, and VFX requirements in one table,
              then export the results to a spreadsheet-friendly CSV.
            </p>
          </div>
        </section>

        <BreakdownTable data={sampleScenes} />
      </main>
    </div>
  );
}
