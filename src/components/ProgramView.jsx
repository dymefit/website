import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";

export default function ProgramView({ client, program }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayModal, setDayModal] = useState(null); // {mode:'add'|'edit', day?}
  const [exModal, setExModal] = useState(null);    // {dayId, exercise?}

  const refresh = useCallback(async () => {
    if (!program) {
      setDays([]);
      return;
    }
    setLoading(true);
    try {
      setDays(await api.listDays(program.id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    // swap positions
    await Promise.all([
      api.updateExercise(a.id, { position: b.position }),
      api.updateExercise(b.id, { position: a.position }),
    ]);
    refresh();
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1>{program.name}</h1>
          <div className="sub">
            {client?.name} · {program.weeks}-week block · {days.length} training days
          </div>
        </div>
        <button className="btn" onClick={() => setDayModal({ mode: "add" })}>
          + Add Day
        </button>
      </div>

      {loading && <div className="muted-note">Loading…</div>}

      {!loading && days.length === 0 && (
        <div className="empty-block">
          No training days yet. Click <strong>+ Add Day</strong> to start building.
        </div>
      )}

      <div className="day-grid">
        {days.map((d) => (
          <div className="day-card" key={d.id}>
            <div className="day-card-head">
              <div>
                <h3>{d.label}</h3>
                {d.focus && <span className="focus">{d.focus}</span>}
              </div>
              <div className="row-actions">
                <button className="mini-btn" onClick={() => setDayModal({ mode: "edit", day: d })}>Edit</button>
                <button className="mini-btn danger" onClick={() => deleteDay(d)}>Delete</button>
              </div>
            </div>

            <table className="exercises">
              <thead>
                <tr>
                  <th style={{ width: "32px" }}></th>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Load</th>
                  <th>Rest</th>
                  <th style={{ width: "120px" }}></th>
                </tr>
              </thead>
              <tbody>
                {d.exercises.length === 0 && (
                  <tr><td colSpan="7" className="muted-note">No exercises yet.</td></tr>
                )}
                {d.exercises.map((ex, i) => (
                  <tr key={ex.id}>
                    <td className="reorder">
                      <button className="tiny" disabled={i === 0} onClick={() => moveExercise(d, i, -1)}>▲</button>
                      <button className="tiny" disabled={i === d.exercises.length - 1} onClick={() => moveExercise(d, i, 1)}>▼</button>
                    </td>
                    <td className="name">{ex.name}</td>
                    <td>{ex.sets}</td>
                    <td>{ex.reps}</td>
                    <td>{ex.load}</td>
                    <td>{ex.rest}</td>
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
          position={
            days.find((d) => d.id === exModal.dayId)?.exercises.length ?? 0
          }
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
      if (mode === "edit") {
        await api.updateDay(day.id, { label: label.trim(), focus: focus.trim() });
      } else {
        await api.createDay(programId, label.trim(), focus.trim(), position);
      }
      onSaved();
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
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

function ExerciseForm({ dayId, exercise, position, onClose, onSaved }) {
  const [f, setF] = useState({
    name: exercise?.name ?? "",
    sets: exercise?.sets ?? "",
    reps: exercise?.reps ?? "",
    load: exercise?.load ?? "",
    rest: exercise?.rest ?? "",
    notes: exercise?.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      if (exercise) {
        await api.updateExercise(exercise.id, f);
      } else {
        await api.createExercise(dayId, f, position);
      }
      onSaved();
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={exercise ? "Edit exercise" : "Add exercise"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Exercise</span>
          <input value={f.name} onChange={set("name")} autoFocus required placeholder="e.g. Back Squat" />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Sets</span>
            <input value={f.sets} onChange={set("sets")} placeholder="4" />
          </label>
          <label className="field">
            <span>Reps</span>
            <input value={f.reps} onChange={set("reps")} placeholder="5" />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>Load</span>
            <input value={f.load} onChange={set("load")} placeholder="75% 1RM" />
          </label>
          <label className="field">
            <span>Rest</span>
            <input value={f.rest} onChange={set("rest")} placeholder="2:30" />
          </label>
        </div>
        <label className="field">
          <span>Notes</span>
          <input value={f.notes} onChange={set("notes")} placeholder="optional cue / tempo" />
        </label>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Save</button>
        </div>
      </form>
    </Modal>
  );
}
