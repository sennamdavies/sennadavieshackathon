import type { BreakdownProgress } from "@/lib/types";

type ProgressBarProps = {
  progress: BreakdownProgress;
};

/**
 * Visual progress feedback for the scene-by-scene AI breakdown pass.
 *
 * Args:
 *   progress: Current breakdown progress metadata.
 *
 * Returns:
 *   A labeled progress card with percentage and scene counters.
 */
export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Processing
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            {progress.message}
          </h3>
          {progress.currentSceneTitle ? (
            <p className="mt-1 text-sm text-slate-600">
              Current scene: {progress.currentSceneTitle}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-slate-950">
            {progress.percent}%
          </p>
          <p className="text-sm text-slate-600">
            {progress.completedScenes} of {progress.totalScenes} scenes
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
