import { OSProvider } from './os/OSContext.jsx';
import { SettingsProvider, useSettings } from './os/SettingsContext.jsx';
import { SessionProvider, SessionScreens } from './os/Session.jsx';
import Desktop from './os/Desktop.jsx';
import Taskbar from './os/Taskbar.jsx';
import StartMenu from './os/StartMenu.jsx';
import ContextMenu from './os/ContextMenu.jsx';
import WindowLayer from './os/WindowLayer.jsx';
import { useWallpaperGlass } from './os/liquid.js';

function Screen() {
  const { wallpaper, brightness, nightLight, material, transparency } = useSettings();
  useWallpaperGlass(wallpaper, material === 'liquid' && transparency !== false);
  return (
    <div className="desktop-root">
      <div className="wallpaper" style={{ backgroundImage: `url(${wallpaper})` }} />
      <Desktop />
      <WindowLayer />
      <StartMenu />
      <Taskbar />
      <ContextMenu />
      <SessionScreens />
      {/* Brightness + night light are cheap overlays (no filters on the page). */}
      {/* Only rendered while in use, so they cost nothing normally. */}
      {brightness < 100 && <div className="screen-dim" style={{ opacity: ((100 - brightness) / 100) * 0.7 }} />}
      {nightLight && <div className="screen-night" />}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <OSProvider>
        <SessionProvider>
          <Screen />
        </SessionProvider>
      </OSProvider>
    </SettingsProvider>
  );
}
