// Netlify Function: record an e-signed Enrollment Agreement.
// The signer must be logged in (Bearer token). We verify the token with
// Supabase, stamp server time + client IP + user agent (attribution under
// Utah UETA), then insert using the SIGNER'S OWN token so RLS guarantees
// the row's email matches the authenticated account.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

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
    return json(200, { ok: true, id: saved.id, signed_at: saved.signed_at });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
