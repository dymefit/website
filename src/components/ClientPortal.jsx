import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";

// local-time YYYY-MM-DD
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function prettyDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });
}

export default function ClientPortal({ user, onSignOut }) {
  const [client, setClient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [openSession, setOpenSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.getMyClient(user.email);
      setClient(me);
      if (me) {
        const today = new Date();
        const from = new Date(today); from.setDate(from.getDate() - 30);
        const to = new Date(today); to.setDate(to.getDate() + 60);
        setSessions(await api.listSessions(me.id, ymd(from), ymd(to)));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="portal">
      <header className="portal-head">
        <div className="brand"><span className="brand-mark">◆</span> ProgramLab</div>
        <div className="portal-user">
          {client?.name && <span>{client.name}</span>}
          <button className="linklike" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <main className="portal-body">
        {error && <div className="api-error">{error}</div>}
        {loading && <p className="muted-note">Loading…</p>}

        {!loading && !client && (
          <div className="empty-block">
            No client profile is linked to <strong>{user.email}</strong> yet.
            Ask your coach to add you as a client with this email address.
          </div>
        )}

        {!loading && client && !openSession && (
          <SessionList sessions={sessions} onOpen={setOpenSession} />
        )}

        {!loading && client && openSession && (
          <SessionLogger
            client={client}
            session={openSession}
            onBack={() => setOpenSession(null)}
          />
        )}
      </main>
    </div>
  );
}

function SessionList({ sessions, onOpen }) {
  if (sessions.length === 0) {
    return <div className="empty-block">No sessions scheduled yet. Check back soon.</div>;
  }
  const todayStr = ymd(new Date());
  // Shortcut: today's session, or the next upcoming one.
  const todays = sessions.filter((s) => s.date === todayStr);
  const hero = todays[0] || sessions.find((s) => s.date > todayStr);

  return (
    <>
      {hero && (
        <button className="hero-card" onClick={() => onOpen(hero)}>
          <div className="hero-kicker">
            {hero.date === todayStr ? "Today's workout" : `Next workout · ${prettyDate(hero.date)}`}
          </div>
          <div className="hero-label">{hero.days?.label ?? "Workout"}</div>
          {hero.days?.focus && <div className="hero-focus">{hero.days.focus}</div>}
          <span className="hero-cta">Start workout →</span>
        </button>
      )}

      <h2 className="portal-subtitle">All workouts</h2>
      <div className="session-list">
        {sessions.map((s) => (
          <button key={s.id} className="session-card" onClick={() => onOpen(s)}>
            <div className="session-date">
              {prettyDate(s.date)}{s.date === todayStr && <span className="today-pill">Today</span>}
            </div>
            <div className="session-label">{s.days?.label ?? "Workout"}</div>
            {s.days?.focus && <div className="session-focus">{s.days.focus}</div>}
          </button>
        ))}
      </div>
    </>
  );
}

function SessionLogger({ client, session, onBack }) {
  const [day, setDay] = useState(null);
  const [logs, setLogs] = useState({}); // exercise_id -> log row
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await api.getDay(session.day_id);
        setDay(d);
        const existing = await api.listLogsForSession(session.id);
        const map = {};
        for (const l of existing) map[l.exercise_id] = l;
        setLogs(map);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [session.id, session.day_id]);

  return (
    <>
      <button className="linklike back-link" onClick={onBack}>← All workouts</button>
      <h1 className="portal-title">
        {prettyDate(session.date)} · {day?.label ?? "Workout"}
      </h1>
      {day?.focus && <p className="sub">{day.focus}</p>}
      {error && <div className="api-error">{error}</div>}
      {loading && <p className="muted-note">Loading…</p>}

      {!loading && day && (
        <div className="log-list">
          {day.exercises.length === 0 && <p className="muted-note">No exercises in this workout.</p>}
          {day.exercises.map((ex) => (
            <ExerciseLogger
              key={ex.id}
              exercise={ex}
              client={client}
              session={session}
              existing={logs[ex.id]}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ExerciseLogger({ exercise, client, session, existing }) {
  const initialSets =
    existing?.sets?.length ? existing.sets : [{ weight: "", reps: "", rpe: "" }];
  const [sets, setSets] = useState(initialSets);
  const [note, setNote] = useState(existing?.note ?? "");
  const [status, setStatus] = useState(existing ? "saved" : "idle"); // idle|saving|saved|error

  const setField = (i, k) => (e) => {
    const next = sets.map((s, j) => (j === i ? { ...s, [k]: e.target.value } : s));
    setSets(next);
    setStatus("idle");
  };
  const addSet = () => setSets([...sets, { weight: "", reps: "", rpe: "" }]);
  const removeSet = (i) => setSets(sets.filter((_, j) => j !== i));

  async function save() {
    setStatus("saving");
    try {
      const cleanSets = sets
        .map((s) => ({ weight: s.weight.trim(), reps: s.reps.trim(), rpe: (s.rpe || "").trim() }))
        .filter((s) => s.weight || s.reps);
      await api.saveLog({
        client_id: client.id,
        session_id: session.id,
        exercise_id: exercise.id,
        date: session.date,
        sets: cleanSets,
        note: note.trim() || null,
      });
      setStatus("saved");
    } catch (e) {
      alert(e.message);
      setStatus("error");
    }
  }

  const prescription = [
    exercise.sets && `${exercise.sets} sets`,
    exercise.reps && `${exercise.reps} reps`,
    exercise.load,
    exercise.rest && `rest ${exercise.rest}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="log-card">
      <div className="log-head">
        <div>
          <h3>{exercise.name}</h3>
          {prescription && <div className="prescription">{prescription}</div>}
          {exercise.notes && <div className="ex-notes">{exercise.notes}</div>}
        </div>
        <span className={"log-status " + status}>
          {status === "saved" ? "✓ Logged" : status === "saving" ? "Saving…" : ""}
        </span>
      </div>

      <table className="set-table">
        <thead>
          <tr><th>Set</th><th>Weight</th><th>Reps</th><th>RPE</th><th></th></tr>
        </thead>
        <tbody>
          {sets.map((s, i) => (
            <tr key={i}>
              <td className="setn">{i + 1}</td>
              <td><input value={s.weight} onChange={setField(i, "weight")} placeholder={exercise.load || "—"} inputMode="decimal" /></td>
              <td><input value={s.reps} onChange={setField(i, "reps")} placeholder={exercise.reps || "—"} inputMode="numeric" /></td>
              <td><input value={s.rpe} onChange={setField(i, "rpe")} placeholder="—" inputMode="decimal" /></td>
              <td>
                {sets.length > 1 && (
                  <button className="tiny" onClick={() => removeSet(i)} title="Remove set">✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="log-actions">
        <button className="btn secondary small" onClick={addSet}>+ Set</button>
        <input className="log-note" value={note} onChange={(e) => { setNote(e.target.value); setStatus("idle"); }} placeholder="Note (optional)" />
        <button className="btn small" onClick={save} disabled={status === "saving"}>
          {status === "saved" ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
