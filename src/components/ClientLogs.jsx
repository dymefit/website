import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import ProgressCharts from "./ProgressCharts.jsx";

function prettyDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function setSummary(sets) {
  if (!sets || sets.length === 0) return "—";
  return sets
    .map((s) => {
      const wr = [s.weight, s.reps].filter(Boolean).join("×");
      return s.rpe ? `${wr} @${s.rpe}` : wr;
    })
    .filter(Boolean)
    .join(",  ");
}

export default function ClientLogs({ client }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!client) { setLogs([]); return; }
    setLoading(true);
    setError("");
    try {
      setLogs(await api.listClientLogs(client.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { load(); }, [load]);

  if (!client) {
    return (
      <div className="placeholder">
        <div>
          <div className="big">📊</div>
          <p>Select a client to see their logged workouts.</p>
        </div>
      </div>
    );
  }

  // group by date (already sorted desc)
  const byDate = {};
  for (const l of logs) (byDate[l.date] ||= []).push(l);
  const dates = Object.keys(byDate);

  return (
    <>
      <div className="content-header">
        <div>
          <h1>{client.name} · Logs</h1>
          <div className="sub">What this client has actually logged</div>
        </div>
        <button className="btn secondary" onClick={load} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="api-error">{error}</div>}
      {loading && <div className="muted-note">Loading…</div>}
      {!loading && logs.length === 0 && (
        <div className="empty-block">No logged workouts yet for this client.</div>
      )}

      {!loading && logs.length > 0 && <ProgressCharts logs={logs} />}

      <div className="day-grid">
        {dates.map((date) => (
          <div className="day-card" key={date}>
            <div className="day-card-head">
              <h3>{prettyDate(date)}</h3>
              <span className="focus">{byDate[date][0]?.sessions?.days?.label || ""}</span>
            </div>
            <table className="exercises">
              <thead>
                <tr><th>Exercise</th><th>Prescribed</th><th>Logged</th><th>Note</th></tr>
              </thead>
              <tbody>
                {byDate[date].map((l) => {
                  const ex = l.exercises || {};
                  const prescribed = [
                    ex.sets && `${ex.sets}×${ex.reps || "?"}`,
                    ex.load,
                  ].filter(Boolean).join(" @ ");
                  return (
                    <tr key={l.id}>
                      <td className="name">{ex.name || "—"}</td>
                      <td className="muted-cell">{prescribed || "—"}</td>
                      <td>{setSummary(l.sets)}</td>
                      <td className="muted-cell">{l.note || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
