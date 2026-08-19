// Shared vocabularies for programming.

export const PROGRAM_TYPES = [
  "Weight Loss",
  "Strength",
  "Hypertrophy",
  "Endurance",
  "Functional",
  "Recovery",
  "Power",
  "Pool",
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Selectable machines — common at hotel / commercial gyms. Offered as the
// "no free weights" alternative a traveling client can choose instead.
export const MACHINES = [
  "Lat Pulldown",
  "Leg Press",
  "Hamstring Curl",
  "Leg Extension",
  "Seated Row",
  "Back Extension",
  "Chest Press",
];

// Equipment library — your gym's real inventory, grouped for the picker.
export const EQUIPMENT_GROUPS = [
  {
    group: "Free weights",
    items: ["Barbell", "Dumbbells", "Kettlebell", "Hex / Trap bar", "Cable column", "Landmine", "Plate"],
  },
  {
    group: "Machines (hotel / commercial)",
    items: MACHINES,
  },
  {
    group: "Bodyweight / functional",
    items: ["Bodyweight", "TRX", "Bands", "Plyo box", "Med ball", "Slam ball", "Stability ball", "Airex", "Sled", "Run Rocket", "Ankle weights"],
  },
  {
    group: "Cardio",
    items: ["Assault Bike", "Octane Lateral-X", "Woodway Treadmill", "Stair Climber", "Battle rope"],
  },
];

// Movement-pattern taxonomy — used to relate lifts so a logged value can
// project loads onto exercises that share a pattern.
export const MOVEMENT_PATTERNS = [
  "Squat",
  "Hinge",
  "Lunge / Split",
  "Horizontal Push",
  "Vertical Push",
  "Horizontal Pull",
  "Vertical Pull",
  "Carry",
  "Rotation / Core",
  "Jump / Power",
  "Locomotion / Cardio",
  "Mobility / Recovery",
];

// Public contact address shown to clients (NOT the coach login identity).
export const CONTACT_EMAIL = "Dymefitofficial@gmail.com";
