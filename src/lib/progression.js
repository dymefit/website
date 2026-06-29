// Projection engine: estimate 1RM from logged work, then prescribe loads as
// a percentage of that 1RM, snapped to the loads the gym actually has.

// Epley estimated 1RM from a single set.
export function epley1RM(weight, reps) {
  const w = parseFloat(weight);
  const r = parseFloat(reps);
  if (!w || !r || w <= 0) return null;
  if (r <= 1) return w;
  return w * (1 + r / 30);
}

// Best estimated 1RM across an array of sets ([{weight, reps}]).
export function bestE1RM(sets) {
  let best = null;
  for (const s of sets || []) {
    const e = epley1RM(s.weight, s.reps);
    if (e != null && (best == null || e > best)) best = e;
  }
  return best;
}

// Best estimated 1RM across many log rows (each row has a .sets array).
export function e1RMFromLogs(logs) {
  let best = null;
  for (const l of logs || []) {
    const e = bestE1RM(l.sets);
    if (e != null && (best == null || e > best)) best = e;
  }
  return best;
}

// Smallest load increment available per equipment type.
const LOAD_STEP = {
  Dumbbells: 5,
  Barbell: 5,
  "Hex / Trap bar": 5,
  Plate: 5,
  Landmine: 5,
  Sled: 5,
  "Cable column": 10,
  "Med ball": 2,
  "Ankle weights": 2,
};

// Kettlebells only come in these sizes.
const KB_SET = [9, 13, 18, 25, 35, 40, 44, 52, 63, 70, 77, 85, 93];

// Round a target load to the nearest weight the gym owns.
export function roundToLoad(value, equipment) {
  if (value == null || isNaN(value) || value <= 0) return null;
  if (equipment === "Kettlebell") {
    return KB_SET.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a), KB_SET[0]);
  }
  const step = LOAD_STEP[equipment] || 5;
  return Math.round(value / step) * step;
}

// Project a working load from estimated 1RM and a target percentage.
export function projectLoad(e1RM, pct, equipment) {
  const p = parseFloat(pct);
  if (!e1RM || !p) return null;
  return roundToLoad((e1RM * p) / 100, equipment);
}

// Power work should never drop below 3 reps.
export const POWER_MIN_REPS = 3;
export const isPowerPattern = (pattern) => /power/i.test(pattern || "");

// ---- Same-pattern cross-projection ----
// Strength coefficients relative to the "reference" lift of each pattern
// (reference = 1.0). Lets a logged max on one lift seed loads for related
// lifts in the same movement pattern. Unknown lifts default to 1.0.
const COEFFICIENTS = {
  // Squat (ref: back squat)
  "back squat": 1.0, squat: 1.0, "front squat": 0.85, "hex bar squat": 1.05,
  "trap bar squat": 1.05, "goblet squat": 0.6, "leg press": 1.8,
  "split squat": 0.5, "bulgarian split squat": 0.5, "box squat": 0.95,
  // Hinge (ref: deadlift)
  deadlift: 1.0, "conventional deadlift": 1.0, "trap bar deadlift": 1.05,
  "hex bar deadlift": 1.05, "romanian deadlift": 0.8, rdl: 0.8,
  "good morning": 0.6, "hamstring curl": 0.4, "hip thrust": 1.1,
  // Horizontal push (ref: bench press)
  "bench press": 1.0, "barbell bench press": 1.0, "incline bench press": 0.85,
  "db bench press": 0.9, "dumbbell bench press": 0.9, "chest press": 0.95,
  "push up": 0.5, "pushup": 0.5,
  // Vertical push (ref: overhead press)
  "overhead press": 1.0, ohp: 1.0, "shoulder press": 1.0, "push press": 1.15,
  "db shoulder press": 0.9,
  // Horizontal pull (ref: barbell row)
  "barbell row": 1.0, "bent over row": 1.0, "seated row": 0.95, "cable row": 0.9,
  "db row": 0.55, "dumbbell row": 0.55,
  // Vertical pull (ref: lat pulldown)
  "lat pulldown": 1.0, pulldown: 1.0, "pull up": 1.1, "pullup": 1.1, "chin up": 1.1,
  // Leg extension (knee)
  "leg extension": 0.5,
};

export function coeffFor(name) {
  const key = (name || "").trim().toLowerCase();
  return COEFFICIENTS[key] ?? 1.0;
}

// Given exercises (each {id, name, pattern}) and a map of exercise_id -> e1RM,
// compute the reference 1RM per pattern (best logged lift, de-rated to the
// pattern's reference lift). { [pattern]: refE1RM }.
export function patternReferences(exercises, e1rmById) {
  const refs = {};
  for (const ex of exercises || []) {
    const e1 = e1rmById[ex.id];
    if (!e1 || !ex.pattern) continue;
    const ref = e1 / coeffFor(ex.name);
    refs[ex.pattern] = Math.max(refs[ex.pattern] || 0, ref);
  }
  return refs;
}
