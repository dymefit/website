// ===== ProgramLab — exercise programming front end =====
// Simple state held in memory + persisted to localStorage.

const STORE_KEY = "programlab.v1";

const seed = {
  clients: [
    {
      id: "c1",
      name: "Jordan Avery",
      goal: "Strength",
      programs: [
        {
          id: "p1",
          name: "Foundations — Phase 1",
          weeks: 4,
          days: [
            {
              label: "Day A",
              focus: "Lower / Push",
              exercises: [
                { name: "Back Squat", sets: "4", reps: "5", load: "75% 1RM", rest: "2:30" },
                { name: "Romanian Deadlift", sets: "3", reps: "8", load: "RPE 7", rest: "2:00" },
                { name: "Walking Lunge", sets: "3", reps: "10/leg", load: "BW + DB", rest: "1:30" },
                { name: "Standing Calf Raise", sets: "3", reps: "15", load: "Moderate", rest: "1:00" },
              ],
            },
            {
              label: "Day B",
              focus: "Upper / Pull",
              exercises: [
                { name: "Bench Press", sets: "4", reps: "6", load: "72% 1RM", rest: "2:30" },
                { name: "Pull-up", sets: "4", reps: "AMRAP", load: "BW", rest: "2:00" },
                { name: "Seated Row", sets: "3", reps: "10", load: "RPE 7", rest: "1:30" },
                { name: "Face Pull", sets: "3", reps: "15", load: "Light", rest: "1:00" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "c2",
      name: "Sam Rivera",
      goal: "Hypertrophy",
      programs: [
        {
          id: "p2",
          name: "Upper/Lower Split",
          weeks: 6,
          days: [
            {
              label: "Upper",
              focus: "Volume",
              exercises: [
                { name: "Incline DB Press", sets: "4", reps: "10", load: "RPE 8", rest: "1:30" },
                { name: "Lat Pulldown", sets: "4", reps: "12", load: "RPE 8", rest: "1:30" },
                { name: "Lateral Raise", sets: "3", reps: "15", load: "Light", rest: "1:00" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return structuredClone(seed);
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
}

const state = {
  data: load(),
  selectedClientId: null,
  selectedProgramId: null,
  view: "programs", // "programs" | "calendar"
};

// ----- helpers -----
const $ = (sel) => document.querySelector(sel);
const uid = (p) => p + Math.random().toString(36).slice(2, 8);

function currentClient() {
  return state.data.clients.find((c) => c.id === state.selectedClientId) || null;
}
function currentProgram() {
  const c = currentClient();
  if (!c) return null;
  return c.programs.find((p) => p.id === state.selectedProgramId) || null;
}

// ----- sidebar rendering -----
function renderClients() {
  const ul = $("#client-list");
  ul.innerHTML = "";
  if (state.data.clients.length === 0) {
    ul.innerHTML = '<li class="list-empty">No clients yet</li>';
    return;
  }
  state.data.clients.forEach((c) => {
    const li = document.createElement("li");
    li.className = "list-item" + (c.id === state.selectedClientId ? " active" : "");
    li.innerHTML = `<span>${c.name}</span><span class="meta">${c.goal || ""}</span>`;
    li.onclick = () => selectClient(c.id);
    ul.appendChild(li);
  });
}

function renderPrograms() {
  const ul = $("#program-list");
  ul.innerHTML = "";
  const c = currentClient();
  if (!c) {
    ul.innerHTML = '<li class="list-empty">Select a client</li>';
    return;
  }
  if (c.programs.length === 0) {
    ul.innerHTML = '<li class="list-empty">No programs yet</li>';
    return;
  }
  c.programs.forEach((p) => {
    const li = document.createElement("li");
    li.className = "list-item" + (p.id === state.selectedProgramId ? " active" : "");
    li.innerHTML = `<span>${p.name}</span><span class="meta">${p.weeks}w</span>`;
    li.onclick = () => selectProgram(p.id);
    ul.appendChild(li);
  });
}

function setActiveNav() {
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === state.view);
  });
}

// ----- selection -----
function selectClient(id) {
  state.selectedClientId = id;
  const c = currentClient();
  state.selectedProgramId = c && c.programs[0] ? c.programs[0].id : null;
  state.view = "programs";
  renderAll();
}
function selectProgram(id) {
  state.selectedProgramId = id;
  state.view = "programs";
  renderAll();
}

// ----- main content rendering -----
function renderContent() {
  const el = $("#content");
  if (state.view === "calendar") return renderCalendar(el);

  const program = currentProgram();
  if (!program) {
    el.innerHTML = `
      <div class="placeholder">
        <div>
          <div class="big">📋</div>
          <p>Select a client and program to view it here.</p>
        </div>
      </div>`;
    return;
  }

  const client = currentClient();
  const daysHtml = program.days.map((d) => `
    <div class="day-card">
      <div class="day-card-head">
        <h3>${d.label}</h3>
        <span class="focus">${d.focus || ""}</span>
      </div>
      <table class="exercises">
        <thead>
          <tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Load</th><th>Rest</th></tr>
        </thead>
        <tbody>
          ${d.exercises.map((ex) => `
            <tr>
              <td class="name">${ex.name}</td>
              <td>${ex.sets}</td>
              <td>${ex.reps}</td>
              <td>${ex.load}</td>
              <td>${ex.rest}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`).join("");

  el.innerHTML = `
    <div class="content-header">
      <div>
        <h1>${program.name}</h1>
        <div class="sub">${client.name} · ${program.weeks}-week block · ${program.days.length} training days</div>
      </div>
      <button class="btn" id="add-day">+ Add Day</button>
    </div>
    <div class="day-grid">${daysHtml}</div>`;

  $("#add-day").onclick = () => {
    const label = prompt("Day label (e.g. Day C):");
    if (!label) return;
    program.days.push({ label, focus: "", exercises: [] });
    save();
    renderContent();
  };
}

function renderCalendar(el) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString("default", { month: "long" });
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let cells = dows.map((d) => `<div class="cal-dow">${d}</div>`).join("");
  for (let i = 0; i < startDow; i++) cells += '<div class="cal-cell empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === now.getDate();
    // Simple demo scheduling: training on Mon/Wed/Fri
    const dow = new Date(year, month, day).getDay();
    const train = [1, 3, 5].includes(dow);
    cells += `
      <div class="cal-cell${isToday ? " today" : ""}">
        <div class="date">${day}</div>
        ${train ? '<span class="cal-tag">Training</span>' : ""}
      </div>`;
  }

  el.innerHTML = `
    <div class="content-header">
      <div>
        <h1>${monthName} ${year}</h1>
        <div class="sub">Scheduled sessions${currentClient() ? " · " + currentClient().name : ""}</div>
      </div>
    </div>
    <div class="calendar">${cells}</div>`;
}

// ----- actions -----
function addClient() {
  const name = prompt("Client name:");
  if (!name) return;
  const goal = prompt("Primary goal (e.g. Strength):") || "";
  const id = uid("c");
  state.data.clients.push({ id, name, goal, programs: [] });
  save();
  selectClient(id);
}

function addProgram() {
  const c = currentClient();
  if (!c) { alert("Select a client first."); return; }
  const name = prompt("Program name:");
  if (!name) return;
  const weeks = parseInt(prompt("Number of weeks:", "4"), 10) || 4;
  const id = uid("p");
  c.programs.push({ id, name, weeks, days: [] });
  save();
  selectProgram(id);
}

// ----- wire up -----
function renderAll() {
  setActiveNav();
  renderClients();
  renderPrograms();
  renderContent();
}

document.querySelectorAll(".nav-btn").forEach((b) => {
  b.onclick = () => { state.view = b.dataset.view; renderAll(); };
});
$("#add-client").onclick = addClient;
$("#add-program").onclick = addProgram;

// initial selection
if (state.data.clients[0]) selectClient(state.data.clients[0].id);
else renderAll();
