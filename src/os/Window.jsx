import { memo, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Add16Regular, Dismiss12Regular } from '@fluentui/react-icons';
import { useWindowActions, taskbarH } from './OSContext.jsx';
import { AppIcon } from './registry.jsx';
import AppHost from '../apps/AppHost.jsx';
import { EASE, isLiquid, useMorphIn, jellyKeyframes, prefersReducedMotion, domRect, trackBusy } from './liquid.js';
import './Window.css';

const MIN_W = 400;
const MIN_H = 260;
const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const MORPH_MS = 220;
const MORPH_EASE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';

// Thin Windows 11 caption glyphs.
const Glyph = {
  min: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" strokeWidth="1" /></svg>,
  max: <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>,
  restore: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="0.5" y="2.5" width="7" height="7" rx="1.5" />
      <path d="M2.5 0.5h5.5a1.5 1.5 0 0 1 1.5 1.5v5.5" />
    </svg>
  ),
  close: <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0.5 0.5l9 9M9.5 0.5l-9 9" stroke="currentColor" strokeWidth="1" /></svg>,
};

function viewport() {
  return { vw: window.innerWidth, vh: window.innerHeight - taskbarH() };
}

// Where the window actually sits (normal / maximized / snapped).
function layoutRect(win) {
  const { vw, vh } = viewport();
  if (win.maximized) return { x: 0, y: 0, w: vw, h: vh };
  if (win.snapped === 'left') return { x: 0, y: 0, w: Math.round(vw / 2), h: vh };
  if (win.snapped === 'right') return { x: Math.round(vw / 2), y: 0, w: vw - Math.round(vw / 2), h: vh };
  return { x: win.x, y: win.y, w: win.w, h: win.h };
}

function snapZone(x, y) {
  const { vw } = viewport();
  if (y <= 2) return 'max';
  if (x <= 2) return 'left';
  if (x >= vw - 3) return 'right';
  return null;
}

// Run pointer-move work at most once per frame, and clean up on release.
function trackPointer(e, { onFrame, onEnd }) {
  let raf = 0;
  let last = e;
  const move = (ev) => {
    last = ev;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; onFrame(last); });
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    if (raf) { cancelAnimationFrame(raf); onFrame(last); }
    document.documentElement.classList.remove('os-dragging');
    onEnd();
  };
  document.documentElement.classList.add('os-dragging');
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

function Window({ win, active }) {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, snapWindow, setRect, openMenu } = useWindowActions();
  const ref = useRef(null);
  const [preview, setPreview] = useState(null); // snap preview zone while dragging
  const [, forceRender] = useState(0);
  const isFull = win.maximized || !!win.snapped;

  // When this window comes to the front, move keyboard focus into its app
  // (so arrow keys / presentation clickers work immediately).
  useEffect(() => {
    if (!active || win.minimized) return;
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) {
      // Fall back to the window itself so typing never goes to a window behind.
      (el.querySelector('[data-autofocus]') || el).focus({ preventScroll: true });
    }
  }, [active, win.minimized]);

  // Liquid Glass: windows pop open with jelly springs.
  useMorphIn(ref, (to) => ({ x: to.left + to.width * 0.1, y: to.top + to.height * 0.08 + 18, w: to.width * 0.8, h: to.height * 0.8 }));

  // Liquid Glass: minimize squishes into the taskbar icon; restore bounces back out of it.
  const wasMin = useRef(win.minimized);
  useEffect(() => {
    if (wasMin.current === win.minimized) return;
    wasMin.current = win.minimized;
    const el = ref.current;
    if (!el || !isLiquid() || prefersReducedMotion()) return;
    const r = layoutRect(win);
    const btn = domRect(`.tb-center [data-app="${win.app}"]`) || { x: window.innerWidth / 2 - 20, y: window.innerHeight - 50, w: 40, h: 40 };
    if (win.minimized) {
      const tx = btn.x + btn.w / 2 - (r.x + r.w / 2);
      const ty = btn.y + btn.h / 2 - (r.y + r.h / 2);
      trackBusy(el.animate(
        [
          { transform: 'none', opacity: 1, offset: 0 },
          { transform: `translate(${tx * 0.25}px, ${ty * 0.1}px) scale(0.92, 1.04)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${tx}px, ${ty}px) scale(${(btn.w / r.w) * 1.6}, ${(btn.h / r.h) * 0.9})`, opacity: 0, offset: 1 },
        ],
        { duration: 340, easing: 'cubic-bezier(0.5, 0, 0.7, 0.4)' }
      ));
    } else {
      const { frames, duration } = jellyKeyframes(btn, r, { opacityFrom: 0 });
      trackBusy(el.animate(frames, { duration }));
    }
  }, [win.minimized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-layout maximized/snapped windows when the browser is resized.
  useEffect(() => {
    const onResize = () => forceRender((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Change size instantly, then animate from the old box with a cheap transform (FLIP).
  const morph = (change) => {
    const el = ref.current;
    const from = el.getBoundingClientRect();
    flushSync(change);
    el.style.transform = '';
    const to = el.getBoundingClientRect();
    if (!to.width || !to.height) return;
    // Center-origin FLIP (transform-origin itself must not be animated — it would run on the main thread).
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    trackBusy(el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})` },
        { transform: 'none' },
      ],
      isLiquid() && !prefersReducedMotion()
        ? { duration: EASE.smooth.duration, easing: EASE.smooth.easing }
        : { duration: MORPH_MS, easing: MORPH_EASE }
    ));
  };
  const toggleMax = () => morph(() => maximizeWindow(win.id));

  // ── drag by the title bar (moves with transform, commits once on release) ──
  const onTitleDown = (e) => {
    if (e.button !== 0 || e.target.closest('.win-caption-btn, .win-no-drag')) return;
    e.preventDefault();
    const el = ref.current;
    const start = { x: e.clientX, y: e.clientY };
    const r0 = layoutRect(win);
    let base = { x: r0.x, y: r0.y }; // the left/top React has rendered
    let pos = { ...base };
    let full = isFull;
    let dragging = false;
    let zone = null;
    // Track drag speed so letting go can give a jelly wobble (Liquid Glass).
    const liquid = isLiquid() && !prefersReducedMotion();
    let prev = { ...pos, t: performance.now() };
    let vx = 0; // px per frame (~16ms), smoothed
    let vy = 0;
    // Translate only while dragging (changing scale every frame would force a full redraw).
    const apply = () => {
      el.style.transform = `translate3d(${pos.x - base.x}px, ${pos.y - base.y}px, 0)`;
    };

    trackPointer(e, {
      onFrame: (ev) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!dragging) {
          if (Math.hypot(dx, dy) < 4) return;
          dragging = true;
          el.classList.add('win-dragging');
          if (full) {
            // Pull a maximized/snapped window back to normal size under the cursor.
            const ratio = (start.x - r0.x) / r0.w;
            base = { x: Math.round(start.x - win.w * ratio), y: 0 };
            flushSync(() => {
              maximizeWindow(win.id, false);
              setRect(win.id, base);
            });
            full = false;
          }
        }
        const { vh } = viewport();
        pos = { x: base.x + dx, y: Math.min(Math.max(base.y + dy, 0), vh - 32) };
        const now = performance.now();
        const k = 16 / Math.max(now - prev.t, 1);
        vx = vx * 0.5 + (pos.x - prev.x) * k * 0.5;
        vy = vy * 0.5 + (pos.y - prev.y) * k * 0.5;
        prev = { ...pos, t: now };
        apply();
        const z = snapZone(ev.clientX, ev.clientY);
        if (z !== zone) {
          zone = z;
          setPreview(z);
        }
      },
      onEnd: () => {
        if (!dragging) return;
        // if the pointer was resting before release, there's no fling
        if (performance.now() - prev.t > 90) vx = vy = 0;
        setPreview(null);
        // the faster you were moving, the more it squishes when you let go
        const ax = Math.min(Math.abs(vx) * 0.004, 0.06);
        const ay = Math.min(Math.abs(vy) * 0.004, 0.06);
        const [sx, sy] = [1 + ax - ay * 0.5, 1 + ay - ax * 0.5];
        if (zone) {
          morph(() => {
            setRect(win.id, pos);
            zone === 'max' ? maximizeWindow(win.id, true) : snapWindow(win.id, zone);
          });
        } else {
          flushSync(() => setRect(win.id, pos));
          el.style.transform = '';
          void el.offsetWidth; // apply the final position before transitions come back
          // let go → the stretch wobbles back like jelly
          if (liquid && (Math.abs(sx - 1) > 0.003 || Math.abs(sy - 1) > 0.003)) {
            trackBusy(el.animate([{ transform: `scale(${sx}, ${sy})` }, { transform: 'none' }], { duration: EASE.bouncy.duration, easing: EASE.bouncy.easing }));
          }
        }
        el.classList.remove('win-dragging');
      },
    });
  };

  // ── resize from edges/corners (direct style updates, commit once) ──
  const onEdgeDown = (e, edge) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    const start = { x: e.clientX, y: e.clientY };
    const r0 = layoutRect(win);
    if (isFull) flushSync(() => { maximizeWindow(win.id, false); setRect(win.id, r0); });
    let r = r0;
    el.classList.add('win-dragging');

    trackPointer(e, {
      onFrame: (ev) => {
        const dx = ev.clientX - start.x;
        const dy = Math.max(ev.clientY, 0) - start.y;
        let { x, y, w, h } = r0;
        if (edge.includes('e')) w = Math.max(MIN_W, r0.w + dx);
        if (edge.includes('s')) h = Math.max(MIN_H, r0.h + dy);
        if (edge.includes('w')) { w = Math.max(MIN_W, r0.w - dx); x = r0.x + r0.w - w; }
        if (edge.includes('n')) { h = Math.max(MIN_H, r0.h - dy); y = r0.y + r0.h - h; }
        r = { x, y, w, h };
        Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
      },
      onEnd: () => {
        el.classList.remove('win-dragging');
        setRect(win.id, r);
      },
    });
  };

  const titleMenu = (e) =>
    openMenu(e, [
      { label: 'Restore', icon: Glyph.restore, disabled: !isFull, onClick: () => morph(() => maximizeWindow(win.id, false)) },
      { label: 'Minimize', icon: Glyph.min, onClick: () => minimizeWindow(win.id) },
      { label: 'Maximize', icon: Glyph.max, disabled: win.maximized, onClick: () => morph(() => maximizeWindow(win.id, true)) },
      { divider: true },
      { label: 'Close', icon: Glyph.close, shortcut: 'Alt+F4', onClick: () => closeWindow(win.id) },
    ]);

  const rect = layoutRect(win);
  const { vw, vh } = viewport();
  // Minimize flies toward the bottom-center (taskbar).
  const minTransform = `translate3d(${vw / 2 - (rect.x + rect.w / 2)}px, ${vh + 40 - (rect.y + rect.h / 2)}px, 0) scale(0.25)`;

  const classes = [
    'win',
    active ? 'win-active' : 'win-inactive',
    isFull && 'win-full',
    win.closing && 'win-closing',
    win.minimized && 'win-minimized',
  ].filter(Boolean).join(' ');

  const tabs = win.app === 'explorer' || win.app === 'notepad';

  return (
    <>
      <div
        ref={ref}
        className={classes}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          zIndex: 100 + win.z * 2,
          transform: win.minimized ? minTransform : undefined,
          // Liquid Glass frame: where the pre-blurred wallpaper sits behind this window
          '--wg-pos': `${-rect.x - 1}px ${-rect.y - 1}px`,
        }}
        tabIndex={-1}
        onPointerDownCapture={() => !active && focusWindow(win.id)}
      >
        <div
          className={`win-titlebar ${tabs ? 'win-titlebar-tabs' : ''}`}
          onPointerDown={onTitleDown}
          onDoubleClick={(e) => !e.target.closest('.win-caption-btn, .win-no-drag') && toggleMax()}
          onContextMenu={titleMenu}
        >
          {tabs ? (
            <div className="win-tabs">
              <div className="win-tab">
                <AppIcon app={win.app} size={16} />
                <span className="win-title">{win.title}</span>
                <button className="win-tab-close win-no-drag" onClick={() => closeWindow(win.id)}>
                  <Dismiss12Regular />
                </button>
              </div>
              <button className="win-tab-add win-no-drag" title="New tab"><Add16Regular /></button>
            </div>
          ) : (
            <div className="win-heading">
              <AppIcon app={win.app} size={16} />
              <span className="win-title">{win.title}</span>
            </div>
          )}
          <div className="win-captions">
            <button className="win-caption-btn" title="Minimize" onClick={() => minimizeWindow(win.id)}>{Glyph.min}</button>
            <button className="win-caption-btn" title={isFull ? 'Restore Down' : 'Maximize'} onClick={toggleMax}>
              {isFull ? Glyph.restore : Glyph.max}
            </button>
            <button className="win-caption-btn win-close" title="Close" onClick={() => closeWindow(win.id)}>{Glyph.close}</button>
          </div>
        </div>

        <div className="win-body">
          <AppHost app={win.app} itemId={win.itemId} winId={win.id} props={win.props} />
        </div>

        {!isFull && EDGES.map((edge) => (
          <div key={edge} className={`win-edge win-edge-${edge}`} onPointerDown={(e) => onEdgeDown(e, edge)} />
        ))}
      </div>

      {preview &&
        createPortal(
          <div
            className="snap-preview"
            style={{
              zIndex: 100 + win.z * 2 - 1,
              ...(preview === 'max'
                ? { left: 8, top: 8, width: vw - 16, height: vh - 16 }
                : { left: preview === 'left' ? 8 : vw / 2 + 4, top: 8, width: vw / 2 - 12, height: vh - 16 }),
            }}
          />,
          document.body
        )}
    </>
  );
}

export default memo(Window);
