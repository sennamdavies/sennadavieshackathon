"use client";

import { Clapperboard, FileText, LoaderCircle, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { analyzeSceneAction } from "@/app/actions";
import { BreakdownTable } from "@/components/breakdown-table";
import { FileUploadZone } from "@/components/file-upload-zone";
import { ProgressBar } from "@/components/progress-bar";
import { downloadBreakdownCsv } from "@/lib/export-csv";
import { parseScript } from "@/lib/parse-script";
import type { BreakdownProgress, SceneBreakdown } from "@/lib/types";

const IDLE_PROGRESS: BreakdownProgress = {
  status: "idle",
  completedScenes: 0,
  totalScenes: 0,
  percent: 0,
  message: "Upload a screenplay to begin the smart breakdown.",
};

/**
 * Builds the shared progress state for the scene-by-scene analysis loop.
 *
 * Args:
 *   completedScenes: Number of scenes already analyzed.
 *   totalScenes: Total scenes queued for analysis.
 *   currentSceneTitle: Optional title of the scene currently being processed.
 *   status: UI status value for the progress card.
 *   message: Human-readable progress message.
 *
 * Returns:
 *   A normalized progress object for the UI.
 */
function createProgressState(
  completedScenes: number,
  totalScenes: number,
  currentSceneTitle: string | undefined,
  status: BreakdownProgress["status"],
  message: string
): BreakdownProgress {
  const percent =
    totalScenes === 0 ? 0 : Math.round((completedScenes / totalScenes) * 100);

  return {
    status,
    completedScenes,
    totalScenes,
    percent,
    message,
    currentSceneTitle,
  };
}

export default function Home() {
  const activeRunIdRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rows, setRows] = useState<SceneBreakdown[]>([]);
  const [progress, setProgress] = useState<BreakdownProgress>(IDLE_PROGRESS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isBusy =
    progress.status === "parsing" || progress.status === "analyzing";
  const hasResults = rows.length > 0;

  const summaryLabel = useMemo(() => {
    if (progress.totalScenes > 0) {
      return `${progress.totalScenes} scene${
        progress.totalScenes === 1 ? "" : "s"
      } ready for analysis`;
    }

    if (selectedFile) {
      return `Selected file: ${selectedFile.name}`;
    }

    return "No screenplay loaded yet";
  }, [progress.totalScenes, selectedFile]);

  function handleFileSelected(file: File) {
    if (isBusy) {
      return;
    }

    activeRunIdRef.current += 1;
    setSelectedFile(file);
    setRows([]);
    setErrorMessage(null);
    setProgress({
      ...IDLE_PROGRESS,
      message: `Ready to analyze ${file.name}.`,
    });
  }

  async function handleAnalyzeScript() {
    if (!selectedFile) {
      return;
    }

    const runId = activeRunIdRef.current + 1;
    activeRunIdRef.current = runId;
    setRows([]);
    setErrorMessage(null);
    setProgress({
      ...IDLE_PROGRESS,
      status: "parsing",
      message: "Parsing screenplay into scenes...",
    });

    try {
      const scriptText = await selectedFile.text();
      const scenes = parseScript(scriptText);

      if (scenes.length === 0) {
        throw new Error("No scenes were detected in the uploaded script.");
      }

      setProgress(
        createProgressState(
          0,
          scenes.length,
          scenes[0]?.title,
          "analyzing",
          "Analyzing scenes with Claude..."
        )
      );

      const nextRows: SceneBreakdown[] = [];

      // Analyze scenes sequentially so the progress bar tracks a predictable,
      // production-style queue instead of racing multiple requests at once.
      for (const [index, scene] of scenes.entries()) {
        const breakdown = await analyzeSceneAction(scene);

        if (activeRunIdRef.current !== runId) {
          return;
        }

        const completedScenes = index + 1;

        nextRows.push(breakdown);
        setRows([...nextRows]);
        setProgress(
          createProgressState(
            completedScenes,
            scenes.length,
            scenes[index + 1]?.title,
            completedScenes === scenes.length ? "complete" : "analyzing",
            completedScenes === scenes.length
              ? "Smart breakdown complete."
              : "Analyzing scenes with Claude..."
          )
        );
      }
    } catch (error) {
      if (activeRunIdRef.current !== runId) {
        return;
      }

      setProgress({
        ...IDLE_PROGRESS,
        status: "error",
        message: "SceneSync could not finish the smart breakdown.",
      });
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error interrupted analysis."
      );
    }
  }

  async function handleExport() {
    if (!hasResults) {
      return;
    }

    setIsExporting(true);

    try {
      await downloadBreakdownCsv(rows);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 font-sans">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="rounded-[32px] border border-slate-200 bg-white/85 px-8 py-10 shadow-sm">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              <Clapperboard className="h-4 w-4" />
              SceneSync
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  AI-powered smart breakdowns for the invisible labor of
                  pre-production.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  Upload a script, let SceneSync split it into scenes, extract
                  production elements with Claude, and export the results to the
                  spreadsheets your team already uses.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-slate-900" />
                  <h2 className="text-lg font-semibold text-slate-950">
                    Studio-ready workflow
                  </h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <li>Parse `.txt` and `.fountain` scripts into scene objects</li>
                  <li>Track progress as each scene is analyzed individually</li>
                  <li>Review color-coded cast, props, wardrobe, and VFX tags</li>
                  <li>Download CSV output for scheduling and budgeting teams</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <FileUploadZone
              isBusy={isBusy}
              selectedFileName={selectedFile?.name}
              onFileSelected={handleFileSelected}
            />

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                    Script status
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    {summaryLabel}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeScript}
                  disabled={!selectedFile || isBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isBusy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isBusy ? "Analyzing..." : "Run Smart Breakdown"}
                </button>
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>

            {progress.status !== "idle" ? <ProgressBar progress={progress} /> : null}
          </div>

          <div className="space-y-6">
            {hasResults ? (
              <BreakdownTable
                rows={rows}
                isExporting={isExporting}
                onExport={handleExport}
              />
            ) : (
              <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm">
                <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
                  <div className="rounded-full bg-slate-100 p-4 text-slate-900">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    Your breakdown will appear here
                  </h2>
                  <p className="text-sm leading-7 text-slate-600">
                    Upload a screenplay and run the smart breakdown to generate
                    cast, props, wardrobe, and VFX tags scene by scene.
                  </p>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
