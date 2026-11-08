import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { config } from '../content/config.js';

// Wallpapers available in Settings → Personalization (files in public/wallpapers/).
export const WALLPAPERS = [
  { id: 'bloom', name: 'Bloom', src: 'wallpapers/bloom.jpg' },
  { id: 'bloom-dark', name: 'Bloom Dark', src: 'wallpapers/bloom-dark.jpg' },
  { id: 'flow', name: 'Flow', src: 'wallpapers/flow.jpg' },
  { id: 'aurora', name: 'Aurora', src: 'wallpapers/aurora.jpg' },
];

// Windows 11 accent color palette.
export const ACCENTS = [
  '#005fb8', '#0063b1', '#2d7d9a', '#038387', '#00b7c3', '#00b294', '#018574', '#107c10',
  '#498205', '#847545', '#ffb900', '#ff8c00', '#f7630c', '#da3b01', '#d13438', '#e81123',
  '#ea005e', '#c30052', '#e3008c', '#bf0077', '#b146c2', '#881798', '#8764b8', '#6b69d6',
];

const KEY = 'kodita:settings';
const DEFAULTS = {
  theme: config.theme || 'light',
  material: config.material || 'liquid', // 'liquid' (Liquid Glass) or 'mica' (Windows 11)
  accent: config.accent || '#005fb8',
  wallpaper: config.wallpaper,
  brightness: 100,
  volume: 70,
  nightLight: false,
  wifi: true,
  bluetooth: true,
  airplane: false,
  batterySaver: false,
};

function load() {
  let s = DEFAULTS;
  try {
    s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    /* use defaults */
  }
  document.documentElement.dataset.material = s.material;
  return s;
}

const SettingsContext = createContext(null);
export const useSettings = () => useContext(SettingsContext);
// True when Liquid Glass effects should be drawn.
export const useGlass = () => {
  const s = useContext(SettingsContext);
  return s.material === 'liquid' && s.transparency !== false;
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  const set = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  // Apply theme + accent to the whole page, and remember the choices.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    // Dark mode uses a lighter tint of the accent (like Windows 11) so it stays readable.
    root.style.setProperty('--accent', settings.theme === 'dark' ? `color-mix(in srgb, ${settings.accent} 45%, white)` : settings.accent);
    root.classList.toggle('no-transparency', settings.transparency === false);
    if (root.dataset.material !== settings.material) {
      root.dataset.material = settings.material;
      // The floating Liquid Glass taskbar takes a bit more room: let maximized windows re-measure.
      window.dispatchEvent(new Event('resize'));
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable — settings just won't persist */
    }
  }, [settings]);

  const reset = useCallback(() => setSettings(DEFAULTS), []);
  const value = useMemo(() => ({ ...settings, set, reset }), [settings, set, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
