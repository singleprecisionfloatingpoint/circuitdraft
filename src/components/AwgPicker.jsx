import React from 'react';
import { AWG_TABLE } from '../data/awg.js';

export default function AwgPicker({ value, onChange, compact = false }) {
  return (
    <div className={`awg-picker ${compact ? 'is-compact' : ''}`}>
      {AWG_TABLE.map((a) => (
        <button
          key={a.awg}
          type="button"
          className={`awg-chip ${String(value) === a.awg ? 'is-active' : ''}`}
          onClick={() => onChange(a.awg)}
          title={`${a.awg} AWG — ${a.mm} mm ⌀ — ${a.mm2} mm² — ~${a.ampacity}A`}
          style={{ '--chip': a.color }}
        >
          <span className="awg-swatch" style={{ background: a.color, height: Math.max(2, a.stroke) }} />
          <span className="awg-num">{a.awg}</span>
          {!compact && <span className="awg-mm">{a.mm}mm</span>}
        </button>
      ))}
    </div>
  );
}
