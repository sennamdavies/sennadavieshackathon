import type { AnalyzeSceneInput, BreakdownCategories } from "./types";

export const SYSTEM_PROMPT =
  "Extract production elements into JSON. Categories: cast (array), props (array), wardrobe (array), vfx (array). Return ONLY JSON.";

const CLAUDE_MODEL = "claude-3-5-sonnet-latest";
const ANTHROPIC_VERSION = "2023-06-01";

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicResponse = {
  content: AnthropicTextBlock[];
};

/**
 * Normalizes one Claude category into a clean array of strings.
 *
 * Args:
 *   value: Parsed JSON value for a single category.
 *
 * Returns:
 *   A trimmed string array with empty values removed.
 */
function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
}

/**
 * Strips Markdown code fences so JSON parsing works even when the model wraps
 * the payload in a fenced code block.
 *
 * Args:
 *   raw: Raw text returned by Claude.
 *
 * Returns:
 *   The JSON payload string without surrounding code fences.
 */
function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBraceIndex = trimmed.indexOf("{");
  const lastBraceIndex = trimmed.lastIndexOf("}");

  if (firstBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    return trimmed.slice(firstBraceIndex, lastBraceIndex + 1).trim();
  }

  return trimmed;
}

/**
 * Parses and validates Claude's JSON response into the app's category shape.
 *
 * Args:
 *   raw: Raw text returned by Claude.
 *
 * Returns:
 *   Normalized production elements.
 */
export function parseClaudeBreakdown(raw: string): BreakdownCategories {
  const parsed = JSON.parse(extractJsonPayload(raw)) as Partial<
    Record<keyof BreakdownCategories, unknown>
  >;

  return {
    cast: normalizeStringArray(parsed.cast),
    props: normalizeStringArray(parsed.props),
    wardrobe: normalizeStringArray(parsed.wardrobe),
    vfx: normalizeStringArray(parsed.vfx),
  };
}

/**
 * Pulls the first text block from the Anthropic API response.
 *
 * Args:
 *   response: Parsed Anthropic API response payload.
 *
 * Returns:
 *   The text content emitted by the model.
 */
function extractTextBlock(response: AnthropicResponse): string {
  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock) {
    throw new Error("Claude did not return a text response.");
  }

  return textBlock.text;
}

/**
 * Sends one scene to Claude and returns normalized production categories.
 *
 * Args:
 *   scene: Scene title and content to analyze.
 *
 * Returns:
 *   Structured production elements for the scene.
 */
export async function analyzeSceneWithClaude(
  scene: AnalyzeSceneInput
): Promise<BreakdownCategories> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Scene Title: ${scene.title}\n\nScene Content:\n${scene.content}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as AnthropicResponse;

  return parseClaudeBreakdown(extractTextBlock(payload));
}
