import React from 'react';
import { COMPONENTS, COMPONENT_GROUPS } from '../data/components.jsx';
import { AWG_TABLE } from '../data/awg.js';

export default function Palette({ onAdd, activeAwg, setActiveAwg }) {
  return (
    <aside className="sidebar">
      <div className="panel-section">
        <h2 className="section-title">Components</h2>
        <p className="section-hint">Drag onto the canvas — or click to drop in the centre.</p>

        {COMPONENT_GROUPS.map((group) => (
          <div key={group} className="palette-group">
            <h3 className="palette-group-title">{group}</h3>
            <div className="palette-grid">
              {Object.entries(COMPONENTS)
                .filter(([, c]) => c.group === group)
                .map(([type, c]) => (
                  <button
                    key={type}
                    type="button"
                    className="palette-item"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-voltpad', type);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => onAdd(type)}
                    title={`Add ${c.name}`}
                  >
                    <span className="palette-icon">{c.icon}</span>
                    <span className="palette-name">{c.name}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <h2 className="section-title">Conductor (AWG)</h2>
        <p className="section-hint">
          Lower gauge = thicker conductor. Line weight scales with the real diameter.
        </p>
        <ul className="awg-legend">
          {AWG_TABLE.map((a) => (
            <li
              key={a.awg}
              className={`awg-row ${String(activeAwg) === a.awg ? 'is-active' : ''}`}
              onClick={() => setActiveAwg(a.awg)}
            >
              <span className="awg-line" style={{ background: a.color, height: Math.max(2, a.stroke) }} />
              <span className="awg-row-num">{a.awg}</span>
              <span className="awg-row-meta">
                {a.mm} mm · {a.mm2} mm²
              </span>
              <span className="awg-row-amp">{a.ampacity}A</span>
            </li>
          ))}
        </ul>
        <p className="section-hint dim">Ampacity values are typical reference figures.</p>
      </div>
    </aside>
  );
}
