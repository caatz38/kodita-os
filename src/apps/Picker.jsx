// Shown when Slides/Quiz is opened without a file: pick one, and it opens in this same window.
import { useWindowActions } from '../os/OSContext.jsx';
import { allFiles, getItem } from '../content/tree.js';
import { ItemIcon } from '../os/registry.jsx';
import { Slide } from './Slides.jsx';
import './Picker.css';

export default function Picker({ type, title, winId, dark = false }) {
  const { setTitle } = useWindowActions();
  const files = allFiles().filter((f) => f.type === type);
  return (
    <div className={`pk ${dark ? 'pk-dark' : ''}`} data-autofocus tabIndex={-1}>
      <h1>{title}</h1>
      <div className="pk-grid">
        {files.map((f) => (
          <button key={f.id} className="pk-card" onClick={() => setTitle(winId, f.name, f.id)}>
            <span className="pk-thumb">
              {type === 'slides' && f.slides?.[0] ? <Slide slide={f.slides[0]} index={0} total={f.slides.length} thumb /> : <ItemIcon item={f} size={56} />}
            </span>
            <span className="pk-name">{f.name}</span>
            <span className="pk-sub">{getItem(f.parentId)?.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
