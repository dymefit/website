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
