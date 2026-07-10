import { useEffect, useState, useCallback } from "react";
import * as api from "../lib/api";
import Modal from "./Modal.jsx";

// Category + equipment order mirror the original workbook layout.
const CATEGORY_ORDER = [
  "LOWER BODY",
  "UPPER BODY — PUSH",
  "UPPER BODY — PULL",
  "CORE & ROTATION",
  "EXPLOSIVE / POWER",
  "CONDITIONING",
];
const EQUIP_ORDER = [
  "Default", "Barbell", "Dumbbell", "Machine / Cable", "Band", "Bodyweight", "Kettlebell",
];

export default function ExerciseLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(null); // {category, pattern, equipment?}

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await api.listLibrary());
    } catch (e) {
      setError(
        e.message?.includes("exercise_library")
          ? "The library table isn't set up yet — run supabase/migration-exercise-library.sql."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function remove(item) {
    if (!confirm(`Remove "${item.name}" from the library?`)) return;
    try { await api.deleteLibraryItem(item.id); refresh(); }
    catch (e) { alert(e.message); }
  }

  // group: category -> pattern -> equipment -> [items]
  const byCat = {};
  for (const it of items) {
    ((byCat[it.category] ||= {})[it.pattern] ||= {})[it.equipment] ||= [];
    byCat[it.category][it.pattern][it.equipment].push(it);
  }
  const cats = [
    ...CATEGORY_ORDER.filter((c) => byCat[c]),
    ...Object.keys(byCat).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Exercise Library</h1>
          <div className="sub">
            Same pattern = same training effect. Pick by what your client has access to.
          </div>
        </div>
        <button className="btn" onClick={() => setAdding({})}>+ Add exercise</button>
      </div>

      {error && <div className="api-error">{error}</div>}
      {loading && <div className="muted-note">Loading…</div>}

      {cats.map((cat) => (
        <section className="lib-cat" key={cat}>
          <h2 className="lib-cat-title">{cat}</h2>
          {Object.keys(byCat[cat]).sort().map((pattern) => (
            <div className="day-card lib-pattern" key={pattern}>
              <div className="day-card-head">
                <h3>{pattern}</h3>
                <button
                  className="mini-btn"
                  onClick={() => setAdding({ category: cat, pattern })}
                >+ Add</button>
              </div>
              <div className="lib-eq-grid">
                {EQUIP_ORDER.filter((eq) => byCat[cat][pattern][eq]).map((eq) => (
                  <div className="lib-eq" key={eq}>
                    <div className="lib-eq-name">{eq}</div>
                    {byCat[cat][pattern][eq].map((it) => (
                      <div className="lib-item" key={it.id}>
                        <span>{it.name}</span>
                        <button className="tiny" title="Remove" aria-label={`Remove ${it.name}`} onClick={() => remove(it)}>✕</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {adding && (
        <AddForm
          categories={cats.length ? cats : CATEGORY_ORDER}
          patternsByCat={Object.fromEntries(cats.map((c) => [c, Object.keys(byCat[c] || {})]))}
          preset={adding}
          onClose={() => setAdding(null)}
          onSaved={() => { setAdding(null); refresh(); }}
        />
      )}
    </>
  );
}

function AddForm({ categories, patternsByCat, preset, onClose, onSaved }) {
  const [category, setCategory] = useState(preset.category || categories[0] || "");
  const [pattern, setPattern] = useState(preset.pattern || "");
  const [newPattern, setNewPattern] = useState("");
  const [equipment, setEquipment] = useState(preset.equipment || "Default");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const patterns = patternsByCat[category] || [];
  const usingNew = pattern === "__new__";

  async function submit(e) {
    e.preventDefault();
    const pat = usingNew ? newPattern.trim() : pattern;
    if (!category || !pat || !name.trim()) return;
    setBusy(true);
    try {
      await api.addLibraryItem({ category, pattern: pat, equipment, name: name.trim() });
      onSaved();
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Add to library" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="field-row">
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPattern(""); }}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Equipment</span>
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
              {EQUIP_ORDER.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Movement pattern</span>
          <select value={pattern} onChange={(e) => setPattern(e.target.value)} required>
            <option value="">— pick a pattern —</option>
            {patterns.map((p) => <option key={p} value={p}>{p}</option>)}
            <option value="__new__">＋ New pattern…</option>
          </select>
        </label>
        {usingNew && (
          <label className="field">
            <span>New pattern name</span>
            <input value={newPattern} onChange={(e) => setNewPattern(e.target.value)} autoFocus required placeholder="e.g. Grip / Forearm" />
          </label>
        )}
        <label className="field">
          <span>Exercise name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Zercher Squat" />
        </label>
        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={busy}>Add</button>
        </div>
      </form>
    </Modal>
  );
}
