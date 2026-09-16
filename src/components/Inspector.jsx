import React from 'react';
import { COMPONENTS } from '../data/components.jsx';
import { getAwg } from '../data/awg.js';
import { portPoint, wireLength } from '../lib/geometry.js';
import AwgPicker from './AwgPicker.jsx';

export default function Inspector({
  doc,
  selection,
  setSelection,
  onUpdateWire,
  onUpdateNode,
  onDelete,
  activeAwg,
  setActiveAwg,
}) {
  const nodeMap = Object.fromEntries(doc.nodes.map((n) => [n.id, n]));

  if (!selection) {
    return (
      <aside className="inspector">
        <div className="panel-section">
          <h2 className="section-title">Inspector</h2>
          <p className="section-hint">
            Select a component or a conductor to edit it. Drag from a terminal dot to draw a wire.
          </p>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Diagram</h2>
          <dl className="kv">
            <div><dt>Components</dt><dd>{doc.nodes.length}</dd></div>
            <div><dt>Conductors</dt><dd>{doc.wires.length}</dd></div>
            <div><dt>Active gauge</dt><dd>{getAwg(activeAwg).awg} AWG</dd></div>
          </dl>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Active Gauge</h2>
          <AwgPicker value={activeAwg} onChange={setActiveAwg} />
          <div className="spec-card">
            <div className="spec-row"><span>Diameter</span><b>{getAwg(activeAwg).mm} mm</b></div>
            <div className="spec-row"><span>Cross-section</span><b>{getAwg(activeAwg).mm2} mm²</b></div>
            <div className="spec-row"><span>Typical ampacity</span><b>{getAwg(activeAwg).ampacity} A</b></div>
            <div className="spec-row"><span>Stroke</span><b>{getAwg(activeAwg).stroke} px</b></div>
          </div>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Shortcuts</h2>
          <ul className="shortcuts">
            <li><kbd>Del</kbd> remove selection</li>
            <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> undo</li>
            <li><kbd>Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>Z</kbd> redo</li>
            <li><kbd>Esc</kbd> deselect</li>
          </ul>
        </div>
      </aside>
    );
  }

  if (selection.kind === 'wire') {
    const wire = doc.wires.find((w) => w.id === selection.id);
    if (!wire) return <aside className="inspector" />;

    const spec = getAwg(wire.awg);
    const a = portPoint(nodeMap[wire.from.nodeId], wire.from.portId);
    const b = portPoint(nodeMap[wire.to.nodeId], wire.to.portId);
    const len = a && b ? wireLength(a, b) : 0;
    const fromNode = nodeMap[wire.from.nodeId];
    const toNode = nodeMap[wire.to.nodeId];

    return (
      <aside className="inspector">
        <div className="panel-section">
          <div className="inspector-head">
            <h2 className="section-title">Conductor</h2>
            <span className="badge" style={{ '--badge': spec.color }}>{spec.awg} AWG</span>
          </div>

          <AwgPicker
            value={wire.awg}
            onChange={(awg) => onUpdateWire(wire.id, { awg, color: null })}
          />

          <div className="spec-card">
            <div className="spec-row"><span>Diameter</span><b>{spec.mm} mm</b></div>
            <div className="spec-row"><span>Cross-section</span><b>{spec.mm2} mm²</b></div>
            <div className="spec-row"><span>Typical ampacity</span><b>{spec.ampacity} A</b></div>
            <div className="spec-row"><span>Route length</span><b>{Math.round(len)} px</b></div>
          </div>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Color</h2>
          <p className="section-hint">Defaults to the gauge ramp. Override for hot / neutral / ground coding.</p>
          <div className="color-row">
            <button
              type="button"
              className={`color-auto ${!wire.color ? 'is-active' : ''}`}
              onClick={() => onUpdateWire(wire.id, { color: null })}
              style={{ background: spec.color }}
              title="Auto (gauge color)"
            />
            {['#111827', '#f8fafc', '#16a34a', '#0ea5e9', '#f43f5e', '#a855f7', '#eab308'].map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${wire.color === c ? 'is-active' : ''}`}
                style={{ background: c }}
                onClick={() => onUpdateWire(wire.id, { color: c })}
                title={c}
              />
            ))}
            <label className="color-custom" title="Custom color">
              <input
                type="color"
                value={wire.color || spec.color}
                onChange={(e) => onUpdateWire(wire.id, { color: e.target.value })}
              />
              <span>+</span>
            </label>
          </div>
        </div>

        <div className="panel-section">
          <h2 className="section-title">Connection</h2>
          <dl className="kv">
            <div><dt>From</dt><dd>{COMPONENTS[fromNode?.type]?.name} · {wire.from.portId}</dd></div>
            <div><dt>To</dt><dd>{COMPONENTS[toNode?.type]?.name} · {wire.to.portId}</dd></div>
          </dl>
        </div>

        <div className="panel-section">
          <button type="button" className="btn danger full" onClick={onDelete}>
            Delete conductor
          </button>
        </div>
      </aside>
    );
  }

  const node = nodeMap[selection.id];
  if (!node) return <aside className="inspector" />;
  const comp = COMPONENTS[node.type];

  return (
    <aside className="inspector">
      <div className="panel-section">
        <div className="inspector-head">
          <h2 className="section-title">Component</h2>
          <span className="badge badge-neutral">{comp?.name}</span>
        </div>
        <label className="field">
          <span>Label</span>
          <input
            type="text"
            value={node.label || ''}
            placeholder={comp?.name}
            onChange={(e) => onUpdateNode(node.id, { label: e.target.value })}
          />
        </label>
        <div className="spec-card">
          <div className="spec-row"><span>Type</span><b>{node.type}</b></div>
          <div className="spec-row"><span>Position</span><b>{node.x}, {node.y}</b></div>
          <div className="spec-row"><span>Terminals</span><b>{comp?.ports.length ?? 0}</b></div>
        </div>
      </div>

      <div className="panel-section">
        <h2 className="section-title">Terminals</h2>
        <ul className="terminal-list">
          {comp?.ports.map((p) => (
            <li key={p.id}>
              <span className="terminal-dot" />
              <span className="terminal-id">{p.id}</span>
              <span className="terminal-label">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-section">
        <button type="button" className="btn danger full" onClick={onDelete}>
          Delete component
        </button>
      </div>
    </aside>
  );
}
