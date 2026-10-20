// fix-encoding.js — deterministic: try 0..4 undo layers, pick the one that
// produces real code. Skip files where nothing works.
const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

function undoOnce(s) {
  const bytes = Buffer.alloc(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    bytes[i * 2] = c & 0xff;
    bytes[i * 2 + 1] = (c >> 8) & 0xff;
  }
  return bytes.toString("utf16le");
}

function scoreCode(s) {
  // Lower score = better. We want first non-ws token to be a TS/JS starter.
  const t = s.replace(/^\uFEFF/, "").replace(/^\s+/, "");
  if (/^("use client"|'use client'|"use server"|'use server')/.test(t)) return 0;
  if (/^(import\s|export\s|const\s|let\s|var\s|function\s|interface\s|type\s|class\s|\/\/|\/\*|#!)/.test(t)) return 1;
  // fallback: fewer CJK chars = better
  let cjk = 0;
  for (let i = 0; i < Math.min(t.length, 200); i++) {
    const c = t.charCodeAt(i);
    if (c >= 0x4e00 && c <= 0x9fff) cjk++;
  }
  return 100 + cjk;
}

for (const f of walk("src")) {
  const orig = fs.readFileSync(f, "utf8");
  let best = orig;
  let bestScore = scoreCode(orig);
  let bestLayer = 0;
  let cur = orig;

  for (let layer = 1; layer <= 4; layer++) {
    cur = undoOnce(cur);
    if (cur === orig) break; // round-trip identity, stop
    const sc = scoreCode(cur);
    if (sc < bestScore) {
      best = cur;
      bestScore = sc;
      bestLayer = layer;
    }
    if (bestScore === 0) break; // perfect
  }

  if (bestScore >= 100) {
    console.log("SKIP  (no good layer found, leaving unchanged): " + f);
    continue;
  }

  const out = best.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").replace(/\u0000+$/, "");
  fs.writeFileSync(f, Buffer.from(out, "utf8"));
  console.log(
    "layer " + bestLayer + "  " + f + "  ->  " + out.slice(0, 50).replace(/\n/g, "\\n")
  );
}