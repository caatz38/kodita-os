import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight16Regular, Checkmark16Regular } from '@fluentui/react-icons';
import { useUI, useWindowActions } from './OSContext.jsx';
import { useGlass } from './SettingsContext.jsx';
import { useLiquidGlass, useMorphIn } from './liquid.js';
import './ContextMenu.css';

// items: [{ label, icon, shortcut, onClick, submenu, checked, disabled } | { divider: true }]
function MenuList({ items, x, y, onDone, flipX = null }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y, ready: false });
  const [openSub, setOpenSub] = useState(null); // { index, x, y }
  const glass = useGlass();

  // Keep the menu on screen.
  useLayoutEffect(() => {
    const el = ref.current;
    const { width, height } = el.getBoundingClientRect();
    const maxX = window.innerWidth - width - 4;
    const maxY = window.innerHeight - height - 4;
    let left = x;
    if (left > maxX) left = flipX != null ? flipX - width - 2 : maxX;
    setPos({ left: Math.max(4, left), top: Math.max(4, Math.min(y, maxY)), ready: true });
  }, [x, y, flipX]);

  // Pop out of the click point with jelly springs; bend light once settled.
  const settled = useMorphIn(ref, (to) => ({ x: to.left, y: to.top, w: to.width * 0.3, h: to.height * 0.18 }), { active: pos.ready });
  useLiquidGlass(ref, { enabled: glass, refract: settled, radius: 14, bezel: 12, scale: 36, blur: 14, saturate: 190 });

  return (
    <div
      ref={ref}
      className={`ctx-menu ${pos.ready ? 'ctx-ready' : ''}`}
      style={{ left: pos.left, top: pos.top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="ctx-divider" />
        ) : (
          <div
            key={i}
            className={`ctx-item ${item.disabled ? 'ctx-disabled' : ''} ${openSub?.index === i ? 'ctx-active' : ''}`}
            onMouseEnter={(e) => {
              if (item.submenu) {
                const r = e.currentTarget.getBoundingClientRect();
                setOpenSub({ index: i, x: r.right + 2, y: r.top - 5, flipX: r.left });
              } else setOpenSub(null);
            }}
            onClick={() => {
              if (item.disabled || item.submenu) return;
              item.onClick?.();
              onDone();
            }}
          >
            <span className="ctx-icon">
              {item.checked ? <Checkmark16Regular /> : item.icon}
            </span>
            <span className="ctx-label">{item.label}</span>
            {item.shortcut && <span className="ctx-shortcut">{item.shortcut}</span>}
            {item.submenu && <ChevronRight16Regular className="ctx-chevron" />}
            {openSub?.index === i &&
              createPortal(
                <MenuList items={item.submenu} x={openSub.x} y={openSub.y} flipX={openSub.flipX} onDone={onDone} />,
                document.body
              )}
          </div>
        )
      )}
    </div>
  );
}

export default function ContextMenu() {
  const { menu } = useUI();
  const { closeMenu } = useWindowActions();

  useEffect(() => {
    if (!menu) return;
    const onDown = (e) => {
      if (!e.target.closest('.ctx-menu')) closeMenu();
    };
    const onKey = (e) => e.key === 'Escape' && closeMenu();
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', closeMenu);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', closeMenu);
    };
  }, [menu, closeMenu]);

  if (!menu) return null;
  return <MenuList key={`${menu.x},${menu.y}`} items={menu.items} x={menu.x} y={menu.y} onDone={closeMenu} />;
}
