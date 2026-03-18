import test from "node:test";
import assert from "node:assert/strict";

import { parseScript } from "./parse-script.ts";

test("parseScript returns fountain scenes with headings and scene content", () => {
  const script = `INT. COFFEE SHOP - DAY
Maya sits alone with a notebook.

MAYA
I think this is the opening.

EXT. CITY STREET - NIGHT
Cars hiss by in the rain.

JORDAN
Then let's make it cinematic.`;

  const scenes = parseScript(script);

  assert.equal(scenes.length, 2);
  assert.equal(scenes[0]?.title, "INT. COFFEE SHOP - DAY");
  assert.match(scenes[0]?.content ?? "", /Maya sits alone/);
  assert.match(scenes[1]?.content ?? "", /Cars hiss by/);
});

test("parseScript falls back to a single untitled scene when no heading exists", () => {
  const script = `A projector flickers to life.
Maya flips through research notes.`;

  const scenes = parseScript(script);

  assert.equal(scenes.length, 1);
  assert.equal(scenes[0]?.title, "UNTITLED SCENE 1");
  assert.match(scenes[0]?.content ?? "", /projector flickers/i);
});
