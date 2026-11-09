import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search20Regular, ChevronRight12Regular, ChevronLeft12Regular, Power20Regular,
  LockClosed20Regular, WeatherMoon20Regular, ArrowClockwise20Regular,
} from '@fluentui/react-icons';
import { useUI, useWindowActions } from './OSContext.jsx';
import { usePower } from './Session.jsx';
import { useGlass } from './SettingsContext.jsx';
import { useLiquidGlass, useMorphIn, morphOut, domRect } from './liquid.js';
import { APPS, AppIcon, ItemIcon, FILE_TYPES } from './registry.jsx';
import { Logo } from './Icons.jsx';
import { tree, allFiles } from '../content/tree.js';
import { config } from '../content/config.js';
import './StartMenu.css';

const PINNED_APPS = ['explorer', 'slides', 'code', 'media', 'photos', 'notepad', 'settings'];
const RECENT_LABELS = ['Recently added', '2h ago', 'Yesterday at 4:20 PM', '17h ago', 'Monday at 9:12 AM', 'Last week'];

function describe(item) {
  return FILE_TYPES[item.type]?.label || 'File';
}

export default function StartMenu() {
  const { startOpen, startQuery } = useUI();
  const { setStartOpen, openItem, openApp, openMenu } = useWindowActions();
  const power = usePower();
  const glass = useGlass();
  const [opened, setOpened] = useState(false); // has it ever been opened (for the close animation)
  const [query, setQuery] = useState('');
  const [view, setView] = useState('home'); // home | all
  const ref = useRef(null);
  const inputRef = useRef(null);

  // Grow out of the Start button with jelly springs; bend light only once settled.
  const settled = useMorphIn(ref, () => domRect('.tb-start'), { active: startOpen, opacityFrom: 0.35 });
  useLiquidGlass(ref, { enabled: glass, refract: settled && startOpen, radius: 28, bezel: 30, scale: 70, blur: 16, saturate: 190 });
  // Shrink back into the Start button when closing.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (startOpen) wasOpen.current = true;
    else if (wasOpen.current) {
      wasOpen.current = false;
      const a = morphOut(ref.current, domRect('.tb-start'), 200);
      return () => a?.cancel();
    }
  }, [startOpen]);

  // Stays mounted (so opening is instant); only the CSS class changes.
  useEffect(() => {
    if (!startOpen) {
      inputRef.current?.blur();
      return;
    }
    setOpened(true);
    setQuery(startQuery);
    setView('home');
    inputRef.current?.focus();
  }, [startOpen, startQuery]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!startOpen) return;
    const onDown = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest('[data-start-toggle]') || e.target.closest('.ctx-menu')) return;
      setStartOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.querySelector('.ctx-menu')) setStartOpen(false);
    };
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [startOpen, setStartOpen]);

  const pinned = useMemo(
    () => [
      ...PINNED_APPS.map((app) => ({ key: app, name: APPS[app].name, icon: <AppIcon app={app} size={32} />, open: () => openApp(app) })),
      ...tree.map((item) => ({ key: item.id, name: item.name, icon: <ItemIcon item={item} size={32} />, open: () => openItem(item) })),
    ],
    [openApp, openItem]
  );

  const recommended = useMemo(() => allFiles().slice(0, 6), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const apps = Object.entries(APPS)
      .filter(([, a]) => a.name.toLowerCase().includes(q))
      .map(([id, a]) => ({ key: id, name: a.name, kind: 'App', icon: (s) => <AppIcon app={id} size={s} />, open: () => openApp(id) }));
    const items = [];
    (function walk(list) {
      for (const it of list) {
        if (it.name.toLowerCase().includes(q)) {
          items.push({ key: it.id, name: it.name, kind: describe(it), icon: (s) => <ItemIcon item={it} size={s} />, open: () => openItem(it) });
        }
        if (it.children) walk(it.children);
      }
    })(tree);
    return [...apps, ...items];
  }, [query, openApp, openItem]);

  const [activeResult, setActiveResult] = useState(0);
  useEffect(() => setActiveResult(0), [query]);

  const powerMenu = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const act = (fn) => () => { setStartOpen(false); fn(); };
    openMenu({ preventDefault() {}, stopPropagation() {}, clientX: r.left - 60, clientY: r.top - 140 }, [
      { label: 'Lock', icon: <LockClosed20Regular />, onClick: act(power.lock) },
      { label: 'Sleep', icon: <WeatherMoon20Regular />, onClick: act(power.sleep) },
      { label: 'Shut down', icon: <Power20Regular />, onClick: act(power.shutdown) },
      { label: 'Restart', icon: <ArrowClockwise20Regular />, onClick: act(power.restart) },
    ]);
  };
  const userMenu = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    openMenu({ preventDefault() {}, stopPropagation() {}, clientX: r.left, clientY: r.top - 80 }, [
      { label: 'Change account settings', onClick: () => openApp('settings', { props: { page: 'accounts' } }) },
      { label: 'Lock', icon: <LockClosed20Regular />, onClick: () => { setStartOpen(false); power.lock(); } },
    ]);
  };

  // The tile grids never change, so React can reuse them on every open (no re-render cost).
  const homeView = useMemo(
    () => (
        <div className="start-body">
          <div className="start-section">
            <div className="start-row">
              <span className="start-heading">Pinned</span>
              <button className="start-pill" onClick={() => setView('all')}>
                All apps <ChevronRight12Regular />
              </button>
            </div>
            <div className="start-grid">
              {pinned.map((p, i) => (
                <button key={p.key} className="start-tile" style={{ '--i': i }} onClick={p.open} title={p.name}>
                  {p.icon}
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="start-section start-recommended">
            <div className="start-row">
              <span className="start-heading">Recommended</span>
              <button className="start-pill" onClick={() => setView('all')}>
                More <ChevronRight12Regular />
              </button>
            </div>
            <div className="start-rec-grid">
              {recommended.map((item, i) => (
                <button key={item.id} className="start-rec" style={{ '--i': i + 6 }} onClick={() => openItem(item)}>
                  <ItemIcon item={item} size={32} />
                  <span className="sr-text">
                    <span className="sr-name">{item.name}</span>
                    <span className="sr-kind">{RECENT_LABELS[i % RECENT_LABELS.length]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
    ),
    [pinned, recommended, openItem] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const best = results?.[activeResult];

  return (
    <div
      ref={ref}
      className={`start ${startOpen ? 'start-in' : opened ? 'start-out' : 'start-idle'}`}
      aria-hidden={!startOpen} onContextMenu={(e) => e.preventDefault()}>
      <div className="start-search">
        <Search20Regular />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!results?.length) return;
            if (e.key === 'Enter') best?.open();
            if (e.key === 'ArrowDown') setActiveResult((i) => Math.min(i + 1, results.length - 1));
            if (e.key === 'ArrowUp') setActiveResult((i) => Math.max(i - 1, 0));
          }}
          placeholder="Search for apps, settings, and documents"
          spellCheck={false}
        />
      </div>

      {results ? (
        <div className="start-results">
          <div className="sr-list">
            {results.length === 0 && <div className="sr-empty">No results for “{query}”</div>}
            {results.length > 0 && <div className="start-heading sr-heading">Best match</div>}
            {results.map((r, i) => (
              <button
                key={r.key}
                className={`sr-item ${i === activeResult ? 'active' : ''} ${i === 0 ? 'sr-best' : ''}`}
                onMouseEnter={() => setActiveResult(i)}
                onClick={r.open}
              >
                {r.icon(i === 0 ? 32 : 24)}
                <span className="sr-text">
                  <span className="sr-name">{r.name}</span>
                  <span className="sr-kind">{r.kind}</span>
                </span>
              </button>
            ))}
          </div>
          {best && (
            <div className="sr-detail">
              {best.icon(64)}
              <div className="sr-detail-name">{best.name}</div>
              <div className="sr-kind">{best.kind}</div>
              <div className="sr-divider" />
              <button className="sr-open" onClick={best.open}>Open</button>
            </div>
          )}
        </div>
      ) : view === 'home' ? (
        homeView
      ) : (
        <div className="start-body start-all">
          <div className="start-row">
            <span className="start-heading">All apps</span>
            <button className="start-pill" onClick={() => setView('home')}>
              <ChevronLeft12Regular /> Back
            </button>
          </div>
          <div className="start-all-list">
            {[...Object.entries(APPS).map(([id, a]) => ({ key: id, name: a.name, icon: <AppIcon app={id} size={24} />, open: () => openApp(id) })),
              ...tree.map((it) => ({ key: it.id, name: it.name, icon: <ItemIcon item={it} size={24} />, open: () => openItem(it) }))]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((a, i, arr) => (
                <div key={a.key}>
                  {(i === 0 || arr[i - 1].name[0].toUpperCase() !== a.name[0].toUpperCase()) && (
                    <div className="start-letter">{a.name[0].toUpperCase()}</div>
                  )}
                  <button className="start-all-item" onClick={a.open}>
                    {a.icon}
                    <span>{a.name}</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="start-footer">
        <button className="start-user" onClick={userMenu}>
          <span className="start-avatar"><Logo src={config.logoIcon} size={22} wide /></span>
          <span>{config.userName}</span>
        </button>
        <button className="start-power" title="Power" onClick={powerMenu}>
          <Power20Regular />
        </button>
      </div>
    </div>
  );
}
