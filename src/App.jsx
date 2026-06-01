import { useEffect, useState, useCallback } from "react";
import { isConfigured } from "./lib/supabase";
import { useAuth } from "./auth.jsx";
import * as api from "./lib/api";
import Login from "./components/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProgramView from "./components/ProgramView.jsx";
import CalendarView from "./components/CalendarView.jsx";

function NotConfigured() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">Finish setup</h1>
        <p>
          Supabase isn't configured yet. Copy <code>.env.example</code> to{" "}
          <code>.env</code>, add your project URL and anon key, then restart
          the dev server. See <code>README.md</code> for the full walkthrough.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [view, setView] = useState("programs"); // "programs" | "calendar"

  // Load clients once authenticated
  const refreshClients = useCallback(async () => {
    const data = await api.listClients();
    setClients(data);
    return data;
  }, []);

  useEffect(() => {
    if (user) refreshClients().catch(console.error);
  }, [user, refreshClients]);

  // Load programs when the selected client changes
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
        .catch(console.error);
    } else {
      setPrograms([]);
      setSelectedProgram(null);
    }
  }, [selectedClient, refreshPrograms]);

  if (!isConfigured) return <NotConfigured />;
  if (authLoading) return <div className="splash">Loading…</div>;
  if (!user) return <Login />;

  return (
    <div className="app">
      <Sidebar
        user={user}
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
        onSignOut={signOut}
      />

      <main className="content">
        {view === "calendar" ? (
          <CalendarView client={selectedClient} />
        ) : (
          <ProgramView
            client={selectedClient}
            program={selectedProgram}
          />
        )}
      </main>
    </div>
  );
}
