import { useEffect, useState } from "react";
import * as api from "../lib/api";
import { karvonenZones } from "../lib/zones";
import ClientForm from "./ClientForm.jsx";
import { PARQ } from "../lib/enrollmentText";

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


function EnrollmentBlock({ client }) {
  const [rec, setRec] = useState(undefined);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setRec(undefined); setOpen(false);
    api.getEnrollmentForEmail(client.email).then(setRec).catch(() => setRec(null));
  }, [client.id, client.email]);

  if (rec === undefined) return null;
  if (!rec) {
    return (
      <div className="detail-notes" style={{ marginTop: 14 }}>
        <span className="detail-label">📝 Enrollment agreement &amp; waiver</span>
        <p className="detail-value empty">Not signed yet — the client is prompted to sign on their first portal login{client.email ? "" : " (add their email first)"}.</p>
      </div>
    );
  }
  const med = rec.medical || {};
  const flags = (med.parq || []).filter((x) => x.answer === true);
  return (
    <div className="detail-notes enroll-record" style={{ marginTop: 14 }}>
      <span className="detail-label">📝 Enrollment agreement &amp; waiver</span>
      <p className="detail-value">
        ✅ Signed by <strong>{rec.signature_name}</strong> on {new Date(rec.signed_at).toLocaleString()}
        {rec.is_minor && <> · minor — guardian <strong>{rec.guardian_name}</strong> ({rec.guardian_relationship}) signed as {rec.guardian_signature_name}</>}
        {" "}· doc v{rec.doc_version}{rec.ip_address ? ` · IP ${rec.ip_address}` : ""}
      </p>
      <p className="detail-value">
        {flags.length
          ? <span className="enroll-flag inline">⚠ PAR-Q+: {flags.length} "Yes" answer{flags.length > 1 ? "s" : ""} — clearance/adjustment indicated</span>
          : <span className="hotel-flag ok inline">PAR-Q+: all "No" — cleared to begin</span>}
      </p>
      <button type="button" className="linklike" onClick={() => setOpen((v) => !v)}>{open ? "▾ Hide" : "▸ View"} Exhibit A &amp; details</button>
      {open && (
        <div className="enroll-detail">
          <div className="detail-grid">
            <Field label="Date of birth" value={rec.date_of_birth} />
            <Field label="Phone" value={rec.participant?.phone} />
            <Field label="Address" value={rec.participant?.address} />
            <Field label="Emergency contact" value={rec.participant?.emergency_contact?.name ? `${rec.participant.emergency_contact.name} · ${rec.participant.emergency_contact.phone}${rec.participant.emergency_contact.relationship ? " (" + rec.participant.emergency_contact.relationship + ")" : ""}` : null} />
          </div>
          <ol className="parq compact">
            {(med.parq || PARQ.map((q) => ({ q, answer: null }))).map((x, i) => (
              <li key={i} className={x.answer ? "yes" : ""}><span className="parq-q">{x.q}</span><span className="parq-a">{x.answer === true ? "YES" : x.answer === false ? "No" : "—"}</span></li>
            ))}
          </ol>
          {Object.entries(med.history || {}).map(([k, v]) => v ? (
            <div key={k} className="detail-field"><span className="detail-label">{k.replace(/_/g, " ")}</span><span className="detail-value">{v}</span></div>
          ) : null)}
          <button type="button" className="btn secondary small" onClick={() => window.print()}>Print record</button>
        </div>
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

      <EnrollmentBlock client={client} />

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
