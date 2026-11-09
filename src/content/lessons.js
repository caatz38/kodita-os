// ─────────────────────────────────────────────────────────────────────────────
//  KODITA OS — LESSON CONTENT
//  This is the one file to edit. Everything on the desktop comes from here.
//
//  Item types (and the app that opens them):
//    folder  → File Explorer     { type:'folder', name, children:[...] }
//    slides  → Slides            { type:'slides', name, slides:[...] }
//                                or a live Canva deck: { type:'slides', name, canva:'https://www.canva.com/design/<id>/<token>' }
//                                (the design must be shared as 'Anyone with the link'; needs internet)
//    code    → Code Lab          { type:'code',   name, task, starter }
//    video   → Media Player      { type:'video',  name, src:'media/demo.mp4' }  or  { youtube:'VIDEO_ID' }
//    image   → Photos            { type:'image',  name, src:'media/foto.png' }
//    quiz    → Quiz              { type:'quiz',   name, questions:[...] }
//    text    → Notepad           { type:'text',   name, content:'...' }
//
//  Slide layouts:
//    { layout:'title',   title, subtitle }
//    { layout:'section', title, subtitle }                  big divider slide
//    { layout:'bullets', title, points:['...', '...'] }
//    { layout:'code',    title, code:'...', points:[...] }  code on the left, notes on the right
//    { layout:'image',   title, image:'media/x.png', caption }
//    { layout:'full',    image:'media/x.jpg', alt }               a finished slide image (e.g. a Canva page)
//
//  Media files (images/videos) go in the  public/media/  folder.
//  Optional on any item:  description:'...'  (shown in Explorer's Details pane)
// ─────────────────────────────────────────────────────────────────────────────

export const desktop = [
  // ───────────────────────────── GAME DEV ─────────────────────────────
  // Slides are embedded live from Canva — edit the design in Canva and it updates here.
  {
    type: 'folder',
    name: 'Game Dev',
    description: 'Roblox Studio Gamedev — Roblox Step Coding.',
    children: [
      {
        type: 'slides',
        name: 'Roblox Step Coding',
        description: 'Roblox Studio intro, tools & navigation, step coding lava, shortcut & challenge.',
        canva: 'https://www.canva.com/design/DAHZBSAdjbs/Zxb9yPGkj_Zs5_IETjKJXw',
      },
    ],
  },

  // ───────────────────────────── WEB DEV ─────────────────────────────
  // Slides are embedded live from the Canva deck "</kodita> | WD | Lesson 1".
  // The latihan follow the deck: HTML #thebones → CSS #theskin → JS #thebrain → Challenge.
  {
    type: 'folder',
    name: 'Web Dev',
    description: 'Web Development Lesson 1 — Web Dev Introduction, HTML CSS JS Basic.',
    children: [
      {
        type: 'slides',
        name: 'Web Dev Lesson 1',
        description: 'What is website development, VSCode, HTML/CSS/JS basic, challenge, GitHub.',
        canva: 'https://www.canva.com/design/DAHSU9ywGsY/5fOD_TcRkWaw0VCNhqp9gA',
      },
      {
        type: 'code',
        name: 'latihan-1-html-thebones',
        description: 'HTML #thebones: <h1>, <p>, <img>, <a>, <button>.',
        task: 'HTML = #thebones. Ganti isi <h1> dan <p> jadi tentang kamu, lalu tambahin minimal 1 tag lagi dari materi (<p>, <a>, <img>, atau <button>).',
        starter: `<html>
  <body>
    <!-- <h1> = big heading -->
    <h1>Halo, aku ...</h1>

    <!-- <p> = paragraph -->
    <p>Ini website pertamaku!</p>

    <!-- <img> = picture -->
    <img src="brand/logo.svg" width="80">

    <!-- <a> = clickable link -->
    <p><a href="https://wikipedia.org" target="_blank">Buka Wikipedia</a></p>

    <!-- <button> = clickable button -->
    <button>Klik aku</button>

    <!-- TODO: tambahin tag kamu sendiri di sini -->

  </body>
</html>
`,
      },
      {
        type: 'code',
        name: 'latihan-2-css-theskin',
        description: 'CSS #theskin: color, background, font-size, margin/padding.',
        task: 'CSS = #theskin. Ubah color, background, font-size, dan margin/padding sampai websitenya keliatan gud ✨',
        starter: `<html>
  <body>
    <h1>Halo, aku ...</h1>
    <p>Aku lagi belajar CSS di Kodita!</p>
    <button>Klik aku</button>
  </body>

  <style>
    body {
      background: #fdf6e3;   /* background = fill color */
      padding: 40px;          /* padding = spacing di dalam */
      font-family: sans-serif;
    }
    h1 {
      color: #333333;         /* color = text color */
      font-size: 32px;        /* font-size = size of font */
    }
    p {
      color: gray;
      margin-bottom: 24px;    /* margin = spacing di luar */
    }
    button {
      background: white;
      color: black;
      padding: 8px 16px;
      font-size: 16px;
    }
    /* TODO: ganti warna & ukurannya sesukamu! */
  </style>
</html>
`,
      },
      {
        type: 'code',
        name: 'latihan-3-js-thebrain',
        description: 'JS #thebrain: variable, function, if else, event listener, console.log().',
        task: 'JS = #thebrain. Klik tombolnya dan lihat Console di bawah preview. Lalu ubah angka 5 jadi 10 dan ganti pesannya!',
        starter: `<html>
  <body>
    <h1>Klik counter</h1>
    <p id="teks">Kamu belum klik sama sekali</p>
    <button id="tombol">Klik aku</button>
  </body>

  <script>
    // variable = labeled box for data
    let jumlahKlik = 0;
    const tombol = document.getElementById('tombol');
    const teks = document.getElementById('teks');

    // function = reusable block of actions
    function tambahKlik() {
      jumlahKlik = jumlahKlik + 1;

      // if else = decision
      if (jumlahKlik >= 5) {
        teks.textContent = 'Wih, kamu udah klik ' + jumlahKlik + ' kali! 🔥';
      } else {
        teks.textContent = 'Kamu klik ' + jumlahKlik + ' kali';
      }

      // console.log() = print a msg to check things
      console.log('jumlahKlik sekarang:', jumlahKlik);
    }

    // event listener = react when there's an event
    tombol.addEventListener('click', tambahKlik);
  </script>

  <style>
    body { font-family: sans-serif; text-align: center; padding-top: 40px; }
    button { font-size: 18px; padding: 10px 24px; }
  </style>
</html>
`,
      },
      {
        type: 'code',
        name: 'challenge-website-pertamaku',
        description: 'Challenge: gabungin HTML + CSS + JS jadi website tentang dirimu.',
        task: 'Challenge! Bikin website tentang dirimu: minimal 3 tag HTML (#thebones), 3 properti CSS (#theskin), dan 1 event listener JS (#thebrain). Kalau sudah: copy kodenya ke VSCode sebagai index.html, lalu upload ke GitHub (git init → git add . → git commit → git push).',
        starter: `<html>
  <body>
    <!-- #thebones: isi websitemu -->
    <h1>Nama Kamu</h1>
    <p>Kelas ... · suka ...</p>
    <button id="tombol">Sapa aku</button>
  </body>

  <style>
    /* #theskin: bikin websitemu keren */
    body {
      font-family: sans-serif;
      text-align: center;
      padding: 40px;
    }
  </style>

  <script>
    // #thebrain: bikin websitemu bisa ngapa-ngapain
    const tombol = document.getElementById('tombol');
    tombol.addEventListener('click', function () {
      console.log('tombol diklik!');
      // TODO: ubah sesuatu di halaman waktu tombolnya diklik
    });
  </script>
</html>
`,
      },
    ],
  },

  // ───────────────────────────── ABOUT ─────────────────────────────
  // Slides are embedded live from the Canva deck "</kodita>".
  {
    type: 'slides',
    name: 'Tentang Kodita',
    description: 'Perkenalan Kodita: apa itu Kodita dan kenapa harus join.',
    canva: 'https://www.canva.com/design/DAHPQlgw9G0/zPUqK_-YcUOCfy47g4GkuQ',
  },
];

// Files shown in the Recycle Bin (just for fun).
export const recycleBin = [
  {
    type: 'text',
    name: 'pr-matematika-belum-dikerjakan',
    content: 'PR Matematika\n\n1. ...\n2. ...\n3. ...\n\n(nanti aja deh, main Roblox dulu)',
  },
];
