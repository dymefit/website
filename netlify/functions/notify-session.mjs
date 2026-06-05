// Netlify Function: email a client when the coach schedules a workout.
// Sends via Resend (https://resend.com). Safe no-op until RESEND_API_KEY is set.
//
// Security: the caller must present the coach's Supabase access token
// (Authorization: Bearer <token>); we validate it against Supabase and
// confirm the email matches the configured coach. This stops anyone from
// using the endpoint to send arbitrary email.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;
const COACH_EMAIL = (process.env.VITE_COACH_EMAIL || "unutoa31@gmail.com").toLowerCase();
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_FROM = process.env.NOTIFY_FROM || "ProgramLab <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "https://dyme-fit.netlify.app";

const json = (statusCode, data) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    // 1) Validate the caller is the coach.
    const auth = event.headers.authorization || event.headers.Authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json(401, { error: "Missing token" });

    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!who.ok) return json(401, { error: "Invalid token" });
    const user = await who.json();
    if ((user.email || "").toLowerCase() !== COACH_EMAIL) {
      return json(403, { error: "Not authorized" });
    }

    // 2) Parse payload.
    const { to, clientName, dayLabel, date, focus } = JSON.parse(event.body || "{}");
    if (!to) return json(400, { error: "Missing recipient" });

    // 3) If email isn't configured yet, succeed quietly so scheduling still works.
    if (!RESEND_API_KEY) {
      return json(200, { skipped: true, reason: "RESEND_API_KEY not set" });
    }

    // 4) Send via Resend.
    const subject = `New workout scheduled: ${dayLabel || "Workout"} on ${date}`;
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px">
        <h2 style="margin:0 0 8px">Hi ${clientName || "there"},</h2>
        <p style="margin:0 0 12px;color:#333">Your coach scheduled a new workout for you.</p>
        <table style="border-collapse:collapse;margin:8px 0">
          <tr><td style="padding:4px 10px 4px 0;color:#666">Date</td><td style="padding:4px 0"><b>${date}</b></td></tr>
          <tr><td style="padding:4px 10px 4px 0;color:#666">Workout</td><td style="padding:4px 0"><b>${dayLabel || "Workout"}</b></td></tr>
          ${focus ? `<tr><td style="padding:4px 10px 4px 0;color:#666">Focus</td><td style="padding:4px 0">${focus}</td></tr>` : ""}
        </table>
        <p style="margin:16px 0">
          <a href="${APP_URL}" style="background:#4f8cff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">Open ProgramLab</a>
        </p>
        <p style="color:#999;font-size:12px">Log in to see the details and record your sets.</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: NOTIFY_FROM, to: [to], subject, html }),
    });
    const result = await res.json();
    if (!res.ok) return json(502, { error: "Email send failed", detail: result });
    return json(200, { sent: true, id: result.id });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
