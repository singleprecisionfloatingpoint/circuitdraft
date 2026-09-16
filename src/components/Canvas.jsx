import React, { useCallback, useEffect, useRef, useState } from 'react';
import NodeView from './NodeView.jsx';
import { COMPONENTS } from '../data/components.jsx';
import { portPoint, wirePath, wireMidpoint } from '../lib/geometry.js';
import { getAwg } from '../data/awg.js';
import { clamp } from '../lib/utils.js';

const WORLD_W = 4200;
const WORLD_H = 3000;

export default function Canvas({
  doc,
  view,
  setView,
  activeAwg,
  selection,
  setSelection,
  onAddNode,
  onAddWire,
  onMoveNode,
  onBeginHistory,
  worldRef,
  showLabels,
}) {
  const stageRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [hoverPort, setHoverPort] = useState(null);

  const dragRef = useRef(drag);
  dragRef.current = drag;
  const viewRef = useRef(view);
  viewRef.current = view;
  const isDragging = drag !== null;

  const toWorld = useCallback((cx, cy) => {
    const el = stageRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (cx - r.left - v.x) / v.zoom, y: (cy - r.top - v.y) / v.zoom };
  }, []);

  /* -------- wheel zoom (non-passive so we can preventDefault) -------- */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const v = viewRef.current;
      const next = clamp(v.zoom * Math.exp(-e.deltaY * 0.0016), 0.3, 2.5);
      const k = next / v.zoom;
      setView({ zoom: next, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setView]);

  /* -------- global pointer handling for the active drag -------- */
  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;

      if (d.kind === 'node') {
        const p = toWorld(e.clientX, e.clientY);
        const snap = e.altKey ? 1 : 10;
        const nx = Math.round((p.x - d.dx) / snap) * snap;
        const ny = Math.round((p.y - d.dy) / snap) * snap;
        onMoveNode(d.id, nx, ny);
        return;
      }

      if (d.kind === 'wire') {
        const p = toWorld(e.clientX, e.clientY);
        setDrag((prev) => (prev ? { ...prev, cursor: p } : prev));
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const pe = el && el.closest && el.closest('[data-port]');
        setHoverPort(
          pe ? { nodeId: pe.dataset.nodeId, portId: pe.dataset.portId } : null
        );
        return;
      }

      if (d.kind === 'pan') {
        setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
      }
    };

    const onUp = (e) => {
      const d = dragRef.current;
      if (d && d.kind === 'wire') {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const pe = el && el.closest && el.closest('[data-port]');
        if (pe) {
          const to = { nodeId: pe.dataset.nodeId, portId: pe.dataset.portId };
          if (to.nodeId !== d.from.nodeId || to.portId !== d.from.portId) {
            onAddWire(d.from, to);
          }
        }
      }
      setHoverPort(null);
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging, toWorld, onMoveNode, onAddWire, setView]);

  /* -------- interactions -------- */
  const handleStageDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    setSelection(null);
    setDrag({ kind: 'pan', sx: e.clientX, sy: e.clientY, ox: viewRef.current.x, oy: viewRef.current.y });
  };

  const handleNodeDown = (e, node) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelection({ kind: 'node', id: node.id });
    const p = toWorld(e.clientX, e.clientY);
    onBeginHistory();
    setDrag({ kind: 'node', id: node.id, dx: p.x - node.x, dy: p.y - node.y });
  };

  const handlePortDown = (e, nodeId, portId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const p = toWorld(e.clientX, e.clientY);
    setDrag({ kind: 'wire', from: { nodeId, portId }, cursor: p });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-voltpad');
    if (!type || !COMPONENTS[type]) return;
    const p = toWorld(e.clientX, e.clientY);
    onAddNode(type, p.x, p.y);
  };

  /* -------- derived render data -------- */
  const nodeMap = Object.fromEntries(doc.nodes.map((n) => [n.id, n]));
  const ordered = [...doc.nodes].sort((a, b) => {
    const sa = selection?.kind === 'node' && selection.id === a.id ? 1 : 0;
    const sb = selection?.kind === 'node' && selection.id === b.id ? 1 : 0;
    return sa - sb;
  });

  const tempWire =
    drag?.kind === 'wire'
      ? (() => {
          const from = portPoint(nodeMap[drag.from.nodeId], drag.from.portId);
          if (!from) return null;
          const to = hoverPort
            ? portPoint(nodeMap[hoverPort.nodeId], hoverPort.portId)
            : drag.cursor;
          if (!to) return null;
          return { d: wirePath(from, to), color: getAwg(activeAwg).color, stroke: getAwg(activeAwg).stroke };
        })()
      : null;

  return (
    <div
      ref={stageRef}
      className={`stage ${drag?.kind === 'pan' ? 'is-panning' : ''}`}
      onPointerDown={handleStageDown}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={handleDrop}
    >
      <div
        ref={worldRef}
        className="world"
        style={{
          width: WORLD_W,
          height: WORLD_H,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
        }}
      >
        <svg
          className="wire-layer"
          width={WORLD_W}
          height={WORLD_H}
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          {doc.wires.map((w) => {
            const a = portPoint(nodeMap[w.from.nodeId], w.from.portId);
            const b = portPoint(nodeMap[w.to.nodeId], w.to.portId);
            if (!a || !b) return null;

            const spec = getAwg(w.awg);
            const color = w.color || spec.color;
            const isSel = selection?.kind === 'wire' && selection.id === w.id;
            const d = wirePath(a, b);
            const mid = wireMidpoint(a, b);

            return (
              <g key={w.id}>
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(18, spec.stroke + 14)}
                  strokeLinecap="round"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelection({ kind: 'wire', id: w.id });
                  }}
                />
                {isSel && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth={spec.stroke + 6}
                    strokeLinecap="round"
                    opacity="0.35"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={spec.stroke}
                  strokeLinecap="round"
                  style={{ pointerEvents: 'none' }}
                />
                {showLabels && (
                  <g transform={`translate(${mid.x}, ${mid.y})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      x={-17}
                      y={-9}
                      width={34}
                      height={18}
                      rx={5}
                      fill="#0a1120"
                      stroke={color}
                      strokeWidth={1}
                      opacity="0.96"
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fill={color}
                    >
                      {spec.awg}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {tempWire && (
            <path
              d={tempWire.d}
              fill="none"
              stroke={tempWire.color}
              strokeWidth={tempWire.stroke}
              strokeLinecap="round"
              strokeDasharray="8 6"
              opacity="0.85"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>

        {ordered.map((n) => (
          <NodeView
            key={n.id}
            node={n}
            selected={selection?.kind === 'node' && selection.id === n.id}
            hoverPort={hoverPort}
            showLabels={showLabels}
            onNodeDown={handleNodeDown}
            onPortDown={handlePortDown}
          />
        ))}
      </div>

      <div className="stage-hud">
        <span>{Math.round(view.zoom * 100)}%</span>
        <span className="hud-sep" />
        <span>{doc.nodes.length} parts</span>
        <span className="hud-sep" />
        <span>{doc.wires.length} wires</span>
      </div>

      <div className="stage-tip">Ctrl/⌘ + wheel to zoom · drag background to pan · Alt disables snapping</div>
    </div>
  );
}
