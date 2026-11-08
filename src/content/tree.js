// Turns lessons.js into a lookup-able tree: ids, parents, paths, fake dates & sizes.
import { desktop, recycleBin } from './lessons.js';
import { FILE_TYPES } from '../os/registry.jsx';

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function prepare(items, parentId) {
  return items.map((item) => {
    const id = `${parentId}/${slug(item.name)}`;
    const out = { ...item, id, parentId };
    if (item.children) out.children = prepare(item.children, id);
    return out;
  });
}

export const DESKTOP_ID = 'desktop';
export const tree = prepare(desktop, DESKTOP_ID);

// Built-in places (not from lessons.js).
const EMPTY_FOLDERS = ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos'].map((name) => ({
  id: `user/${slug(name)}`,
  type: 'folder',
  name,
  parentId: 'sys/thispc',
  children: [],
  system: true,
}));

export const SYSTEM_ITEMS = {
  thispc: { id: 'sys/thispc', type: 'thispc', name: 'This PC' },
  recycle: { id: 'sys/recycle', type: 'recycle', name: 'Recycle Bin' },
};
SYSTEM_ITEMS.recycle.children = prepare(recycleBin, SYSTEM_ITEMS.recycle.id);

export const DESKTOP_FOLDER = { id: DESKTOP_ID, type: 'folder', name: 'Desktop', parentId: 'sys/thispc', children: tree, system: true };
export const USER_FOLDERS = [DESKTOP_FOLDER, ...EMPTY_FOLDERS];

const byId = new Map();
function index(items) {
  for (const it of items) {
    byId.set(it.id, it);
    if (it.children) index(it.children);
  }
}
index(tree);
index(Object.values(SYSTEM_ITEMS));
index(USER_FOLDERS);

export const getItem = (id) => byId.get(id);
export const allFiles = () =>
  [...byId.values()].filter((i) => FILE_TYPES[i.type]?.app && !['folder', 'thispc', 'recycle'].includes(i.type) && !i.id.startsWith('sys/'));
export const allFolders = () => tree.filter((i) => i.type === 'folder');

// Every item inside a folder, at any depth.
export function descendants(item) {
  const out = [];
  (function walk(list = []) {
    for (const it of list) {
      out.push(it);
      walk(it.children);
    }
  })(item?.children);
  return out;
}

// Breadcrumb: list of items from the top down to `id`.
export function pathTo(id) {
  const path = [];
  let cur = byId.get(id);
  while (cur) {
    path.unshift(cur);
    cur = cur.parentId && cur.parentId !== 'sys/thispc' ? byId.get(cur.parentId) : null;
  }
  return path;
}

// ── fake but stable "Date modified" and "Size" ──
function hash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const TODAY = new Date();
export function modifiedDate(item) {
  const h = hash(item.id);
  const d = new Date(TODAY);
  d.setDate(d.getDate() - (h % 9));
  d.setHours(8 + (h % 10), (h >> 3) % 60);
  return d;
}
export function fmtModified(item) {
  const d = modifiedDate(item);
  return `${d.toLocaleDateString('en-US')} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export function fileSize(item) {
  let kb;
  switch (item.type) {
    case 'folder':
    case 'thispc':
    case 'recycle':
      return '';
    case 'slides': kb = 180 + (item.slides?.length || 1) * 64; break;
    case 'code': kb = Math.max(1, Math.ceil((item.starter?.length || 200) / 1024)); break;
    case 'quiz': kb = 2 + (item.questions?.length || 0); break;
    case 'video': kb = 48_213; break;
    case 'image': kb = 1_284; break;
    default: kb = Math.max(1, Math.ceil((item.content?.length || 100) / 1024));
  }
  return `${kb.toLocaleString('en-US')} KB`;
}

export function typeLabel(item) {
  return FILE_TYPES[item.type]?.label || 'File';
}
