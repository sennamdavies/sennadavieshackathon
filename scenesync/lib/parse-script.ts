import { Fountain, type FountainToken } from "fountain-js";

import type { Scene } from "./types";

const SCENE_HEADING_PATTERN =
  /^\s*(?:INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.|I\/E\.|EST\.)/i;

const CONTENT_TOKEN_TYPES = new Set([
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "lyrics",
  "centered",
  "shot",
]);

/**
 * Collapses screenplay lines into a clean scene content block.
 *
 * Args:
 *   lines: Raw lines gathered while building the current scene.
 *
 * Returns:
 *   A trimmed block of text ready for AI analysis.
 */
function normalizeSceneContent(lines: string[]): string {
  return lines
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Pushes the current in-memory scene into the parsed scene list.
 *
 * Args:
 *   scenes: Mutable list of parsed scenes.
 *   title: Active scene heading.
 *   contentLines: Accumulated scene body lines.
 */
function appendScene(
  scenes: Scene[],
  title: string,
  contentLines: string[]
): void {
  if (!title.trim()) {
    return;
  }

  const content = normalizeSceneContent(contentLines);

  scenes.push({
    id: `scene-${scenes.length + 1}`,
    title: title.trim(),
    content,
  });
}

/**
 * Parses screenplay text with `fountain-js` and converts tokens into scenes.
 *
 * Args:
 *   scriptText: Full screenplay text.
 *
 * Returns:
 *   Ordered scenes if `fountain-js` finds scene headings, otherwise an empty
 *   array so the caller can decide whether to use a fallback parser.
 */
function parseWithFountain(scriptText: string): Scene[] {
  const fountain = new Fountain();
  const parsed = fountain.parse(scriptText, true);
  const scenes: Scene[] = [];
  let activeTitle = "";
  let activeContent: string[] = [];

  for (const token of parsed.tokens ?? []) {
    const text = token.text?.trim();

    if (!text) {
      continue;
    }

    if (token.type === "scene_heading") {
      appendScene(scenes, activeTitle, activeContent);
      activeTitle = text;
      activeContent = [];
      continue;
    }

    if (!activeTitle) {
      continue;
    }

    if (shouldIncludeToken(token)) {
      activeContent.push(text);
    }
  }

  appendScene(scenes, activeTitle, activeContent);

  return scenes;
}

/**
 * Determines whether a Fountain token should become part of the scene body.
 *
 * Args:
 *   token: One parsed `fountain-js` token.
 *
 * Returns:
 *   True when the token carries useful narrative or dialogue context.
 */
function shouldIncludeToken(token: FountainToken): boolean {
  return Boolean(token.type && CONTENT_TOKEN_TYPES.has(token.type));
}

/**
 * Parses plain screenplay text by detecting scene headings with regex.
 *
 * Args:
 *   scriptText: Full screenplay text.
 *
 * Returns:
 *   Scene objects derived from common screenplay heading conventions.
 */
function parseWithRegex(scriptText: string): Scene[] {
  const scenes: Scene[] = [];
  const lines = scriptText.split(/\r?\n/);
  let activeTitle = "";
  let activeContent: string[] = [];

  for (const line of lines) {
    if (SCENE_HEADING_PATTERN.test(line)) {
      appendScene(scenes, activeTitle, activeContent);
      activeTitle = line.trim();
      activeContent = [];
      continue;
    }

    if (activeTitle) {
      activeContent.push(line);
    }
  }

  appendScene(scenes, activeTitle, activeContent);

  return scenes;
}

/**
 * Splits a screenplay into scene objects for downstream AI analysis.
 *
 * Args:
 *   scriptText: Raw `.txt` or `.fountain` screenplay content.
 *
 * Returns:
 *   Ordered scene objects containing a heading and body content.
 */
export function parseScript(scriptText: string): Scene[] {
  const normalized = scriptText.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const fountainScenes = parseWithFountain(normalized);

  if (fountainScenes.length > 0) {
    return fountainScenes;
  }

  const regexScenes = parseWithRegex(normalized);

  if (regexScenes.length > 0) {
    return regexScenes;
  }

  return [
    {
      id: "scene-1",
      title: "UNTITLED SCENE 1",
      content: normalized,
    },
  ];
}
