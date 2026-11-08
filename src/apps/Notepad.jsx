import { memo, useEffect, useRef, useState } from 'react';
import { useWindowActions } from '../os/OSContext.jsx';
import './Notepad.css';

const key = (item) => `kodita:notepad:${item?.id || 'scratch'}`;
function load(item) {
  try {
    return localStorage.getItem(key(item));
  } catch {
    return null;
  }
}

function Notepad({ item }) {
  const { openMenu, openApp } = useWindowActions();
  const [text, setText] = useState(() => load(item) ?? item?.content ?? '');
  const [zoom, setZoom] = useState(100);
  const [wrap, setWrap] = useState(true);
  const [status, setStatus] = useState(true);
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const ref = useRef(null);

  // Autosave.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key(item), text);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text, item]);

  const updatePos = () => {
    const el = ref.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split('\n');
    setPos({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const insert = (str) => {
    const el = ref.current;
    el.focus();
    document.execCommand('insertText', false, str);
  };
  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${item?.name || 'Untitled'}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const exec = (cmd) => {
    ref.current.focus();
    document.execCommand(cmd);
  };
  const zoomBy = (d) => setZoom((z) => Math.min(500, Math.max(10, z + d)));
  const timeDate = () => insert(new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'numeric', day: 'numeric', year: 'numeric' }));

  const menu = (e, items) => {
    const r = e.currentTarget.getBoundingClientRect();
    openMenu({ preventDefault() {}, stopPropagation() {}, clientX: r.left, clientY: r.bottom + 2 }, items);
  };
  const fileMenu = [
    { label: 'New tab', shortcut: 'Ctrl+N', onClick: () => openApp('notepad') },
    { divider: true },
    { label: 'Save', shortcut: 'Ctrl+S', onClick: () => {} },
    { label: 'Download as .txt', onClick: download },
  ];
  const editMenu = [
    { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => exec('undo') },
    { divider: true },
    { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => exec('cut') },
    { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => exec('copy') },
    { label: 'Select all', shortcut: 'Ctrl+A', onClick: () => { ref.current.focus(); ref.current.select(); } },
    { label: 'Time/Date', shortcut: 'F5', onClick: timeDate },
  ];
  const viewMenu = [
    { label: 'Zoom in', shortcut: 'Ctrl+Plus', onClick: () => zoomBy(10) },
    { label: 'Zoom out', shortcut: 'Ctrl+Minus', onClick: () => zoomBy(-10) },
    { label: 'Restore default zoom', shortcut: 'Ctrl+0', onClick: () => setZoom(100) },
    { divider: true },
    { label: 'Status bar', checked: status, onClick: () => setStatus((s) => !s) },
    { label: 'Word wrap', checked: wrap, onClick: () => setWrap((w) => !w) },
  ];

  const onKeyDown = (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomBy(10); }
    else if (mod && e.key === '-') { e.preventDefault(); zoomBy(-10); }
    else if (mod && e.key === '0') { e.preventDefault(); setZoom(100); }
    else if (mod && e.key === 's') { e.preventDefault(); }
    else if (e.key === 'F5') { e.preventDefault(); timeDate(); }
  };

  const chars = text.length;

  return (
    <div className="np">
      <div className="np-menubar">
        <button onClick={(e) => menu(e, fileMenu)}>File</button>
        <button onClick={(e) => menu(e, editMenu)}>Edit</button>
        <button onClick={(e) => menu(e, viewMenu)}>View</button>
      </div>
      <textarea
        ref={ref}
        className="np-text"
        data-autofocus
        value={text}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        style={{ fontSize: `${15 * (zoom / 100)}px`, whiteSpace: wrap ? 'pre-wrap' : 'pre' }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onKeyUp={updatePos}
        onClick={updatePos}
        onSelect={updatePos}
      />
      {status && (
        <div className="np-status">
          <span>Ln {pos.ln}, Col {pos.col}</span>
          <span>{chars} characters</span>
          <span className="np-flex" />
          <span>{zoom}%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      )}
    </div>
  );
}

export default memo(Notepad);
