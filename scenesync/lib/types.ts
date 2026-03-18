/**
 * Shared screenplay scene information used across parsing, analysis, and UI.
 */
export type Scene = {
  id: string;
  title: string;
  content: string;
};

/**
 * Structured production elements returned by the AI breakdown pass.
 */
export type BreakdownCategories = {
  cast: string[];
  props: string[];
  wardrobe: string[];
  vfx: string[];
};

/**
 * Fully analyzed scene breakdown row rendered in the table and exported to CSV.
 */
export type SceneBreakdown = Scene & BreakdownCategories;

/**
 * Input payload passed from the client to the server action for one scene.
 */
export type AnalyzeSceneInput = Scene;

/**
 * Status values used to drive the upload, progress, and completion UI states.
 */
export type ProgressStatus =
  | "idle"
  | "parsing"
  | "analyzing"
  | "complete"
  | "error";

/**
 * Scene-by-scene progress metadata for the smart breakdown workflow.
 */
export type BreakdownProgress = {
  status: ProgressStatus;
  completedScenes: number;
  totalScenes: number;
  percent: number;
  message: string;
  currentSceneTitle?: string;
};
