import { useState } from "react";
import * as api from "../lib/api";
import { karvonenZones } from "../lib/zones";
import ClientForm from "./ClientForm.jsx";

function Field({ label, value, href }) {
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      {value ? (
        href ? <a className="detail-value link" href={href}>{value}</a>
             : <span className="detail-value">{value}</span>
      ) : (
        <span className="detail-value empty">—</span>
      )}
    </div>
  );
}

function ZonesBlock({ client }) {
  const z = karvonenZones(client.age, client.resting_hr);
  return (
    <div className="detail-notes" style={{ marginTop: 14 }}>
      <span className="detail-label">
        HR training zones (Karvonen{client.age ? ` · age ${client.age}` : ""}{client.resting_hr ? ` · resting ${client.resting_hr}` : ""})
      </span>
      {z ? (
        <table className="zones-table">
          <tbody>
            {z.zones.map((row) => (
              <tr key={row.zone} className={`zrow z${row.zone}`}>
                <td className="zname">Z{row.zone} · {row.name}</td>
                <td className="zbpm">{row.low}–{row.high} bpm</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="detail-value empty">
          Not set — the client enters age + resting HR in their portal.
        </p>
      )}
    </div>
  );
}

export default function ClientDetail({ client, onChanged, onDeleted }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${client.name}? This removes their programs, schedule, and logs. This cannot be undone.`)) return;
    try {
      await api.deleteClient(client.id);
      onDeleted?.(client.id);
    } catch (e) {
      alert(e.message);
    }
  }

  if (!client) {
    return (
      <div className="placeholder">
        <div>
          <div className="big">👤</div>
          <p>Select a client to see their details.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1>{client.name}</h1>
          <div className="sub">{client.goal || "No goal set"}</div>
        </div>
        <div className="row-actions">
          <button className="btn secondary danger-btn" onClick={handleDelete}>Delete</button>
          <button className="btn" onClick={() => setEditing(true)}>Edit client</button>
        </div>
      </div>

      <div className="detail-grid">
        <Field label="Email" value={client.email} href={client.email ? `mailto:${client.email}` : null} />
        <Field label="Phone" value={client.phone} href={client.phone ? `tel:${client.phone}` : null} />
        <Field label="Start date" value={client.start_date} />
        <Field label="Goal" value={client.goal} />
        <Field label="TPI screen" value={client.tpi_score ? `${client.tpi_score}${client.tpi_notes ? " — " + client.tpi_notes : ""}` : null} />
      </div>

      <div className="detail-notes">
        <span className="detail-label">Notes</span>
        {client.notes
          ? <p className="detail-value">{client.notes}</p>
          : <p className="detail-value empty">No notes yet.</p>}
      </div>

      <ZonesBlock client={client} />

      {(client.hotel_equipment || []).length > 0 && (
        <div className="detail-notes" style={{ marginTop: 14 }}>
          <span className="detail-label">🏨 Traveling — hotel gym has</span>
          <p className="detail-value">{client.hotel_equipment.join(" · ")}</p>
        </div>
      )}

      {editing && (
        <ClientForm
          client={client}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setEditing(false);
            onChanged(updated);
          }}
        />
      )}
    </>
  );
}
