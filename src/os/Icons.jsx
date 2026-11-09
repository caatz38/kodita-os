// Colorful Windows 11–style icons, drawn as inline SVG (48×48 grid).
import { useId } from 'react';

function Svg({ size = 48, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      {children}
    </svg>
  );
}

// Unique gradient ids so several icons on screen don't clash.
function useIds(...names) {
  const base = useId().replace(/:/g, '');
  return Object.fromEntries(names.map((n) => [n, `${base}${n}`]));
}

export function FolderIcon({ size }) {
  const id = useIds('back', 'front');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.back} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4b225" />
          <stop offset="1" stopColor="#e09612" />
        </linearGradient>
        <linearGradient id={id.front} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd96a" />
          <stop offset="1" stopColor="#ffc532" />
        </linearGradient>
      </defs>
      <path d="M4 11a3 3 0 0 1 3-3h11.2a3 3 0 0 1 2.1.9L23.4 12H41a3 3 0 0 1 3 3v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.back})`} />
      <path d="M4 18.5a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3V38a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.front})`} />
      <path d="M7 16h34a2.5 2.5 0 0 1 2.5 2.5" stroke="#fff3c4" strokeWidth="1" fill="none" opacity="0.9" />
    </Svg>
  );
}

export function ExplorerIcon({ size }) {
  const id = useIds('back', 'front', 'band');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.back} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4b225" />
          <stop offset="1" stopColor="#e09612" />
        </linearGradient>
        <linearGradient id={id.front} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd96a" />
          <stop offset="1" stopColor="#ffc532" />
        </linearGradient>
        <linearGradient id={id.band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0f6cbd" />
          <stop offset="1" stopColor="#2899f5" />
        </linearGradient>
      </defs>
      <path d="M4 11a3 3 0 0 1 3-3h11.2a3 3 0 0 1 2.1.9L23.4 12H41a3 3 0 0 1 3 3v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.back})`} />
      <path d="M4 18.5a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3V38a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.front})`} />
      <path d="M4 31h40v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.band})`} />
    </Svg>
  );
}

export function SettingsIcon({ size }) {
  const id = useIds('g', 'c');
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a97a8" />
          <stop offset="1" stopColor="#4f5b6b" />
        </linearGradient>
        <linearGradient id={id.c} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3aa0f3" />
          <stop offset="1" stopColor="#0f5fb8" />
        </linearGradient>
      </defs>
      <g transform="translate(24 24)" fill={`url(#${id.g})`}>
        {teeth.map((a) => (
          <rect key={a} x="-4.5" y="-21" width="9" height="10" rx="2.5" transform={`rotate(${a})`} />
        ))}
        <circle r="15.5" />
      </g>
      <circle cx="24" cy="24" r="8.5" fill={`url(#${id.c})`} />
      <circle cx="24" cy="24" r="4" fill="#e8f2fc" />
    </Svg>
  );
}

export function NotepadIcon({ size }) {
  const id = useIds('p');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.p} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb2f6" />
          <stop offset="1" stopColor="#1f7fd6" />
        </linearGradient>
      </defs>
      <rect x="9" y="7" width="30" height="36" rx="4" fill={`url(#${id.p})`} />
      <rect x="12" y="13" width="24" height="27" rx="2" fill="#f5f9fd" />
      <g stroke="#9cc5ea" strokeWidth="2" strokeLinecap="round">
        <path d="M16 20h16M16 25.5h16M16 31h10" />
      </g>
      <g fill="#0d4f99">
        <rect x="14" y="4" width="3" height="7" rx="1.5" />
        <rect x="22.5" y="4" width="3" height="7" rx="1.5" />
        <rect x="31" y="4" width="3" height="7" rx="1.5" />
      </g>
    </Svg>
  );
}

export function SlidesAppIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9a52" />
          <stop offset="1" stopColor="#e5531a" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="40" height="36" rx="6" fill={`url(#${id.b})`} />
      <rect x="10" y="12" width="28" height="18" rx="2" fill="#fff" />
      <path d="M14 26l5-6 4 4 3-3 6 5z" fill="#ffb98a" />
      <circle cx="31" cy="17" r="2.5" fill="#ffc9a3" />
      <path d="M24 30v5M19 37h10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function CodeAppIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b3f73" />
          <stop offset="1" stopColor="#1a1c3d" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="40" height="36" rx="6" fill={`url(#${id.b})`} />
      <rect x="4" y="6" width="40" height="7" rx="3" fill="#5a5fa8" opacity="0.6" />
      <circle cx="9.5" cy="9.5" r="1.4" fill="#ff6b6b" />
      <circle cx="14" cy="9.5" r="1.4" fill="#ffd166" />
      <circle cx="18.5" cy="9.5" r="1.4" fill="#4cd97b" />
      <path d="M18 20l-6 7 6 7M30 20l6 7-6 7" stroke="#53d8fb" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26.5 18.5l-5 17" stroke="#c792ea" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function MediaAppIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5f9e" />
          <stop offset="1" stopColor="#8a3cf0" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="40" height="36" rx="8" fill={`url(#${id.b})`} />
      <path d="M19 15.5v17a1.5 1.5 0 0 0 2.3 1.3l13.4-8.5a1.5 1.5 0 0 0 0-2.6l-13.4-8.5A1.5 1.5 0 0 0 19 15.5Z" fill="#fff" />
    </Svg>
  );
}

export function PhotosAppIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64c3ff" />
          <stop offset="1" stopColor="#1677d9" />
        </linearGradient>
      </defs>
      <rect x="4" y="7" width="40" height="34" rx="6" fill={`url(#${id.b})`} />
      <circle cx="33" cy="16.5" r="4" fill="#ffe27a" />
      <path d="M4 33l11-12 9 9 5-5 15 13v-1 0a6 6 0 0 1-6 4H10a6 6 0 0 1-6-6Z" fill="#e8f6ff" />
      <path d="M24 30l5-5 15 13a6 6 0 0 1-6 3H31Z" fill="#b8e1ff" />
    </Svg>
  );
}

export function QuizAppIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5fd68a" />
          <stop offset="1" stopColor="#13a05a" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="40" height="36" rx="8" fill={`url(#${id.b})`} />
      <path d="M18.5 19a5.5 5.5 0 1 1 8 4.9c-1.6.8-2.5 1.9-2.5 3.6v1" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="34.5" r="2.2" fill="#fff" />
    </Svg>
  );
}

export function RecycleBinIcon({ size }) {
  const id = useIds('b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9f3fb" stopOpacity="0.95" />
          <stop offset="1" stopColor="#a7c3dc" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d="M10 12h28l-3 30a3 3 0 0 1-3 2.7H16a3 3 0 0 1-3-2.7Z" fill={`url(#${id.b})`} stroke="#7f9bb5" strokeWidth="1" />
      <rect x="8" y="8" width="32" height="5" rx="2" fill="#d6e6f4" stroke="#7f9bb5" strokeWidth="1" />
      <g stroke="#8fb0cc" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 18l1 21M24 18v21M30 18l-1 21" />
      </g>
    </Svg>
  );
}

export function ThisPCIcon({ size }) {
  const id = useIds('s');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.s} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4fb4ff" />
          <stop offset="1" stopColor="#0b5fc2" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="40" height="27" rx="3" fill="#3a4a5c" />
      <rect x="6" y="10" width="36" height="23" rx="1.5" fill={`url(#${id.s})`} />
      <path d="M20 35h8l1.5 5h-11Z" fill="#8796a8" />
      <rect x="14" y="40" width="20" height="3" rx="1.5" fill="#6b7a8c" />
    </Svg>
  );
}

export function UserIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#d9dde3" />
      <circle cx="16" cy="12.5" r="5.5" fill="#8e98a6" />
      <path d="M6 27a10 8 0 0 1 20 0" fill="#8e98a6" />
    </svg>
  );
}

// A document page with a colored badge — used for lesson files.
const BADGES = {
  slides: { color: '#e5531a', glyph: <path d="M-5 -3.5h10v6h-10z M0 2.5v3 M-3 5.5h6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /> },
  code: { color: '#3b3f73', glyph: <path d="M-2.5 -4l-3.5 4 3.5 4M2.5 -4l3.5 4-3.5 4" stroke="#53d8fb" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /> },
  video: { color: '#b33fd6', glyph: <path d="M-2.5 -4.5v9l7-4.5z" fill="#fff" /> },
  image: { color: '#1677d9', glyph: <path d="M-5.5 4l3.5-5 3 3 1.5-1.5 3 3.5z M3 -3.5a1.6 1.6 0 1 0 0.01 0" fill="#fff" /> },
  quiz: { color: '#13a05a', glyph: <path d="M-4.5 0.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /> },
  text: { color: '#1f7fd6', glyph: <path d="M-4.5 -3h9M-4.5 0h9M-4.5 3h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /> },
};

export function FileIcon({ size, kind = 'text' }) {
  const badge = BADGES[kind] || BADGES.text;
  return (
    <Svg size={size}>
      <path d="M11 4h17.5L39 14.5V42a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#fff" stroke="#c9c9c9" strokeWidth="1" />
      <path d="M28.5 4v8.5a2 2 0 0 0 2 2H39" fill="#ececec" stroke="#c9c9c9" strokeWidth="1" strokeLinejoin="round" />
      <g stroke="#e1e1e1" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 20h20M14 24h20M28 28h6M28 32h6" />
      </g>
      <g transform="translate(17 33)">
        <rect x="-10" y="-9" width="20" height="18" rx="3.5" fill={badge.color} />
        {badge.glyph}
      </g>
    </Svg>
  );
}

// Kodita logo (from config) as an <img>.
// Kodita logo (from config). The logo is black; CSS turns it white on dark backgrounds.
// Pass `wide` for the tight, bold small-size version (keeps its width, height follows).
export function Logo({ src, size = 24, wide = false, style }) {
  return (
    <img
      className="kodita-logo"
      src={src}
      width={size}
      height={wide ? undefined : size}
      alt=""
      draggable={false}
      style={{ display: 'block', ...(wide ? { height: 'auto' } : null), ...style }}
    />
  );
}

// Colored "special" folders (Desktop, Downloads, Documents…) like Windows 11's library folders.
const PLACE_STYLES = {
  desktop: { back: '#1a8ad6', front: ['#4cc2ff', '#1f9be8'], glyph: <rect x="17" y="25" width="14" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" /> },
  downloads: { back: '#0d8f7a', front: ['#3fd0b4', '#18a990'], glyph: <path d="M24 22v11M19 29l5 5 5-5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /> },
  documents: { back: '#5d6f86', front: ['#a3b6cc', '#7d93ad'], glyph: <path d="M18 24h12M18 28.5h12M18 33h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /> },
  pictures: { back: '#1468c8', front: ['#59b4ff', '#2585ea'], glyph: <path d="M17 34l5-6 4 4 3-3 4 5z M28.5 24.5a2 2 0 1 0 .01 0" fill="#fff" /> },
  music: { back: '#c5402a', front: ['#ff8a70', '#ee5c43'], glyph: <path d="M22 33.5a2.5 2.5 0 1 1-2.5-2.5H22V23l8-2v10.5a2.5 2.5 0 1 1-2.5-2.5H30" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinejoin="round" /> },
  videos: { back: '#6a35c4', front: ['#b17cff', '#8a4cf0'], glyph: <path d="M21 23.5v10l8.5-5z" fill="#fff" /> },
};

export function PlaceIcon({ kind, size }) {
  const st = PLACE_STYLES[kind] || PLACE_STYLES.documents;
  const id = useIds('f');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.f} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={st.front[0]} />
          <stop offset="1" stopColor={st.front[1]} />
        </linearGradient>
      </defs>
      <path d="M4 11a3 3 0 0 1 3-3h11.2a3 3 0 0 1 2.1.9L23.4 12H41a3 3 0 0 1 3 3v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={st.back} />
      <path d="M4 18.5a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3V38a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill={`url(#${id.f})`} />
      {st.glyph}
    </Svg>
  );
}

export function HomeIcon({ size }) {
  const id = useIds('r', 'b');
  return (
    <Svg size={size}>
      <defs>
        <linearGradient id={id.r} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9f5a" />
          <stop offset="1" stopColor="#e86a2c" />
        </linearGradient>
        <linearGradient id={id.b} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e8" />
          <stop offset="1" stopColor="#f6dcc4" />
        </linearGradient>
      </defs>
      <path d="M10 22v18a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V22L24 10Z" fill={`url(#${id.b})`} stroke="#d9a47a" strokeWidth="1" />
      <path d="M4.5 24.5 24 7l19.5 17.5" stroke={`url(#${id.r})`} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20" y="29" width="8" height="14" rx="1.5" fill="#e86a2c" />
    </Svg>
  );
}

export function DriveIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="4" y="16" width="40" height="18" rx="3" fill="#c9d3de" stroke="#8d9aa8" strokeWidth="1" />
      <rect x="4" y="27" width="40" height="7" rx="2" fill="#a9b6c4" />
      <circle cx="37" cy="30.5" r="1.6" fill="#3ccf6e" />
      <path d="M9 14l5-6h20l5 6" fill="#dde4ec" stroke="#8d9aa8" strokeWidth="1" />
      <g transform="translate(9 19)">
        <rect width="3.5" height="3.5" fill="#3ccbf4" />
        <rect x="4" width="3.5" height="3.5" fill="#ff9a52" />
        <rect y="4" width="3.5" height="3.5" fill="#3ccbf4" />
        <rect x="4" y="4" width="3.5" height="3.5" fill="#3ccbf4" />
      </g>
    </Svg>
  );
}
