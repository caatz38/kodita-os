import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { FILE_TYPES, APPS } from './registry.jsx';

// Three contexts so each part of the UI only re-renders when its own data changes.
const ActionsContext = createContext(null); // stable functions, never change
const WindowsContext = createContext(null); // open windows + focused id
const UIContext = createContext(null); // start menu + context menu

export const useWindowActions = () => useContext(ActionsContext);
export const useWindows = () => useContext(WindowsContext);
export const useUI = () => useContext(UIContext);
// Everything at once (re-renders on any change — fine for small components).
export const useOS = () => ({ ...useContext(ActionsContext), ...useContext(WindowsContext), ...useContext(UIContext) });

// Default window size per app (shrunk to fit small screens).
const SIZES = {
  explorer: [920, 580],
  slides: [1040, 660],
  code: [1120, 680],
  media: [960, 600],
  photos: [900, 600],
  quiz: [860, 620],
  notepad: [720, 480],
  settings: [1000, 660],
};

// Space reserved at the bottom for the taskbar (the Liquid Glass one floats, so it needs more).
export const taskbarH = () => (document.documentElement.dataset.material === 'liquid' ? 68 : 48);
let nextId = 1;

// Open windows survive an accidental reload (same browser tab only).
const WIN_KEY = 'kodita:windows';
function loadWindows() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(WIN_KEY) || 'null');
    if (!saved?.windows?.length) return { windows: [], focused: null, z: 0 };
    nextId = Math.max(...saved.windows.map((w) => w.id)) + 1;
    return saved;
  } catch {
    return { windows: [], focused: null, z: 0 };
  }
}

function initialRect(app, count) {
  const [w0, h0] = SIZES[app] || [800, 520];
  const vw = window.innerWidth;
  const vh = window.innerHeight - taskbarH();
  const w = Math.min(w0, vw - 40);
  const h = Math.min(h0, vh - 40);
  const offset = (count % 6) * 28;
  return {
    x: Math.max(8, Math.round((vw - w) / 2 - 60 + offset)),
    y: Math.max(8, Math.round((vh - h) / 2 - 40 + offset)),
    w,
    h,
  };
}

function topmost(windows, exceptId) {
  return windows
    .filter((w) => !w.minimized && !w.closing && w.id !== exceptId)
    .sort((a, b) => b.z - a.z)[0]?.id ?? null;
}

function reducer(state, action) {
  const { windows } = state;
  const update = (id, patch) => windows.map((w) => (w.id === id ? { ...w, ...patch } : w));

  switch (action.type) {
    case 'open': {
      const z = state.z + 1;
      const win = {
        id: nextId++,
        app: action.app,
        itemId: action.itemId ?? null,
        title: action.title,
        props: action.props,
        ...initialRect(action.app, windows.length),
        z,
        minimized: false,
        maximized: false,
        snapped: null,
        closing: false,
      };
      return { ...state, z, windows: [...windows, win], focused: win.id };
    }
    case 'focus': {
      if (action.id == null) return { ...state, focused: null };
      const z = state.z + 1;
      return { ...state, z, windows: update(action.id, { z, minimized: false }), focused: action.id };
    }
    case 'close':
      return { ...state, windows: update(action.id, { closing: true }), focused: topmost(windows, action.id) };
    case 'remove':
      return { ...state, windows: windows.filter((w) => w.id !== action.id) };
    case 'minimize':
      return { ...state, windows: update(action.id, { minimized: true }), focused: topmost(windows, action.id) };
    case 'maximize': {
      const w = windows.find((x) => x.id === action.id);
      const value = action.value ?? !w.maximized;
      return { ...state, windows: update(action.id, { maximized: value, snapped: null }) };
    }
    case 'snap':
      return { ...state, windows: update(action.id, { snapped: action.side, maximized: false }) };
    case 'rect':
      return { ...state, windows: update(action.id, action.rect) };
    case 'closeAll':
      return { ...state, windows: [], focused: null };
    case 'minimizeAll':
      return { ...state, windows: windows.map((w) => ({ ...w, minimized: true })), focused: null };
    case 'restoreAll':
      return { ...state, windows: windows.map((w) => (action.ids.includes(w.id) ? { ...w, minimized: false } : w)) };
    case 'title':
      return { ...state, windows: update(action.id, { title: action.title, itemId: action.itemId ?? null }) };
    default:
      return state;
  }
}

export function OSProvider({ children }) {
  const [startOpen, setStartOpen] = useState(false);
  const [startQuery, setStartQuery] = useState('');
  const [menu, setMenu] = useState(null); // { x, y, items }
  const [wm, dispatch] = useReducer(reducer, null, loadWindows);
  const windowsRef = useRef(wm.windows);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(WIN_KEY, JSON.stringify({ ...wm, windows: wm.windows.filter((w) => !w.closing) }));
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [wm]);
  windowsRef.current = wm.windows;

  const openMenu = useCallback((e, items) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, items });
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);

  const toggleStart = useCallback((query = '') => {
    setStartQuery(query);
    setStartOpen((o) => !o);
  }, []);

  // ── window actions ──
  const focusWindow = useCallback((id) => dispatch({ type: 'focus', id }), []);
  const minimizeWindow = useCallback((id) => dispatch({ type: 'minimize', id }), []);
  const maximizeWindow = useCallback((id, value) => dispatch({ type: 'maximize', id, value }), []);
  const snapWindow = useCallback((id, side) => dispatch({ type: 'snap', id, side }), []);
  const setRect = useCallback((id, rect) => dispatch({ type: 'rect', id, rect }), []);
  const setTitle = useCallback((id, title, itemId) => dispatch({ type: 'title', id, title, itemId }), []);
  const closeWindow = useCallback((id) => {
    dispatch({ type: 'close', id });
    setTimeout(() => dispatch({ type: 'remove', id }), 120);
  }, []);

  const closeAll = useCallback(() => dispatch({ type: 'closeAll' }), []);
  // Taskbar "Show desktop": minimize everything; click again to bring them back.
  const peekRef = useRef(null);
  const toggleDesktop = useCallback(() => {
    const open = windowsRef.current.filter((w) => !w.minimized && !w.closing).map((w) => w.id);
    if (open.length) {
      peekRef.current = open;
      dispatch({ type: 'minimizeAll' });
    } else if (peekRef.current) {
      dispatch({ type: 'restoreAll', ids: peekRef.current });
      peekRef.current = null;
    }
  }, []);

  const openApp = useCallback((app, { item = null, title, props } = {}) => {
    setStartOpen(false);
    dispatch({
      type: 'open',
      app,
      itemId: item?.id,
      props,
      title: title || (item ? item.name : app === 'notepad' ? 'Untitled' : APPS[app]?.name || app),
    });
  }, []);

  // Open a desktop/lesson item in the right app (re-uses an open window for the same file).
  const openItem = useCallback((item) => {
    setStartOpen(false);
    if (item.type === 'app') return openApp(item.app);
    const app = FILE_TYPES[item.type]?.app;
    if (!app) return;
    const existing = windowsRef.current.find((w) => w.itemId === item.id && !w.closing);
    if (existing) return dispatch({ type: 'focus', id: existing.id });
    openApp(app, { item });
  }, [openApp]);

  const actions = useMemo(
    () => ({
      focusWindow, minimizeWindow, maximizeWindow, snapWindow, setRect, setTitle, closeWindow,
      openApp, openItem, openMenu, closeMenu, toggleStart, setStartOpen, closeAll, toggleDesktop,
    }),
    [focusWindow, minimizeWindow, maximizeWindow, snapWindow, setRect, setTitle, closeWindow,
      openApp, openItem, openMenu, closeMenu, toggleStart, closeAll, toggleDesktop]
  );
  const windows = useMemo(() => ({ windows: wm.windows, focused: wm.focused }), [wm.windows, wm.focused]);
  const ui = useMemo(() => ({ startOpen, startQuery, menu }), [startOpen, startQuery, menu]);

  return (
    <ActionsContext.Provider value={actions}>
      <WindowsContext.Provider value={windows}>
        <UIContext.Provider value={ui}>{children}</UIContext.Provider>
      </WindowsContext.Provider>
    </ActionsContext.Provider>
  );
}
