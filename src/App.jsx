import { isConfigured } from "./lib/supabase";
import { useAuth, isCoachEmail } from "./auth.jsx";
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
          <code>VITE_SUPABASE_ANON_KEY</code>, then rebuild.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (!isConfigured) return <NotConfigured />;
  if (loading) return <div className="splash">Loading…</div>;
  // The public marketing site lives at "/"; this React app is the member
  // portal at "/app", so signed-out visitors go straight to Login.
  if (!user) return <Login onBack={() => { window.location.href = "/"; }} />;

  return isCoachEmail(user.email)
    ? <CoachApp user={user} onSignOut={signOut} />
    : <ClientPortal user={user} onSignOut={signOut} />;
}
