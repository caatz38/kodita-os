# Kodita OS

**Live:** https://caatz38.github.io/kodita-os/

A Windows 11–style desktop in the browser, used as an interactive presentation for **Kodita**: a social project teaching junior high school students to code with Roblox and websites.

Instead of slides in Canva or PowerPoint, the presenter double-clicks folders on a desktop (**Game Dev**, **Web Dev**…), opens lesson files, and each one opens in its own app window.

## What's inside

- **Desktop, taskbar, Start menu, right-click menus, Quick Settings, calendar** in the Windows 11 layout
- **Two looks:** *Liquid Glass* (refractive glass + spring animations, default) or classic *Windows 11*. Switch in Settings → Personalization
- **Apps**
  - File Explorer
  - Slides (projector-friendly, clicker support, fullscreen)
  - Code Lab (live HTML/CSS editor + preview)
  - Quiz (game-show style with timer)
  - Media Player
  - Photos
  - Notepad
  - Settings
- Boot screen, lock screen and sign-in; windows survive an accidental reload

## Run it

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Publish

Every push to `main` rebuilds and publishes the site to GitHub Pages automatically (see `.github/workflows/deploy.yml`).

## Edit the lessons

All lesson content lives in **`src/content/lessons.js`**: folders, slides, quizzes and coding exercises. The top of that file explains every item type. Put images and videos in `public/media/`.

Other settings (user name, logo, default theme, boot screen) are in **`src/content/config.js`**. Replace `public/brand/logo.svg` with your own logo.

## Notes

- The Liquid Glass edge refraction needs a Chromium browser (Chrome, Edge). Other browsers show frosted glass instead.
- On slower laptops, turn off **Settings → Personalization → Transparency effects**.
- Kodita OS is an independent project inspired by the look of Windows 11 and Apple's Liquid Glass. It isn't affiliated with Microsoft or Apple. All icons and wallpapers here were made for this project.
