// Netlify Function: enrollment requests from the home page.
// With a beta code: validates + redeems atomically via the
// redeem_beta_code RPC (codes stored hashed; anon has no table access).
// Without a code: records interest. Both paths email the coach.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_FROM = process.env.NOTIFY_FROM || "Fitness-Elevated <noreply@fitness-elevated.com>";
const COACH_EMAIL = (process.env.VITE_COACH_EMAIL || "unutoa31@gmail.com").toLowerCase();
const APP_URL = process.env.APP_URL || "https://www.fitness-elevated.com";

const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(data),
});
const esc = (x) => String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function emailCoach(subject, html) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: NOTIFY_FROM, to: [COACH_EMAIL], subject, html }),
    });
  } catch { /* notification failure never blocks the visitor */ }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  try {
    const p = JSON.parse(event.body || "{}");
    const name = (p.name || "").trim().slice(0, 120);
    const email = (p.email || "").trim().slice(0, 160);
    const pkg = (p.package || "").trim().slice(0, 80);
    const code = (p.code || "").trim().slice(0, 40);
    if (!name || !/.+@.+\..+/.test(email)) return json(400, { error: "Name and a valid email are required." });

    if (code) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_beta_code`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "content-type": "application/json" },
        body: JSON.stringify({ p_code: code, p_name: name, p_email: email, p_package: pkg }),
      });
      if (!r.ok) return json(502, { error: "Code check unavailable — try again in a minute." });
      const out = await r.json();
      if (!out.valid) return json(200, { valid: false });
      await emailCoach(
        `🎟️ Beta code redeemed (${out.label}) — ${name}`,
        `<p><strong>${esc(name)}</strong> (${esc(email)}) redeemed beta code <strong>${esc(out.label)}</strong> for <strong>${esc(pkg || "unspecified package")}</strong>.</p>
         <p>Next: add them as a client in <a href="${APP_URL}/app">the app</a> with this email so their portal unlocks.</p>`
      );
      return json(200, { valid: true, label: out.label });
    }

    if (p.type === "booking") {
      await emailCoach(
        `📅 Assessment booking — ${name} · ${esc(p.when || "time not set")}`,
        `<p><strong>${esc(name)}</strong> (${esc(email)}) booked a free assessment for <strong>${esc(p.when || "?")}</strong>.</p>
         <p>Goal: ${esc(p.goal || "—")}<br>Notes: ${esc(p.note || "—")}</p>
         <p>Reply to confirm or reschedule.</p>`
      );
      return json(200, { received: true });
    }

    await emailCoach(
      `📥 Enrollment request — ${name} (${pkg || "no package"})`,
      `<p><strong>${esc(name)}</strong> (${esc(email)}) requested enrollment in <strong>${esc(pkg || "unspecified package")}</strong> from the website.</p>
       <p>Reply to set up payment and onboarding.</p>`
    );
    return json(200, { received: true });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
