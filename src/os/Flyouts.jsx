import { useEffect, useRef, useState } from 'react';
import {
  Wifi120Regular, Bluetooth20Regular, Airplane20Regular, BatterySaver20Regular, WeatherMoon20Regular,
  DarkTheme20Regular, BrightnessHigh20Regular, Speaker220Regular, SpeakerMute20Filled, Settings20Regular,
  Battery820Regular, Edit20Regular, ChevronUp20Regular, ChevronDown20Regular,
} from '@fluentui/react-icons';
import { useSettings, useGlass } from './SettingsContext.jsx';
import { useLiquidGlass, useMorphIn, domRect } from './liquid.js';
import { useWindowActions } from './OSContext.jsx';
import { useClock } from './useClock.js';
import './Flyouts.css';

// Closes when clicking outside (except on the button that opened it) or pressing Escape.
function useDismiss(ref, onClose, toggleSelector) {
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest(toggleSelector)) return;
      onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [ref, onClose, toggleSelector]);
}

function Slider({ icon, value, onChange, label }) {
  return (
    <div className="qs-slider">
      <span className="qs-slider-icon" title={label}>{icon}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ '--p': `${value}%` }}
        aria-label={label}
      />
    </div>
  );
}

export function QuickSettings({ onClose }) {
  const s = useSettings();
  const { openApp } = useWindowActions();
  const ref = useRef(null);
  useDismiss(ref, onClose, '[data-flyout="quick"]');
  const qsSettled = useMorphIn(ref, () => domRect('[data-flyout="quick"]'), { opacityFrom: 0.3 });
  useLiquidGlass(ref, { enabled: useGlass(), refract: qsSettled, radius: 26, bezel: 28, scale: 64, blur: 14 });

  const tiles = [
    { key: 'wifi', label: s.wifi ? 'Kodita-WiFi' : 'Wi-Fi', icon: <Wifi120Regular />, on: s.wifi, toggle: () => s.set({ wifi: !s.wifi, airplane: false }), split: true },
    { key: 'bt', label: 'Bluetooth', icon: <Bluetooth20Regular />, on: s.bluetooth, toggle: () => s.set({ bluetooth: !s.bluetooth }), split: true },
    { key: 'air', label: 'Airplane mode', icon: <Airplane20Regular />, on: s.airplane, toggle: () => s.set({ airplane: !s.airplane, wifi: s.airplane, bluetooth: s.airplane }) },
    { key: 'bs', label: 'Battery saver', icon: <BatterySaver20Regular />, on: s.batterySaver, toggle: () => s.set({ batterySaver: !s.batterySaver }) },
    { key: 'night', label: 'Night light', icon: <WeatherMoon20Regular />, on: s.nightLight, toggle: () => s.set({ nightLight: !s.nightLight }) },
    { key: 'dark', label: 'Dark mode', icon: <DarkTheme20Regular />, on: s.theme === 'dark', toggle: () => s.set({ theme: s.theme === 'dark' ? 'light' : 'dark' }) },
  ];

  return (
    <div className="flyout qs" ref={ref} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <div className="qs-body">
        <div className="qs-grid">
          {tiles.map((t) => (
            <div key={t.key} className="qs-tile">
              <button className={`qs-tile-btn ${t.on ? 'on' : ''} ${t.split ? 'split' : ''}`} onClick={t.toggle}>
                {t.icon}
                {t.split && <span className="qs-tile-chev">›</span>}
              </button>
              <span className="qs-tile-label">{t.label}</span>
            </div>
          ))}
        </div>
        <Slider icon={<BrightnessHigh20Regular />} label="Brightness" value={s.brightness} onChange={(v) => s.set({ brightness: Math.max(v, 20) })} />
        <Slider icon={s.volume === 0 ? <SpeakerMute20Filled /> : <Speaker220Regular />} label="Volume" value={s.volume} onChange={(v) => s.set({ volume: v })} />
      </div>
      <div className="qs-footer">
        <span className="qs-battery"><Battery820Regular /> 86%</span>
        <span className="qs-footer-btns">
          <button title="Edit quick settings"><Edit20Regular /></button>
          <button title="All settings" onClick={() => { onClose(); openApp('settings'); }}><Settings20Regular /></button>
        </span>
      </div>
    </div>
  );
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarFlyout({ onClose }) {
  const now = useClock();
  const ref = useRef(null);
  const notesRef = useRef(null);
  const calRef = useRef(null);
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  useDismiss(ref, onClose, '[data-flyout="calendar"]');
  const glass = useGlass();
  const notesSettled = useMorphIn(notesRef, () => domRect('.tb-clock'), { opacityFrom: 0.3 });
  const calSettled = useMorphIn(calRef, () => domRect('.tb-clock'), { opacityFrom: 0.3 });
  useLiquidGlass(notesRef, { enabled: glass, refract: notesSettled, radius: 26, bezel: 24, scale: 56, blur: 14 });
  useLiquidGlass(calRef, { enabled: glass, refract: calSettled, radius: 26, bezel: 28, scale: 64, blur: 14 });

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const same = (a, b) => a.toDateString() === b.toDateString();
  const shift = (n) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <div className="flyout-stack" ref={ref} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <div className="flyout cal-notes" ref={notesRef}>
        <div className="cal-notes-head"><strong>Notifications</strong></div>
        <div className="cal-notes-empty">No new notifications</div>
      </div>
      <div className="flyout cal" ref={calRef}>
        <div className="cal-head">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <div className="cal-body">
          <div className="cal-month">
            <span>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span>
              <button onClick={() => shift(-1)} title="Previous month"><ChevronUp20Regular /></button>
              <button onClick={() => shift(1)} title="Next month"><ChevronDown20Regular /></button>
            </span>
          </div>
          <div className="cal-grid">
            {WEEKDAYS.map((w) => <span key={w} className="cal-wd">{w}</span>)}
            {days.map((d) => (
              <span
                key={d.toISOString()}
                className={`cal-day ${d.getMonth() !== month.getMonth() ? 'other' : ''} ${same(d, now) ? 'today' : ''}`}
              >
                {d.getDate()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
