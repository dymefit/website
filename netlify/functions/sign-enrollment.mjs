// Netlify Function: record an e-signed Enrollment Agreement.
// The signer must be logged in (Bearer token). We verify the token with
// Supabase, stamp server time + client IP + user agent (attribution under
// Utah UETA), then insert using the SIGNER'S OWN token so RLS guarantees
// the row's email matches the authenticated account.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_FROM = process.env.NOTIFY_FROM || "Fitness-Elevated <onboarding@resend.dev>";
const COACH_EMAIL = (process.env.VITE_COACH_EMAIL || "unutoa31@gmail.com").toLowerCase();
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "Dymefitofficial@gmail.com";
const APP_URL = process.env.APP_URL || "https://www.fitness-elevated.com";

const esc = (x) => String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Confirmation email to the signer (coach BCC'd). Never fails the signature.
async function sendConfirmation(row) {
  if (!RESEND_API_KEY) return { skipped: "no key" };
  const when = new Date(row.signed_at).toLocaleString("en-US", { timeZone: "America/Denver", dateStyle: "long", timeStyle: "short" });
  const flags = (row.medical?.parq || []).filter((q) => q.answer === true).length;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <div style="background:linear-gradient(120deg,#F6E2B0,#D4AF37,#9A6E16 55%,#F6D899);padding:18px 22px;border-radius:12px 12px 0 0">
      <h2 style="margin:0;color:#241B07;font-size:20px">Fitness-Elevated</h2>
      <div style="color:#241B07;font-size:13px">Enrollment confirmation</div>
    </div>
    <div style="border:1px solid #e6e2d8;border-top:0;padding:22px;border-radius:0 0 12px 12px">
      <p>Hi ${esc(row.full_name.split(" ")[0])},</p>
      <p>Thanks — we've received your signed <strong>Enrollment Agreement, Medical Disclaimer &amp; Waiver</strong> and your <strong>Exhibit A (Medical History)</strong>. You're all set to begin.</p>
      <table style="border-collapse:collapse;font-size:14px;margin:14px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Signed by</td><td><strong>${esc(row.signature_name)}</strong>${row.is_minor ? ` (guardian: ${esc(row.guardian_signature_name)})` : ""}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Date</td><td>${esc(when)} (Mountain)</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Account</td><td>${esc(row.email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Document</td><td>v${esc(row.doc_version)} · ref ${esc((row.id || "").slice(0, 8))}</td></tr>
      </table>
      ${flags ? `<p style="background:#FFF7DC;border:1px solid #D4AF37;border-radius:8px;padding:10px 12px;font-size:14px">You answered "Yes" to ${flags} readiness question${flags > 1 ? "s" : ""}. Please check in with your physician before starting, and share any clearance or restrictions with your coach — your program will be built around them.</p>` : ""}
      <p><strong>What happens next</strong><br>Your coach reviews your medical history, builds your program, and schedules your first sessions. Open <a href="${APP_URL}/app" style="color:#9A6E16">your member portal</a> anytime to see what's scheduled and log your training.</p>
      <p style="font-size:13px;color:#666">Keep this email for your records. Questions? Reply to this message or write to <a href="mailto:${CONTACT_EMAIL}" style="color:#9A6E16">${CONTACT_EMAIL}</a>.</p>
      <p style="font-size:12px;color:#999">— Dymond Unutoa · Fitness-Elevated · fitness-elevated.com</p>
    </div>
  </div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [row.email],
        bcc: [COACH_EMAIL],
        reply_to: CONTACT_EMAIL,
        subject: `Fitness-Elevated — enrollment confirmed for ${row.full_name}`,
        html,
      }),
    });
    const body = await r.json().catch(() => ({}));
    return r.ok ? { sent: true, id: body.id } : { sent: false, error: body.message || r.status };
  } catch (e) {
    return { sent: false, error: e.message };
  }
}

const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(data),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const auth = event.headers.authorization || event.headers.Authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json(401, { error: "Sign in to sign the agreement." });

    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!who.ok) return json(401, { error: "Session expired — sign in again." });
    const user = await who.json();

    const p = JSON.parse(event.body || "{}");
    const required = ["full_name", "signature_name", "doc_version", "acknowledgments", "participant", "medical"];
    for (const k of required) if (!p[k]) return json(400, { error: `Missing ${k}` });
    const ack = p.acknowledgments;
    if (!(ack.read_agreement && ack.exhibit_a_true && ack.electronic_consent && ack.age_or_guardian)) {
      return json(400, { error: "All acknowledgments are required." });
    }
    if (p.signature_name.trim().toLowerCase() !== p.full_name.trim().toLowerCase()) {
      return json(400, { error: "Typed signature must match your full legal name." });
    }
    if (p.is_minor && !(p.guardian_name && p.guardian_signature_name)) {
      return json(400, { error: "A parent/guardian name and signature are required for participants under 18." });
    }

    const row = {
      user_id: user.id,
      email: user.email,
      full_name: p.full_name.trim(),
      date_of_birth: p.date_of_birth || null,
      is_minor: !!p.is_minor,
      guardian_name: p.guardian_name || null,
      guardian_relationship: p.guardian_relationship || null,
      participant: p.participant,
      medical: p.medical,
      acknowledgments: ack,
      signature_name: p.signature_name.trim(),
      guardian_signature_name: p.guardian_signature_name || null,
      doc_version: p.doc_version,
      doc_hash: p.doc_hash || null,
      ip_address: event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || null,
      user_agent: event.headers["user-agent"] || null,
      signed_at: new Date().toISOString(),
    };

    const ins = await fetch(`${SUPABASE_URL}/rest/v1/enrollment_forms`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    });
    if (!ins.ok) {
      const msg = await ins.text();
      return json(ins.status, { error: msg.includes("enrollment_forms") ? "Enrollment table not set up yet." : "Could not save signature." });
    }
    const [saved] = await ins.json();
    const email = await sendConfirmation({ ...row, id: saved.id, signed_at: saved.signed_at });
    return json(200, { ok: true, id: saved.id, signed_at: saved.signed_at, email });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
