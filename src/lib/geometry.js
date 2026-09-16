import { COMPONENTS } from '../data/components.jsx';

export function portOffset(comp, port) {
  if (typeof port.x === 'number' && typeof port.y === 'number') {
    return { x: port.x, y: port.y };
  }
  const sameSide = comp.ports.filter((p) => p.side === port.side);
  const i = Math.max(0, sameSide.indexOf(port));
  const t = (i + 1) / (sameSide.length + 1);
  switch (port.side) {
    case 'left':
      return { x: 0, y: t };
    case 'right':
      return { x: 1, y: t };
    case 'top':
      return { x: t, y: 0 };
    default:
      return { x: t, y: 1 };
  }
}

export function portPoint(node, portId) {
  if (!node) return null;
  const comp = COMPONENTS[node.type];
  if (!comp) return null;
  const port = comp.ports.find((p) => p.id === portId);
  if (!port) return null;
  const o = portOffset(comp, port);
  return { x: node.x + o.x * comp.w, y: node.y + o.y * comp.h };
}

/** Smooth S-curve between two terminals. */
export function wirePath(a, b) {
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

/** Point on the cubic bezier at t = 0.5. */
export function wireMidpoint(a, b) {
  const mx = (a.x + b.x) / 2;
  return {
    x: (a.x + 6 * mx + b.x) / 8,
    y: (a.y + b.y) / 2,
  };
}

/** Numeric arc length of the bezier (used for the inspector readout). */
export function wireLength(a, b) {
  const mx = (a.x + b.x) / 2;
  const at = (t) => {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * a.x + 3 * mt * mt * t * mx + 3 * mt * t * t * mx + t * t * t * b.x,
      y: mt * mt * mt * a.y + 3 * mt * mt * t * a.y + 3 * mt * t * t * b.y + t * t * t * b.y,
    };
  };
  let len = 0;
  let prev = at(0);
  for (let i = 1; i <= 24; i += 1) {
    const p = at(i / 24);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}
