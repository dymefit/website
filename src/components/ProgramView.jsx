import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";

export default function ProgramView({ client, program, onProgramsChanged, onSelectProgram }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayModal, setDayModal] = useState(null); // {mode:'add'|'edit', day?}
  const [exModal, setExModal] = useState(null);    // {dayId, exercise?}
  const [week, setWeek] = useState(1);
  const [busy, setBusy] = useState(false);
  const [weekNotes, setWeekNotes] = useState({});
  const [noteDraft, setNoteDraft] = useState("");

  const refresh = useCallback(async () => {
    if (!program) { setDays([]); return; }
    setLoading(true);
    try {
      setDays(await api.listDays(program.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    setWeek(1);
    setWeekNotes(program?.week_notes || {});
  }, [program?.id]);
  // keep the editable draft in sync with the selected week
  useEffect(() => {
    setNoteDraft(weekNotes?.[String(week)] || "");
  }, [week, weekNotes]);

  if (!program) {
    return (
      <div className="placeholder">
        <div>
          <div className="big">📋</div>
          <p>Select a client and program to view it here.</p>
        </div>
      </div>
    );
  }

  const weeks = program.weeks || 1;

  // Effective value for an exercise field in the selected week.
  const override = (ex) => ex.progressions?.[String(week)] || {};
  const eff = (ex, k) => {
    const o = override(ex);
    return o[k] ?? ex[k] ?? "";
  };
  const isProgressed = (ex) => Object.keys(override(ex)).length > 0;

  async function deleteDay(day) {
    if (!confirm(`Delete "${day.label}" and its exercises?`)) return;
    await api.deleteDay(day.id);
    refresh();
  }
  async function deleteExercise(ex) {
    if (!confirm(`Remove "${ex.name}"?`)) return;
    await api.deleteExercise(ex.id);
    refresh();
  }
  async function moveExercise(day, index, dir) {
    const arr = day.exercises;
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    const a = arr[index], b = arr[j];
    await Promise.all([
      api.updateExercise(a.id, { position: b.position }),
      api.updateExercise(b.id, { position: a.position }),
    ]);
    refresh();
  }
  async function moveDay(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= days.length) return;
    const a = days[index], b = days[j];
    await Promise.all([
      api.updateDay(a.id, { position: b.position }),
      api.updateDay(b.id, { position: a.position }),
    ]);
    refresh();
  }
  async function saveWeekNote() {
    const next = { ...weekNotes };
    if (noteDraft.trim()) next[String(week)] = noteDraft.trim();
    else delete next[String(week)];
    setWeekNotes(next);
    try { await api.updateProgram(program.id, { week_notes: next }); }
    catch (e) { alert(e.message); }
  }
  async function dupDay(day) {
    setBusy(true);
    try { await api.duplicateDay(day, days.length); await refresh(); }
    catch (e) { alert(e.message); }
    finally { setBusy(false); }
  }
  async function dupProgram() {
    setBusy(true);
    try {
      const copy = await api.duplicateProgram(program);
      const list = await onProgramsChanged?.();
      const fresh = (list || []).find((p) => p.id === copy.id) || copy;
      onSelectProgram?.(fresh);
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1>{program.name}</h1>
          <div className="sub">
            {client?.name} · {weeks}-week block · {days.length} training days
          </div>
        </div>
        <div className="row-actions">
          {weeks > 1 && (
            <label className="week-select">
              Week
              <select value={week} onChange={(e) => setWeek(Number(e.target.value))}>
                {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </label>
          )}
          <button className="btn secondary" onClick={() => window.print()} title="Print or save as PDF">
            Print
          </button>
          <button className="btn secondary" onClick={dupProgram} disabled={busy} title="Duplicate this whole program">
            Duplicate
          </button>
          <button className="btn" onClick={() => setDayModal({ mode: "add" })}>+ Add Day</button>
        </div>
      </div>

      {/* Per-week note (shown for the selected week) */}
      <div className="week-note">
        <label className="detail-label" htmlFor="weeknote">
          Week {week} note
        </label>
        <textarea
          id="weeknote"
          rows="2"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={saveWeekNote}
          placeholder={`Notes for week ${week} (e.g. deload, test maxes)…`}
        />
      </div>

      {loading && <div className="muted-note">Loading…</div>}
      {!loading && days.length === 0 && (
        <div className="empty-block">
          No training days yet. Click <strong>+ Add Day</strong> to start building.
        </div>
      )}

      <div className="day-grid">
        {days.map((d, di) => (
          <div className="day-card" key={d.id}>
            <div className="day-card-head">
              <div>
                <h3>{d.label}</h3>
                {d.focus && <span className="focus">{d.focus}</span>}
              </div>
              <div className="row-actions">
                <span className="day-reorder">
                  <button className="mini-btn" disabled={di === 0} onClick={() => moveDay(di, -1)} title="Move day up">↑</button>
                  <button className="mini-btn" disabled={di === days.length - 1} onClick={() => moveDay(di, 1)} title="Move day down">↓</button>
                </span>
                <button className="mini-btn" onClick={() => setDayModal({ mode: "edit", day: d })}>Edit</button>
                <button className="mini-btn" onClick={() => dupDay(d)} disabled={busy}>Duplicate</button>
                <button className="mini-btn danger" onClick={() => deleteDay(d)}>Delete</button>
              </div>
            </div>

            <table className="exercises">
              <thead>
                <tr>
                  <th style={{ width: "32px" }}></th>
                  <th>Exercise</th>
                  <th>Sets</th><th>Reps</th><th>Load</th><th>Rest</th>
                  <th style={{ width: "110px" }}></th>
                </tr>
              </thead>
              <tbody>
                {d.exercises.length === 0 && (
                  <tr><td colSpan="7" className="muted-note">No exercises yet.</td></tr>
                )}
                {d.exercises.map((ex, i) => (
                  <tr key={ex.id} className={isProgressed(ex) ? "progressed" : ""}>
                    <td className="reorder">
                      <button className="tiny" disabled={i === 0} onClick={() => moveExercise(d, i, -1)}>▲</button>
                      <button className="tiny" disabled={i === d.exercises.length - 1} onClick={() => moveExercise(d, i, 1)}>▼</button>
                    </td>
                    <td className="name">
                      {ex.name}
                      {isProgressed(ex) && <span className="wk-badge" title={`Adjusted for week ${week}`}>W{week}</span>}
                      {ex.notes && <div className="ex-notes">{ex.notes}</div>}
                    </td>
                    <td>{eff(ex, "sets")}</td>
                    <td>{eff(ex, "reps")}</td>
                    <td>{eff(ex, "load")}</td>
                    <td>{eff(ex, "rest")}</td>
                    <td className="row-actions">
                      <button className="mini-btn" onClick={() => setExModal({ dayId: d.id, exercise: ex })}>Edit</button>
                      <button className="mini-btn danger" onClick={() => deleteExercise(ex)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="day-card-foot">
              <button className="btn secondary small" onClick={() => setExModal({ dayId: d.id })}>
                + Add exercise
              </button>
            </div>
          </div>
        ))}
      </div>

      {dayModal && (
        <DayForm
          programId={program.id}
          mode={dayModal.mode}
          day={dayModal.day}
          position={days.length}
          onClose={() => setDayModal(null)}
          onSaved={() => { setDayModal(null); refresh(); }}
        />
      )}

      {exModal && (
        <ExerciseForm
          dayId={exModal.dayId}
          exercise={exModal.exercise}
          weeks={weeks}
          position={days.find((d) => d.id === exModal.dayId)?.exercises.length ?? 0}
          onClose={() => setExModal(null)}
          onSaved={() => { setExModal(null); refresh(); }}
        />
      )}
    </>
  );
}

function DayForm({ programId, mode, day, position, onClose, onSaved }) {
  const [label, setLabel] = useState(day?.label ?? "");
  const [focus, setFocus] = useState(day?.focus ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setBusy(true);
    try {
      if (mode === "edit") await api.updateDay(day.id, { label: label.trim(), focus: focus.trim() });
      else await api.createDay(programId, label.trim(), focus.trim(), position);
      onSaved();
    } catch (err) { alert(err.message); setBusy(false); }
  }

  return (
    <Modal title={mode === "edit" ? "Edit day" : "New training day"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} autoFocus required placeholder="e.g. Day A" />
        </label>
        <label className="field">
          <span>Focus</span>
          <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Lower / Push" />
        </label>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Save</button>
        </div>
      </form>
    </Modal>
  );
}

function ExerciseForm({ dayId, exercise, weeks, position, onClose, onSaved }) {
  const [f, setF] = useState({
    name: exercise?.name ?? "",
    sets: exercise?.sets ?? "",
    reps: exercise?.reps ?? "",
    load: exercise?.load ?? "",
    rest: exercise?.rest ?? "",
    notes: exercise?.notes ?? "",
  });
  // progression overrides keyed by week string
  const [prog, setProg] = useState(() => ({ ...(exercise?.progressions || {}) }));
  const [showProg, setShowProg] = useState(
    () => Object.keys(exercise?.progressions || {}).length > 0
  );
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const setWeekField = (w, k) => (e) => {
    const val = e.target.value;
    setProg((p) => {
      const row = { ...(p[w] || {}) };
      if (val) row[k] = val; else delete row[k];
      const next = { ...p };
      if (Object.keys(row).length) next[w] = row; else delete next[w];
      return next;
    });
  };

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      const fields = { ...f, progressions: prog };
      if (exercise) await api.updateExercise(exercise.id, fields);
      else await api.createExercise(dayId, fields, position);
      onSaved();
    } catch (err) { alert(err.message); setBusy(false); }
  }

  return (
    <Modal title={exercise ? "Edit exercise" : "Add exercise"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Exercise</span>
          <input value={f.name} onChange={set("name")} autoFocus required placeholder="e.g. Back Squat" />
        </label>
        <div className="field-row">
          <label className="field"><span>Sets</span><input value={f.sets} onChange={set("sets")} placeholder="4" /></label>
          <label className="field"><span>Reps</span><input value={f.reps} onChange={set("reps")} placeholder="5" /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Load</span><input value={f.load} onChange={set("load")} placeholder="75% 1RM" /></label>
          <label className="field"><span>Rest</span><input value={f.rest} onChange={set("rest")} placeholder="2:30" /></label>
        </div>
        <label className="field">
          <span>Notes</span>
          <input value={f.notes} onChange={set("notes")} placeholder="optional cue / tempo" />
        </label>

        {weeks > 1 && (
          <div className="prog-section">
            <button type="button" className="linklike" onClick={() => setShowProg((s) => !s)}>
              {showProg ? "▾" : "▸"} Week-by-week progression
            </button>
            {showProg && (
              <>
                <p className="muted-note">Leave a cell blank to keep the base value above.</p>
                <table className="prog-table">
                  <thead>
                    <tr><th>Week</th><th>Sets</th><th>Reps</th><th>Load</th><th>Rest</th></tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: weeks }, (_, i) => String(i + 1)).map((w) => (
                      <tr key={w}>
                        <td className="wk">{w}</td>
                        {["sets", "reps", "load", "rest"].map((k) => (
                          <td key={k}>
                            <input
                              value={prog[w]?.[k] ?? ""}
                              onChange={setWeekField(w, k)}
                              placeholder={f[k] || "—"}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Save</button>
        </div>
      </form>
    </Modal>
  );
}
