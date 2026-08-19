import { useState } from "react";
import { useAuth } from "../auth.jsx";
import BrandMark from "./BrandMark.jsx";
import { CONTACT_EMAIL } from "../lib/constants";

export default function Login({ onBack }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        if (!data.session) {
          setInfo("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand auth-brand">
          <BrandMark size={30} />
          <span className="brand-name">Fitness-Elevated</span>
        </div>
        <h1 className="auth-title">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="auth-sub">Coaches and clients sign in here.</p>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"} />
        </label>

        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <p className="auth-switch">
          {mode === "signin" ? "New client? " : "Already have an account? "}
          <button type="button" className="linklike"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}>
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>

        {onBack && (
          <button type="button" className="linklike auth-back" onClick={onBack}>← Back to home</button>
        )}
        <p className="auth-contact">Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </form>
    </div>
  );
}
