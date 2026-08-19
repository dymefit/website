import { supabase } from "./supabase";
import { bestE1RM, patternReferences } from "./progression";

// All tables carry a coach_id with a DB default of auth.uid(), and RLS
// restricts rows to the owning coach — so the client never sends coach_id.

// ---------- Clients ----------
export async function listClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createClient(fields) {
  const { data, error } = await supabase
    .from("clients")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id, fields) {
  const { data, error } = await supabase
    .from("clients").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id) {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Programs ----------
export async function listPrograms(clientId) {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProgram(clientId, fields) {
  const { data, error } = await supabase
    .from("programs")
    .insert({ client_id: clientId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProgram(id, fields) {
  const { data, error } = await supabase
    .from("programs").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProgram(id) {
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Days (+ nested exercises) ----------
export async function listDays(programId) {
  const { data, error } = await supabase
    .from("days")
    .select("*, exercises(*)")
    .eq("program_id", programId)
    .order("position", { ascending: true });
  if (error) throw error;
  // sort nested exercises by position
  return (data || []).map((d) => ({
    ...d,
    exercises: (d.exercises || []).sort((a, b) => a.position - b.position),
  }));
}

export async function createDay(programId, label, focus, position) {
  const { data, error } = await supabase
    .from("days")
    .insert({ program_id: programId, label, focus, position })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDay(id, fields) {
  const { data, error } = await supabase
    .from("days").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDay(id) {
  const { error } = await supabase.from("days").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Exercises ----------
export async function createExercise(dayId, fields, position) {
  const { data, error } = await supabase
    .from("exercises")
    .insert({ day_id: dayId, position, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExercise(id, fields) {
  const { data, error } = await supabase
    .from("exercises").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteExercise(id) {
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Sessions (calendar scheduling) ----------
// A session assigns a program day to a specific date for a client.
export async function listSessions(clientId, fromISO, toISO) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, days(label, focus, program_id)")
    .eq("client_id", clientId)
    .gte("date", fromISO)
    .lte("date", toISO)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createSession(clientId, dayId, date) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ client_id: clientId, day_id: dayId, date })
    .select("*, days(label, focus, program_id)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Client portal + workout logs ----------
// Find the logged-in client's record by their email (set by the coach).
export async function getMyClient(email) {
  const { data, error } = await supabase
    .from("clients").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return data;
}

// A single day with its exercises (for logging a scheduled session).
export async function getDay(dayId) {
  const { data, error } = await supabase
    .from("days").select("*, exercises(*)").eq("id", dayId).single();
  if (error) throw error;
  data.exercises = (data.exercises || []).sort((a, b) => a.position - b.position);
  return data;
}

export async function listLogsForSession(sessionId) {
  const { data, error } = await supabase
    .from("workout_logs").select("*").eq("session_id", sessionId);
  if (error) throw error;
  return data;
}

// Upsert one exercise's log for a session (one row per session+exercise).
export async function saveLog(entry) {
  const { data, error } = await supabase
    .from("workout_logs")
    .upsert(entry, { onConflict: "session_id,exercise_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// A client's logged maxes across ALL programs. Returns:
//   { byId: { exercise_id: e1RM }, patternRefs: { pattern: referenceE1RM } }
// patternRefs lets a max on one lift seed loads for related same-pattern lifts.
export async function getClientMaxes(clientId) {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("exercise_id, sets, exercises(name, pattern)")
    .eq("client_id", clientId);
  if (error) throw error;
  const byId = {};
  const meta = {};
  for (const row of data || []) {
    const e = bestE1RM(row.sets);
    if (e == null) continue;
    if (!byId[row.exercise_id] || e > byId[row.exercise_id]) byId[row.exercise_id] = e;
    meta[row.exercise_id] = row.exercises || {};
  }
  const exList = Object.keys(byId).map((id) => ({
    id, name: meta[id]?.name, pattern: meta[id]?.pattern,
  }));
  return { byId, patternRefs: patternReferences(exList, byId) };
}

// All exercises across a client's programs (deduped by name) — for the
// "log a tested max" picker.
export async function listClientExercises(clientId) {
  const programs = await listPrograms(clientId);
  const seen = new Set();
  const out = [];
  for (const p of programs) {
    const days = await listDays(p.id);
    for (const d of days) {
      for (const ex of d.exercises) {
        const key = (ex.name || "").toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          out.push({ id: ex.id, name: ex.name, pattern: ex.pattern, equipment: ex.equipment });
        }
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// Record a tested max (outside a scheduled session) so projections can start.
export async function logTestedMax({ clientId, exerciseId, weight, reps, date }) {
  const { error } = await supabase.from("workout_logs").insert({
    client_id: clientId,
    exercise_id: exerciseId,
    session_id: null,
    date,
    sets: [{ weight: String(weight), reps: String(reps), rpe: "" }],
    note: "Tested max",
  });
  if (error) throw error;
}

// Coach: read a client's logged workouts (with exercise + session context).
export async function listClientLogs(clientId) {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*, exercises(name, sets, reps, load), sessions(date, days(label))")
    .eq("client_id", clientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

// Notify a client by email that a workout was scheduled (fire-and-forget).
// Calls the Netlify Function, which no-ops if email isn't configured.
export async function notifySessionScheduled(payload) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;
    await fetch("/api/notify-session", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    /* non-blocking: scheduling must succeed even if email fails */
  }
}

// Members-only nutrition guide, served by an authenticated function.
export async function fetchNutritionGuide() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Sign in required");
  const res = await fetch("/api/nutrition-guide", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Couldn't load the guide");
  return res.text();
}

// ---------- Exercise library ----------
export async function listLibrary() {
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .order("category").order("pattern").order("equipment").order("name");
  if (error) throw error;
  return data;
}

export async function addLibraryItem({ category, pattern, equipment, name }) {
  const { data, error } = await supabase
    .from("exercise_library")
    .insert({ category, pattern, equipment, name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLibraryItem(id) {
  const { error } = await supabase.from("exercise_library").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Duplication helpers ----------
const exerciseFields = (ex) => ({
  name: ex.name, sets: ex.sets, reps: ex.reps, load: ex.load,
  rest: ex.rest, notes: ex.notes, progressions: ex.progressions ?? {},
});

// Duplicate a single day (with its exercises) into the same program.
// `day` is a loaded day object from listDays (includes program_id + exercises).
export async function duplicateDay(day, position) {
  const copy = await createDay(day.program_id, `${day.label} (copy)`, day.focus, position);
  for (const ex of day.exercises || []) {
    await createExercise(copy.id, exerciseFields(ex), ex.position);
  }
  return copy;
}

// Duplicate a whole program (all days + exercises) — to the same client by
// default, or to another client (template → real golfer) via targetClientId.
export async function duplicateProgram(program, targetClientId) {
  const dest = targetClientId || program.client_id;
  const suffix = dest === program.client_id ? " (copy)" : "";
  const copy = await createProgram(dest, {
    name: `${program.name}${suffix}`,
    weeks: program.weeks,
    type: program.type ?? null,
    level: program.level ?? null,
    week_notes: program.week_notes ?? {},
  });
  const days = await listDays(program.id);
  for (const d of days) {
    const newDay = await createDay(copy.id, d.label, d.focus, d.position);
    for (const ex of d.exercises || []) {
      await createExercise(newDay.id, exerciseFields(ex), ex.position);
    }
  }
  return copy;
}

// ---------- Enrollment agreement / waiver (e-signed) ----------
export async function getMyEnrollment() {
  const { data, error } = await supabase
    .from("enrollment_forms")
    .select("id, full_name, signed_at, doc_version, is_minor")
    .order("signed_at", { ascending: false })
    .limit(1);
  if (error) {
    // Table not migrated yet → don't gate the portal (nothing could be signed yet).
    if (/enrollment_forms/.test(error.message)) return { pending_setup: true };
    throw error;
  }
  return data?.[0] ?? null;
}

export async function getEnrollmentForEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from("enrollment_forms")
    .select("*")
    .ilike("email", email)
    .order("signed_at", { ascending: false })
    .limit(1);
  if (error) {
    if (/enrollment_forms/.test(error.message)) return null;
    throw error;
  }
  return data?.[0] ?? null;
}

export async function signEnrollment(payload) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch("/api/sign-enrollment", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Could not record signature.");
  return body;
}
