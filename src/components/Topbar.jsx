import React from 'react';
import { AWG_TABLE } from '../data/awg.js';

export default function Topbar({
  name,
  setName,
  activeAwg,
  setActiveAwg,
  onExport,
  busy,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showLabels,
  setShowLabels,
  onNew,
  user,
  onSignOut,
}) {
  const spec = AWG_TABLE.find((a) => a.awg === String(activeAwg));

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">⚡</span>
        <span className="brand-name">
          Volt<strong>Pad</strong> by angking
        </span>
      </div>

      <input
        className="project-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Untitled diagram"
        spellCheck={false}
      />

      <div className="gauge-select">
        <span className="gauge-dot" style={{ background: spec?.color }} />
        <select value={activeAwg} onChange={(e) => setActiveAwg(e.target.value)} title="Default gauge for new wires">
          {AWG_TABLE.map((a) => (
            <option key={a.awg} value={a.awg}>
              {a.awg} AWG — {a.mm} mm
            </option>
          ))}
        </select>
      </div>

      <div className="topbar-group">
        <button type="button" className="btn icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">↶</button>
        <button type="button" className="btn icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">↷</button>
        <button
          type="button"
          className={`btn icon ${showLabels ? 'is-on' : ''}`}
          onClick={() => setShowLabels((v) => !v)}
          title="Toggle AWG badges"
        >
          ⌗
        </button>
      </div>

      <div className="topbar-spacer" />

      <button type="button" className="btn ghost" onClick={onNew} title="Start a new diagram">
        New
      </button>

      <button type="button" className="btn" onClick={() => onExport('png')} disabled={busy}>
        PNG
      </button>
      <button type="button" className="btn primary" onClick={() => onExport('pdf')} disabled={busy}>
        {busy ? 'Exporting…' : 'Export PDF'}
      </button>

      <div className="user-chip" title={user?.username}>
        <span className="avatar">{(user?.username || '?').slice(0, 1).toUpperCase()}</span>
        <span className="user-name">{user?.username}</span>
        <button type="button" className="signout" onClick={onSignOut} title="Sign out">⏻</button>
      </div>
    </header>
  );
}
