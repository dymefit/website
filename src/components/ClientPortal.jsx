import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import { karvonenZones, estimateMaxHR } from "../lib/zones";
import { HOTEL_GROUPS, availableAtHotel } from "../lib/hotel";
import { swapCandidates, effortHint } from "../lib/swap";
import { parseRest, formatSecs } from "../lib/rest";
import { parseWork, buildPhases, clockLabel } from "../lib/workclock";
import Modal from "./Modal.jsx";

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
  const [testMax, setTestMax] = useState(false); // "log a tested max" modal
  const [hotel, setHotel] = useState(false);     // hotel-equipment modal

  // Open the members-only guide in a new tab (window opens synchronously so
  // popup blockers allow it; content streams in after the authed fetch).
  function openNutritionGuide() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write("<title>Nutrition Guide</title><p style='font-family:sans-serif;padding:24px'>Loading your guide…</p>");
    api.fetchNutritionGuide()
      .then((html) => { w.document.open(); w.document.write(html); w.document.close(); })
      .catch((e) => { w.document.open(); w.document.write(`<p style='font-family:sans-serif;padding:24px'>${e.message}</p>`); w.document.close(); });
  }

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
        <div className="brand"><span className="brand-mark">◆</span> Fitness-Elevated</div>
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
          <>
            <div className="portal-actions">
              <button className="btn secondary small" onClick={openNutritionGuide} title="Meal planning, fueling, and hydration guide">
                🥗 Nutrition Guide
              </button>
              <button
                className={"btn secondary small" + ((client.hotel_equipment || []).length ? " hotel-on" : "")}
                onClick={() => setHotel(true)}
                title="Tell us what your hotel gym has"
              >
                🏨 Hotel{(client.hotel_equipment || []).length ? ` (${client.hotel_equipment.length})` : ""}
              </button>
              <button className="btn secondary small" onClick={() => setTestMax(true)}>
                ＋ Log a tested max
              </button>
            </div>
            <SessionList sessions={sessions} onOpen={setOpenSession} />
            <TrainingZones client={client} onSaved={(c) => setClient(c)} />
          </>
        )}

        {!loading && client && openSession && (
          <SessionLogger
            client={client}
            session={openSession}
            onBack={() => setOpenSession(null)}
          />
        )}
      </main>

      {testMax && client && (
        <TestedMaxModal
          client={client}
          onClose={() => setTestMax(false)}
          onSaved={() => { setTestMax(false); }}
        />
      )}

      {hotel && client && (
        <HotelModal
          client={client}
          onClose={() => setHotel(false)}
          onSaved={(updated) => { setHotel(false); setClient(updated); }}
        />
      )}
    </div>
  );
}

// Hotel mode: check off what the hotel gym has; programming adapts to it.
function HotelModal({ client, onClose, onSaved }) {
  const [sel, setSel] = useState(() => new Set(client.hotel_equipment || []));
  const [busy, setBusy] = useState(false);

  const toggle = (item) =>
    setSel((s) => {
      const next = new Set(s);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  async function save(clear = false) {
    setBusy(true);
    try {
      const updated = await api.updateClient(client.id, {
        hotel_equipment: clear ? [] : [...sel],
      });
      onSaved(updated);
    } catch (e) {
      alert(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="🏨 Hotel gym equipment" onClose={onClose}>
      <div className="form">
        <p className="muted-note">
          Check what's available at your hotel gym. Your workouts will flag
          anything that needs a swap and point you to the alternative.
        </p>
        {HOTEL_GROUPS.map((g) => (
          <div key={g.group} className="hotel-group">
            <div className="lib-eq-name">{g.group}</div>
            <div className="hotel-items">
              {g.items.map((item) => (
                <label key={item} className={"hotel-check" + (sel.has(item) ? " on" : "")}>
                  <input
                    type="checkbox"
                    checked={sel.has(item)}
                    onChange={() => toggle(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="form-actions">
          {(client.hotel_equipment || []).length > 0 && (
            <button type="button" className="btn secondary" onClick={() => save(true)} disabled={busy}>
              Back home (clear)
            </button>
          )}
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn" onClick={() => save(false)} disabled={busy}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Karvonen HR zones — client enters age + resting HR; zones display live.
function TrainingZones({ client, onSaved }) {
  const [age, setAge] = useState(client.age ?? "");
  const [rest, setRest] = useState(client.resting_hr ?? "");
  const [status, setStatus] = useState("idle"); // idle|saving|saved

  const zones = karvonenZones(age, rest);
  const maxHR = estimateMaxHR(age);

  async function save() {
    setStatus("saving");
    try {
      const updated = await api.updateClient(client.id, {
        age: parseInt(age, 10) || null,
        resting_hr: parseInt(rest, 10) || null,
      });
      setStatus("saved");
      onSaved?.(updated);
    } catch (e) {
      alert(e.message);
      setStatus("idle");
    }
  }

  return (
    <section className="zones-card">
      <div className="zones-head">
        <h2 className="portal-subtitle">Heart-rate training zones</h2>
        <span className={"log-status " + status} role="status" aria-live="polite">{status === "saved" ? "✓ Saved" : status === "saving" ? "Saving…" : ""}</span>
      </div>
      <p className="muted-note">
        Enter your age and resting heart rate — your zones for cardio and
        metabolic days are calculated with the Karvonen method.
      </p>
      <div className="zones-inputs">
        <label className="field">
          <span>Age</span>
          <input value={age} onChange={(e) => { setAge(e.target.value); setStatus("idle"); }} inputMode="numeric" placeholder="35" />
        </label>
        <label className="field">
          <span>Resting HR (bpm)</span>
          <input value={rest} onChange={(e) => { setRest(e.target.value); setStatus("idle"); }} inputMode="numeric" placeholder="60" />
        </label>
        <label className="field">
          <span>Max HR (220 − age)</span>
          <input value={maxHR ?? "—"} disabled />
        </label>
        <button className="btn small" onClick={save} disabled={status === "saving" || !age || !rest}>
          Save
        </button>
      </div>

      {zones && (
        <table className="zones-table">
          <thead>
            <tr><th>Zone</th><th>Range (bpm)</th><th>What it's for</th></tr>
          </thead>
          <tbody>
            {zones.zones.map((z) => (
              <tr key={z.zone} className={`zrow z${z.zone}`}>
                <td className="zname">Z{z.zone} · {z.name}</td>
                <td className="zbpm">{z.low}–{z.high}</td>
                <td className="zwhy">{z.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!zones && age && rest && (
        <p className="muted-note">Check your numbers — resting HR must be below your max HR.</p>
      )}
    </section>
  );
}

// One-tap rest timer, preset to the exercise's prescribed rest. Countdown is
// timestamp-based (immune to background-tab throttling); finishing beeps,
// vibrates, and flashes so the client knows to start the next set.
// Work/interval clock: runs the TIME-based part of a prescription — interval
// rounds (30s on / 90s off), holds (planks, wall sits), ladders, and steady
// cardio blocks — with a beep/vibration on every transition.
function WorkClock({ sets, reps, restStr }) {
  const spec = parseWork(reps, sets);
  const [phases, setPhases] = useState(null); // active phase list | null
  const [idx, setIdx] = useState(0);
  const [endsAt, setEndsAt] = useState(null);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const audioRef = { current: null };

  function beep(n = 2) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioRef.current || new Ctx();
      audioRef.current = ctx;
      Array.from({ length: n }, (_, i) => i * 0.3).forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.26);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.28);
      });
    } catch { /* vibration/visual still fire */ }
    if (navigator.vibrate) navigator.vibrate(n >= 3 ? [250, 100, 250, 100, 400] : [200, 80, 200]);
  }

  useEffect(() => {
    if (!phases || endsAt == null) return;
    const tick = () => {
      const rem = Math.ceil((endsAt - Date.now()) / 1000);
      if (rem <= 0) {
        const next = idx + 1;
        if (next < phases.length) {
          beep(2);
          setIdx(next);
          setEndsAt(Date.now() + phases[next].secs * 1000);
        } else {
          beep(3);
          setPhases(null);
          setEndsAt(null);
          setDone(true);
          setTimeout(() => setDone(false), 6000);
        }
      } else {
        setLeft(rem);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phases, endsAt, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!spec) return null;

  function start() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === "suspended") audioRef.current.resume();
    } catch { /* ignore */ }
    const p = buildPhases(spec, parseRest(restStr) ?? 0);
    if (!p.length) return;
    setDone(false);
    setIdx(0);
    setPhases(p);
    setLeft(p[0].secs);
    setEndsAt(Date.now() + p[0].secs * 1000);
  }

  if (done) {
    return (
      <button type="button" className="rest-timer done" onClick={start} role="status" aria-live="assertive">
        ✅ {spec.kind === "interval" ? "Intervals complete!" : "Work complete!"}
      </button>
    );
  }
  if (phases) {
    const ph = phases[idx];
    return (
      <button
        type="button"
        className={"rest-timer running work-" + ph.cue}
        onClick={() => { setPhases(null); setEndsAt(null); }}
        aria-live="polite"
      >
        {ph.cue === "work" ? "🏃" : "😮‍💨"} {ph.label} · {formatSecs(left)}
        <span className="rest-cancel"> · tap to cancel</span>
      </button>
    );
  }
  return (
    <button type="button" className="rest-timer work-idle" onClick={start}>
      ▶ {clockLabel(spec)}
    </button>
  );
}

function RestTimer({ restStr }) {
  const preset = parseRest(restStr) ?? 90;
  const [endsAt, setEndsAt] = useState(null); // ms timestamp | null
  const [left, setLeft] = useState(preset);
  const [done, setDone] = useState(false);
  const audioRef = { current: null };

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioRef.current || new Ctx();
      audioRef.current = ctx;
      [0, 0.35, 0.7].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.28);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3);
      });
    } catch { /* audio unavailable — vibration/visual still fire */ }
    if (navigator.vibrate) navigator.vibrate([250, 100, 250, 100, 400]);
  }

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const rem = Math.ceil((endsAt - Date.now()) / 1000);
      if (rem <= 0) {
        setEndsAt(null);
        setLeft(preset);
        setDone(true);
        beep();
        setTimeout(() => setDone(false), 6000);
      } else {
        setLeft(rem);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]); // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    // unlock audio inside the user gesture so the finish beep is allowed
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === "suspended") audioRef.current.resume();
    } catch { /* ignore */ }
    setDone(false);
    setEndsAt(Date.now() + preset * 1000);
  }

  if (done) {
    return (
      <button type="button" className="rest-timer done" onClick={start} role="status" aria-live="assertive">
        ✅ Rest complete — go!
      </button>
    );
  }
  if (endsAt) {
    return (
      <button type="button" className="rest-timer running" onClick={() => { setEndsAt(null); setLeft(preset); }}>
        ⏱ {formatSecs(left)} <span className="rest-cancel">· tap to cancel</span>
      </button>
    );
  }
  return (
    <button type="button" className="rest-timer" onClick={start}>
      ⏱ Rest {formatSecs(preset)}
    </button>
  );
}

function TestedMaxModal({ client, onClose, onSaved }) {
  const [exercises, setExercises] = useState([]);
  const [exId, setExId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.listClientExercises(client.id)
      .then((l) => { setExercises(l); if (l[0]) setExId(l[0].id); })
      .catch(() => setExercises([]));
  }, [client.id]);

  async function submit(e) {
    e.preventDefault();
    if (!exId || !weight) return;
    setBusy(true);
    try {
      await api.logTestedMax({
        clientId: client.id,
        exerciseId: exId,
        weight: weight.trim(),
        reps: (reps || "1").trim(),
        date: ymd(new Date()),
      });
      setDone(true);
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Log a tested max" onClose={onClose}>
      {done ? (
        <div className="form">
          <p>✓ Saved. Your coach's projected loads will use this max.</p>
          <div className="form-actions">
            <button className="btn" onClick={onSaved}>Done</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="form">
          <p className="muted-note">
            Log a heavy set you tested (e.g. a 1–5 rep max). This seeds the
            loads your coach prescribes — even before your first session.
          </p>
          <label className="field">
            <span>Exercise</span>
            <select value={exId} onChange={(e) => setExId(e.target.value)} required>
              {exercises.length === 0 && <option value="">No exercises yet</option>}
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>Weight</span>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" placeholder="225" required />
            </label>
            <label className="field">
              <span>Reps</span>
              <input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" placeholder="1" />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={busy || !exId}>Save max</button>
          </div>
        </form>
      )}
    </Modal>
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
  const [library, setLibrary] = useState([]); // for hotel-mode swaps
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

  // Load the library only when hotel mode is on — it powers the swap picker.
  useEffect(() => {
    if ((client.hotel_equipment || []).length === 0) return;
    api.listLibrary().then(setLibrary).catch(() => setLibrary([]));
  }, [client.hotel_equipment]);

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
              library={library}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ExerciseLogger({ exercise, client, session, existing, library }) {
  const initialSets =
    existing?.sets?.length ? existing.sets : [{ weight: "", reps: "", rpe: "" }];
  const [sets, setSets] = useState(initialSets);
  const [note, setNote] = useState(existing?.note ?? "");
  const [status, setStatus] = useState(existing ? "saved" : "idle"); // idle|saving|saved|error
  // Hotel mode: flag equipment the hotel doesn't have.
  const hotelMode = (client.hotel_equipment || []).length > 0;
  const hotelOK = availableAtHotel(exercise.equipment, client.hotel_equipment);
  const [useAlt, setUseAlt] = useState(hotelOK === false && !!exercise.alt);
  // SWAP: ranked same-pattern substitutes from the library the hotel supports.
  const candidates = hotelMode
    ? swapCandidates(exercise, client.hotel_equipment, library)
    : [];
  const [swapped, setSwapped] = useState(null); // {name, equipment} | null
  const [showPicker, setShowPicker] = useState(false);
  const [autoPicked, setAutoPicked] = useState(false);

  // When flagged and substitutes exist, start on the best one automatically.
  useEffect(() => {
    if (!autoPicked && hotelOK === false && candidates.length > 0 && !swapped) {
      setSwapped(candidates[0]);
      setAutoPicked(true);
    }
  }, [hotelOK, candidates.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Tag the log with the swap so the coach sees what was actually done.
      const tag = swapped ? `[Swapped to: ${swapped.name}] ` : "";
      const noteText = note.trim().startsWith("[Swapped to:") ? note.trim() : `${tag}${note.trim()}`;
      await api.saveLog({
        client_id: client.id,
        session_id: session.id,
        exercise_id: exercise.id,
        date: session.date,
        sets: cleanSets,
        note: noteText.trim() || null,
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
          <h3>
            {swapped ? swapped.name : useAlt && exercise.alt ? exercise.alt : exercise.name}
            {swapped && <span className="swap-badge">⇄ swap</span>}
          </h3>
          {prescription && <div className="prescription">{prescription}</div>}
          {swapped && effortHint(swapped.equipment) && (
            <div className="ex-notes">{effortHint(swapped.equipment)}</div>
          )}
          {exercise.notes && <div className="ex-notes">{exercise.notes}</div>}
          {hotelOK === false && !swapped && (
            <div className="hotel-flag">
              🏨 Not at your hotel{candidates.length ? "" : " — ask your coach for a swap"}
            </div>
          )}
          {swapped && (
            <div className="hotel-flag ok">🏨 Swapped from {exercise.name} — same movement pattern</div>
          )}
          {hotelMode && candidates.length > 0 && (
            <button type="button" className="alt-toggle" onClick={() => setShowPicker((v) => !v)}>
              ⇄ Swap{swapped ? " / change" : ""} ({candidates.length} option{candidates.length > 1 ? "s" : ""})
            </button>
          )}
          {!hotelMode && exercise.alt && (
            <button type="button" className="alt-toggle" onClick={() => setUseAlt((v) => !v)}>
              {useAlt ? `↩ Back to ${exercise.name}` : `🏨 No free weights? Use ${exercise.alt}`}
            </button>
          )}
          {showPicker && (
            <div className="swap-picker">
              {swapped && (
                <button type="button" className="swap-option" onClick={() => { setSwapped(null); setShowPicker(false); }}>
                  ↩ Original: {exercise.name}
                </button>
              )}
              {candidates.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  className={"swap-option" + (swapped?.name === c.name ? " on" : "")}
                  onClick={() => { setSwapped(c); setShowPicker(false); setStatus("idle"); }}
                >
                  <span>{c.name}</span>
                  <span className="swap-eq">{c.source === "alt" ? "★ Coach pick" : c.equipment}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={"log-status " + status} role="status" aria-live="polite">
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
                  <button className="tiny" onClick={() => removeSet(i)} title="Remove set" aria-label={`Remove set ${i + 1}`}>✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="timers-row">
        <WorkClock sets={exercise.sets} reps={exercise.reps} restStr={exercise.rest} />
        <RestTimer restStr={exercise.rest} />
      </div>
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
