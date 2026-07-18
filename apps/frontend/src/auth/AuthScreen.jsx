import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";

// Ecran connexion / inscription (bascule entre les deux modes).
export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">K</span> Kapsule
        </div>
        <h1 className="auth-title">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
        <form onSubmit={submit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            <span>Mot de passe</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {mode === "register" && <p className="auth-hint">8 caractères minimum.</p>}
          {error && <p className="msg error auth-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
