// Kodita OS settings — edit these freely.
export const config = {
  userName: 'admin',
  // Kodita logo </k>. `logo` is used at large sizes (boot, lock screen, Settings),
  // `logoIcon` (bolder strokes, tight crop) at small sizes (Start button, menus, browser tab).
  logo: 'brand/logo.svg',
  logoIcon: 'brand/logo-icon.svg',
  // Main accent color (buttons, highlights). Tune it to match the Kodita logo.
  accent: '#005fb8',
  wallpaper: 'wallpapers/bloom.jpg',
  theme: 'light', // 'light' or 'dark'
  material: 'liquid', // 'liquid' = Liquid Glass, 'mica' = classic Windows 11
  // Show the boot screen + lock screen when the page opens (a reload in the same tab skips it).
  boot: true,
  // Switch the browser to fullscreen when you click "Sign in" (great for the projector).
  fullscreenOnSignIn: true,
};
// Note: theme, accent and wallpaper above are only the defaults.
// Changes made in the Settings app are remembered by the browser.
