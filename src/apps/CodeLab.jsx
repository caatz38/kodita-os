import { memo, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import {
  Play20Filled, ArrowReset20Regular, FontIncrease20Regular, FontDecrease20Regular,
  FullScreenMaximize20Regular, ArrowClockwise20Regular, Lightbulb20Regular, LockClosed12Regular,
  ChevronDown12Regular, ChevronRight12Regular,
} from '@fluentui/react-icons';
import './CodeLab.css';

// Injected before the student's code: forwards console.log / errors to the Console panel.
const CONSOLE_SHIM = `<script>(function () {
  var send = function (level, args) {
    try {
      parent.postMessage({ __koditaConsole: true, level: level, text: Array.prototype.map.call(args, function (a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }).join(' ') }, '*');
    } catch (e) {}
  };
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () { send(level, arguments); orig && orig.apply(console, arguments); };
  });
  window.addEventListener('error', function (e) { send('error', [e.message + (e.lineno ? ' (baris ' + e.lineno + ')' : '')]); });
})();<\/script>`;

const DEFAULT_CODE = `<h1>Halo!</h1>
<p>Tulis kode HTML di sini.</p>
`;

// Remember edits per file so closing a window by accident doesn't lose them.
const storeKey = (item) => `kodita:code:${item?.id || 'scratch'}`;
function load(item) {
  try {
    return localStorage.getItem(storeKey(item));
  } catch {
    return null;
  }
}
function save(item, code) {
  try {
    localStorage.setItem(storeKey(item), code);
  } catch {
    /* storage unavailable — fine */
  }
}

function CodeLab({ item }) {
  const starter = item?.starter ?? DEFAULT_CODE;
  const fileName = `${item?.name || 'untitled'}.html`;
  const [code, setCode] = useState(() => load(item) ?? starter);
  const [preview, setPreview] = useState(code);
  const [fontSize, setFontSize] = useState(18);
  const [split, setSplit] = useState(0.5);
  const [showTask, setShowTask] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const mainRef = useRef(null);
  const previewRef = useRef(null);
  const frameRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const consoleEndRef = useRef(null);

  // Collect console.log output from the preview.
  useEffect(() => {
    const onMessage = (e) => {
      if (!e.data?.__koditaConsole || e.source !== frameRef.current?.contentWindow) return;
      setLogs((l) => [...l.slice(-199), { level: e.data.level, text: e.data.text, id: Math.random() }]);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  // Fresh console for every new version of the page.
  useEffect(() => setLogs([]), [preview, reloadKey]);
  useEffect(() => consoleEndRef.current?.scrollIntoView({ block: 'nearest' }), [logs]);
  const usesConsole = /console\.|<script/i.test(preview);

  // Live preview (slightly delayed so typing stays smooth).
  useEffect(() => {
    const t = setTimeout(() => {
      setPreview(code);
      save(item, code);
    }, 300);
    return () => clearTimeout(t);
  }, [code, item]);

  const extensions = useMemo(
    () => [
      html(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { fontSize: `${fontSize}px`, height: '100%' },
        '.cm-scroller': { fontFamily: '"Cascadia Code", "Cascadia Mono", Consolas, "SF Mono", Menlo, monospace', lineHeight: '1.6' },
        '.cm-content': { padding: '12px 0' },
        '.cm-gutters': { paddingLeft: '6px' },
      }),
    ],
    [fontSize]
  );

  const run = () => {
    setPreview(code);
    setReloadKey((k) => k + 1);
  };
  const reset = () => {
    if (code !== starter && !window.confirm('Kembalikan kode ke awal? Perubahanmu akan hilang.')) return;
    setCode(starter);
    setPreview(starter);
    setReloadKey((k) => k + 1);
  };
  const fullscreenPreview = () => previewRef.current?.requestFullscreen?.().catch(() => {});

  // Drag the divider between editor and preview.
  const onDividerDown = (e) => {
    e.preventDefault();
    const rect = mainRef.current.getBoundingClientRect();
    document.documentElement.classList.add('os-dragging');
    let raf = 0;
    const move = (ev) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSplit(Math.min(0.8, Math.max(0.2, (ev.clientX - rect.left) / rect.width))));
    };
    const up = () => {
      document.documentElement.classList.remove('os-dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="cl" data-autofocus tabIndex={-1}>
      <div className="cl-toolbar">
        <div className="cl-file">
          <span className="cl-file-dot" />
          {fileName}
        </div>
        <div className="cl-actions">
          <button className="cl-btn" onClick={() => setFontSize((s) => Math.max(12, s - 2))} title="Smaller text"><FontDecrease20Regular /></button>
          <span className="cl-size">{fontSize}px</span>
          <button className="cl-btn" onClick={() => setFontSize((s) => Math.min(36, s + 2))} title="Bigger text"><FontIncrease20Regular /></button>
          <span className="cl-sep" />
          <button className="cl-btn cl-btn-label" onClick={reset} title="Reset to starter code"><ArrowReset20Regular /> Reset</button>
          <button className="cl-run" onClick={run} title="Run"><Play20Filled /> Run</button>
        </div>
      </div>

      {item?.task && (
        <div className={`cl-task ${showTask ? '' : 'collapsed'}`}>
          <button className="cl-task-head" onClick={() => setShowTask((s) => !s)}>
            {showTask ? <ChevronDown12Regular /> : <ChevronRight12Regular />}
            <Lightbulb20Regular className="cl-task-icon" />
            <strong>Tugas</strong>
            {!showTask && <span className="cl-task-peek">{item.task}</span>}
          </button>
          {showTask && <p>{item.task}</p>}
        </div>
      )}

      <div className="cl-main" ref={mainRef}>
        <div className="cl-editor" style={{ width: `${split * 100}%` }}>
          <CodeMirror
            value={code}
            onChange={setCode}
            theme="dark"
            height="100%"
            extensions={extensions}
            basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: true }}
          />
        </div>
        <div className="cl-divider" onPointerDown={onDividerDown} />
        <div className="cl-preview" ref={previewRef}>
          <div className="cl-browserbar">
            <button className="cl-btn" onClick={run} title="Refresh"><ArrowClockwise20Regular /></button>
            <div className="cl-url"><LockClosed12Regular /> kodita.local/{fileName}</div>
            <button className="cl-btn" onClick={fullscreenPreview} title="Fullscreen preview"><FullScreenMaximize20Regular /></button>
          </div>
          <iframe
            key={reloadKey}
            ref={frameRef}
            title="Preview"
            className="cl-frame"
            sandbox="allow-scripts allow-modals allow-forms"
            srcDoc={CONSOLE_SHIM + preview}
          />
          {usesConsole && (
            <div className={`cl-console ${consoleOpen ? 'open' : ''}`}>
              <div className="cl-console-head">
                <button className="cl-console-toggle" onClick={() => setConsoleOpen((o) => !o)}>
                  {consoleOpen ? <ChevronDown12Regular /> : <ChevronRight12Regular />} Console
                  {logs.length > 0 && <span className="cl-console-count">{logs.length}</span>}
                </button>
                <button className="cl-console-clear" onClick={() => setLogs([])}>Clear</button>
              </div>
              {consoleOpen && (
                <div className="cl-console-body">
                  {logs.length === 0 && <div className="cl-console-empty">console.log() kamu muncul di sini</div>}
                  {logs.map((l) => (
                    <div key={l.id} className={`cl-log cl-log-${l.level}`}>
                      <span className="cl-log-caret">›</span>
                      {l.text}
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CodeLab);
