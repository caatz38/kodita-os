// Picks the right app component for a window.
import { memo } from 'react';
import { APPS, AppIcon } from '../os/registry.jsx';
import { getItem } from '../content/tree.js';
import FileExplorer from './FileExplorer.jsx';
import Slides from './Slides.jsx';
import CodeLab from './CodeLab.jsx';
import Quiz from './Quiz.jsx';
import { MediaPlayer, Photos } from './MediaPlayer.jsx';
import Settings from './Settings.jsx';
import Notepad from './Notepad.jsx';
import './apps.css';

const COMPONENTS = {
  explorer: FileExplorer,
  slides: Slides,
  code: CodeLab,
  quiz: Quiz,
  media: MediaPlayer,
  photos: Photos,
  settings: Settings,
  notepad: Notepad,
};

function Placeholder({ app, item }) {
  return (
    <div className="app-placeholder">
      <AppIcon app={app} size={64} />
      <div className="app-placeholder-title">{item?.name || APPS[app]?.name}</div>
      <div className="app-placeholder-sub">{APPS[app]?.name} — coming soon</div>
    </div>
  );
}

// Memoized: window moves/resizes/focus changes never re-render the app inside.
function AppHost({ app, itemId, winId, props }) {
  const Component = COMPONENTS[app] || Placeholder;
  const item = itemId ? getItem(itemId) : null;
  return <Component app={app} item={item} winId={winId} props={props} />;
}

export default memo(AppHost);
