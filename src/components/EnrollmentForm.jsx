import { useMemo, useState } from "react";
import * as api from "../lib/api";
import { SECTIONS, PARQ, HISTORY_FIELDS, DOC_VERSION, BUSINESS, fullText } from "../lib/enrollmentText";
import BrandMark from "./BrandMark.jsx";

async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch { return null; }
}

function ageFromDOB(dob) {
  if (!dob) return null;
  const [y, m, d] = dob.split("-").map(Number);
  const t = new Date();
  let age = t.getFullYear() - y;
  if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) age--;
  return age;
}

export default function EnrollmentForm({ user, client, onSigned }) {
  const [p, setP] = useState({
    full_name: client?.name || "",
    date_of_birth: "",
    phone: client?.phone || "",
    address: "",
    emergency_name: "",
    emergency_phone: "",
    emergency_relationship: "",
  });
  const [parq, setParq] = useState(Array(PARQ.length).fill(null)); // true/false/null
  const [hist, setHist] = useState(Object.fromEntries(HISTORY_FIELDS.map((f) => [f.key, ""])));
  const [guardian, setGuardian] = useState({ name: "", relationship: "", signature: "" });
  const [ack, setAck] = useState({ read_agreement: false, exhibit_a_true: false, electronic_consent: false, age_or_guardian: false });
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const age = ageFromDOB(p.date_of_birth);
  const isMinor = age !== null && age < 18;
  const parqFlag = parq.some((v) => v === true);
  const parqDone = parq.every((v) => v !== null);
  const setField = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const canSign = useMemo(() => {
    const base = p.full_name.trim() && p.date_of_birth && p.emergency_name.trim() && p.emergency_phone.trim()
      && parqDone && Object.values(ack).every(Boolean)
      && signature.trim().toLowerCase() === p.full_name.trim().toLowerCase();
    const minorOK = !isMinor || (guardian.name.trim() && guardian.signature.trim().toLowerCase() === guardian.name.trim().toLowerCase());
    return Boolean(base && minorOK);
  }, [p, parqDone, ack, signature, isMinor, guardian]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!canSign) return;
    setBusy(true);
    try {
      const doc_hash = await sha256(fullText());
      const res = await api.signEnrollment({
        full_name: p.full_name,
        date_of_birth: p.date_of_birth,
        is_minor: isMinor,
        guardian_name: isMinor ? guardian.name : null,
        guardian_relationship: isMinor ? guardian.relationship : null,
        guardian_signature_name: isMinor ? guardian.signature : null,
        participant: {
          phone: p.phone, address: p.address,
          emergency_contact: { name: p.emergency_name, phone: p.emergency_phone, relationship: p.emergency_relationship },
          age_at_signing: age,
        },
        medical: { parq: PARQ.map((q, i) => ({ q, answer: parq[i] })), parq_flag: parqFlag, history: hist },
        acknowledgments: { ...ack, signed_from: "client-portal" },
        signature_name: signature,
        doc_version: DOC_VERSION,
        doc_hash,
      });
      onSigned?.(res);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="enroll" onSubmit={submit}>
      <header className="enroll-head">
        <BrandMark size={34} />
        <div>
          <h1>Enrollment Agreement, Medical Disclaimer &amp; Waiver</h1>
          <div className="sub">{BUSINESS} · Please read carefully, complete Exhibit A, and sign below. Version {DOC_VERSION}</div>
        </div>
      </header>

      <p className="enroll-note">
        Welcome — before your first session, every member completes this agreement once. Signing as <strong>{user.email}</strong>.
      </p>

      {/* ---- Participant ---- */}
      <section className="enroll-sec">
        <h2>Participant Information</h2>
        <div className="field-row">
          <label className="field"><span>Full legal name *</span><input value={p.full_name} onChange={setField("full_name")} required autoComplete="name" /></label>
          <label className="field" style={{ maxWidth: 190 }}><span>Date of birth *</span><input type="date" value={p.date_of_birth} onChange={setField("date_of_birth")} required /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Phone</span><input value={p.phone} onChange={setField("phone")} autoComplete="tel" /></label>
          <label className="field"><span>Address</span><input value={p.address} onChange={setField("address")} autoComplete="street-address" /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Emergency contact name *</span><input value={p.emergency_name} onChange={setField("emergency_name")} required /></label>
          <label className="field"><span>Emergency contact phone *</span><input value={p.emergency_phone} onChange={setField("emergency_phone")} required /></label>
          <label className="field" style={{ maxWidth: 170 }}><span>Relationship</span><input value={p.emergency_relationship} onChange={setField("emergency_relationship")} /></label>
        </div>
        {isMinor && <div className="enroll-flag">Participant is under 18 — a parent or legal guardian must complete and sign this form (see Section 5).</div>}
      </section>

      {/* ---- Agreement text ---- */}
      <section className="enroll-sec enroll-doc" aria-label="Agreement text">
        {SECTIONS.map((s) => (
          <div key={s.id} className={"enroll-clause" + (s.id === "waiver" ? " emphasis" : "")}>
            <h3>{s.title}</h3>
            {s.body.map((para, i) => <p key={i}>{para}</p>)}
          </div>
        ))}
      </section>

      {/* ---- Exhibit A ---- */}
      <section className="enroll-sec">
        <h2>Exhibit A — Medical History &amp; Physical Activity Readiness</h2>
        <p className="muted-note">Answer every question. A "Yes" doesn't exclude you — it means we'll ask for your physician's clearance or adjust your program accordingly.</p>
        <ol className="parq">
          {PARQ.map((q, i) => (
            <li key={i}>
              <span className="parq-q">{q}</span>
              <span className="parq-a" role="radiogroup" aria-label={`Question ${i + 1}`}>
                <label><input type="radio" name={`parq${i}`} checked={parq[i] === true} onChange={() => setParq(parq.map((v, j) => (j === i ? true : v)))} /> Yes</label>
                <label><input type="radio" name={`parq${i}`} checked={parq[i] === false} onChange={() => setParq(parq.map((v, j) => (j === i ? false : v)))} /> No</label>
              </span>
            </li>
          ))}
        </ol>
        {parqDone && parqFlag && (
          <div className="enroll-flag">
            You answered "Yes" to at least one question. Please talk with your physician before starting, and bring us any clearance or activity restrictions. Your coach will design around them.
          </div>
        )}
        {HISTORY_FIELDS.map((f) => (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            <textarea rows={2} value={hist[f.key]} onChange={(e) => setHist({ ...hist, [f.key]: e.target.value })} placeholder={f.placeholder} />
          </label>
        ))}
      </section>

      {/* ---- Guardian (minors) ---- */}
      {isMinor && (
        <section className="enroll-sec">
          <h2>Parent / Legal Guardian</h2>
          <div className="field-row">
            <label className="field"><span>Parent/guardian full legal name *</span><input value={guardian.name} onChange={(e) => setGuardian({ ...guardian, name: e.target.value })} required /></label>
            <label className="field" style={{ maxWidth: 200 }}><span>Relationship *</span><input value={guardian.relationship} onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })} required placeholder="Parent / Legal guardian" /></label>
          </div>
          <label className="field">
            <span>Parent/guardian electronic signature — type your full legal name exactly as above *</span>
            <input className="sig-input" value={guardian.signature} onChange={(e) => setGuardian({ ...guardian, signature: e.target.value })} placeholder="Type full legal name" />
          </label>
        </section>
      )}

      {/* ---- E-sign ---- */}
      <section className="enroll-sec enroll-sign">
        <h2>Acknowledgment &amp; Electronic Signature</h2>
        <label className="ack"><input type="checkbox" checked={ack.read_agreement} onChange={(e) => setAck({ ...ack, read_agreement: e.target.checked })} />
          I have read and understand the entire Enrollment Agreement above, including the <strong>Medical Advice Disclaimer (Section 2)</strong> and the <strong>Waiver and Release of Liability (Section 4)</strong>, and I agree to its terms.</label>
        <label className="ack"><input type="checkbox" checked={ack.exhibit_a_true} onChange={(e) => setAck({ ...ack, exhibit_a_true: e.target.checked })} />
          I have completed <strong>Exhibit A</strong> truthfully and completely, and I will tell my coach if anything changes.</label>
        <label className="ack"><input type="checkbox" checked={ack.age_or_guardian} onChange={(e) => setAck({ ...ack, age_or_guardian: e.target.checked })} />
          {isMinor
            ? "I am the parent or legal guardian of the participant named above and have authority to sign on their behalf."
            : "I am at least 18 years of age and competent to enter this Agreement."}</label>
        <label className="ack"><input type="checkbox" checked={ack.electronic_consent} onChange={(e) => setAck({ ...ack, electronic_consent: e.target.checked })} />
          I consent to conduct this transaction electronically and intend my typed name below to be my legally binding electronic signature (Utah Code § 46-4-201).</label>

        <label className="field">
          <span>Electronic signature — type your full legal name exactly as entered above *</span>
          <input className="sig-input" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type full legal name" autoComplete="off" />
        </label>
        <div className="sig-meta">Date: {new Date().toLocaleDateString()} · Account: {user.email} · Document v{DOC_VERSION}</div>

        {error && <div className="api-error" role="alert">{error}</div>}
        <button type="submit" className="btn" disabled={!canSign || busy}>
          {busy ? "Recording signature…" : "Sign Agreement & Exhibit A"}
        </button>
        {!canSign && <div className="muted-note">Complete all required fields, answer every Exhibit A question, check all four acknowledgments, and type your name to match.</div>}
      </section>
    </form>
  );
}
