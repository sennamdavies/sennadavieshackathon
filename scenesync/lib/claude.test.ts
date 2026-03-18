import test from "node:test";
import assert from "node:assert/strict";

import { parseClaudeBreakdown } from "./claude.ts";

test("parseClaudeBreakdown normalizes fenced JSON into clean arrays", () => {
  const raw = `\`\`\`json
{
  "cast": [" Maya ", "Jordan"],
  "props": ["Notebook"],
  "wardrobe": ["Red Jacket"],
  "vfx": ["Rain enhancement"]
}
\`\`\``;

  const result = parseClaudeBreakdown(raw);

  assert.deepEqual(result.cast, ["Maya", "Jordan"]);
  assert.deepEqual(result.props, ["Notebook"]);
  assert.deepEqual(result.wardrobe, ["Red Jacket"]);
  assert.deepEqual(result.vfx, ["Rain enhancement"]);
});

test("parseClaudeBreakdown returns empty arrays for missing categories", () => {
  const raw = `{"cast":["Maya"]}`;

  const result = parseClaudeBreakdown(raw);

  assert.deepEqual(result.cast, ["Maya"]);
  assert.deepEqual(result.props, []);
  assert.deepEqual(result.wardrobe, []);
  assert.deepEqual(result.vfx, []);
});

test("parseClaudeBreakdown tolerates preamble text before fenced JSON", () => {
  const raw = `Here is the JSON you requested:

\`\`\`json
{
  "cast": ["Maya"],
  "props": ["Storyboard"],
  "wardrobe": [],
  "vfx": []
}
\`\`\``;

  const result = parseClaudeBreakdown(raw);

  assert.deepEqual(result.cast, ["Maya"]);
  assert.deepEqual(result.props, ["Storyboard"]);
});
