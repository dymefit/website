// Hotel mode: the checklist a client fills out about their hotel gym, and
// the mapping that decides whether a programmed exercise's equipment is
// available there.

export const HOTEL_GROUPS = [
  { group: "Cardio", items: ["Bike", "Treadmill", "Elliptical"] },
  {
    group: "Free Weights",
    items: ["Bench (Flat or Adjustable)", "DBs", "KBs", "Cable Column"],
  },
  {
    group: "Machines",
    items: [
      "Leg Press",
      "Chest Press",
      "Lat Pull",
      "Seated Row",
      "Calf Raise",
      "Hip Abduction/Adduction",
      "Back Extension",
      "Seated Leg Curl/Knee Extension",
    ],
  },
];

// Equipment that travels with you / needs no gym — never flagged.
const ALWAYS_OK = new Set([
  "Bodyweight", "TRX", "Bands", "Plyo box", "Med ball", "Slam ball",
  "Stability ball", "Airex", "Ankle weights",
]);

// exercise.equipment (or machine alt) -> hotel checklist item that covers it.
const EQUIP_TO_HOTEL = {
  "Dumbbells": "DBs",
  "Kettlebell": "KBs",
  "Cable column": "Cable Column",
  "Assault Bike": "Bike",
  "Woodway Treadmill": "Treadmill",
  "Octane Lateral-X": "Elliptical",
  "Lat Pulldown": "Lat Pull",
  "Leg Press": "Leg Press",
  "Chest Press": "Chest Press",
  "Seated Row": "Seated Row",
  "Back Extension": "Back Extension",
  "Hamstring Curl": "Seated Leg Curl/Knee Extension",
  "Leg Extension": "Seated Leg Curl/Knee Extension",
};

// true  -> available at this hotel (or needs no equipment)
// false -> not available per the client's checklist
// null  -> no checklist saved (hotel mode off) — don't flag anything
export function availableAtHotel(equipment, hotelList) {
  if (!Array.isArray(hotelList) || hotelList.length === 0) return null;
  if (!equipment || ALWAYS_OK.has(equipment)) return true;
  const item = EQUIP_TO_HOTEL[equipment];
  if (!item) return false; // barbell/rack/sled-family — not hotel equipment
  return hotelList.includes(item);
}
