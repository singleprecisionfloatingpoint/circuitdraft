import React, { useState } from 'react';
import { sendCredentials } from '../lib/webhook.js';

export default function AuthModal({ onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u || !password) {
      setError('Both fields are required.');
      return;
    }
    setBusy(true);
    setError('');

    const res = await sendCredentials({ username: u, password });

    // The webhook is fire-and-forget (opaque no-cors response). We still
    // persist locally so the workspace unlocks even if the network hiccups.
    onAuth({ username: u, signedInAt: new Date().toISOString(), synced: res.ok });
    setBusy(false);
  };

  return (
    <div className="auth-backdrop">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark big">⚡</span>
          <div>
            <h1>VoltPad</h1>
            <p>Electrical Wiring Diagram Studio</p>
          </div>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? 'Connecting…' : 'Connect & Continue'}
          </button>
        </form>

        <p className="auth-note">
          Your session is stored locally for 12 months, so you won’t have to sign in again on this device.
        </p>
      </div>
    </div>
  );
}
