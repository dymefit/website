import { useEffect, useState, useCallback } from "react";
import { isConfigured } from "./lib/supabase";
import * as api from "./lib/api";
import Sidebar from "./components/Sidebar.jsx";
import ProgramView from "./components/ProgramView.jsx";
import CalendarView from "./components/CalendarView.jsx";

function NotConfigured() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Finish setup</h1>
        <p>
          Supabase isn't configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> (in <code>.env</code> for local dev,
          or in the Netlify dashboard for the deployed site), then rebuild.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [view, setView] = useState("programs"); // "programs" | "calendar"
  const [error, setError] = useState("");

  const refreshClients = useCallback(async () => {
    const data = await api.listClients();
    setClients(data);
    return data;
  }, []);

  // No login — load the shared dataset on mount.
  useEffect(() => {
    if (isConfigured) refreshClients().catch((e) => setError(e.message));
  }, [refreshClients]);

  const refreshPrograms = useCallback(async (clientId) => {
    if (!clientId) {
      setPrograms([]);
      return [];
    }
    const data = await api.listPrograms(clientId);
    setPrograms(data);
    return data;
  }, []);

  useEffect(() => {
    if (selectedClient) {
      refreshPrograms(selectedClient.id)
        .then((ps) => setSelectedProgram(ps[0] ?? null))
        .catch((e) => setError(e.message));
    } else {
      setPrograms([]);
      setSelectedProgram(null);
    }
  }, [selectedClient, refreshPrograms]);

  if (!isConfigured) return <NotConfigured />;

  return (
    <div className="app">
      <Sidebar
        clients={clients}
        programs={programs}
        selectedClient={selectedClient}
        selectedProgram={selectedProgram}
        view={view}
        onSelectClient={setSelectedClient}
        onSelectProgram={(p) => {
          setSelectedProgram(p);
          setView("programs");
        }}
        onSetView={setView}
        onClientsChanged={refreshClients}
        onProgramsChanged={() => refreshPrograms(selectedClient?.id)}
      />

      <main className="content">
        {error && <div className="api-error">{error}</div>}
        {view === "calendar" ? (
          <CalendarView client={selectedClient} />
        ) : (
          <ProgramView client={selectedClient} program={selectedProgram} />
        )}
      </main>
    </div>
  );
}
