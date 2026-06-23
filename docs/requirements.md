# Requirements — Portfolio Website

> Refactor v2.1 — 2026-06-22. Perubahan dari v1/v2:
> 1. Tema visual **Nord** (Polar Night + Frost), menggantikan dark-teal.
> 2. Struktur codebase pindah ke **`src/`** (`src/app`, `src/components`, `src/lib`, `src/content`).
> 3. **GSAP ScrollTrigger dimaksimalkan** (pin, scrub, batch, timeline) sebagai mesin gerak utama.
> 4. **Backdrop global CLEAN/minimal** — latar polos, tanpa aurora/constellation/meteor/grid/cursor-glow.
> 5. **Hero = parallax scene gunung warna SOLID bernuansa Nord**, dengan **transisi parallax** ke section bawah.
>
> Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 ·
> GSAP 3 — **ScrollTrigger** inti (opsional ScrollSmoother bila punya GSAP Club; default Lenis) ·
> Lenis (smooth scroll, sinkron ScrollTrigger) · Framer Motion 11 (hanya micro-interaction).
>
> **Catatan**: Placeholder di `src/lib/constants.ts` (seperti `yourusername`, `yourdomain.com`, dan `HERO_STATS`) harus diganti sebelum deploy.

## 1. Ringkasan Produk

Website portfolio satu-halaman (single-page) bertema **Nord dark** (Polar Night)
beraksen **Frost** (`#88C0D0`), dengan halaman blog terpisah berbasis MDX dan
chatbot "digital twin". Konten berbahasa Indonesia.

Struktur file berada di dalam **`src/`** (`src/app/`, `src/components/`, `src/lib/`,
`src/content/`). Import alias `@/*` → `./src/*`. Folder `public/` tetap di root.

Karakter visual: **clean & lapang**. Latar global polos (solid Polar Night), tanpa
motif ramai. Satu-satunya momen visual kaya adalah **Hero**: scene **gunung
berlapis berwarna solid** bernuansa Nord yang bergerak **parallax**, lalu transisi
parallax yang menyatu ke section di bawahnya.

## 2. Functional Requirements

### 2.1 Halaman Utama (`/`)

- Section berurutan: Hero → About → Skills → Projects → Blog → Contact.
- **Backdrop global clean**: hanya wash solid Polar Night (`#242933`) + vignette
  super-halus opsional. `z-0`; konten di `z-10`. **Tidak ada** aurora, grid,
  constellation, meteor, atau cursor-glow.
- Navbar sticky dengan perubahan gaya saat scroll, scrollspy, dan menu mobile.
- Scroll progress bar tipis (Frost) di tepi atas layar.
- Smooth scrolling (Lenis) aktif & **disinkronkan ke ScrollTrigger tiap frame**;
  klik anchor nav digerakkan halus dan akurat ke posisi setelah pin.

### 2.2 Hero — Parallax Scene Gunung (solid) + Transisi (fitur utama)

- Judul (`SITE.name`) = elemen LCP: ter-render penuh di HTML SSR, opacity awal 1,
  tidak menunggu animasi. Nama memakai gradient text Frost beranimasi.
- Badge status "Available" (dot Frost berdenyut) sebagai eyebrow di atas judul.
- **Hero adalah scene gunung berlapis (`HeroScene`)** memakai warna **solid (flat
  fill)** bernuansa Nord — tanpa gradient ramai/blur pada gunung. Komposisi z-stack
  belakang → depan:
  1. Sky polos (`#242933` / `#2E3440`) — paling lambat.
  2. Gunung jauh solid `#3B4252`.
  3. Gunung tengah solid `#434C5E`.
  4. Gunung depan solid `#4C566A` — paling cepat, naik "menyapu".
  5. Konten Hero (eyebrow, judul, tagline, body, CTA, stats).
  Aksen opsional super-tipis: 1 garis horizon Frost-deep `#5E81AC` (boleh dimatikan).
- **Transisi parallax ke bawah**: saat hero di-scroll keluar, timeline ScrollTrigger
  ber-`pin` + `scrub` menggerakkan tiap lapisan gunung dengan `y`/`scale`/`opacity`
  berbeda (kecepatan beda → kedalaman); gunung depan naik keluar dan section About
  **meluncur naik menimpa** scene (z lebih tinggi) dengan seam fog tipis yang
  membaur — peralihan menyatu & bersih, bukan potong keras.
- CTA: "View Projects" (→ projects, shimmer Frost) dan "Get in Touch" (→ contact).
- Stats inline (angka besar + label) yang boleh **menghitung naik di-scrub**;
  scroll indicator ikon chevron halus.
- **LCP & CLS aman**: judul SSR opacity 1; pin memakai `pinSpacing`; semua layer
  gunung absolute/dekoratif.

### 2.3 About

- Kartu profil (nama, role, lokasi, status, bio) + timeline perjalanan + stat grid.
- Kartu memakai `SpotlightCard` (glow Frost mengikuti kursor saat hover).
- Reveal saat masuk viewport (`Reveal`/`RevealGroup` berbasis ScrollTrigger); kartu
  profil punya parallax `y` scrub halus (dipakai hemat demi clean look).
- Section ini **menerima handoff parallax** dari Hero (lihat §2.2).

### 2.4 Skills

- Strip teknologi berjalan (`Marquee`) di atas grid kategori; **kecepatan marquee
  mengikuti velocity scroll Lenis**.
- Menampilkan `SKILL_GROUPS` (Frontend, Backend, Database, Tools & DevOps, Soft
  Skills) dengan ikon `react-icons` dalam grid tile per kategori (`SpotlightCard`).
- Reveal bertahap memakai **`ScrollTrigger.batch`**.

### 2.5 Projects

- Menampilkan `PROJECTS` dengan filter berbasis tag (default "All"); kartu
  re-stagger (batch) tiap filter berubah.
- Tiap kartu (`SpotlightCard as="article"`): judul, deskripsi, tags, thumbnail
  placeholder, badge "Featured" opsional, tautan github/demo. Unggulan diberi
  border-beam Frost.

### 2.6 Blog

- Section ringkas di halaman utama menampilkan ≤3 artikel terbaru (`SpotlightCard`).
- Halaman `/blog` menampilkan seluruh artikel (newest-first): tags, judul,
  excerpt, tanggal (id-ID), reading time. Empty-state bila kosong.
- Halaman `/blog/[slug]` me-render MDX (`next-mdx-remote/rsc`) dengan `remark-gfm`,
  `rehype-slug`, `rehype-highlight`; navigasi prev/next; `notFound()` bila slug
  tak ada.
- Artikel di-pre-render via `generateStaticParams`; metadata OpenGraph per artikel.
- Kartu blog fully clickable (seluruh area `<Link>`).

### 2.7 Contact

- Form (nama, email, pesan) POST ke `/api/contact`, state `idle|sending|sent|error`.
- Tautan sosial dari `SOCIAL_LINKS`.

### 2.8 Chatbot (`ChatWidget` + `/api/chat`)

- Widget mengambang (ikon `react-icons`); menyapa dengan nama dari `PERSONAL`.
- Respons di-stream dari `/api/chat` (OpenAI-compatible) memakai
  `CHATBOT_SYSTEM_PROMPT` (digital twin, hanya seputar pemilik).
- Panel chat memakai `data-lenis-prevent` agar scroll internal tidak diambil Lenis.

### 2.9 SEO

- `src/app/sitemap.ts`, `src/app/robots.ts`, metadata global + JSON-LD Person di
  `src/app/layout.tsx`.
- OpenGraph image di `/images/og.png` (1200×630) — tetap di `public/`.

## 3. Non-Functional Requirements

### 3.1 Performa & Core Web Vitals

- Target Lighthouse production (`npm run build && npm start`, profil bersih):
  Performance baik, A11y ≥96, Best Practices 100, SEO ≥95, CLS = 0. Backdrop clean
  + scene gunung solid (SVG ringan, tanpa canvas/blur berat) menjaga performa.
- Font `display: swap` via `next/font/google` (self-hosted); auto-preload +
  size-adjust fallback menjaga CLS ~0.
- CSS di-inline (`experimental.inlineCss`) agar tidak render-blocking.
- `browserslist` modern di `package.json` untuk mengurangi polyfill.
- **GSAP & ScrollTrigger di-import dinamis di komponen klien**. Plugin di-`register`
  sekali di `src/lib/gsap.ts`.
- **Tidak ada loop rAF/canvas di backdrop** (constellation dihapus) → beban paint
  idle mendekati nol.

### 3.2 Aturan Animasi (non-negotiable)

- **Hanya `transform`/`opacity`** yang dianimasikan saat scroll (GPU-composited).
- **Warna gunung solid (flat fill)**; tidak ada animasi `background-position`/blur
  pada layer fullscreen.
- **Pin/scrub aman**: `pinSpacing: true`, `anticipatePin: 1`, `invalidateOnRefresh`;
  panggil `ScrollTrigger.refresh()` setelah font/SVG load agar pin tidak meleset.
- **Reduced motion** (`prefers-reduced-motion: reduce`): pin, scrub, parallax,
  smooth-scroll (Lenis), shimmer, border-beam, marquee, text-gradient dimatikan.
  `HeroScene` jadi komposisi gunung statis bertumpuk; reveal jadi fade tanpa translate.
- **Mobile (≤767px)**: `HeroScene` tidak di-pin (gunung statis bertumpuk), parallax
  `transform: none`.
- **LCP aman**: judul Hero SSR opacity 1, tidak ditunda animasi/pin.
- **No layout shift**: pin memakai spacer; parallax hanya menggeser layer absolute.
- **Cleanup**: setiap ScrollTrigger/timeline via `useGSAP` (auto-revert); listener,
  ticker, dan instans Lenis di-`kill`/`destroy` saat unmount.

### 3.3 Aksesibilitas

- Kontras teks WCAG AA. `--text-muted` di-tune ke ~5:1 di atas Polar Night
  (**bukan** Nord3 `#4C566A`).
- Focus ring keyboard global via `:focus-visible` (outline Frost `#88C0D0`).
- `prefers-reduced-motion` dihormati di CSS, GSAP/ScrollTrigger, **dan** Framer
  Motion (`MotionConfig reducedMotion="user"`).
- Form Contact: tiap field punya `<label>` terhubung + `autoComplete`; status
  submit via `role="status" aria-live="polite"`; honeypot `website`.
- Elemen dekoratif `aria-hidden` (layer gunung, ikon skill, backdrop); skip-to-content.
- Link berulang (GitHub/Live Demo per proyek) diberi `aria-label` unik.
- Navbar scrollspy menandai section aktif dengan `aria-current="location"`.
- Tombol chat & hamburger punya `aria-label` + `aria-expanded`.
- **Pin section tidak menjebak fokus**: konten tetap dalam urutan DOM normal.

### 3.4 Keamanan

- `/api/chat`: rate limit 20/menit per-IP (`src/lib/rate-limit.ts`), validasi
  `messages`, strip role `system` dari klien, batas 10 pesan terakhir × 2000 char.
- `/api/contact`: rate limit 5/menit per-IP, validasi email + panjang, honeypot,
  pengiriman via Resend (fallback log-only bila env kosong).
- Security headers (`next.config.ts`): HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP.

### 3.5 Konsistensi Kode

- Seluruh codebase diformat Prettier (double quotes, semicolons): `npm run format`,
  cek `npm run format:check`.
- Typecheck via `npm run build`.
- Komponen klien meminimalkan re-render: efek kursor/scroll menulis CSS var
  langsung (rAF), bukan state React.

## 4. Constraints & Catatan

- Rate limit in-memory (best-effort, reset saat restart, tidak multi-instance safe).
- `docs/` di-`.gitignore` (privat).
- Banyak placeholder di `src/lib/constants.ts` (`yourusername`, `yourdomain.com`, `HERO_STATS`)
  yang harus diganti sebelum rilis.
- `react-scroll-parallax`, `CanvasBackground`, `AmbientGlow`, **dan kini
  `ConstellationCanvas`/aurora/meteor/grid/cursor-glow** tidak dipakai (clean look).
  Seluruh motion scroll dipegang **GSAP ScrollTrigger**; latar dipegang `Backdrop`
  (clean wash) + `HeroScene` (gunung solid).
- **ScrollSmoother** (GSAP Club) opsional pengganti Lenis; default tetap Lenis.
- Migrasi v1→v2.1 (teal→Nord, root→`src/`, backdrop→clean, hero→gunung solid)
  wajib mengganti referensi path lama, token warna lama, dan menghapus komponen
  backdrop ramai; lihat `design.md` §2, §5, §6.
- **Tidak ada test suite** bawaan; refactor dilakukan tanpa coverage tambahan.
