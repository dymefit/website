import { useState } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";

// Create or edit a client. Pass `client` to edit; omit to create.
export default function ClientForm({ client, onClose, onSaved }) {
  const editing = Boolean(client);
  const [f, setF] = useState({
    name: client?.name ?? "",
    goal: client?.goal ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    start_date: client?.start_date ?? "",
    notes: client?.notes ?? "",
    tpi_score: client?.tpi_score ?? "",
    tpi_notes: client?.tpi_notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      // empty date string must become null, not ""
      const payload = {
        name: f.name.trim(),
        goal: f.goal.trim() || null,
        email: f.email.trim() || null,
        phone: f.phone.trim() || null,
        start_date: f.start_date || null,
        notes: f.notes.trim() || null,
        tpi_score: f.tpi_score.trim() || null,
        tpi_notes: f.tpi_notes.trim() || null,
      };
      const saved = editing
        ? await api.updateClient(client.id, payload)
        : await api.createClient(payload);
      onSaved(saved);
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? "Edit client" : "New client"} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Name</span>
          <input value={f.name} onChange={set("name")} autoFocus required />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Primary goal</span>
            <input value={f.goal} onChange={set("goal")} placeholder="e.g. Strength" />
          </label>
          <label className="field">
            <span>Start date</span>
            <input type="date" value={f.start_date ?? ""} onChange={set("start_date")} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>Email</span>
            <input type="email" value={f.email} onChange={set("email")} placeholder="name@email.com" />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={f.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
          </label>
        </div>
        <label className="field">
          <span>Notes</span>
          <textarea rows="3" value={f.notes} onChange={set("notes")} placeholder="Injuries, preferences, history…" />
        </label>
        <div className="field-row">
          <label className="field" style={{ maxWidth: 130 }}>
            <span>TPI screen score</span>
            <input value={f.tpi_score} onChange={set("tpi_score")} placeholder="e.g. 9/13" />
          </label>
          <label className="field">
            <span>TPI results summary</span>
            <input value={f.tpi_notes} onChange={set("tpi_notes")} placeholder="e.g. Limited hip IR (lead), poor pelvic tilt — bias hip mobility" />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>{editing ? "Save" : "Add client"}</button>
        </div>
      </form>
    </Modal>
  );
}
