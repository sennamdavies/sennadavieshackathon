"use server";

import { analyzeSceneWithClaude } from "@/lib/claude";
import type { AnalyzeSceneInput, SceneBreakdown } from "@/lib/types";

/**
 * Server Action that analyzes one scene and returns a typed breakdown row.
 *
 * Args:
 *   scene: Scene metadata and full scene text from the client.
 *
 * Returns:
 *   A scene row containing the original scene details plus extracted
 *   production categories.
 */
export async function analyzeSceneAction(
  scene: AnalyzeSceneInput
): Promise<SceneBreakdown> {
  const categories = await analyzeSceneWithClaude(scene);

  return {
    ...scene,
    ...categories,
  };
}
