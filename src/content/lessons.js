// ─────────────────────────────────────────────────────────────────────────────
//  KODITA OS — LESSON CONTENT
//  This is the one file to edit. Everything on the desktop comes from here.
//
//  Item types (and the app that opens them):
//    folder  → File Explorer     { type:'folder', name, children:[...] }
//    slides  → Slides            { type:'slides', name, slides:[...] }
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

// Turns a folder of exported slide images (page-01.jpg, page-02.jpg, …) into slides.
function canvaPages(folder, texts) {
  return texts.map((alt, i) => ({ layout: 'full', image: `media/${folder}/page-${String(i + 1).padStart(2, '0')}.jpg`, alt }));
}

export const desktop = [
  // ───────────────────────────── GAME DEV ─────────────────────────────
  // Slides come from the Canva deck "Roblox Step Coding" (exported as images
  // into public/media/roblox-step-coding/). To update: re-export the pages
  // from Canva with the same file names.
  {
    type: 'folder',
    name: 'Game Dev',
    description: 'Roblox Studio Gamedev — Roblox Step Coding.',
    children: [
      {
        type: 'slides',
        name: 'Roblox Step Coding',
        description: 'Roblox Studio intro, tools & navigation, step coding lava, shortcut & challenge.',
        slides: canvaPages('roblox-step-coding', [
          'Roblox Studio Gamedev — Roblox Step Coding',
          'What you’ll learn today: Roblox Studio Intro, Tools & Navigation, Step Coding Lava, Shortcut & Challenge',
          'Roblox Studio itu apa sih? Game engine buat bikin game Roblox. Semua game Roblox yang kamu lihat dibikin di sini.',
          'Cara aksesnya gimana? 2 cara, yaitu lewat website atau download langsung.',
          '3 Main Panels: Viewport, Explorer, Properties',
          'Yang biasa digunakan — Penting!!',
          'Tutor gerakin camera + jalan: nengok = klik kanan (tahan) + geser mouse; maju mundur kanan kiri = W, A, S, D; naik turun = E dan Q; zoom = scroll mouse.',
          'Shortcut: Undo ⌘Z, Redo ⌘⇧Z, Copy ⌘C, Paste ⌘V, Cut ⌘X, Duplicate ⌘D, Save ⌘S, Find ⌘F, Replace ⌘⌥F, Close Script ⌘W, Reopen Closed Script ⌘⇧T',
          'Terus cara kita koding-kodingan gimana kak?',
          'Ini nih: klik tombol “+”, muncul deh. Roblox memakai bahasa pemrograman Lua!',
          'Contoh penggunaan Lua: digunakan sebagai “Lava” dalam obby. Udah, segini aja? Memang.',
          'Today’s problem: kalau misalkan player dengan 101 health menyentuh lava, dia hidup atau tidak?',
          'Roblox Studio — Lesson Completed!',
        ]),
      },
      { type: 'video', name: 'Demo Roblox Studio', description: 'Taruh video demo di public/media/ lalu isi src.', src: '' },
      {
        type: 'quiz',
        name: 'Kuis Roblox Step Coding',
        description: 'Kuis dari materi Roblox Step Coding.',
        questions: [
          { q: 'Roblox Studio itu apa?', options: ['Game buat dimainkan', 'Game engine buat bikin game Roblox', 'Aplikasi chat', 'Browser internet'], answer: 1 },
          { q: 'Ada berapa panel utama (main panels) di Roblox Studio?', options: ['2', '3', '4', '5'], answer: 1 },
          { q: 'Panel yang BUKAN termasuk 3 main panels adalah…', options: ['Viewport', 'Explorer', 'Properties', 'Toolbox'], answer: 3 },
          { q: 'Tombol untuk maju, mundur, kanan, kiri adalah…', options: ['Panah atas/bawah', 'W, A, S, D', 'E dan Q', 'Spasi'], answer: 1 },
          { q: 'Tombol untuk naik dan turun adalah…', options: ['E dan Q', 'W dan S', 'Shift dan Ctrl', 'Z dan X'], answer: 0 },
          { q: 'Shortcut untuk Duplicate adalah…', options: ['⌘/Ctrl + C', '⌘/Ctrl + V', '⌘/Ctrl + D', '⌘/Ctrl + Z'], answer: 2 },
          { q: 'Roblox memakai bahasa pemrograman…', options: ['Python', 'Java', 'Lua', 'HTML'], answer: 2 },
          {
            q: 'Today’s problem: player dengan 101 health menyentuh lava (script: humanoid.Health = 0). Dia hidup atau tidak?',
            options: ['Hidup, health-nya sisa 1', 'Tidak — health langsung jadi 0', 'Hidup, karena health lebih dari 100', 'Lava tidak berpengaruh'],
            answer: 1,
          },
        ],
      },
    ],
  },

  // ───────────────────────────── WEB DEV ─────────────────────────────
  {
    type: 'folder',
    name: 'Web Dev',
    description: 'Belajar membuat website sendiri dengan HTML & CSS.',
    children: [
      {
        type: 'slides',
        name: '01 - Apa itu Website',
        description: 'Bagaimana website bekerja.',
        slides: [
          { layout: 'title', title: 'Apa itu Website?', subtitle: 'Dan bagaimana cara membuatnya' },
          {
            layout: 'bullets',
            title: 'Website ada di mana-mana',
            points: ['YouTube, Instagram, Google — semuanya website', 'Website = kumpulan halaman yang dibuka lewat browser', 'Setiap website dibuat dengan KODE'],
          },
          {
            layout: 'bullets',
            title: '3 bahasa utama website',
            points: ['🦴 HTML — kerangka / isi halaman', '🎨 CSS — tampilan: warna, ukuran, posisi', '⚡ JavaScript — interaksi & logika'],
          },
          { layout: 'section', title: 'Hari ini: HTML & CSS', subtitle: 'Di akhir sesi kamu punya halaman profil sendiri!' },
        ],
      },
      {
        type: 'slides',
        name: '02 - Mengenal HTML',
        description: 'Tag-tag dasar HTML.',
        slides: [
          { layout: 'title', title: 'Mengenal HTML', subtitle: 'HyperText Markup Language' },
          {
            layout: 'code',
            title: 'Tag = pembungkus isi',
            code: '<h1>Ini judul besar</h1>\n<p>Ini paragraf biasa.</p>',
            points: ['Tag pembuka <h1> dan penutup </h1>', 'h1 = heading (judul)', 'p = paragraph (paragraf)'],
          },
          {
            layout: 'code',
            title: 'Tag yang sering dipakai',
            code: '<h1>Judul</h1>\n<p>Paragraf</p>\n<img src="foto.png">\n<a href="https://...">Link</a>\n<button>Klik aku</button>',
            points: ['img = gambar', 'a = link ke halaman lain', 'button = tombol'],
          },
          { layout: 'section', title: 'Saatnya praktik!', subtitle: 'Buka file “latihan-1-halo-dunia”' },
        ],
      },
      {
        type: 'slides',
        name: '03 - Mempercantik dengan CSS',
        description: 'Memberi warna dan gaya pada halaman.',
        slides: [
          { layout: 'title', title: 'Mempercantik dengan CSS', subtitle: 'Cascading Style Sheets' },
          {
            layout: 'code',
            title: 'Cara menulis CSS',
            code: 'h1 {\n  color: purple;\n  font-size: 48px;\n}',
            points: ['h1 = elemen yang mau diubah', 'color = warna tulisan', 'font-size = ukuran tulisan'],
          },
          {
            layout: 'code',
            title: 'Properti favorit',
            code: 'body {\n  background: #fdf2ff;\n  text-align: center;\n}\nbutton {\n  padding: 12px 24px;\n  border-radius: 12px;\n}',
            points: ['background = warna latar', 'text-align = posisi teks', 'border-radius = sudut melengkung'],
          },
        ],
      },
      {
        type: 'code',
        name: 'latihan-1-halo-dunia',
        description: 'Latihan pertama: halaman HTML sederhana.',
        task: 'Ganti tulisan "Halo dunia!" dengan namamu, lalu tambahkan satu paragraf tentang hobimu.',
        starter: `<h1>Halo dunia!</h1>
<p>Ini website pertamaku.</p>

<style>
  body {
    font-family: sans-serif;
    text-align: center;
    padding-top: 40px;
  }
</style>`,
      },
      {
        type: 'code',
        name: 'latihan-2-kartu-profil',
        description: 'Membuat kartu profil dengan CSS.',
        task: 'Ubah warna, nama, dan emoji di kartu profil ini supaya mencerminkan dirimu!',
        starter: `<div class="kartu">
  <div class="foto">😎</div>
  <h1>Nama Kamu</h1>
  <p>Kelas 8 · Suka main game & coding</p>
  <button>Follow</button>
</div>

<style>
  body {
    margin: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #6a5cff, #00c6ff);
    font-family: sans-serif;
  }
  .kartu {
    background: white;
    padding: 32px 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  .foto { font-size: 64px; }
  h1 { margin: 8px 0 4px; }
  p { color: gray; }
  button {
    margin-top: 12px;
    padding: 10px 28px;
    border: none;
    border-radius: 999px;
    background: #6a5cff;
    color: white;
    font-size: 16px;
  }
</style>`,
      },
      {
        type: 'quiz',
        name: 'Kuis Web Dev',
        description: '5 pertanyaan seputar HTML & CSS.',
        questions: [
          { q: 'HTML dipakai untuk…', options: ['Mewarnai halaman', 'Membuat kerangka & isi halaman', 'Membuat game 3D', 'Mengedit foto'], answer: 1 },
          { q: 'Tag untuk judul paling besar adalah…', options: ['<p>', '<title>', '<h1>', '<big>'], answer: 2 },
          { q: 'Properti CSS untuk mengubah warna tulisan adalah…', options: ['color', 'background', 'font', 'text-color'], answer: 0 },
          { q: 'Tag <img> dipakai untuk menampilkan…', options: ['Video', 'Gambar', 'Tombol', 'Link'], answer: 1 },
          { q: 'Bahasa yang membuat website bisa interaktif adalah…', options: ['HTML', 'CSS', 'JavaScript', 'Excel'], answer: 2 },
        ],
      },
    ],
  },

  // ───────────────────────────── ABOUT ─────────────────────────────
  {
    type: 'slides',
    name: 'Tentang Kodita',
    description: 'Perkenalan Kodita.',
    slides: [
      { layout: 'title', title: 'Halo! Kami Kodita 👋', subtitle: 'Belajar coding itu seru' },
      {
        layout: 'bullets',
        title: 'Apa itu Kodita?',
        points: ['Proyek sosial untuk mengenalkan coding ke pelajar', 'Belajar lewat game & website', 'Tidak perlu pengalaman sebelumnya'],
      },
      {
        layout: 'bullets',
        title: 'Hari ini kita akan…',
        points: ['🎮 Membuat game di Roblox Studio', '🌐 Membuat website sendiri', '🏆 Kuis berhadiah!'],
      },
      { layout: 'section', title: 'Yuk mulai!', subtitle: 'Buka folder Game Dev atau Web Dev di desktop' },
    ],
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
