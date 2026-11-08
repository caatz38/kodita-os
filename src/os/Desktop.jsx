import { memo, useRef, useState } from 'react';
import {
  Grid20Regular, ArrowSort20Regular, ArrowSync20Regular, Add20Regular, Desktop20Regular,
  PaintBrush20Regular, WindowConsole20Regular, WindowNew20Regular,
} from '@fluentui/react-icons';
import { useWindowActions } from './OSContext.jsx';
import { ItemIcon } from './registry.jsx';
import { tree, SYSTEM_ITEMS } from '../content/tree.js';
import './Desktop.css';

const SYSTEM_ICONS = [SYSTEM_ITEMS.thispc, SYSTEM_ITEMS.recycle];

const SIZES = { small: 32, medium: 48, large: 72 };

function Desktop() {
  const { openItem, openMenu, openApp, focusWindow } = useWindowActions();
  const [iconSize, setIconSize] = useState('medium');
  const [selected, setSelected] = useState(() => new Set());
  const [box, setBox] = useState(null); // drag-select rectangle
  const [sortAsc, setSortAsc] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const iconRefs = useRef(new Map());

  let items = [...SYSTEM_ICONS, ...tree];
  if (sortAsc !== null) {
    items = [...items].sort((a, b) => a.name.localeCompare(b.name) * (sortAsc ? 1 : -1));
  }

  // ── drag-to-select ──
  const onPointerDown = (e) => {
    focusWindow(null);
    if (e.button !== 0 || e.target.closest('.desk-icon')) return;
    setSelected(new Set());
    const start = { x: e.clientX, y: e.clientY };
    const move = (ev) => {
      const r = {
        left: Math.min(start.x, ev.clientX),
        top: Math.min(start.y, ev.clientY),
        width: Math.abs(ev.clientX - start.x),
        height: Math.abs(ev.clientY - start.y),
      };
      setBox(r);
      const hit = new Set();
      iconRefs.current.forEach((el, id) => {
        if (!el) return;
        const b = el.getBoundingClientRect();
        if (b.right > r.left && b.left < r.left + r.width && b.bottom > r.top && b.top < r.top + r.height) hit.add(id);
      });
      setSelected(hit);
    };
    const up = () => {
      setBox(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onIconClick = (e, id) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelected((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
    } else setSelected(new Set([id]));
  };

  const desktopMenu = (e) =>
    openMenu(e, [
      {
        label: 'View', icon: <Grid20Regular />, submenu: [
          { label: 'Large icons', checked: iconSize === 'large', onClick: () => setIconSize('large') },
          { label: 'Medium icons', checked: iconSize === 'medium', onClick: () => setIconSize('medium') },
          { label: 'Small icons', checked: iconSize === 'small', onClick: () => setIconSize('small') },
        ],
      },
      {
        label: 'Sort by', icon: <ArrowSort20Regular />, submenu: [
          { label: 'Name (A–Z)', checked: sortAsc === true, onClick: () => setSortAsc(true) },
          { label: 'Name (Z–A)', checked: sortAsc === false, onClick: () => setSortAsc(false) },
          { label: 'Default', checked: sortAsc === null, onClick: () => setSortAsc(null) },
        ],
      },
      { label: 'Refresh', icon: <ArrowSync20Regular />, onClick: () => setRefreshKey((k) => k + 1) },
      { divider: true },
      { label: 'New', icon: <Add20Regular />, submenu: [
        { label: 'Folder', disabled: true },
        { label: 'Text Document', onClick: () => openApp('notepad') },
      ] },
      { divider: true },
      { label: 'Display settings', icon: <Desktop20Regular />, onClick: () => openApp('settings', { props: { page: 'system' } }) },
      { label: 'Personalize', icon: <PaintBrush20Regular />, onClick: () => openApp('settings', { props: { page: 'personalization' } }) },
      { divider: true },
      { label: 'Open in Terminal', icon: <WindowConsole20Regular />, disabled: true },
      { label: 'Show more options', icon: <WindowNew20Regular />, shortcut: 'Shift+F10', disabled: true },
    ]);

  const iconMenu = (e, item) => {
    if (!selected.has(item.id)) setSelected(new Set([item.id]));
    openMenu(e, [
      { label: 'Open', onClick: () => openItem(item) },
      { divider: true },
      { label: 'Properties', disabled: true },
    ]);
  };

  return (
    <div
      className={`desktop desk-${iconSize}`}
      onPointerDown={onPointerDown}
      onContextMenu={desktopMenu}
    >
      <div className="desk-grid" key={refreshKey}>
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => iconRefs.current.set(item.id, el)}
            className={`desk-icon ${selected.has(item.id) ? 'selected' : ''}`}
            onClick={(e) => onIconClick(e, item.id)}
            onDoubleClick={() => openItem(item)}
            onContextMenu={(e) => iconMenu(e, item)}
            onKeyDown={(e) => e.key === 'Enter' && openItem(item)}
          >
            <ItemIcon item={item} size={SIZES[iconSize]} />
            <span className="desk-label">{item.name}</span>
          </button>
        ))}
      </div>
      {box && <div className="desk-select" style={box} />}
    </div>
  );
}

export default memo(Desktop);
