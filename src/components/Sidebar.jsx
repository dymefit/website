import { useState } from "react";
import * as api from "../lib/api";
import { PROGRAM_TYPES, LEVELS } from "../lib/constants";
import Modal from "./Modal.jsx";
import ClientForm from "./ClientForm.jsx";

export default function Sidebar({
  user,
  onSignOut,
  clients,
  programs,
  selectedClient,
  selectedProgram,
  view,
  onSelectClient,
  onSelectProgram,
  onSetView,
  onClientsChanged,
  onProgramsChanged,
}) {
  const [clientModal, setClientModal] = useState(false);
  const [programModal, setProgramModal] = useState(false);

  // Coach access to the members-only guide (same authed flow as the portal).
  function openNutritionGuide() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write("<title>Nutrition Guide</title><p style='font-family:sans-serif;padding:24px'>Loading your guide…</p>");
    api.fetchNutritionGuide()
      .then((html) => { w.document.open(); w.document.write(html); w.document.close(); })
      .catch((e) => { w.document.open(); w.document.write(`<p style='font-family:sans-serif;padding:24px'>${e.message}</p>`); w.document.close(); });
  }

  const navBtn = (key, icon, label, extra = {}) => (
    <button
      className={"nav-btn" + (view === key ? " active" : "")}
      onClick={() => onSetView(key)}
      {...extra}
    >
      <span className="nav-icon">{icon}</span> {label}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">◆</span>
        <span className="brand-name">Fitness-Elevated</span>
      </div>

      <nav className="nav">
        {navBtn("calendar", "📅", "Calendar")}
        {navBtn("programs", "📋", "Programs")}
        {navBtn("client", "👤", "Client")}
        {navBtn("logs", "📊", "Logs")}
        {navBtn("library", "📚", "Library")}
        <button className="nav-btn" onClick={openNutritionGuide} title="Members-only nutrition guide">
          <span className="nav-icon">🥗</span> Nutrition Guide
        </button>
      </nav>

      {/* Clients */}
      <div className="panel">
        <div className="panel-head">
          <h2>Clients</h2>
          <button className="icon-btn" onClick={() => setClientModal(true)} title="Add client" aria-label="Add client">+</button>
        </div>
        <ul className="list">
          {clients.length === 0 && <li className="list-empty">No clients yet</li>}
          {clients.map((c) => (
            <li
              key={c.id}
              className={"list-item" + (selectedClient?.id === c.id ? " active" : "")}
              onClick={() => onSelectClient(c)}
            >
              <span>{c.name}</span>
              <span className="meta">{c.goal || ""}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Programs */}
      <div className="panel">
        <div className="panel-head">
          <h2>Programs</h2>
          <button
            className="icon-btn"
            onClick={() => selectedClient && setProgramModal(true)}
            title={selectedClient ? "Add program" : "Select a client first"}
            aria-label="Add program"
            disabled={!selectedClient}
          >+</button>
        </div>
        <ul className="list">
          {!selectedClient && <li className="list-empty">Select a client</li>}
          {selectedClient && programs.length === 0 && (
            <li className="list-empty">No programs yet</li>
          )}
          {programs.map((p) => (
            <li
              key={p.id}
              className={"list-item" + (selectedProgram?.id === p.id ? " active" : "")}
              onClick={() => onSelectProgram(p)}
            >
              <span>{p.name}</span>
              <span className="meta">{p.weeks}w</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="sidebar-foot">
        <span className="user-email" title={user?.email}>{user?.email || "Coach"}</span>
        {onSignOut && <button className="linklike" onClick={onSignOut}>Sign out</button>}
      </div>

      {clientModal && (
        <ClientForm
          onClose={() => setClientModal(false)}
          onSaved={async (created) => {
            setClientModal(false);
            const list = await onClientsChanged();
            const fresh = (list || []).find((c) => c.id === created.id);
            if (fresh) onSelectClient(fresh);
          }}
        />
      )}

      {programModal && selectedClient && (
        <ProgramForm
          clientId={selectedClient.id}
          onClose={() => setProgramModal(false)}
          onSaved={async (created) => {
            setProgramModal(false);
            await onProgramsChanged();
            onSelectProgram(created);
          }}
        />
      )}
    </aside>
  );
}

function ProgramForm({ clientId, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(PROGRAM_TYPES[1]); // Strength
  const [level, setLevel] = useState(LEVELS[0]); // Beginner
  const [weeks, setWeeks] = useState(12); // 3-month block default
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const created = await api.createProgram(clientId, {
        name: name.trim(),
        type,
        level,
        weeks: Number(weeks) || 12,
      });
      onSaved(created);
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="New program" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Program name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {PROGRAM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Length (weeks · 4-week microcycles)</span>
          <select value={weeks} onChange={(e) => setWeeks(e.target.value)}>
            <option value={4}>4 weeks (1 microcycle)</option>
            <option value={8}>8 weeks (2 microcycles)</option>
            <option value={12}>12 weeks · 3 months (3 microcycles)</option>
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Add program</button>
        </div>
      </form>
    </Modal>
  );
}
