// Which app opens which file type, and which icon each one gets.
import {
  FolderIcon, ExplorerIcon, SettingsIcon, NotepadIcon, SlidesAppIcon, CodeAppIcon,
  MediaAppIcon, PhotosAppIcon, RecycleBinIcon, ThisPCIcon, FileIcon, PlaceIcon,
} from './Icons.jsx';

export const APPS = {
  explorer: { name: 'File Explorer', Icon: ExplorerIcon },
  slides: { name: 'Slides', Icon: SlidesAppIcon },
  code: { name: 'Code Lab', Icon: CodeAppIcon },
  media: { name: 'Media Player', Icon: MediaAppIcon },
  photos: { name: 'Photos', Icon: PhotosAppIcon },
  notepad: { name: 'Notepad', Icon: NotepadIcon },
  settings: { name: 'Settings', Icon: SettingsIcon },
};

// type -> { app, label shown in Explorer "Type" column, extension }
export const FILE_TYPES = {
  folder: { app: 'explorer', label: 'File folder', ext: '' },
  slides: { app: 'slides', label: 'Presentation', ext: '.slides' },
  code: { app: 'code', label: 'HTML Document', ext: '.html' },
  video: { app: 'media', label: 'Video', ext: '.mp4' },
  image: { app: 'photos', label: 'Image', ext: '.png' },
  quiz: { app: 'quiz', label: 'Quiz', ext: '.quiz' },
  text: { app: 'notepad', label: 'Text Document', ext: '.txt' },
  app: { app: null, label: 'Application', ext: '' },
  thispc: { app: 'explorer', label: 'System', ext: '' },
  recycle: { app: 'explorer', label: 'System', ext: '' },
};

export function ItemIcon({ item, size = 48 }) {
  switch (item.type) {
    case 'folder':
      // Built-in user folders (Desktop, Downloads…) get their colored icon.
      if (item.id === 'desktop') return <PlaceIcon kind="desktop" size={size} />;
      if (item.id?.startsWith('user/')) return <PlaceIcon kind={item.id.slice(5)} size={size} />;
      return <FolderIcon size={size} />;
    case 'thispc': return <ThisPCIcon size={size} />;
    case 'recycle': return <RecycleBinIcon size={size} />;
    case 'app': {
      const Icon = APPS[item.app]?.Icon || FolderIcon;
      return <Icon size={size} />;
    }
    default: return <FileIcon size={size} kind={item.type} />;
  }
}

export function AppIcon({ app, size = 24 }) {
  const Icon = APPS[app]?.Icon;
  return Icon ? <Icon size={size} /> : null;
}
