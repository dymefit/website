import { useEffect, useState, useCallback } from "react";
import * as api from "./lib/api";
import Sidebar from "./components/Sidebar.jsx";
import ProgramView from "./components/ProgramView.jsx";
import CalendarView from "./components/CalendarView.jsx";
import ClientDetail from "./components/ClientDetail.jsx";
import ClientLogs from "./components/ClientLogs.jsx";
import ExerciseLibrary from "./components/ExerciseLibrary.jsx";

export default function CoachApp({ user, onSignOut }) {
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [view, setView] = useState("programs"); // "programs" | "calendar" | "client"
  const [error, setError] = useState("");

  const refreshClients = useCallback(async () => {
    const data = await api.listClients();
    setClients(data);
    return data;
  }, []);

  const handleClientChanged = useCallback(async (updated) => {
    if (updated) setSelectedClient(updated);
    await refreshClients();
  }, [refreshClients]);

  const handleClientDeleted = useCallback(async () => {
    setSelectedClient(null);
    setView("client");
    await refreshClients();
  }, [refreshClients]);

  useEffect(() => {
    refreshClients().catch((e) => setError(e.message));
  }, [refreshClients]);

  const refreshPrograms = useCallback(async (clientId) => {
    if (!clientId) { setPrograms([]); return []; }
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

  return (
    <div className="app">
      <Sidebar
        user={user}
        onSignOut={onSignOut}
        clients={clients}
        programs={programs}
        selectedClient={selectedClient}
        selectedProgram={selectedProgram}
        view={view}
        onSelectClient={setSelectedClient}
        onSelectProgram={(p) => { setSelectedProgram(p); setView("programs"); }}
        onSetView={setView}
        onClientsChanged={refreshClients}
        onProgramsChanged={() => refreshPrograms(selectedClient?.id)}
      />

      <main className="content">
        {error && <div className="api-error">{error}</div>}
        {view === "calendar" && <CalendarView client={selectedClient} />}
        {view === "logs" && <ClientLogs client={selectedClient} />}
        {view === "library" && <ExerciseLibrary />}
        {view === "client" && (
          <ClientDetail client={selectedClient} onChanged={handleClientChanged} onDeleted={handleClientDeleted} />
        )}
        {view === "programs" && (
          <ProgramView
            client={selectedClient}
            program={selectedProgram}
            onProgramsChanged={() => refreshPrograms(selectedClient?.id)}
            onSelectProgram={setSelectedProgram}
          />
        )}
      </main>
    </div>
  );
}
