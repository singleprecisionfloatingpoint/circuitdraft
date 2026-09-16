import React from 'react';

const S = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="100%"
    height="100%"
  >
    {children}
  </svg>
);

/**
 * Every component declares its footprint (w/h in world px) and its terminals.
 * A terminal can be side-anchored (`side`) or absolutely anchored (`x`,`y` in 0..1).
 */
export const COMPONENTS = {
  panel: {
    name: 'Load Center',
    group: 'Power',
    w: 96, h: 128,
    ports: [
      { id: 'main', label: 'MAIN', side: 'left' },
      { id: 'b1', label: 'B1', side: 'right' },
      { id: 'b2', label: 'B2', side: 'right' },
      { id: 'b3', label: 'B3', side: 'right' },
      { id: 'gnd', label: 'GND', side: 'bottom' },
    ],
    icon: (
      <S>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <path d="M8 7.5h8M8 11h8M8 14.5h8M8 18h4" />
      </S>
    ),
  },
  meter: {
    name: 'Meter',
    group: 'Power',
    w: 84, h: 84,
    ports: [
      { id: 'in', label: 'IN', side: 'left' },
      { id: 'out', label: 'OUT', side: 'right' },
      { id: 'g', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 12l3.6-2.6" />
        <path d="M7.2 12h1.4M15.4 12h1.4M12 7.2v1.4" />
      </S>
    ),
  },
  breaker: {
    name: 'Breaker',
    group: 'Power',
    w: 84, h: 68,
    ports: [
      { id: 'line', label: 'L', side: 'top' },
      { id: 'load', label: 'LD', side: 'bottom' },
    ],
    icon: (
      <S>
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <path d="M9 7v10M15 7v10" />
        <path d="M12 3.5V7" />
      </S>
    ),
  },
  transformer: {
    name: 'Transformer',
    group: 'Power',
    w: 92, h: 92,
    ports: [
      { id: 'p1', label: 'P1', x: 0, y: 0.3 },
      { id: 'p2', label: 'P2', x: 0, y: 0.7 },
      { id: 's1', label: 'S1', x: 1, y: 0.3 },
      { id: 's2', label: 'S2', x: 1, y: 0.7 },
    ],
    icon: (
      <S>
        <circle cx="9.2" cy="12" r="4.5" />
        <circle cx="14.8" cy="12" r="4.5" />
        <path d="M4 12H2.4M21.6 12H20" />
      </S>
    ),
  },
  outlet: {
    name: 'Receptacle',
    group: 'Devices',
    w: 76, h: 76,
    ports: [
      { id: 'hot', label: 'H', side: 'left' },
      { id: 'neu', label: 'N', side: 'right' },
      { id: 'gnd', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        <circle cx="9.4" cy="9" r="0.95" fill="currentColor" />
        <circle cx="14.6" cy="9" r="0.95" fill="currentColor" />
        <circle cx="12" cy="15.2" r="1.3" />
      </S>
    ),
  },
  gfci: {
    name: 'GFCI',
    group: 'Devices',
    w: 76, h: 76,
    ports: [
      { id: 'line', label: 'L', side: 'left' },
      { id: 'load', label: 'LD', side: 'right' },
      { id: 'gnd', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        <circle cx="9.4" cy="9.5" r="0.95" fill="currentColor" />
        <circle cx="14.6" cy="9.5" r="0.95" fill="currentColor" />
        <path d="M9 14.5h6M10.5 17.2h3" />
      </S>
    ),
  },
  switch: {
    name: 'Switch',
    group: 'Devices',
    w: 72, h: 72,
    ports: [
      { id: 'line', label: 'L', side: 'top' },
      { id: 'load', label: 'LD', side: 'bottom' },
      { id: 'gnd', label: 'G', side: 'left' },
    ],
    icon: (
      <S>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M12 7v3.5" />
        <circle cx="12" cy="14.5" r="1.5" />
      </S>
    ),
  },
  dimmer: {
    name: 'Dimmer',
    group: 'Devices',
    w: 72, h: 72,
    ports: [
      { id: 'line', label: 'L', side: 'top' },
      { id: 'load', label: 'LD', side: 'bottom' },
      { id: 'gnd', label: 'G', side: 'left' },
    ],
    icon: (
      <S>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M9.5 9.5c1.2-1.6 3.8-1.6 5 0" />
        <circle cx="12" cy="15" r="1.5" />
      </S>
    ),
  },
  light: {
    name: 'Luminaire',
    group: 'Devices',
    w: 72, h: 72,
    ports: [
      { id: 'hot', label: 'H', side: 'left' },
      { id: 'neu', label: 'N', side: 'right' },
      { id: 'gnd', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .9 1.6l.1.6h5.2l.1-.6c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z" />
        <path d="M9.6 19h4.8M10.6 21.4h2.8" />
      </S>
    ),
  },
  fan: {
    name: 'Ceiling Fan',
    group: 'Devices',
    w: 80, h: 80,
    ports: [
      { id: 'hot', label: 'H', side: 'left' },
      { id: 'neu', label: 'N', side: 'right' },
      { id: 'gnd', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <circle cx="12" cy="12" r="2.2" />
        <path d="M12 9.8c-.6-2.6 0-5.3 2-5.8 1.8-.5 2.6 2.2.7 5.6" />
        <path d="M14.2 12c2.6-.6 5.3 0 5.8 2 .5 1.8-2.2 2.6-5.6.7" />
        <path d="M12 14.2c.6 2.6 0 5.3-2 5.8-1.8.5-2.6-2.2-.7-5.6" />
        <path d="M9.8 12c-2.6.6-5.3 0-5.8-2-.5-1.8 2.2-2.6 5.6-.7" />
      </S>
    ),
  },
  motor: {
    name: 'Motor',
    group: 'Devices',
    w: 84, h: 84,
    ports: [
      { id: 'l1', label: 'L1', side: 'left' },
      { id: 'l2', label: 'L2', side: 'right' },
      { id: 'gnd', label: 'G', side: 'bottom' },
    ],
    icon: (
      <S>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M9 15.5V9l3 3.5L15 9v6.5" />
      </S>
    ),
  },
  junction: {
    name: 'Junction Box',
    group: 'Infrastructure',
    w: 76, h: 76,
    ports: [
      { id: 'a', label: 'A', side: 'top' },
      { id: 'b', label: 'B', side: 'right' },
      { id: 'c', label: 'C', side: 'bottom' },
      { id: 'd', label: 'D', side: 'left' },
    ],
    icon: (
      <S>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 4.5v15M4.5 12h15" />
      </S>
    ),
  },
  splice: {
    name: 'Splice',
    group: 'Infrastructure',
    w: 64, h: 64,
    ports: [
      { id: 'a', label: 'A', side: 'top' },
      { id: 'b', label: 'B', side: 'right' },
      { id: 'c', label: 'C', side: 'bottom' },
      { id: 'd', label: 'D', side: 'left' },
    ],
    icon: (
      <S>
        <circle cx="12" cy="12" r="5" />
        <path d="M6 12H3.2M20.8 12H18M12 6V3.2M12 20.8V18" />
      </S>
    ),
  },
  ground: {
    name: 'Ground Rod',
    group: 'Infrastructure',
    w: 72, h: 72,
    ports: [{ id: 'g', label: 'G', side: 'top' }],
    icon: (
      <S>
        <path d="M12 3v9" />
        <path d="M6 12.5h12M8.4 16.2h7.2M10.4 19.9h3.2" />
      </S>
    ),
  },
};

export const COMPONENT_GROUPS = ['Power', 'Devices', 'Infrastructure'];
