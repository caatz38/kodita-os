import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft20Regular, ArrowRight20Regular, ArrowUp20Regular, ArrowClockwise20Regular,
  ChevronRight16Regular, ChevronRight12Regular, ChevronDown12Regular, ChevronDown16Regular, Search16Regular,
  Add20Regular, Cut20Regular, Copy20Regular, ClipboardPaste20Regular, Rename20Regular, Share20Regular, Delete20Regular,
  ArrowSort20Regular, Grid20Regular, Filter20Regular, MoreHorizontal20Regular, PanelRight20Regular,
  Pin12Regular, Clock16Regular, Star16Regular, People16Regular, TextBulletListLtr16Regular, Grid16Regular,
  Open20Regular, WindowNew20Regular, Info16Regular,
} from '@fluentui/react-icons';
import { useWindowActions } from '../os/OSContext.jsx';
import { ItemIcon } from '../os/registry.jsx';
import { HomeIcon, PhotosAppIcon, ThisPCIcon, DriveIcon, RecycleBinIcon } from '../os/Icons.jsx';
import {
  getItem, pathTo, descendants, allFiles, allFolders, USER_FOLDERS,
  fmtModified, modifiedDate, fileSize, typeLabel,
} from '../content/tree.js';
import './FileExplorer.css';

const ICON_SIZES = { xl: 96, large: 64, medium: 48 };
const VIEW_LABELS = { xl: 'Extra large icons', large: 'Large icons', medium: 'Medium icons', details: 'Details' };

// ── what's at a location ──
function resolve(loc) {
  if (loc === 'home') return { kind: 'home', name: 'Home' };
  if (loc === 'gallery') return { kind: 'gallery', name: 'Gallery', items: allFiles().filter((f) => f.type === 'image') };
  if (loc === 'sys/thispc') return { kind: 'thispc', name: 'This PC' };
  const item = getItem(loc);
  if (!item) return { kind: 'home', name: 'Home' };
  return { kind: 'folder', name: item.name, item, items: item.children || [] };
}

function parentOf(loc) {
  if (loc === 'home') return null;
  if (loc === 'gallery' || loc === 'sys/thispc') return 'home';
  if (loc === 'sys/recycle') return 'desktop';
  return getItem(loc)?.parentId || 'home';
}

function LocIcon({ loc, size = 16 }) {
  if (loc === 'home') return <HomeIcon size={size} />;
  if (loc === 'gallery') return <PhotosAppIcon size={size} />;
  if (loc === 'sys/thispc') return <ThisPCIcon size={size} />;
  if (loc === 'sys/recycle') return <RecycleBinIcon size={size} />;
  const item = getItem(loc);
  return item ? <ItemIcon item={item} size={size} /> : null;
}

function sortItems(items, sort) {
  const list = [...items];
  // Folders always first, like Windows.
  const folderFirst = (a, b) => (b.type === 'folder') - (a.type === 'folder');
  const cmp = {
    name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }),
    date: (a, b) => modifiedDate(a) - modifiedDate(b),
    type: (a, b) => typeLabel(a).localeCompare(typeLabel(b)),
  }[sort.by];
  if (!cmp) return list;
  return list.sort((a, b) => folderFirst(a, b) || cmp(a, b) * sort.dir);
}

// ─────────────────────────────────────────────────────────────

function FileExplorer({ item, winId }) {
  const { openItem, openApp, setTitle, openMenu } = useWindowActions();
  const startLoc = item ? item.id : 'home';
  const [hist, setHist] = useState({ stack: [startLoc], i: 0 });
  const loc = hist.stack[hist.i];
  const place = useMemo(() => resolve(loc), [loc]);

  const [selected, setSelected] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [view, setView] = useState('large');
  const [sort, setSort] = useState({ by: 'name', dir: 1 });
  const [details, setDetails] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const rootRef = useRef(null);

  // Keep the window tab title in sync with the folder.
  useEffect(() => {
    const isItem = loc !== 'home' && loc !== 'gallery';
    setTitle(winId, place.name, isItem ? loc : null);
    setSelected(new Set());
    setQuery('');
  }, [loc]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (id) => {
    if (!id || id === loc) return;
    setHist((h) => ({ stack: [...h.stack.slice(0, h.i + 1), id], i: h.i + 1 }));
  };
  const canBack = hist.i > 0;
  const canForward = hist.i < hist.stack.length - 1;
  const back = () => canBack && setHist((h) => ({ ...h, i: h.i - 1 }));
  const forward = () => canForward && setHist((h) => ({ ...h, i: h.i + 1 }));
  const up = () => navigate(parentOf(loc));
  const refresh = () => setRefreshKey((k) => k + 1);

  // Items shown in the content area.
  const searching = query.trim().length > 0;
  const items = useMemo(() => {
    let list = place.items || [];
    if (searching) {
      const q = query.trim().toLowerCase();
      const pool = place.kind === 'folder' ? descendants(place.item) : place.kind === 'home' ? [...allFolders(), ...allFiles()] : list;
      list = pool.filter((i) => i.name.toLowerCase().includes(q));
    }
    return sortItems(list, sort);
  }, [place, query, searching, sort]);

  const open = (it) => {
    if (it.type === 'folder' || it.type === 'thispc' || it.type === 'recycle') navigate(it.id);
    else openItem(it);
  };

  const select = (e, it) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelected((s) => {
        const n = new Set(s);
        n.has(it.id) ? n.delete(it.id) : n.add(it.id);
        return n;
      });
    } else setSelected(new Set([it.id]));
  };

  const selectedItems = items.filter((i) => selected.has(i.id));
  const single = selectedItems.length === 1 ? selectedItems[0] : null;

  // ── keyboard ──
  const onKeyDown = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Backspace' || (e.altKey && e.key === 'ArrowLeft')) { e.preventDefault(); back(); return; }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); forward(); return; }
    if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); up(); return; }
    if (e.key === 'F5') { e.preventDefault(); refresh(); return; }
    if (e.key === 'Enter' && single) { open(single); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); setSelected(new Set(items.map((i) => i.id))); return; }
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key) && items.length) {
      e.preventDefault();
      const idx = single ? items.indexOf(single) : -1;
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      const next = items[Math.min(Math.max(idx + step, 0), items.length - 1)];
      setSelected(new Set([next.id]));
    }
  };

  // ── menus ──
  const viewMenu = Object.entries(VIEW_LABELS).map(([k, label]) => ({ label, checked: view === k, onClick: () => setView(k) }));
  const sortMenu = [
    { label: 'Name', checked: sort.by === 'name', onClick: () => setSort((s) => ({ ...s, by: 'name' })) },
    { label: 'Date modified', checked: sort.by === 'date', onClick: () => setSort((s) => ({ ...s, by: 'date' })) },
    { label: 'Type', checked: sort.by === 'type', onClick: () => setSort((s) => ({ ...s, by: 'type' })) },
    { divider: true },
    { label: 'Ascending', checked: sort.dir === 1, onClick: () => setSort((s) => ({ ...s, dir: 1 })) },
    { label: 'Descending', checked: sort.dir === -1, onClick: () => setSort((s) => ({ ...s, dir: -1 })) },
  ];
  const dropdown = (e, items) => {
    const r = e.currentTarget.getBoundingClientRect();
    openMenu({ preventDefault() {}, stopPropagation() {}, clientX: r.left, clientY: r.bottom + 4 }, items);
  };

  const itemMenu = (e, it) => {
    if (!selected.has(it.id)) setSelected(new Set([it.id]));
    const isFolder = it.type === 'folder';
    openMenu(e, [
      { label: 'Open', icon: <Open20Regular />, shortcut: 'Enter', onClick: () => open(it) },
      ...(isFolder ? [{ label: 'Open in new window', icon: <WindowNew20Regular />, onClick: () => openApp('explorer', { item: it }) }] : []),
      { divider: true },
      { label: 'Cut', icon: <Cut20Regular />, disabled: true },
      { label: 'Copy', icon: <Copy20Regular />, disabled: true },
      { label: 'Rename', icon: <Rename20Regular />, disabled: true },
      { label: 'Delete', icon: <Delete20Regular />, disabled: true },
      { divider: true },
      { label: 'Properties', icon: <Info16Regular />, shortcut: 'Alt+Enter', onClick: () => { setSelected(new Set([it.id])); setDetails(true); } },
    ]);
  };
  const backgroundMenu = (e) => {
    if (e.target.closest('.fx-item')) return;
    openMenu(e, [
      { label: 'View', icon: <Grid20Regular />, submenu: viewMenu },
      { label: 'Sort by', icon: <ArrowSort20Regular />, submenu: sortMenu },
      { label: 'Refresh', icon: <ArrowClockwise20Regular />, onClick: refresh },
      { divider: true },
      { label: 'Properties', icon: <Info16Regular />, onClick: () => setDetails(true) },
    ]);
  };

  // Breadcrumb trail.
  const crumbs =
    place.kind === 'folder' ? pathTo(loc).map((i) => ({ id: i.id, name: i.name })) : [{ id: loc, name: place.name }];

  const content = () => {
    if (place.kind === 'home' && !searching) return <HomeView onOpen={open} onSelect={select} selected={selected} onMenu={itemMenu} />;
    if (place.kind === 'thispc' && !searching) return <ThisPCView onOpen={open} onSelect={select} selected={selected} onMenu={itemMenu} />;
    if (items.length === 0) {
      return <div className="fx-empty">{searching ? 'No items match your search.' : place.kind === 'gallery' ? 'No photos yet. Add images to lessons.js to see them here.' : 'This folder is empty.'}</div>;
    }
    return view === 'details' ? (
      <DetailsView items={items} selected={selected} onSelect={select} onOpen={open} onMenu={itemMenu} sort={sort} setSort={setSort} showFolder={searching} />
    ) : (
      <IconView items={items} size={ICON_SIZES[view]} selected={selected} onSelect={select} onOpen={open} onMenu={itemMenu} />
    );
  };

  const count = (place.kind === 'home' || place.kind === 'thispc') && !searching ? null : items.length;

  return (
    <div className="fx" ref={rootRef} tabIndex={-1} data-autofocus onKeyDown={onKeyDown}>
      {/* Address bar */}
      <div className="fx-addr">
        <button className="fx-icon-btn" disabled={!canBack} onClick={back} title="Back (Alt + Left Arrow)"><ArrowLeft20Regular /></button>
        <button className="fx-icon-btn" disabled={!canForward} onClick={forward} title="Forward (Alt + Right Arrow)"><ArrowRight20Regular /></button>
        <button className="fx-icon-btn" disabled={!parentOf(loc)} onClick={up} title="Up to parent folder (Alt + Up Arrow)"><ArrowUp20Regular /></button>
        <button className="fx-icon-btn" onClick={refresh} title="Refresh (F5)"><ArrowClockwise20Regular /></button>
        <div className="fx-crumbs">
          <span className="fx-crumb-icon"><LocIcon loc={loc} /></span>
          <ChevronRight12Regular className="fx-crumb-sep" />
          {searching ? (
            <span className="fx-crumb fx-crumb-static">Search Results in {place.name}</span>
          ) : (
            crumbs.map((c) => (
              <span key={c.id} className="fx-crumb-group">
                <button className="fx-crumb" onClick={() => navigate(c.id)}>{c.name}</button>
                <ChevronRight12Regular className="fx-crumb-sep" />
              </span>
            ))
          )}
        </div>
        <label className="fx-search">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${place.name}`} spellCheck={false} />
          <Search16Regular />
        </label>
      </div>

      {/* Command bar */}
      <div className="fx-cmd">
        <button className="fx-cmd-btn fx-cmd-new" onClick={(e) => dropdown(e, [{ label: 'Folder', disabled: true }, { label: 'Text Document', onClick: () => openApp('notepad') }])}>
          <Add20Regular /> <span>New</span> <ChevronDown12Regular />
        </button>
        <span className="fx-cmd-sep" />
        {[[Cut20Regular, 'Cut'], [Copy20Regular, 'Copy'], [ClipboardPaste20Regular, 'Paste'], [Rename20Regular, 'Rename'], [Share20Regular, 'Share'], [Delete20Regular, 'Delete']].map(([Icon, label]) => (
          <button key={label} className="fx-icon-btn" title={label} disabled={label !== 'Paste' ? !single : true}><Icon /></button>
        ))}
        <span className="fx-cmd-sep" />
        <button className="fx-cmd-btn" onClick={(e) => dropdown(e, sortMenu)}><ArrowSort20Regular /> <span>Sort</span> <ChevronDown12Regular /></button>
        <button className="fx-cmd-btn" onClick={(e) => dropdown(e, viewMenu)}><Grid20Regular /> <span>View</span> <ChevronDown12Regular /></button>
        <button className="fx-cmd-btn" disabled><Filter20Regular /> <span>Filter</span> <ChevronDown12Regular /></button>
        <span className="fx-cmd-sep" />
        <button className="fx-icon-btn" title="See more"><MoreHorizontal20Regular /></button>
        <button className={`fx-cmd-btn fx-details-btn ${details ? 'on' : ''}`} onClick={() => setDetails((d) => !d)}>
          <PanelRight20Regular /> <span>Details</span>
        </button>
      </div>

      {/* Main area */}
      <div className="fx-main">
        <NavPane loc={loc} navigate={navigate} />
        <div
          className="fx-content"
          onPointerDown={(e) => !e.target.closest('.fx-item') && setSelected(new Set())}
          onContextMenu={backgroundMenu}
        >
          <div className="fx-content-inner" key={`${loc}|${refreshKey}|${searching}`}>
            {content()}
          </div>
        </div>
        {details && <DetailsPane item={single} place={place} loc={loc} count={selectedItems.length} />}
      </div>

      {/* Status bar */}
      <div className="fx-status">
        {count != null && <span>{count} {count === 1 ? 'item' : 'items'}</span>}
        {selectedItems.length > 0 && <span className="fx-status-sel">{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected</span>}
        <span className="fx-status-views">
          <button className={view === 'details' ? 'on' : ''} title="Details" onClick={() => setView('details')}><TextBulletListLtr16Regular /></button>
          <button className={view !== 'details' ? 'on' : ''} title="Large icons" onClick={() => setView('large')}><Grid16Regular /></button>
        </span>
      </div>
    </div>
  );
}

export default memo(FileExplorer);

// ───────────────────────────── pieces ─────────────────────────────

function NavPane({ loc, navigate }) {
  const Item = ({ id, label, icon, pinned, chevron, indent = 0 }) => (
    <button className={`fx-nav-item ${loc === id ? 'active' : ''}`} style={{ paddingLeft: 8 + indent * 16 }} onClick={() => navigate(id)}>
      <span className="fx-nav-chevron">{chevron && <ChevronRight12Regular />}</span>
      {icon}
      <span className="fx-nav-label">{label}</span>
      {pinned && <Pin12Regular className="fx-nav-pin" />}
    </button>
  );
  return (
    <nav className="fx-nav">
      <Item id="home" label="Home" icon={<HomeIcon size={16} />} />
      <Item id="gallery" label="Gallery" icon={<PhotosAppIcon size={16} />} />
      <div className="fx-nav-sep" />
      {USER_FOLDERS.map((f) => (
        <Item key={f.id} id={f.id} label={f.name} icon={<ItemIcon item={f} size={16} />} pinned />
      ))}
      {allFolders().map((f) => (
        <Item key={f.id} id={f.id} label={f.name} icon={<ItemIcon item={f} size={16} />} pinned />
      ))}
      <div className="fx-nav-sep" />
      <Item id="sys/thispc" label="This PC" icon={<ThisPCIcon size={16} />} chevron />
      <Item id="sys/recycle" label="Recycle Bin" icon={<RecycleBinIcon size={16} />} />
    </nav>
  );
}

function IconView({ items, size, selected, onSelect, onOpen, onMenu }) {
  return (
    <div className="fx-grid" style={{ '--tile': `${size + 44}px` }}>
      {items.map((it) => (
        <button
          key={it.id}
          className={`fx-item fx-tile ${selected.has(it.id) ? 'selected' : ''}`}
          onClick={(e) => onSelect(e, it)}
          onDoubleClick={() => onOpen(it)}
          onContextMenu={(e) => onMenu(e, it)}
          title={`${it.name}\nType: ${typeLabel(it)}${fileSize(it) ? `\nSize: ${fileSize(it)}` : ''}`}
        >
          <ItemIcon item={it} size={size} />
          <span className="fx-tile-name">{it.name}</span>
        </button>
      ))}
    </div>
  );
}

function DetailsView({ items, selected, onSelect, onOpen, onMenu, sort, setSort, showFolder }) {
  const header = (by, label) => (
    <button
      className={`fx-th ${sort.by === by ? 'sorted' : ''}`}
      onClick={() => setSort((s) => ({ by, dir: s.by === by ? -s.dir : 1 }))}
    >
      {label}
      {sort.by === by && <ChevronDown12Regular className={sort.dir === 1 ? 'fx-asc' : ''} />}
    </button>
  );
  return (
    <div className="fx-table">
      <div className="fx-tr fx-thead">
        {header('name', 'Name')}
        {header('date', 'Date modified')}
        {header('type', 'Type')}
        <span className="fx-th">{showFolder ? 'Folder' : 'Size'}</span>
      </div>
      {items.map((it) => (
        <button
          key={it.id}
          className={`fx-item fx-tr ${selected.has(it.id) ? 'selected' : ''}`}
          onClick={(e) => onSelect(e, it)}
          onDoubleClick={() => onOpen(it)}
          onContextMenu={(e) => onMenu(e, it)}
        >
          <span className="fx-td fx-td-name"><ItemIcon item={it} size={20} /> <span>{it.name}</span></span>
          <span className="fx-td">{fmtModified(it)}</span>
          <span className="fx-td">{typeLabel(it)}</span>
          <span className="fx-td fx-td-size">{showFolder ? getItem(it.parentId)?.name || '' : fileSize(it)}</span>
        </button>
      ))}
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="fx-section">
      <button className="fx-section-head" onClick={() => setOpen((o) => !o)}>
        {open ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
        <span>{title}</span>
      </button>
      {open && children}
    </section>
  );
}

function HomeView({ onOpen, onSelect, selected, onMenu }) {
  const [tab, setTab] = useState('recent');
  const quick = [...USER_FOLDERS.slice(0, 4), ...allFolders()];
  const recent = [...allFiles()].sort((a, b) => modifiedDate(b) - modifiedDate(a));
  return (
    <div className="fx-home">
      <Section title="Quick access">
        <div className="fx-quick">
          {quick.map((f) => (
            <button
              key={f.id}
              className={`fx-item fx-quick-item ${selected.has(f.id) ? 'selected' : ''}`}
              onClick={(e) => onSelect(e, f)}
              onDoubleClick={() => onOpen(f)}
              onContextMenu={(e) => onMenu(e, f)}
            >
              <ItemIcon item={f} size={40} />
              <span className="fx-quick-text">
                <span>{f.name}</span>
                <small>{f.system ? 'Stored locally' : 'Desktop'}</small>
                <Pin12Regular className="fx-quick-pin" />
              </span>
            </button>
          ))}
        </div>
      </Section>

      <div className="fx-pills">
        {[['recent', Clock16Regular, 'Recent'], ['favorites', Star16Regular, 'Favorites'], ['shared', People16Regular, 'Shared']].map(([k, Icon, label]) => (
          <button key={k} className={`fx-pill ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            <Icon /> {label}
          </button>
        ))}
      </div>

      {tab === 'recent' ? (
        <div className="fx-table fx-recent">
          <div className="fx-tr fx-thead">
            <span className="fx-th">Name</span>
            <span className="fx-th">Date modified</span>
            <span className="fx-th">Type</span>
            <span className="fx-th">File location</span>
          </div>
          {recent.map((it) => (
            <button
              key={it.id}
              className={`fx-item fx-tr ${selected.has(it.id) ? 'selected' : ''}`}
              onClick={(e) => onSelect(e, it)}
              onDoubleClick={() => onOpen(it)}
              onContextMenu={(e) => onMenu(e, it)}
            >
              <span className="fx-td fx-td-name"><ItemIcon item={it} size={20} /> <span>{it.name}</span></span>
              <span className="fx-td">{fmtModified(it)}</span>
              <span className="fx-td">{typeLabel(it)}</span>
              <span className="fx-td">{pathTo(it.parentId).map((p) => p.name).join(' › ')}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="fx-empty fx-empty-small">
          {tab === 'favorites' ? "After you've favorited some files, we'll show them here." : "Files that people share with you will show up here."}
        </div>
      )}
    </div>
  );
}

function ThisPCView({ onOpen, onSelect, selected, onMenu }) {
  return (
    <div className="fx-home">
      <Section title={`Folders (${USER_FOLDERS.length})`}>
        <div className="fx-quick">
          {USER_FOLDERS.map((f) => (
            <button
              key={f.id}
              className={`fx-item fx-quick-item ${selected.has(f.id) ? 'selected' : ''}`}
              onClick={(e) => onSelect(e, f)}
              onDoubleClick={() => onOpen(f)}
              onContextMenu={(e) => onMenu(e, f)}
            >
              <ItemIcon item={f} size={40} />
              <span className="fx-quick-text"><span>{f.name}</span><small>System folder</small></span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Devices and drives (1)">
        <div className="fx-quick">
          <button
            className={`fx-item fx-quick-item fx-drive ${selected.has('drive') ? 'selected' : ''}`}
            onClick={(e) => onSelect(e, { id: 'drive' })}
            onDoubleClick={() => onOpen(getItem('desktop'))}
          >
            <DriveIcon size={44} />
            <span className="fx-quick-text">
              <span>Local Disk (C:)</span>
              <span className="fx-drive-bar"><span style={{ width: '58%' }} /></span>
              <small>98.6 GB free of 237 GB</small>
            </span>
          </button>
        </div>
      </Section>
    </div>
  );
}

function DetailsPane({ item, place, loc, count }) {
  const target = item || (place.kind === 'folder' ? place.item : null);
  return (
    <aside className="fx-details">
      {target ? (
        <>
          <div className="fx-details-top">
            <span className="fx-details-name"><ItemIcon item={target} size={20} /> {target.name}</span>
          </div>
          <div className="fx-details-preview"><ItemIcon item={target} size={120} /></div>
          {target.description && <p className="fx-details-desc">{target.description}</p>}
          {!item && count === 0 && <p className="fx-details-hint">Select a single file to get more information</p>}
          <div className="fx-details-head">Details</div>
          <dl className="fx-details-list">
            <dt>Type</dt><dd>{typeLabel(target)}</dd>
            {fileSize(target) && (<><dt>Size</dt><dd>{fileSize(target)}</dd></>)}
            {target.children && (<><dt>Items</dt><dd>{target.children.length}</dd></>)}
            {target.slides && (<><dt>Slides</dt><dd>{target.slides.length}</dd></>)}
            {target.questions && (<><dt>Questions</dt><dd>{target.questions.length}</dd></>)}
            <dt>Date modified</dt><dd>{fmtModified(target)}</dd>
            <dt>Location</dt><dd>{pathTo(target.parentId).map((p) => p.name).join(' › ') || 'This PC'}</dd>
          </dl>
        </>
      ) : (
        <div className="fx-details-empty">
          <LocIcon loc={loc} size={64} />
          <p>{count > 1 ? `${count} items selected` : 'Select a single file to get more information and share your cloud content.'}</p>
        </div>
      )}
    </aside>
  );
}

