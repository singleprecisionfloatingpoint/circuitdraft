import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Topbar from './components/Topbar.jsx';
import Palette from './components/Palette.jsx';
import Canvas from './components/Canvas.jsx';
import Inspector from './components/Inspector.jsx';
import AuthModal from './components/AuthModal.jsx';

import { COMPONENTS } from './data/components.jsx';
import { DEFAULT_AWG } from './data/awg.js';
import { uid } from './lib/utils.js';
import { exportPDF, exportPNG } from './lib/exporter.js';
import {
  clearSession,
  clearUser,
  loadSession,
  loadUser,
  saveSession,
  saveUser,
} from './lib/storage.js';

const emptyDoc = () => ({ name: 'Untitled Diagram', nodes: [], wires: [] });

export default function App() {
  const boot = useMemo(() => loadSession(), []);

  const [doc, setDoc] = useState(() => boot?.doc ?? emptyDoc());
  const [view, setView] = useState(() => boot?.view ?? { x: 40, y: 40, zoom: 1 });
  const [activeAwg, setActiveAwg] = useState(() => boot?.activeAwg ?? DEFAULT_AWG);
  const [showLabels, setShowLabels] = useState(true);
  const [selection, setSelection] = useState(null);
  const [user, setUser] = useState(() => loadUser());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const worldRef = useRef(null);

  /* ------------------------- history ------------------------- */
  const docRef = useRef(doc);
  docRef.current = doc;
  const past = useRef([]);
  const future = useRef([]);
  const [, forceHistoryTick] = useState(0);

  const commit = useCallback((updater) => {
    const prev = docRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (next === prev) return;
    past.current.push(prev);
    if (past.current.length > 80) past.current.shift();
    future.current = [];
    docRef.current = next;
    setDoc(next);
    forceHistoryTick((t) => t + 1);
  }, []);

  /** Same as commit but records nothing — used during live drags. */
  const patch = useCallback((updater) => {
    const prev = docRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (next === prev) return;
    docRef.current = next;
    setDoc(next);
  }, []);

  const beginHistory = useCallback(() => {
    past.current.push(docRef.current);
    if (past.current.length > 80) past.current.shift();
    future.current = [];
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    const prev = past.current.pop();
    future.current.push(docRef.current);
    docRef.current = prev;
    setDoc(prev);
    forceHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current.pop();
    past.current.push(docRef.current);
    docRef.current = next;
    setDoc(next);
    forceHistoryTick((t) => t + 1);
  }, []);

  /* ------------------------- toast ------------------------- */
  const notify = useCallback((msg, kind = 'info') => {
    setToast({ msg, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* ------------------------- autosave (12 months) ------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      saveSession({ doc, view, activeAwg });
    }, 450);
    return () => clearTimeout(t);
  }, [doc, view, activeAwg]);

  /* ------------------------- actions ------------------------- */
  const addNode = useCallback(
    (type, x, y) => {
      const comp = COMPONENTS[type];
      if (!comp) return;
      const node = {
        id: uid(),
        type,
        x: Math.round((x - comp.w / 2) / 10) * 10,
        y: Math.round((y - comp.h / 2) / 10) * 10,
        label: '',
      };
      commit((d) => ({ ...d, nodes: [...d.nodes, node] }));
      setSelection({ kind: 'node', id: node.id });
    },
    [commit]
  );

  const addWire = useCallback(
    (from, to) => {
      commit((d) => {
        const dupe = d.wires.some(
          (w) =>
            (w.from.nodeId === from.nodeId &&
              w.from.portId === from.portId &&
              w.to.nodeId === to.nodeId &&
              w.to.portId === to.portId) ||
            (w.from.nodeId === to.nodeId &&
              w.from.portId === to.portId &&
              w.to.nodeId === from.nodeId &&
              w.to.portId === from.portId)
        );
        if (dupe) return d;
        return {
          ...d,
          wires: [...d.wires, { id: uid(), from, to, awg: activeAwg, color: null }],
        };
      });
    },
    [commit, activeAwg]
  );

  const moveNode = useCallback(
    (id, x, y) => {
      patch((d) => ({ ...d, nodes: d.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }));
    },
    [patch]
  );

  const updateWire = useCallback(
    (id, patchObj) => {
      commit((d) => ({
        ...d,
        wires: d.wires.map((w) => (w.id === id ? { ...w, ...patchObj } : w)),
      }));
    },
    [commit]
  );

  const updateNode = useCallback(
    (id, patchObj) => {
      commit((d) => ({
        ...d,
        nodes: d.nodes.map((n) => (n.id === id ? { ...n, ...patchObj } : n)),
      }));
    },
    [commit]
  );

  const deleteSelection = useCallback(() => {
    if (!selection) return;
    commit((d) => {
      if (selection.kind === 'node') {
        return {
          ...d,
          nodes: d.nodes.filter((n) => n.id !== selection.id),
          wires: d.wires.filter(
            (w) => w.from.nodeId !== selection.id && w.to.nodeId !== selection.id
          ),
        };
      }
      return { ...d, wires: d.wires.filter((w) => w.id !== selection.id) };
    });
    setSelection(null);
  }, [selection, commit]);

  const newDiagram = useCallback(() => {
    if (!window.confirm('Start a new diagram? The current one will be cleared from this device.')) return;
    clearSession();
    commit(() => emptyDoc());
    setSelection(null);
    setView({ x: 40, y: 40, zoom: 1 });
    notify('New diagram started', 'ok');
  }, [commit, notify]);

  const handleExport = useCallback(
    async (kind) => {
      if (!doc.nodes.length) {
        notify('Add some components first', 'warn');
        return;
      }
      setBusy(true);
      try {
        if (kind === 'png') await exportPNG(worldRef.current, doc, doc.name);
        else await exportPDF(worldRef.current, doc, doc.name);
        notify(`${kind.toUpperCase()} exported`, 'ok');
      } catch (err) {
        console.error(err);
        notify(`Export failed: ${err.message}`, 'err');
      } finally {
        setBusy(false);
      }
    },
    [doc, notify]
  );

  const signOut = useCallback(() => {
    if (!window.confirm('Sign out? Your diagram stays saved on this device for 12 months.')) return;
    clearUser();
    setUser(null);
  }, []);

  const handleAuth = useCallback((u) => {
    saveUser(u);
    setUser(u);
  }, []);

  /* ------------------------- keyboard ------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'Escape') {
        setSelection(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteSelection, undo, redo]);

  /* ------------------------- render ------------------------- */
  if (!user) {
    return <AuthModal onAuth={handleAuth} />;
  }

  return (
    <div className="app">
      <Topbar
        name={doc.name}
        setName={(name) => patch((d) => ({ ...d, name }))}
        activeAwg={activeAwg}
        setActiveAwg={setActiveAwg}
        onExport={handleExport}
        busy={busy}
        onUndo={undo}
        onRedo={redo}
        canUndo={past.current.length > 0}
        canRedo={future.current.length > 0}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        onNew={newDiagram}
        user={user}
        onSignOut={signOut}
      />

      <div className="main">
        <Palette onAdd={(type) => addNode(type, 400, 300)} activeAwg={activeAwg} setActiveAwg={setActiveAwg} />

        <Canvas
          doc={doc}
          view={view}
          setView={setView}
          activeAwg={activeAwg}
          selection={selection}
          setSelection={setSelection}
          onAddNode={addNode}
          onAddWire={addWire}
          onMoveNode={moveNode}
          onBeginHistory={beginHistory}
          worldRef={worldRef}
          showLabels={showLabels}
        />

        <Inspector
          doc={doc}
          selection={selection}
          setSelection={setSelection}
          onUpdateWire={updateWire}
          onUpdateNode={updateNode}
          onDelete={deleteSelection}
          activeAwg={activeAwg}
          setActiveAwg={setActiveAwg}
        />
      </div>

      {toast && <div className={`toast toast-${toast.kind}`}>{toast.msg}</div>}
    </div>
  );
}
