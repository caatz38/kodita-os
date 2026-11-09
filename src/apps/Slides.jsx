import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft20Regular, ChevronRight20Regular, SlideMultiple20Regular, Play20Filled,
  FullScreenMinimize20Regular,
} from '@fluentui/react-icons';
import { highlight } from './highlight.jsx';
import { config } from '../content/config.js';
import Picker from './Picker.jsx';
import './Slides.css';

// One slide. Sizes use container units (cqi) so it scales perfectly at any size.
export function Slide({ slide, index, total, thumb = false }) {
  const layout = slide.layout || (slide.code ? 'code' : slide.points ? 'bullets' : 'title');
  return (
    <div className={`sl sl-${layout} ${thumb ? 'sl-thumb' : ''}`}>
      {layout === 'full' && (
        // A finished slide image (e.g. exported from Canva), edge to edge.
        <img className="sl-full-img" src={slide.image} alt={slide.alt || ''} draggable={false} loading={thumb ? 'lazy' : 'eager'} />
      )}

      {layout === 'title' && (
        <>
          <div className="sl-blob sl-blob-a" />
          <div className="sl-blob sl-blob-b" />
          <div className="sl-brand"><img src={config.logo} alt="" /> Kodita</div>
          <div className="sl-center">
            <h1 className="sl-anim">{slide.title}</h1>
            {slide.subtitle && <p className="sl-anim" style={{ '--i': 1 }}>{slide.subtitle}</p>}
          </div>
        </>
      )}

      {layout === 'section' && (
        <>
          <div className="sl-glow" />
          <div className="sl-center">
            <h1 className="sl-anim">{slide.title}</h1>
            {slide.subtitle && <p className="sl-anim" style={{ '--i': 1 }}>{slide.subtitle}</p>}
          </div>
        </>
      )}

      {layout === 'bullets' && (
        <div className="sl-body">
          <h2 className="sl-anim">{slide.title}</h2>
          <ul>
            {(slide.points || []).map((p, i) => (
              <li key={i} className="sl-anim" style={{ '--i': i + 1 }}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {layout === 'code' && (
        <div className="sl-body">
          <h2 className="sl-anim">{slide.title}</h2>
          <div className="sl-code-row">
            <div className="sl-codecard sl-anim" style={{ '--i': 1 }}>
              <div className="sl-code-bar"><i /><i /><i /></div>
              <pre><code>{highlight(slide.code || '', slide.lang)}</code></pre>
            </div>
            {slide.points && (
              <ul className="sl-code-points">
                {slide.points.map((p, i) => (
                  <li key={i} className="sl-anim" style={{ '--i': i + 2 }}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {layout === 'image' && (
        <div className="sl-body sl-image-body">
          {slide.title && <h2 className="sl-anim">{slide.title}</h2>}
          <div className="sl-image sl-anim" style={{ '--i': 1 }}>
            {slide.image ? <img src={slide.image} alt="" /> : <span>Tambahkan gambar di public/media/</span>}
          </div>
          {slide.caption && <p className="sl-caption sl-anim" style={{ '--i': 2 }}>{slide.caption}</p>}
        </div>
      )}

      {layout !== 'title' && layout !== 'section' && layout !== 'full' && (
        <div className="sl-footer">
          <span><img src={config.logo} alt="" /> Kodita</span>
          <span>{index + 1} / {total}</span>
        </div>
      )}
    </div>
  );
}

function Slides({ item, winId }) {
  if (!item) return <Picker type="slides" title="Presentations" winId={winId} />;
  if (item.canva) return <CanvaDeck key={item.id} item={item} />;
  return <Deck key={item.id} item={item} />;
}

// Canva design link → embed URL. Accepts ".../design/<id>/<token>" with or without "/view" or "/edit".
export function canvaEmbedUrl(link) {
  const m = String(link).match(/canva\.com\/design\/([^/?#]+)\/([^/?#]+)/);
  return m ? `https://www.canva.com/design/${m[1]}/${m[2]}/view?embed` : link;
}

// A live, embedded Canva presentation (always shows the latest version from Canva).
function CanvaDeck({ item }) {
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine !== false);
  const [fullscreen, setFullscreen] = useState(false);
  const [engaged, setEngaged] = useState(false); // has the presenter clicked into the deck yet?
  const src = canvaEmbedUrl(item.canva);

  // Clicking into Canva moves focus to the iframe (the page "blurs") → keys now reach Canva.
  useEffect(() => {
    const onBlur = () => setTimeout(() => {
      if (document.activeElement === frameRef.current) setEngaged(true);
    }, 0);
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const onFs = () => setFullscreen(document.fullscreenElement === stageRef.current);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  // Note: a page can't move keyboard focus *inside* Canva's player (cross-origin),
  // so the presenter clicks the slide once — after that arrows/clickers go to Canva.

  const present = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="slides-app slides-canva" tabIndex={-1} data-autofocus>
      <div className="slides-toolbar">
        <span className="slides-canva-badge">Canva</span>
        <span className="slides-title">{item.name}</span>
        {!engaged && loaded && <span className="slides-canva-hint">👆 Klik slide sekali, lalu pakai ← → atau clicker</span>}
        <button className="slides-present" onClick={present} title="Present (fullscreen)">
          <Play20Filled /> Present
        </button>
      </div>
      <div className={`slides-main slides-stage ${fullscreen ? 'is-fullscreen' : ''}`} ref={stageRef}>
        {online ? (
          <div className="slides-canva-frame">
            <iframe
              ref={frameRef}
              title={item.name}
              src={src}
              allow="fullscreen"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
            {!loaded && (
              <div className="slides-canva-loading">
                <span className="slides-spinner" /> Memuat slide dari Canva…
              </div>
            )}
          </div>
        ) : (
          <div className="slides-canva-offline">
            <strong>Butuh internet</strong>
            <span>Slide ini diambil langsung dari Canva. Sambungkan ke internet lalu buka lagi.</span>
          </div>
        )}
        {fullscreen && (
          <button className="slides-exit" onClick={present} title="Exit (Esc)"><FullScreenMinimize20Regular /></button>
        )}
      </div>
    </div>
  );
}

function Deck({ item }) {
  const slides = item?.slides?.length ? item.slides : [{ layout: 'title', title: item?.name || 'Slides', subtitle: 'Belum ada slide — tambahkan di lessons.js' }];
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [thumbs, setThumbs] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef(null);
  const thumbsRef = useRef(null);

  const go = useCallback((n) => {
    setIndex((i) => {
      const next = Math.min(Math.max(n(i), 0), slides.length - 1);
      if (next !== i) setDir(next > i ? 1 : -1);
      return next;
    });
  }, [slides.length]);
  const next = () => go((i) => i + 1);
  const prev = () => go((i) => i - 1);

  const present = () => {
    const el = stageRef.current;
    if (document.fullscreenElement) document.exitFullscreen();
    else el?.requestFullscreen?.().catch(() => {});
  };

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Preload slide images so moving to the next page is instant.
  useEffect(() => {
    slides.forEach((sl) => {
      if (sl.image) {
        const img = new Image();
        img.src = sl.image;
      }
    });
  }, [slides]);

  // Keep the active thumbnail visible.
  useEffect(() => {
    thumbsRef.current?.querySelector('.sl-thumb-btn.active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [index]);

  // Arrow keys, Space, PageUp/PageDown (presentation clickers), Home/End, F5.
  const onKeyDown = (e) => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); go(() => 0); }
    else if (k === 'End') { e.preventDefault(); go(() => slides.length - 1); }
    else if (k === 'F5' || k === 'f' || k === 'F') { e.preventDefault(); present(); }
  };

  // In fullscreen, keep keyboard focus on the stage (keys bubble up to the app).
  useEffect(() => {
    if (!fullscreen) return;
    const el = stageRef.current;
    el.focus();
  }, [fullscreen]);

  return (
    <div className="slides-app" tabIndex={-1} data-autofocus onKeyDown={onKeyDown}>
      <div className="slides-toolbar">
        <button className={`slides-btn ${thumbs ? 'on' : ''}`} onClick={() => setThumbs((t) => !t)} title="Thumbnails">
          <SlideMultiple20Regular />
        </button>
        <span className="slides-title">{item?.name}</span>
        <div className="slides-nav">
          <button className="slides-btn" onClick={prev} disabled={index === 0} title="Previous (←)"><ChevronLeft20Regular /></button>
          <span className="slides-count">{index + 1} / {slides.length}</span>
          <button className="slides-btn" onClick={next} disabled={index === slides.length - 1} title="Next (→)"><ChevronRight20Regular /></button>
        </div>
        <button className="slides-present" onClick={present} title="Present (F5)">
          <Play20Filled /> Present
        </button>
      </div>

      <div className="slides-main">
        {thumbs && (
          <div className="slides-thumbs" ref={thumbsRef}>
            {slides.map((s, i) => (
              <button key={i} className={`sl-thumb-btn ${i === index ? 'active' : ''}`} onClick={() => go(() => i)}>
                <span className="sl-thumb-num">{i + 1}</span>
                <span className="sl-thumb-frame"><Slide slide={s} index={i} total={slides.length} thumb /></span>
              </button>
            ))}
          </div>
        )}

        <div
          className={`slides-stage ${fullscreen ? 'is-fullscreen' : ''}`}
          ref={stageRef}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target.closest('button')) return;
            const r = e.currentTarget.getBoundingClientRect();
            e.clientX - r.left < r.width * 0.3 ? prev() : next();
          }}
        >
          <div className="slides-frame">
            <div key={index} className={`slides-slide ${dir > 0 ? 'from-right' : 'from-left'}`}>
              <Slide slide={slides[index]} index={index} total={slides.length} />
            </div>
          </div>
          <div className="slides-progress"><span style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
          {fullscreen && (
            <button className="slides-exit" onClick={present} title="Exit (Esc)"><FullScreenMinimize20Regular /></button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Slides);
