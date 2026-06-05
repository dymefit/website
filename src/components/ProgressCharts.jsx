// Lightweight, dependency-free progress charts built from workout logs.
// Metric: top set weight per session, per exercise, over time.

function parseWeight(w) {
  const n = parseFloat(String(w ?? "").replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
}

function shortDate(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

function buildSeries(logs) {
  const byEx = {};
  for (const l of logs) {
    const name = l.exercises?.name || "Exercise";
    const weights = (l.sets || []).map((s) => parseWeight(s.weight)).filter((n) => n !== null);
    if (!weights.length) continue;
    (byEx[name] ||= []).push({ date: l.date, y: Math.max(...weights) });
  }
  // ascending by date, dedupe to best per date
  return Object.entries(byEx).map(([name, pts]) => {
    const byDate = {};
    for (const p of pts) byDate[p.date] = Math.max(byDate[p.date] ?? 0, p.y);
    const series = Object.keys(byDate).sort().map((date) => ({ date, y: byDate[date] }));
    return { name, series };
  }).filter((s) => s.series.length > 0);
}

function LineChart({ points }) {
  const W = 300, H = 120, pad = 28;
  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanY = (maxY - minY) || 1;
  const px = (i) => points.length === 1
    ? W / 2
    : pad + (i / (points.length - 1)) * (W - 2 * pad);
  const py = (y) => H - pad - ((y - minY) / spanY) * (H - 2 * pad);
  const path = points.map((p, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      {/* y range labels */}
      <text x="4" y={py(maxY) + 4} className="chart-axis">{maxY}</text>
      <text x="4" y={py(minY) + 4} className="chart-axis">{minY}</text>
      {points.length > 1 && <path d={path} className="chart-line" fill="none" />}
      {points.map((p, i) => (
        <circle key={i} cx={px(i)} cy={py(p.y)} r="3" className="chart-dot" />
      ))}
      {/* first & last date labels */}
      <text x={px(0)} y={H - 8} className="chart-axis" textAnchor="middle">{shortDate(points[0].date)}</text>
      {points.length > 1 && (
        <text x={px(points.length - 1)} y={H - 8} className="chart-axis" textAnchor="middle">
          {shortDate(points[points.length - 1].date)}
        </text>
      )}
    </svg>
  );
}

export default function ProgressCharts({ logs }) {
  const series = buildSeries(logs);
  if (series.length === 0) return null;

  return (
    <div className="charts-section">
      <h2 className="charts-heading">Progress · top set weight</h2>
      <div className="charts-grid">
        {series.map((s) => {
          const first = s.series[0].y;
          const last = s.series[s.series.length - 1].y;
          const delta = last - first;
          return (
            <div className="chart-card" key={s.name}>
              <div className="chart-head">
                <span className="chart-name">{s.name}</span>
                <span className={"chart-delta " + (delta > 0 ? "up" : delta < 0 ? "down" : "")}>
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta) || 0}
                </span>
              </div>
              <LineChart points={s.series} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
