import { memo, useState } from 'react';
import {
  Desktop20Regular, Bluetooth20Regular, Globe20Regular, PaintBrush20Regular, Apps20Regular, Person20Regular,
  Clock20Regular, Games20Regular, Accessibility20Regular, ShieldLock20Regular, ArrowSync20Regular,
  Search16Regular, BrightnessHigh20Regular, WeatherMoon20Regular, Speaker220Regular,
  Wifi120Regular, Airplane20Regular, Image20Regular, Color20Regular, DarkTheme20Regular,
  CheckmarkCircle20Filled, ChevronRight16Regular, Checkmark16Regular, PlugConnected20Regular,
} from '@fluentui/react-icons';
import { useSettings, WALLPAPERS, ACCENTS } from '../os/SettingsContext.jsx';
import { APPS, AppIcon } from '../os/registry.jsx';
import { config } from '../content/config.js';
import './Settings.css';

const PAGES = [
  { id: 'system', label: 'System', icon: Desktop20Regular, color: '#0078d4' },
  { id: 'bluetooth', label: 'Bluetooth & devices', icon: Bluetooth20Regular, color: '#0078d4' },
  { id: 'network', label: 'Network & internet', icon: Globe20Regular, color: '#2d7d9a' },
  { id: 'personalization', label: 'Personalization', icon: PaintBrush20Regular, color: '#e3008c' },
  { id: 'apps', label: 'Apps', icon: Apps20Regular, color: '#6b69d6' },
  { id: 'accounts', label: 'Accounts', icon: Person20Regular, color: '#00a36c' },
  { id: 'time', label: 'Time & language', icon: Clock20Regular, color: '#0078d4' },
  { id: 'gaming', label: 'Gaming', icon: Games20Regular, color: '#767676' },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility20Regular, color: '#0078d4' },
  { id: 'privacy', label: 'Privacy & security', icon: ShieldLock20Regular, color: '#767676' },
  { id: 'update', label: 'Kodita Update', icon: ArrowSync20Regular, color: '#0078d4' },
];

function Toggle({ on, onChange }) {
  return (
    <button className={`st-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <span className="st-toggle-label">{on ? 'On' : 'Off'}</span>
      <span className="st-toggle-track"><span className="st-toggle-thumb" /></span>
    </button>
  );
}

function Row({ icon, title, desc, children, onClick, joined }) {
  return (
    <div className={`st-row ${onClick ? 'st-row-link' : ''} ${joined ? 'st-row-joined' : ''}`} onClick={onClick}>
      {icon && <span className="st-row-icon">{icon}</span>}
      <span className="st-row-text">
        <span>{title}</span>
        {desc && <small>{desc}</small>}
      </span>
      <span className="st-row-ctrl">{children}{onClick && <ChevronRight16Regular />}</span>
    </div>
  );
}

function LocalToggle({ initial = true }) {
  const [on, setOn] = useState(initial);
  return <Toggle on={on} onChange={setOn} />;
}

// ───────────── pages ─────────────

function Personalization() {
  const s = useSettings();
  const themes = [
    { name: 'Light', wallpaper: 'wallpapers/bloom.jpg', theme: 'light' },
    { name: 'Dark', wallpaper: 'wallpapers/bloom-dark.jpg', theme: 'dark' },
    { name: 'Flow', wallpaper: 'wallpapers/flow.jpg', theme: 'light' },
    { name: 'Aurora', wallpaper: 'wallpapers/aurora.jpg', theme: 'dark' },
  ];
  return (
    <>
      <div className="st-hero">
        <div className="st-preview" style={{ backgroundImage: `url(${s.wallpaper})` }}>
          <div className="st-preview-win"><span /><span /><span /></div>
          <div className="st-preview-bar"><i /><i /><i /><i /></div>
        </div>
        <div className="st-hero-side">
          <div className="st-label">Select a theme to apply</div>
          <div className="st-themes">
            {themes.map((t) => (
              <button
                key={t.name}
                className={`st-theme ${s.wallpaper === t.wallpaper && s.theme === t.theme ? 'on' : ''}`}
                style={{ backgroundImage: `url(${t.wallpaper})` }}
                onClick={() => s.set({ wallpaper: t.wallpaper, theme: t.theme })}
                title={t.name}
              >
                <span className={`st-theme-win ${t.theme}`}>Aa</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Row icon={<Image20Regular />} title="Background" desc="Choose a picture for your desktop and lock screen" joined />
      <div className="st-sub">
        <div className="st-walls">
          {WALLPAPERS.map((w) => (
            <button key={w.id} className={`st-wall ${s.wallpaper === w.src ? 'on' : ''}`} style={{ backgroundImage: `url(${w.src})` }} onClick={() => s.set({ wallpaper: w.src })} title={w.name} />
          ))}
        </div>
      </div>

      <Row icon={<Color20Regular />} title="Design style" desc="Liquid Glass: refractive, floating glass. Windows 11: classic Mica look.">
        <select className="st-select" value={s.material} onChange={(e) => s.set({ material: e.target.value })}>
          <option value="liquid">Liquid Glass</option>
          <option value="mica">Windows 11</option>
        </select>
      </Row>
      <Row icon={<DarkTheme20Regular />} title="Choose your mode" desc="Change the colors that appear in Kodita OS and your apps">
        <select className="st-select" value={s.theme} onChange={(e) => s.set({ theme: e.target.value })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Row>
      <Row icon={<Color20Regular />} title="Transparency effects" desc="Windows and surfaces appear translucent. Turn off for slower laptops.">
        <Toggle on={s.transparency !== false} onChange={(v) => s.set({ transparency: v })} />
      </Row>
      <Row icon={<PaintBrush20Regular />} title="Accent color" desc="Used for buttons, highlights and the taskbar" joined />
      <div className="st-sub">
        <div className="st-accents">
          {ACCENTS.map((c) => (
            <button key={c} className={`st-accent ${s.accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => s.set({ accent: c })} title={c}>
              {s.accent === c && <Checkmark16Regular />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function SystemPage() {
  const s = useSettings();
  return (
    <>
      <div className="st-device">
        <div className="st-device-img" style={{ backgroundImage: `url(${s.wallpaper})` }} />
        <div>
          <strong>KODITA-PC</strong>
          <small>Kodita Laptop 14</small>
          <a>Rename</a>
        </div>
        <div className="st-device-stat"><CheckmarkCircle20Filled className="st-ok" /><span>Kodita Update<small>You're up to date</small></span></div>
      </div>
      <Row icon={<BrightnessHigh20Regular />} title="Brightness" desc="Adjust the brightness of the built-in display">
        <input type="range" min={20} max={100} value={s.brightness} onChange={(e) => s.set({ brightness: +e.target.value })} style={{ '--p': `${((s.brightness - 20) / 80) * 100}%`, width: 200 }} />
      </Row>
      <Row icon={<WeatherMoon20Regular />} title="Night light" desc="Use warmer colors to help block blue light">
        <Toggle on={s.nightLight} onChange={(v) => s.set({ nightLight: v })} />
      </Row>
      <Row icon={<Speaker220Regular />} title="Sound" desc="Volume level, output, input, sound devices">
        <input type="range" min={0} max={100} value={s.volume} onChange={(e) => s.set({ volume: +e.target.value })} style={{ '--p': `${s.volume}%`, width: 200 }} />
      </Row>
      <div className="st-group-title">About</div>
      <div className="st-card st-specs">
        <dl>
          <dt>Device name</dt><dd>KODITA-PC</dd>
          <dt>Processor</dt><dd>Kodita Brain™ 9000 @ 4.20 GHz</dd>
          <dt>Installed RAM</dt><dd>16.0 GB</dd>
          <dt>System type</dt><dd>64-bit operating system</dd>
          <dt>Edition</dt><dd>Kodita OS 11 Pro (Student Edition)</dd>
          <dt>Version</dt><dd>24H2</dd>
        </dl>
      </div>
      <button className="st-link-btn" onClick={() => s.reset()}>Reset all settings to default</button>
    </>
  );
}

function BluetoothPage() {
  const s = useSettings();
  return (
    <>
      <Row icon={<Bluetooth20Regular />} title="Bluetooth" desc={s.bluetooth ? 'Discoverable as “KODITA-PC”' : 'Off'}>
        <Toggle on={s.bluetooth} onChange={(v) => s.set({ bluetooth: v })} />
      </Row>
      <div className="st-group-title">Devices</div>
      <Row icon={<PlugConnected20Regular />} title="Presentation Clicker" desc={s.bluetooth ? 'Connected' : 'Not connected'} />
      <Row icon={<PlugConnected20Regular />} title="Wireless Mouse" desc={s.bluetooth ? 'Connected · Battery 74%' : 'Not connected'} />
      <Row icon={<Speaker220Regular />} title="Classroom Speaker" desc="Paired" />
    </>
  );
}

function NetworkPage() {
  const s = useSettings();
  return (
    <>
      <div className="st-card st-net">
        <Wifi120Regular />
        <div><strong>{s.wifi && !s.airplane ? 'Kodita-WiFi' : 'Not connected'}</strong><small>{s.wifi && !s.airplane ? 'Connected, secured' : 'Turn on Wi-Fi to connect'}</small></div>
      </div>
      <Row icon={<Wifi120Regular />} title="Wi-Fi" desc="Connect, manage known networks">
        <Toggle on={s.wifi} onChange={(v) => s.set({ wifi: v, airplane: false })} />
      </Row>
      <Row icon={<Airplane20Regular />} title="Airplane mode" desc="Stop all wireless communication">
        <Toggle on={s.airplane} onChange={(v) => s.set({ airplane: v, wifi: !v, bluetooth: !v })} />
      </Row>
    </>
  );
}

function AppsPage() {
  return (
    <>
      <div className="st-group-title">Installed apps</div>
      {Object.entries(APPS).map(([id, a], i) => (
        <Row key={id} icon={<AppIcon app={id} size={28} />} title={a.name} desc={`Kodita · ${(i + 1) * 3.7 | 0}.${i}2 MB`} />
      ))}
    </>
  );
}

function AccountsPage() {
  return (
    <>
      <div className="st-card st-account">
        <span className="st-avatar st-avatar-lg"><img className="kodita-logo" src={config.logo} alt="" /></span>
        <div><strong>{config.userName}</strong><small>Local account</small><small>Administrator</small></div>
      </div>
      <Row icon={<Person20Regular />} title="Your info" desc="Profile photo" onClick={() => {}} />
      <Row icon={<ShieldLock20Regular />} title="Sign-in options" desc="Password, PIN, security key" onClick={() => {}} />
    </>
  );
}

function TimePage() {
  const now = new Date();
  return (
    <>
      <div className="st-card st-big-time">
        <strong>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</strong>
        <small>{now.toLocaleDateString('en-US', { dateStyle: 'full' })}</small>
      </div>
      <Row icon={<Clock20Regular />} title="Set time automatically"><LocalToggle /></Row>
      <Row icon={<Globe20Regular />} title="Time zone" desc="(UTC+07:00) Bangkok, Hanoi, Jakarta" />
      <Row icon={<Globe20Regular />} title="Windows display language" desc="English (United States)" />
      <Row icon={<Globe20Regular />} title="Country or region" desc="Indonesia" />
    </>
  );
}

function GamingPage() {
  return (
    <>
      <Row icon={<Games20Regular />} title="Game Mode" desc="Optimize your PC for play"><LocalToggle /></Row>
      <Row icon={<Games20Regular />} title="Roblox Studio" desc="Ready to build ✓" />
      <Row icon={<Games20Regular />} title="Captures" desc="Save location, recording quality" onClick={() => {}} />
    </>
  );
}

function AccessibilityPage() {
  const [size, setSize] = useState(100);
  return (
    <>
      <Row icon={<Accessibility20Regular />} title="Text size" desc={`${size}%`}>
        <input type="range" min={100} max={225} value={size} onChange={(e) => setSize(+e.target.value)} style={{ '--p': `${((size - 100) / 125) * 100}%`, width: 200 }} />
      </Row>
      <Row icon={<Accessibility20Regular />} title="Animation effects"><LocalToggle /></Row>
      <Row icon={<Accessibility20Regular />} title="Always show scrollbars"><LocalToggle initial={false} /></Row>
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <Row icon={<ShieldLock20Regular />} title="Kodita Security" desc="Antivirus, browser, firewall, and network protection" onClick={() => {}} />
      <Row icon={<ShieldLock20Regular />} title="Location"><LocalToggle initial={false} /></Row>
      <Row icon={<ShieldLock20Regular />} title="Camera"><LocalToggle /></Row>
      <Row icon={<ShieldLock20Regular />} title="Microphone"><LocalToggle /></Row>
    </>
  );
}

function UpdatePage() {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState('Today, 7:30 AM');
  const check = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setChecked(`Today, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
    }, 2200);
  };
  return (
    <div className="st-card st-update">
      <span className={`st-update-icon ${checking ? 'spin' : ''}`}>{checking ? <ArrowSync20Regular /> : <CheckmarkCircle20Filled />}</span>
      <div>
        <strong>{checking ? 'Checking for updates…' : "You're up to date"}</strong>
        <small>Last checked: {checked}</small>
      </div>
      <button className="st-primary" onClick={check} disabled={checking}>Check for updates</button>
    </div>
  );
}

const PAGE_COMPONENTS = {
  system: SystemPage,
  bluetooth: BluetoothPage,
  network: NetworkPage,
  personalization: Personalization,
  apps: AppsPage,
  accounts: AccountsPage,
  time: TimePage,
  gaming: GamingPage,
  accessibility: AccessibilityPage,
  privacy: PrivacyPage,
  update: UpdatePage,
};

function Settings({ props }) {
  const [page, setPage] = useState(props?.page || 'system');
  const [query, setQuery] = useState('');
  const Page = PAGE_COMPONENTS[page];
  const current = PAGES.find((p) => p.id === page);
  const visible = PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="st" data-autofocus tabIndex={-1}>
      <aside className="st-nav">
        <div className="st-user">
          <span className="st-avatar"><img className="kodita-logo" src={config.logo} alt="" /></span>
          <span><strong>{config.userName}</strong><small>Local Account</small></span>
        </div>
        <label className="st-search">
          <input placeholder="Find a setting" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Search16Regular />
        </label>
        <nav>
          {visible.map((p) => (
            <button key={p.id} className={`st-nav-item ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
              <p.icon style={{ color: p.color }} />
              <span>{p.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="st-main">
        <h1 key={page}>{current.label}</h1>
        <div className="st-page" key={`p-${page}`}>
          <Page />
        </div>
      </main>
    </div>
  );
}

export default memo(Settings);
