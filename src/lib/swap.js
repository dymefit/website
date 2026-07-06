// SWAP engine: given a programmed exercise and the client's hotel checklist,
// rank same-pattern substitutes from the Exercise Library that the client can
// actually perform. "Same pattern = same training effect" — the day's goal
// (sets/reps/rest scheme) carries over to the substitute.
import { availableAtHotel } from "./hotel.js";

// Most-loadable first, so strength/hypertrophy prescriptions survive the swap.
const EQUIP_PRIORITY = ["Dumbbell", "Machine / Cable", "Kettlebell", "Band", "Bodyweight"];

// Library-equipment availability against the hotel checklist. Machine/cable
// and bodyweight entries are name-aware (a "Leg Press" sub needs the Leg
// Press machine; a "TRX Row" needs TRX).
const NAME_NEEDS = [
  [/leg press/i, "Leg Press"],
  [/chest press/i, "Chest Press"],
  [/pulldown|lat pull/i, "Lat Pull"],
  [/seated row|cable row|machine row/i, "Seated Row"],
  [/leg curl/i, "Seated Leg Curl/Knee Extension"],
  [/leg extension/i, "Seated Leg Curl/Knee Extension"],
  [/back ext/i, "Back Extension"],
  [/calf/i, "Calf Raise"],
  [/abduct|adduct/i, "Hip Abduction/Adduction"],
];

function libItemAvailable(item, hotelList) {
  const name = item.name || "";
  const has = (x) => hotelList.includes(x);

  // name-specific accessory needs regardless of equipment column
  if (/trx/i.test(name)) return has("TRX");
  if (/stability ball|swiss ball/i.test(name)) return has("Stability Ball");
  if (/med[- ]?ball|medicine ball|slam/i.test(name)) return has("Medicine Ball");

  switch (item.equipment) {
    case "Dumbbell": return has("DBs");
    case "Kettlebell": return has("KBs");
    case "Band": return has("Bands (Handles)");
    case "Bodyweight": return true;
    case "Machine / Cable": {
      for (const [re, need] of NAME_NEEDS) if (re.test(name)) return has(need) || has("Cable Column");
      return has("Cable Column"); // generic cable work
    }
    default: return false; // Barbell / Default — not hotel equipment
  }
}

// Returns ranked candidates: [{name, equipment, source}] — coach's set
// alternative first (if performable), then library same-pattern options.
export function swapCandidates(exercise, hotelList, library) {
  if (!Array.isArray(hotelList) || hotelList.length === 0) return [];
  const out = [];
  const seen = new Set();
  const push = (name, equipment, source) => {
    const key = name.toLowerCase();
    if (!name || seen.has(key) || key === (exercise.name || "").toLowerCase()) return;
    seen.add(key);
    out.push({ name, equipment, source });
  };

  // 1) coach-set alternative, if the hotel can support it
  if (exercise.alt && availableAtHotel(exercise.alt, hotelList) !== false) {
    push(exercise.alt, "Coach pick", "alt");
  }

  // 2) same-pattern library entries the hotel can support, loadable-first
  if (exercise.pattern) {
    const matches = (library || []).filter(
      (i) => i.pattern === exercise.pattern && libItemAvailable(i, hotelList)
    );
    for (const eq of EQUIP_PRIORITY) {
      for (const i of matches.filter((m) => m.equipment === eq)) {
        push(i.name, i.equipment, "library");
      }
    }
  }
  return out;
}

// Swaps to band / bodyweight / TRX work aren't load-quantifiable — carry the
// rep target and prescribe effort instead.
export function effortHint(equipment) {
  return equipment === "Band" || equipment === "Bodyweight"
    ? "No load number — hit the same reps at a hard effort (RPE 7–9)."
    : null;
}
