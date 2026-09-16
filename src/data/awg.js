/**
 * AWG reference table.
 * stroke = on-screen conductor thickness in px (24 AWG === 1px, thicker as gauge drops)
 * color  = the "heat" ramp: small wire = cool violet/blue, big wire = hot red.
 */
export const AWG_TABLE = [
  { awg: '24',   mm: 0.511, mm2: 0.205, stroke: 1.0,  ampacity: 2,   color: '#8b5cf6', name: 'Violet' },
  { awg: '22',   mm: 0.644, mm2: 0.326, stroke: 1.5,  ampacity: 3,   color: '#6366f1', name: 'Indigo' },
  { awg: '20',   mm: 0.812, mm2: 0.518, stroke: 2.0,  ampacity: 5,   color: '#3b82f6', name: 'Blue' },
  { awg: '18',   mm: 1.024, mm2: 0.823, stroke: 2.6,  ampacity: 7,   color: '#06b6d4', name: 'Cyan' },
  { awg: '16',   mm: 1.291, mm2: 1.31,  stroke: 3.2,  ampacity: 10,  color: '#10b981', name: 'Green' },
  { awg: '14',   mm: 1.628, mm2: 2.08,  stroke: 4.0,  ampacity: 15,  color: '#facc15', name: 'Yellow' },
  { awg: '12',   mm: 2.053, mm2: 3.31,  stroke: 4.8,  ampacity: 20,  color: '#f97316', name: 'Orange' },
  { awg: '10',   mm: 2.588, mm2: 5.26,  stroke: 5.6,  ampacity: 30,  color: '#ef4444', name: 'Red' },
  { awg: '8',    mm: 3.264, mm2: 8.37,  stroke: 6.6,  ampacity: 40,  color: '#dc2626', name: 'Deep Red' },
  { awg: '6',    mm: 4.115, mm2: 13.3,  stroke: 7.8,  ampacity: 55,  color: '#b91c1c', name: 'Crimson' },
  { awg: '4',    mm: 5.189, mm2: 21.2,  stroke: 9.0,  ampacity: 70,  color: '#991b1b', name: 'Dark Red' },
  { awg: '2',    mm: 6.544, mm2: 33.6,  stroke: 10.4, ampacity: 95,  color: '#7f1d1d', name: 'Maroon' },
  { awg: '1/0',  mm: 8.252, mm2: 53.5,  stroke: 12.0, ampacity: 150, color: '#6b0f1a', name: 'Oxblood' },
  { awg: '2/0',  mm: 9.266, mm2: 67.4,  stroke: 13.5, ampacity: 175, color: '#58101a', name: 'Oxblood +' },
];

export const DEFAULT_AWG = '12';

const MAP = new Map(AWG_TABLE.map((a) => [a.awg, a]));

export const getAwg = (awg) => MAP.get(String(awg)) ?? MAP.get(DEFAULT_AWG);
