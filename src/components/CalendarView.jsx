import { useEffect, useMemo, useState, useCallback } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// Local-time YYYY-MM-DD (avoids UTC off-by-one from toISOString).
function ymd(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarView({ client }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sessions, setSessions] = useState([]);
  const [dayOptions, setDayOptions] = useState([]); // flat list across programs
  const [picker, setPicker] = useState(null); // date string being scheduled

  // Load the client's program days so they can be assigned to dates.
  useEffect(() => {
    let cancelled = false;
    async function loadDays() {
      if (!client) { setDayOptions([]); return; }
      const programs = await api.listPrograms(client.id);
      const opts = [];
      for (const p of programs) {
        const days = await api.listDays(p.id);
        for (const d of days) {
          opts.push({ id: d.id, label: `${p.name} — ${d.label}`, focus: d.focus });
        }
      }
      if (!cancelled) setDayOptions(opts);
    }
    loadDays().catch(console.error);
    return () => { cancelled = true; };
  }, [client]);

  const refreshSessions = useCallback(async () => {
    if (!client) { setSessions([]); return; }
    const from = ymd(year, month, 1);
    const to = ymd(year, month, new Date(year, month + 1, 0).getDate());
    setSessions(await api.listSessions(client.id, from, to));
  }, [client, year, month]);

  useEffect(() => { refreshSessions().catch(console.error); }, [refreshSessions]);

  const byDate = useMemo(() => {
    const map = {};
    for (const s of sessions) (map[s.date] ||= []).push(s);
    return map;
  }, [sessions]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  async function assign(dayId) {
    await api.createSession(client.id, dayId, picker);
    // Email the client (fire-and-forget; safe no-op if email isn't configured).
    const opt = dayOptions.find((o) => o.id === dayId);
    if (client.email) {
      api.notifySessionScheduled({
        to: client.email,
        clientName: client.name,
        dayLabel: opt?.label,
        focus: opt?.focus,
        date: picker,
      });
    }
    setPicker(null);
    refreshSessions();
  }
  async function removeSession(id) {
    await api.deleteSession(id);
    refreshSessions();
  }

  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div className="content-header">
        <div>
          <h1>{MONTHS[month]} {year}</h1>
          <div className="sub">
            {client ? `Scheduled sessions · ${client.name}` : "Select a client to schedule sessions"}
          </div>
        </div>
        <div className="row-actions">
          <button className="btn secondary" onClick={prevMonth}>‹</button>
          <button className="btn secondary" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>Today</button>
          <button className="btn secondary" onClick={nextMonth}>›</button>
        </div>
      </div>

      {!client && (
        <div className="empty-block">Pick a client from the sidebar to plan their week.</div>
      )}

      {client && (
        <div className="calendar">
          {DOW.map((d) => <div className="cal-dow" key={d}>{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div className="cal-cell empty" key={`e${i}`} />;
            const dateStr = ymd(year, month, d);
            const isToday =
              d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const list = byDate[dateStr] || [];
            return (
              <div
                className={"cal-cell" + (isToday ? " today" : "")}
                key={dateStr}
                onClick={() => dayOptions.length ? setPicker(dateStr) : alert("Add a program day first (Programs view).")}
                title="Click to schedule a session"
              >
                <div className="date">{d}</div>
                {list.map((s) => (
                  <span
                    className="cal-tag"
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); removeSession(s.id); }}
                    title="Click to remove"
                  >
                    {s.days?.label ?? "Session"} ✕
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {picker && (
        <Modal title={`Schedule for ${picker}`} onClose={() => setPicker(null)}>
          <div className="form">
            {dayOptions.length === 0 && <p className="muted-note">No program days available.</p>}
            <ul className="pick-list">
              {dayOptions.map((o) => (
                <li key={o.id}>
                  <button className="pick-item" onClick={() => assign(o.id)}>
                    <span>{o.label}</span>
                    {o.focus && <span className="meta">{o.focus}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </>
  );
}
