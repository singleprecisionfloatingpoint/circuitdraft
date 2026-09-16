import React from 'react';
import { COMPONENTS } from '../data/components.jsx';
import { portOffset } from '../lib/geometry.js';

export default function NodeView({ node, selected, hoverPort, showLabels, onNodeDown, onPortDown }) {
  const comp = COMPONENTS[node.type];
  if (!comp) return null;

  return (
    <div
      className={`node ${selected ? 'is-selected' : ''}`}
      style={{ left: node.x, top: node.y, width: comp.w, height: comp.h }}
      onPointerDown={(e) => onNodeDown(e, node)}
    >
      <div className="node-body">
        <div className="node-icon" style={{ width: comp.w * 0.5, height: comp.h * 0.5 }}>
          {comp.icon}
        </div>
      </div>

      {showLabels && <div className="node-label">{node.label || comp.name}</div>}

      {comp.ports.map((port) => {
        const o = portOffset(comp, port);
        const hot = hoverPort && hoverPort.nodeId === node.id && hoverPort.portId === port.id;
        return (
          <div
            key={port.id}
            data-port="1"
            data-node-id={node.id}
            data-port-id={port.id}
            className={`port ${hot ? 'is-hot' : ''}`}
            style={{ left: o.x * comp.w, top: o.y * comp.h }}
            onPointerDown={(e) => onPortDown(e, node.id, port.id)}
            title={`${comp.name} — ${port.label}`}
          >
            <span className="port-dot" />
            <span className="port-tag">{port.label}</span>
          </div>
        );
      })}
    </div>
  );
}
