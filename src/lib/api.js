import { supabase } from "./supabase";

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

export async function createClient(name, goal) {
  const { data, error } = await supabase
    .from("clients")
    .insert({ name, goal })
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

export async function createProgram(clientId, name, weeks) {
  const { data, error } = await supabase
    .from("programs")
    .insert({ client_id: clientId, name, weeks })
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
