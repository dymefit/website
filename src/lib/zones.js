// Heart-rate training zones via the Karvonen (heart-rate-reserve) method.
//   Target HR = ((MaxHR − RestingHR) × intensity) + RestingHR
// MaxHR is estimated from age (220 − age).

export const estimateMaxHR = (age) => {
  const a = parseInt(age, 10);
  return a > 0 ? 220 - a : null;
};

const ZONE_DEFS = [
  { zone: 1, name: "Recovery",  lo: 0.50, hi: 0.60, purpose: "Easy movement · warm-up / cool-down" },
  { zone: 2, name: "Endurance", lo: 0.60, hi: 0.70, purpose: "Aerobic base · conversational pace" },
  { zone: 3, name: "Tempo",     lo: 0.70, hi: 0.80, purpose: "Steady effort · comfortably hard" },
  { zone: 4, name: "Threshold", lo: 0.80, hi: 0.90, purpose: "Hard intervals · race pace" },
  { zone: 5, name: "Max",       lo: 0.90, hi: 1.00, purpose: "Short all-out efforts" },
];

// Returns { maxHR, restingHR, zones: [{zone, name, low, high, purpose}] } or null.
export function karvonenZones(age, restingHR) {
  const maxHR = estimateMaxHR(age);
  const rest = parseInt(restingHR, 10);
  if (!maxHR || !rest || rest <= 0 || rest >= maxHR) return null;
  const hrr = maxHR - rest;
  const bpm = (frac) => Math.round(hrr * frac + rest);
  return {
    maxHR,
    restingHR: rest,
    zones: ZONE_DEFS.map((z) => ({
      zone: z.zone,
      name: z.name,
      low: bpm(z.lo),
      high: bpm(z.hi),
      purpose: z.purpose,
    })),
  };
}
