// Work/interval clock: reads a prescription's TIME-based work and turns it
// into a sequence of timed phases (work / off / rest) the client can run
// with one tap. Rep-based work returns null (the rest timer covers those).

const toSecs = (n, unit) => {
  const v = parseInt(n, 10);
  return /m/.test(unit || "") ? v * 60 : v;
};

// parseWork(reps, sets) -> spec | null
//   {kind:'interval', on, off, rounds}   "8x30/90" · "6x1min on/1min easy" · sets=8 reps="30/90"
//   {kind:'ladder', steps:[30,45,60]}    "(30/45/60s)"
//   {kind:'hold', secs}                  "45s" · "30s/side" · "20-30s"
//   {kind:'elapsed', secs}               "20min" · "15-20min" · "3min"
export function parseWork(reps, sets) {
  const r = String(reps || "").trim().toLowerCase();
  if (!r || /yd|yard|amrap/.test(r)) return null;

  // "8x30/90" or "10×45/75" (explicit rounds)
  let m = r.match(/^(\d+)\s*[x×]\s*(\d+)\s*(min|m|s)?\s*(?:on)?\s*\/\s*(\d+)\s*(min|m|s)?/);
  if (m) return { kind: "interval", rounds: +m[1], on: toSecs(m[2], m[3]), off: toSecs(m[4], m[5]) };

  // "30/90" with rounds in the sets column
  m = r.match(/^(\d+)\s*(min|m|s)?\s*\/\s*(\d+)\s*(min|m|s)?$/);
  if (m) {
    const rounds = parseInt(sets, 10) || 1;
    return { kind: "interval", rounds, on: toSecs(m[1], m[2]), off: toSecs(m[3], m[4]) };
  }

  // ladder "(30/45/60s)" possibly with surrounding text
  m = r.match(/\((\d+(?:\/\d+)+)s?\)/);
  if (m) return { kind: "ladder", steps: m[1].split("/").map(Number) };

  // elapsed "20min" / "15-20min" / "20 min"
  m = r.match(/^(\d+)(?:\s*-\s*\d+)?\s*min/);
  if (m) return { kind: "elapsed", secs: +m[1] * 60 };

  // hold "45s" / "30s/side" / "20-30s" / "40s/sd" / "30s/lg"
  m = r.match(/^(\d+)(?:\s*-\s*(\d+))?\s*s(?:ec)?s?\b/);
  if (m) return { kind: "hold", secs: +(m[2] || m[1]) };

  return null;
}

// Expand a spec into runnable phases: [{label, secs, cue}]
// restSecs weaves the exercise's rest between holds/ladder steps.
export function buildPhases(spec, restSecs) {
  const rest = restSecs || 0;
  const p = [];
  if (spec.kind === "interval") {
    for (let i = 1; i <= spec.rounds; i++) {
      p.push({ label: `Round ${i}/${spec.rounds} — GO`, secs: spec.on, cue: "work" });
      if (i < spec.rounds) p.push({ label: `Round ${i}/${spec.rounds} — easy`, secs: spec.off, cue: "off" });
    }
  } else if (spec.kind === "ladder") {
    spec.steps.forEach((s, i) => {
      p.push({ label: `Step ${i + 1}/${spec.steps.length} — hold`, secs: s, cue: "work" });
      if (i < spec.steps.length - 1 && rest > 0) p.push({ label: "Rest", secs: rest, cue: "off" });
    });
  } else if (spec.kind === "hold") {
    p.push({ label: "Work — hold", secs: spec.secs, cue: "work" });
    if (rest > 0) p.push({ label: "Rest", secs: rest, cue: "off" });
  } else if (spec.kind === "elapsed") {
    const half = Math.floor(spec.secs / 2);
    p.push({ label: "First half", secs: half, cue: "work" });
    p.push({ label: "Second half", secs: spec.secs - half, cue: "work" });
  }
  return p;
}

// Idle-button label for the clock.
export function clockLabel(spec) {
  const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  switch (spec.kind) {
    case "interval": return `Interval ${spec.rounds}×${spec.on}s/${spec.off}s`;
    case "ladder": return `Ladder ${spec.steps.join("/")}s`;
    case "hold": return `Work ${mmss(spec.secs)}`;
    case "elapsed": return `Clock ${mmss(spec.secs)}`;
    default: return "Start";
  }
}
