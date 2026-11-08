import { memo, useEffect, useRef, useState } from 'react';
import {
  Play20Filled, Pause20Filled, Speaker220Filled, SpeakerMute20Filled, FullScreenMaximize20Regular,
  ZoomIn20Regular, ZoomOut20Regular, ChevronLeft20Regular, ChevronRight20Regular, Video20Regular,
} from '@fluentui/react-icons';
import { useWindowActions } from '../os/OSContext.jsx';
import { ItemIcon } from '../os/registry.jsx';
import { allFiles, getItem } from '../content/tree.js';
import './MediaPlayer.css';

const fmt = (t) => {
  if (!Number.isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

function Library({ type, title }) {
  const { openItem } = useWindowActions();
  const files = allFiles().filter((f) => f.type === type);
  return (
    <div className="mp-library">
      <h1>{title}</h1>
      {files.length === 0 ? (
        <p className="mp-muted">Belum ada file. Tambahkan di lessons.js.</p>
      ) : (
        <div className="mp-lib-grid">
          {files.map((f) => (
            <button key={f.id} className="mp-lib-card" onDoubleClick={() => openItem(f)} onClick={() => openItem(f)}>
              <span className="mp-lib-thumb"><ItemIcon item={f} size={56} /></span>
              <span className="mp-lib-name">{f.name}</span>
              <span className="mp-muted">{getItem(f.parentId)?.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ item }) {
  return (
    <div className="mp-empty">
      <Video20Regular className="mp-empty-icon" />
      <h2>{item.name}</h2>
      <p>Video belum ditambahkan.</p>
      <code>Taruh file di public/media/ lalu isi  src: 'media/nama-video.mp4'  (atau  youtube: 'ID')  di lessons.js</code>
    </div>
  );
}

// ───────────── Video ─────────────
function VideoPlayer({ item }) {
  const videoRef = useRef(null);
  const rootRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(0);

  const v = () => videoRef.current;
  const toggle = () => (v().paused ? v().play() : v().pause());
  const seek = (t) => { v().currentTime = Math.min(Math.max(t, 0), duration || 0); };
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : rootRef.current?.requestFullscreen?.().catch(() => {}));

  const poke = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2500);
  };
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const onKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowRight') seek(time + 10);
    else if (e.key === 'ArrowLeft') seek(time - 10);
    else if (e.key === 'f') fullscreen();
    else if (e.key === 'm') setMuted((m) => !m);
    poke();
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  return (
    <div
      ref={rootRef}
      className={`mp-video ${playing && idle ? 'idle' : ''}`}
      tabIndex={-1}
      data-autofocus
      onKeyDown={onKeyDown}
      onPointerMove={poke}
    >
      <video
        ref={videoRef}
        src={item.src}
        onClick={toggle}
        onDoubleClick={fullscreen}
        onPlay={() => { setPlaying(true); poke(); }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      {!playing && (
        <button className="mp-bigplay" onClick={toggle} aria-label="Play"><Play20Filled /></button>
      )}
      <div className="mp-controls">
        <div className="mp-seek">
          <span>{fmt(time)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={time}
            onChange={(e) => seek(+e.target.value)}
            style={{ '--p': `${duration ? (time / duration) * 100 : 0}%` }}
          />
          <span>{fmt(duration)}</span>
        </div>
        <div className="mp-row">
          <div className="mp-title">{item.name}</div>
          <div className="mp-center">
            <button className="mp-skip" onClick={() => seek(time - 10)} title="Back 10 seconds">10</button>
            <button className="mp-play" onClick={toggle} title={playing ? 'Pause (Space)' : 'Play (Space)'}>
              {playing ? <Pause20Filled /> : <Play20Filled />}
            </button>
            <button className="mp-skip mp-skip-fwd" onClick={() => seek(time + 30)} title="Forward 30 seconds">30</button>
          </div>
          <div className="mp-right">
            <button className="mp-btn" onClick={() => setMuted((m) => !m)} title="Mute (M)">
              {muted || volume === 0 ? <SpeakerMute20Filled /> : <Speaker220Filled />}
            </button>
            <input
              className="mp-volume"
              type="range"
              min={0}
              max={1}
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
              style={{ '--p': `${(muted ? 0 : volume) * 100}%` }}
            />
            <button className="mp-btn" onClick={fullscreen} title="Full screen (F)"><FullScreenMaximize20Regular /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaPlayerApp({ item }) {
  if (!item) return <div className="mp mp-dark"><Library type="video" title="Video library" /></div>;
  if (item.youtube) {
    return (
      <div className="mp mp-dark">
        <iframe
          className="mp-youtube"
          title={item.name}
          src={`https://www.youtube-nocookie.com/embed/${item.youtube}?rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  return <div className="mp mp-dark">{item.src ? <VideoPlayer item={item} /> : <Empty item={item} />}</div>;
}
export const MediaPlayer = memo(MediaPlayerApp);

// ───────────── Photos ─────────────
function PhotosApp({ item }) {
  const siblings = item ? (getItem(item.parentId)?.children || [item]).filter((i) => i.type === 'image') : [];
  const [current, setCurrent] = useState(item);
  const [zoom, setZoom] = useState(1);
  if (!item) return <div className="mp mp-light"><Library type="image" title="Gallery" /></div>;

  const idx = siblings.findIndex((s) => s.id === current.id);
  const go = (d) => {
    const n = siblings[idx + d];
    if (n) { setCurrent(n); setZoom(1); }
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z * 1.25, 8));
    if (e.key === '-') setZoom((z) => Math.max(z / 1.25, 0.25));
    if (e.key === '0') setZoom(1);
  };

  return (
    <div className="mp mp-light ph" tabIndex={-1} data-autofocus onKeyDown={onKeyDown}>
      <div
        className="ph-stage"
        onWheel={(e) => setZoom((z) => Math.min(Math.max(z * (e.deltaY < 0 ? 1.1 : 0.9), 0.25), 8))}
      >
        {current.src ? (
          <img src={current.src} alt={current.name} style={{ transform: `scale(${zoom})` }} draggable={false} />
        ) : (
          <div className="mp-empty mp-empty-light">
            <h2>{current.name}</h2>
            <p>Gambar belum ditambahkan.</p>
            <code>Taruh file di public/media/ lalu isi  src: 'media/nama-gambar.png'  di lessons.js</code>
          </div>
        )}
        {idx > 0 && <button className="ph-arrow ph-left" onClick={() => go(-1)}><ChevronLeft20Regular /></button>}
        {idx < siblings.length - 1 && <button className="ph-arrow ph-right" onClick={() => go(1)}><ChevronRight20Regular /></button>}
      </div>
      <div className="ph-bar">
        <span className="ph-name">{current.name}</span>
        <button className="mp-btn" onClick={() => setZoom((z) => Math.max(z / 1.25, 0.25))}><ZoomOut20Regular /></button>
        <button className="ph-zoom" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button className="mp-btn" onClick={() => setZoom((z) => Math.min(z * 1.25, 8))}><ZoomIn20Regular /></button>
      </div>
    </div>
  );
}
export const Photos = memo(PhotosApp);
