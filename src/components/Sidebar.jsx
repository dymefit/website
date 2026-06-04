import { useState } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";
import ClientForm from "./ClientForm.jsx";

export default function Sidebar({
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
        <span className="brand-name">ProgramLab</span>
      </div>

      <nav className="nav">
        {navBtn("calendar", "📅", "Calendar")}
        {navBtn("programs", "📋", "Programs")}
        {navBtn("client", "👤", "Client")}
      </nav>

      {/* Clients */}
      <div className="panel">
        <div className="panel-head">
          <h2>Clients</h2>
          <button className="icon-btn" onClick={() => setClientModal(true)} title="Add client">+</button>
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
        <span className="user-email" title="Shared workspace — no login">
          Shared workspace
        </span>
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
  const [weeks, setWeeks] = useState(4);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const created = await api.createProgram(clientId, name.trim(), Number(weeks) || 4);
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
        <label className="field">
          <span>Length (weeks)</span>
          <input type="number" min="1" max="52" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Add program</button>
        </div>
      </form>
    </Modal>
  );
}
