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
//
//  Media files (images/videos) go in the  public/media/  folder.
//  Optional on any item:  description:'...'  (shown in Explorer's Details pane)
// ─────────────────────────────────────────────────────────────────────────────

export const desktop = [
  // ───────────────────────────── GAME DEV ─────────────────────────────
  {
    type: 'folder',
    name: 'Game Dev',
    description: 'Belajar membuat game sendiri di Roblox Studio.',
    children: [
      {
        type: 'slides',
        name: '01 - Apa itu Roblox Studio',
        description: 'Pengenalan Roblox Studio dan apa saja yang bisa dibuat.',
        slides: [
          { layout: 'title', title: 'Apa itu Roblox Studio?', subtitle: 'Bikin game sendiri, dimainkan jutaan orang' },
          {
            layout: 'bullets',
            title: 'Roblox vs Roblox Studio',
            points: [
              'Roblox = tempat kamu MAIN game',
              'Roblox Studio = tempat kamu MEMBUAT game',
              'Gratis, bisa dipakai di Windows dan Mac',
              'Game buatanmu bisa langsung dimainkan teman-temanmu',
            ],
          },
          {
            layout: 'bullets',
            title: 'Apa saja yang bisa kita buat?',
            points: ['🏃 Obby (rintangan parkour)', '🏠 Tycoon & simulator', '🧟 Game survival', '🏎️ Game balapan', '…dan apa pun yang kamu bayangkan!'],
          },
          {
            layout: 'bullets',
            title: 'Kenapa belajar ini?',
            points: [
              'Belajar logika & problem solving sambil bersenang-senang',
              'Bahasa pemrogramannya (Luau) mudah untuk pemula',
              'Developer Roblox ada yang berpenghasilan dari game-nya!',
            ],
          },
          { layout: 'section', title: 'Siap? Ayo mulai! 🚀', subtitle: 'Buka Roblox Studio di komputermu' },
        ],
      },
      {
        type: 'slides',
        name: '02 - Mengenal Antarmuka',
        description: 'Bagian-bagian penting di layar Roblox Studio.',
        slides: [
          { layout: 'title', title: 'Mengenal Antarmuka', subtitle: 'Tur singkat Roblox Studio' },
          {
            layout: 'bullets',
            title: 'Bagian penting di layar',
            points: [
              'Viewport — dunia 3D tempat kamu membangun',
              'Explorer — daftar semua benda di game',
              'Properties — mengubah warna, ukuran, bahan',
              'Toolbox — model & aset siap pakai',
            ],
          },
          {
            layout: 'bullets',
            title: 'Kontrol kamera',
            points: ['W A S D — bergerak', 'Klik kanan + geser — memutar kamera', 'Scroll — zoom in / zoom out', 'F — fokus ke benda yang dipilih'],
          },
          {
            layout: 'bullets',
            title: 'Alat utama',
            points: ['Select — memilih benda', 'Move — memindahkan', 'Scale — mengubah ukuran', 'Rotate — memutar'],
          },
        ],
      },
      {
        type: 'slides',
        name: '03 - Membuat Obby Pertamamu',
        description: 'Langkah demi langkah membuat obby sederhana.',
        slides: [
          { layout: 'title', title: 'Membuat Obby Pertamamu', subtitle: 'Obby = Obstacle course (rintangan)' },
          {
            layout: 'bullets',
            title: 'Langkah 1 — Buat pijakan',
            points: ['Home → Part → Block', 'Ubah ukuran dengan Scale', 'Centang Anchored supaya tidak jatuh!'],
          },
          {
            layout: 'bullets',
            title: 'Langkah 2 — Susun rintangan',
            points: ['Buat beberapa pijakan dengan jarak lompatan', 'Variasikan tinggi dan ukuran', 'Uji dengan tombol Play ▶'],
          },
          {
            layout: 'bullets',
            title: 'Langkah 3 — Tambahkan lava 🔥',
            points: ['Buat Part berwarna merah', 'Material: Neon', 'Nanti kita beri script supaya pemain “kalah” saat menyentuhnya'],
          },
          { layout: 'section', title: 'Tantangan!', subtitle: 'Buat obby dengan minimal 10 pijakan dalam 15 menit' },
        ],
      },
      {
        type: 'slides',
        name: '04 - Dasar Scripting Luau',
        description: 'Script pertama: lava yang mematikan.',
        slides: [
          { layout: 'title', title: 'Dasar Scripting Luau', subtitle: 'Memberi “otak” pada game kita' },
          {
            layout: 'code',
            title: 'Script pertama: Halo!',
            code: 'print("Halo, Kodita!")',
            points: ['print() menampilkan tulisan di Output', 'Teks ditulis di antara tanda kutip " "', 'Klik Play, lalu lihat jendela Output'],
          },
          {
            layout: 'code',
            title: 'Variabel',
            code: 'local nama = "Budi"\nlocal nyawa = 3\n\nprint(nama .. " punya " .. nyawa .. " nyawa")',
            points: ['local = membuat variabel baru', 'Variabel = kotak untuk menyimpan data', '.. = menggabungkan teks'],
          },
          {
            layout: 'code',
            title: 'Lava yang mematikan',
            code:
              'local lava = script.Parent\n\nlava.Touched:Connect(function(benda)\n  local manusia = benda.Parent:FindFirstChild("Humanoid")\n  if manusia then\n    manusia.Health = 0\n  end\nend)',
            points: ['Touched = kejadian saat sesuatu menyentuh lava', 'Humanoid = “nyawa” karakter pemain', 'Health = 0 → pemain kembali ke awal'],
          },
        ],
      },
      { type: 'video', name: 'Demo Roblox Studio', description: 'Taruh video demo di public/media/ lalu isi src.', src: '' },
      {
        type: 'quiz',
        name: 'Kuis Game Dev',
        description: '5 pertanyaan seputar Roblox Studio.',
        questions: [
          { q: 'Aplikasi apa yang dipakai untuk MEMBUAT game Roblox?', options: ['Roblox Player', 'Roblox Studio', 'Microsoft Word', 'Paint'], answer: 1 },
          { q: 'Supaya Part tidak jatuh saat game dimulai, kita harus mencentang…', options: ['CanCollide', 'Transparency', 'Anchored', 'Locked'], answer: 2 },
          { q: 'Bahasa pemrograman yang dipakai di Roblox adalah…', options: ['Python', 'Luau', 'Java', 'HTML'], answer: 1 },
          { q: 'Perintah untuk menampilkan tulisan di Output adalah…', options: ['show()', 'write()', 'print()', 'say()'], answer: 2 },
          { q: 'Panel untuk mengubah warna & ukuran benda bernama…', options: ['Toolbox', 'Output', 'Explorer', 'Properties'], answer: 3 },
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
