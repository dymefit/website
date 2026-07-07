// Rest-time helpers: parse coach-entered rest strings, format countdowns,
// and supply goal-appropriate defaults per program type.

// "2:30" -> 150 · "90" / "90s" -> 90 · "2 min" -> 120. null if unparseable.
export function parseRest(str) {
  const s = String(str || "").trim().toLowerCase();
  if (!s) return null;
  const mmss = s.match(/^(\d+):([0-5]?\d)$/);
  if (mmss) return parseInt(mmss[1], 10) * 60 + parseInt(mmss[2], 10);
  const min = s.match(/^(\d+(?:\.\d+)?)\s*m(in)?s?$/);
  if (min) return Math.round(parseFloat(min[1]) * 60);
  const sec = s.match(/^(\d+)\s*s(ec)?s?$/);
  if (sec) return parseInt(sec[1], 10);
  const bare = s.match(/^(\d+)$/);
  if (bare) {
    const n = parseInt(bare[1], 10);
    return n <= 10 ? n * 60 : n; // "3" means 3 min; "45" means 45 s
  }
  return null;
}

export function formatSecs(total) {
  const t = Math.max(0, Math.round(total));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Recovery appropriate to the day's goal (program type).
const TYPE_REST = {
  "Power": "3:00",
  "Strength": "2:30",
  "Hypertrophy": "1:30",
  "Weight-loss bias": "0:45",
  "Endurance": "0:45",
  "Functional": "1:00",
  "Recovery": "0:30",
  "Pool": "0:45",
};

export function defaultRestForType(type) {
  return TYPE_REST[type] || "1:30";
}
