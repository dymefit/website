import { supabase } from "./supabase";
import { bestE1RM } from "./progression";

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

// Estimated 1RM per exercise for a client, from all their logged sets.
// Returns { [exercise_id]: bestE1RM }.
export async function getClientE1RMs(clientId) {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("exercise_id, sets")
    .eq("client_id", clientId);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    const e = bestE1RM(row.sets);
    if (e != null) map[row.exercise_id] = Math.max(map[row.exercise_id] || 0, e);
  }
  return map;
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

// Duplicate a whole program (all days + exercises) for the same client.
export async function duplicateProgram(program) {
  const copy = await createProgram(program.client_id, `${program.name} (copy)`, program.weeks);
  const days = await listDays(program.id);
  for (const d of days) {
    const newDay = await createDay(copy.id, d.label, d.focus, d.position);
    for (const ex of d.exercises || []) {
      await createExercise(newDay.id, exerciseFields(ex), ex.position);
    }
  }
  return copy;
}
