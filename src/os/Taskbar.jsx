import {
  Search20Regular, ChevronUp16Regular, Wifi120Regular, Speaker220Regular, Battery820Regular,
  WeatherSunny24Filled, Alert20Regular, TaskListSquareLtr20Regular, Settings20Regular,
  Airplane20Regular, SpeakerMute20Filled, FullScreenMaximize20Regular,
} from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOS } from './OSContext.jsx';
import { useSettings, useGlass } from './SettingsContext.jsx';
import { useLiquidGlass } from './liquid.js';
import LiquidLens from './LiquidLens.jsx';
import { QuickSettings, CalendarFlyout } from './Flyouts.jsx';
import { AppIcon, APPS } from './registry.jsx';
import { Logo } from './Icons.jsx';
import { useClock, fmtTime, fmtDate } from './useClock.js';
import { config } from '../content/config.js';
import './Taskbar.css';

export const PINNED = ['explorer', 'slides', 'code', 'media', 'notepad', 'settings'];

function TaskButton({ app }) {
  const { windows, focused, openApp, focusWindow, minimizeWindow, closeWindow, openMenu } = useOS();
  const mine = windows.filter((w) => w.app === app && !w.closing);
  const running = mine.length > 0;
  const activeWin = mine.find((w) => w.id === focused && !w.minimized);

  const onClick = (e) => {
    if (!running) return openApp(app);
    if (mine.length === 1) {
      return activeWin ? minimizeWindow(activeWin.id) : focusWindow(mine[0].id);
    }
    // Several windows of the same app: pick one from a list.
    const r = e.currentTarget.getBoundingClientRect();
    openMenu({ preventDefault() {}, stopPropagation() {}, clientX: r.left - 80, clientY: r.top - 12 - mine.length * 32 - 10 }, mine.map((w) => ({
      label: w.title,
      icon: <AppIcon app={app} size={16} />,
      onClick: () => focusWindow(w.id),
    })));
  };

  const onContext = (e) =>
    openMenu(e, [
      { label: APPS[app].name, icon: <AppIcon app={app} size={16} />, onClick: () => openApp(app) },
      ...(running
        ? [{ divider: true }, { label: mine.length > 1 ? 'Close all windows' : 'Close window', onClick: () => mine.forEach((w) => closeWindow(w.id)) }]
        : []),
    ]);

  return (
    <button
      className={`tb-btn tb-app ${activeWin ? 'tb-active' : ''}`}
      data-lens
      title={running ? mine.map((w) => w.title).join('\n') : APPS[app].name}
      data-app={app}
      onClick={onClick}
      onContextMenu={onContext}
    >
      <AppIcon app={app} size={24} />
      {running && <span className={`tb-dot ${activeWin ? 'active' : ''}`} />}
    </button>
  );
}

// Separate component so only the clock re-renders every second.
function Clock({ onClick, active }) {
  const now = useClock();
  return (
    <button className={`tb-hover tb-clock ${active ? 'pressed' : ''}`} data-flyout="calendar" onClick={onClick} title={now.toLocaleDateString('en-US', { dateStyle: 'full' })}>
      <span>{fmtTime(now)}</span>
      <span>{fmtDate(now)}</span>
    </button>
  );
}

export default function Taskbar() {
  const { startOpen, toggleStart, openMenu, openApp, windows, toggleDesktop } = useOS();
  const settings = useSettings();
  const [flyout, setFlyout] = useState(null); // 'quick' | 'calendar' | null
  const toggleFlyout = (name) => setFlyout((f) => (f === name ? null : name));
  const barRef = useRef(null);
  const centerRef = useRef(null);
  const glass = useGlass();
  const liquid = settings.material === 'liquid';
  useLiquidGlass(barRef, { enabled: glass, radius: 26, bezel: 22, scale: 64, blur: 2, saturate: 200 });
  // Pinned apps first, then any other running apps.
  const extra = [...new Set(windows.filter((w) => !w.closing && !PINNED.includes(w.app)).map((w) => w.app))];

  const taskbarMenu = (e) =>
    openMenu(e, [
      { label: 'Task Manager', icon: <TaskListSquareLtr20Regular />, disabled: true },
      { divider: true },
      { label: 'Taskbar settings', icon: <Settings20Regular />, onClick: () => openApp('settings') },
      { divider: true },
      {
        label: document.fullscreenElement ? 'Exit full screen' : 'Enter full screen',
        icon: <FullScreenMaximize20Regular />,
        shortcut: 'F11',
        onClick: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {})),
      },
    ]);

  return (
    <div className="taskbar" ref={barRef} onContextMenu={taskbarMenu}>
      <button className="tb-widgets tb-hover">
        <WeatherSunny24Filled className="tb-sun" />
        <span className="tb-weather">
          <span className="tb-temp">31°C</span>
          <span className="tb-cond">Sunny</span>
        </span>
      </button>

      <div className="tb-center" ref={centerRef}>
        {liquid && <LiquidLens containerRef={centerRef} />}
        <button
          className={`tb-btn tb-start ${startOpen ? 'pressed' : ''}`}
          data-lens
          title="Start"
          data-start-toggle
          onClick={() => toggleStart()}
        >
          <Logo src={config.logoIcon} size={30} wide />
        </button>
        <button className="tb-search" data-start-toggle onClick={() => toggleStart('')}>
          <Search20Regular />
          <span>Search</span>
        </button>
        {[...PINNED, ...extra].map((app) => (
          <TaskButton key={app} app={app} />
        ))}
      </div>

      <div className="tb-tray">
        <button className="tb-hover tb-chevron" title="Show hidden icons"><ChevronUp16Regular /></button>
        <button className="tb-hover tb-lang" title="Input language">
          <span>ENG</span>
          <span>US</span>
        </button>
        <button
          className={`tb-hover tb-status ${flyout === 'quick' ? 'pressed' : ''}`}
          data-flyout="quick"
          title="Quick settings"
          onClick={() => toggleFlyout('quick')}
        >
          {settings.airplane ? <Airplane20Regular /> : <Wifi120Regular />}
          {settings.volume === 0 ? <SpeakerMute20Filled /> : <Speaker220Regular />}
          <Battery820Regular />
        </button>
        <Clock active={flyout === 'calendar'} onClick={() => toggleFlyout('calendar')} />
        <button className="tb-hover tb-bell" data-flyout="calendar" title="Notifications" onClick={() => toggleFlyout('calendar')}><Alert20Regular /></button>
        <div className="tb-peek" title="Show desktop" onClick={toggleDesktop} />
      </div>
      {flyout === 'quick' && createPortal(<QuickSettings onClose={() => setFlyout(null)} />, document.body)}
      {flyout === 'calendar' && createPortal(<CalendarFlyout onClose={() => setFlyout(null)} />, document.body)}
    </div>
  );
}
