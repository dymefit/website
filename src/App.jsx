import { useState } from "react";
import { isConfigured } from "./lib/supabase";
import { useAuth, isCoachEmail } from "./auth.jsx";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import CoachApp from "./CoachApp.jsx";
import ClientPortal from "./components/ClientPortal.jsx";

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
  const { user, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (!isConfigured) return <NotConfigured />;
  if (loading) return <div className="splash">Loading…</div>;
  if (!user) {
    return showLogin
      ? <Login onBack={() => setShowLogin(false)} />
      : <Landing onEnter={() => setShowLogin(true)} />;
  }

  // Single coach (by email) gets the full builder; everyone else is a client.
  return isCoachEmail(user.email)
    ? <CoachApp user={user} onSignOut={signOut} />
    : <ClientPortal user={user} onSignOut={signOut} />;
}
