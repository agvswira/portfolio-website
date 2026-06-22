# Design — Portfolio Website

> Refactor v2.1 — 2026-06-22. Tema **Nord** · codebase **`src/`** · **GSAP ScrollTrigger**
> mesin gerak utama · **Hero = parallax scene gunung warna solid** · **backdrop clean/minimal**.
>
> Perubahan dari v2: backdrop disederhanakan total (clean look — tanpa aurora mesh,
> constellation, meteor, grid, cursor-glow). Satu-satunya elemen kaya adalah scene
> gunung di Hero, memakai warna **solid** (flat fill), bukan gradient/blur.
>
> Stack visual: Tailwind CSS 3 · GSAP 3 (ScrollTrigger: pin/scrub/batch) + Lenis ·
> Framer Motion 11 (micro-interaction non-scroll) · CSS murni untuk detail kecil.

---

## 1. Filosofi Desain

> "Arctic developer portfolio — bersih, tenang, dan dalam. Palet Nord dengan latar
> polos yang lapang; satu momen sinematik di Hero berupa siluet gunung berlapis
> yang bergerak parallax."

- **Clean first**: latar global polos (solid Polar Night). Tidak ada motif ramai,
  tekstur, partikel, atau efek yang bersaing dengan teks. Ruang kosong = fitur.
- **Satu fokus visual**: kekayaan visual hanya di **Hero scene gunung**. Sisanya
  minimalis agar konten yang berbicara.
- **Accent**: Frost `#88C0D0` (nord8) sebagai aksen utama; `#8FBCBB`/`#81A1C1`/
  `#5E81AC` sebagai variasi. Aurora Nord dipakai sangat terbatas (status form).
- **Mode**: Dark only (Nord night).
- **Font**: Sora (sans) + Geist Mono (eyebrow, label, code).
- **Warna solid, bukan gradient ramai**: gunung & sky memakai flat fill Nord;
  gradient hanya untuk teks nama (`.text-gradient`) dan shimmer CTA halus.
- **Gerak dengan tujuan**: parallax & reveal untuk kedalaman/ritme. Hanya
  `transform`/`opacity`. GSAP ScrollTrigger memimpin; Framer hanya micro.

---

## 2. Color Palette — Nord

Tokens hidup di dua tempat dan **harus konsisten**: `:root` di `src/app/globals.css`
(CSS var) dan `tailwind.config.ts` (utility class).

### Background (Polar Night + base ekstra-gelap)

| Token (CSS / Tailwind)           | HEX       | Nord  | Penggunaan                              |
| -------------------------------- | --------- | ----- | --------------------------------------- |
| `--bg-base` / `bg-base`          | `#242933` | (ekstra) | Background utama clean (paling gelap) |
| `--bg-surface` / `bg-surface`    | `#2E3440` | nord0 | Card, surface, sky scene                |
| `--bg-elevated` / `bg-elevated`  | `#3B4252` | nord1 | Hover/elevated, modal, gunung jauh      |
| `--bg-overlay` / `bg-overlay`    | `#434C5E` | nord2 | Gunung tengah, overlay                  |
| `--border` / `border`            | `#434C5E` | nord2 | Border card, divider                    |
| `--border-strong`                | `#4C566A` | nord3 | Border tegas, gunung depan              |

### Frost (aksen utama)

| Token                          | HEX       | Nord  | Penggunaan                         |
| ------------------------------ | --------- | ----- | ---------------------------------- |
| `--frost-cyan` / `frost-cyan`  | `#8FBCBB` | nord7 | Aksen teduh, ikon, gradient teks   |
| `--frost` / `frost-500`        | `#88C0D0` | nord8 | **Accent utama**, CTA, highlight   |
| `--frost-blue` / `frost-blue`  | `#81A1C1` | nord9 | Hover teks, variasi gradient       |
| `--frost-deep` / `frost-deep`  | `#5E81AC` | nord10| Aksen horizon Hero (tipis), scrollbar |

### Aurora (dipakai sangat terbatas)

| Token        | HEX       | Nord  | Penggunaan                          |
| ------------ | --------- | ----- | ----------------------------------- |
| `--aurora-red`    | `#BF616A` | nord11 | Status form error               |
| `--aurora-green`  | `#A3BE8C` | nord14 | Status form sukses              |
| `--aurora-yellow` | `#EBCB8B` | nord13 | Badge "Featured" opsional        |

> Token Aurora lain (orange/purple) tetap didefinisikan tapi tidak dipakai di UI
> default — demi clean look.

### Text (Snow Storm)

| Token (CSS / Tailwind)               | HEX       | Nord  | Penggunaan                |
| ------------------------------------ | --------- | ----- | ------------------------- |
| `--text-primary` / `text-primary`    | `#ECEFF4` | nord6 | Teks utama                |
| `--text-secondary` / `text-secondary`| `#D8DEE9` | nord4 | Teks pendukung            |
| `--text-muted` / `text-muted`        | `#9AA4B8` | tuned | Caption/label (~5:1, AA)  |

> **Catatan AA**: jangan pakai Nord3 `#4C566A` untuk teks (gagal kontras). Gunakan
> `--text-muted = #9AA4B8`. `tailwind.config.ts` dan `globals.css` memakai nilai sama.

---

## 3. Tipografi

- **Sans**: [Sora](https://fonts.google.com/specimen/Sora) — `--font-sans`.
- **Mono**: Geist Mono — `--font-mono`, untuk eyebrow, label, code block.

| Role               | Font      | Weight  | Size    |
| ------------------ | --------- | ------- | ------- |
| Hero title (LCP)   | Sora      | 600     | 48–72px |
| Heading H2         | Sora      | 600     | 28–36px |
| Heading H3         | Sora      | 600     | 16–22px |
| Body               | Sora      | 400     | 16–18px |
| Eyebrow / label    | Geist Mono| 400–500 | 11–13px |

- `next/font/google` (self-hosted), `display: "swap"`, auto-preload + size-adjust
  fallback → flash minim & CLS terjaga.
- Line-height body 1.7 · heading ~1.2 · judul `tracking-tight`.

---

## 4. Struktur Codebase (`src/`)

```
src/
  app/            # App Router: layout.tsx, page.tsx, blog/, api/, sitemap.ts, robots.ts, globals.css
  components/
    motion/       # SmoothScroll, Parallax, Reveal, RevealGroup, ScrollProgress, HeroScene
    backdrop/     # Backdrop (clean wash + vignette tipis)
    ui/           # Button, Badge, SectionWrapper, SpotlightCard, Marquee
    sections/     # Hero, About, Skills, Projects, Blog, Contact
    chat/         # ChatWidget
    Navbar.tsx, Footer.tsx
  lib/            # gsap.ts, constants.ts, blog.ts, rate-limit.ts, data/{skills,projects}.ts
  content/        # blog/*.mdx
public/           # images/og.png, favicon, dst. (di ROOT, bukan src)
```

- Alias `@/*` → `./src/*` (`tsconfig.json` `paths`).
- Semua referensi v1 (`app/...`, dst.) wajib diprefiks `src/`.
- `ConstellationCanvas` **dihapus** (tidak ada lagi canvas backdrop).

---

## 5. Backdrop (Latar Global) — Clean / Minimal

Komponen `<Backdrop>` dirender sekali di `src/app/page.tsx`, `position: fixed`,
`z-0`, `pointer-events: none`, `aria-hidden`. Konten di `z-10`.

**Prinsip: sesedikit mungkin.** Tujuan utamanya hanya memberi dasar warna yang
tenang dan menjaga keterbacaan.

| Layer        | Teknik                                   | Catatan                                |
| ------------ | ---------------------------------------- | -------------------------------------- |
| Base wash    | `bg-bg-base` (`#242933`) solid           | Dasar Polar Night polos                |
| Vignette     | Radial gradient sangat halus (opsional)  | `.backdrop-vignette` — fokus ke tengah, nyaris tak terlihat |

**Dihapus (demi clean look):** aurora mesh, grid lines, constellation canvas,
meteor, cursor glow. Tidak ada loop rAF / canvas di backdrop sama sekali —
beban paint mendekati nol.

> Tidak ada lagi hue shift backdrop yang mencolok. Boleh ada pergeseran value
> super-halus terhubung scroll (opsional, default mati) — tetap clean.

---

## 6. HeroScene — Parallax Scene Gunung (warna solid) + Transisi (fitur utama)

`HeroScene` (`src/components/motion/HeroScene.tsx`) adalah **satu-satunya** elemen
visual kaya: siluet **gunung berlapis berwarna solid** Nord yang bergerak parallax,
lalu menyerahkan transisi parallax ke section di bawahnya.

### 6.1 Susunan layer (z-stack, belakang → depan) — semua FLAT SOLID

| # | Layer            | Warna SOLID (flat fill)    | Gerak scrub (saat hero keluar)         |
| - | ---------------- | -------------------------- | -------------------------------------- |
| 0 | Sky              | `#242933` (atau `#2E3440`) | `y` paling lambat (nyaris diam)        |
| 1 | Gunung jauh      | `#3B4252` (nord1)          | `y` lambat + `scale` 1→1.04            |
| 2 | Gunung tengah    | `#434C5E` (nord2)          | `y` sedang                             |
| 3 | Gunung depan     | `#4C566A` (nord3)          | `y` cepat, NAIK menyapu ke atas        |
| 4 | Konten Hero      | teks Snow Storm + CTA Frost| `y` naik + `opacity` fade (judul LCP)  |

- **Warna solid, tanpa gradient/blur** pada gunung → tampilan bersih & tegas.
  Atmospheric depth dicapai lewat urutan value Nord (jauh lebih terang → depan
  lebih gelap/tegas) dan kecepatan parallax, **bukan** lewat haze/blur.
- Tiap gunung = **SVG path siluet** dengan satu `fill` solid (bukan raster, bukan
  `linearGradient`). Ringan, tajam di semua DPR.
- **Aksen opsional super-tipis**: satu garis horizon Frost-deep `#5E81AC` selebar
  1–2px di belakang gunung jauh (boleh dimatikan). Tidak ada aurora band.
- `data-depth` per layer memetakan kecepatan `y`.

### 6.2 Mekanisme transisi parallax ke bawah (ScrollTrigger pin + scrub)

- Satu `gsap.timeline({ scrollTrigger: { trigger: heroRef, start: "top top",
  end: "+=120%", scrub: true, pin: true, pinSpacing: true, anticipatePin: 1,
  invalidateOnRefresh: true }})`.
- Timeline menggerakkan layer 0–4 dengan `y`/`scale`/`opacity` berbeda → gunung
  bergerak pada kecepatan beda saat di-scroll = parallax sinematik.
- **Handoff parallax ke bawah**: gunung depan naik keluar layar dan section About
  **meluncur naik menimpa** scene (z lebih tinggi). Pertemuannya dibaurkan oleh
  `.scene-seam` (fog tipis `--bg-base` → transparan) supaya peralihan halus, bukan
  potong keras. Karena backdrop di bawah juga `#242933` solid, transisi terasa
  menyatu & bersih.
- **Stats counter** Hero count-up di-scrub pada porsi awal timeline (opsional).
- `ScrollTrigger.refresh()` dipanggil setelah font & SVG siap (cegah seam loncat).

### 6.3 Fallback
- **Reduced-motion / mobile (≤767px)**: tanpa pin/scrub. Gunung dirender sebagai
  komposisi siluet statis bertumpuk (tetap clean & berlapis, tanpa gerak). About
  mengalir normal di bawahnya. Judul tetap LCP.

---

## 7. Sistem Parallax & Scroll (GSAP-first)

Semua scroll/parallax dimiliki **GSAP ScrollTrigger**, disinkronkan dengan Lenis.
Framer Motion hanya micro-interaction non-scroll.

- **`SmoothScroll`** (Lenis, `lerp ~0.1`): menggerakkan scroll, `ScrollTrigger.update`
  tiap frame, anchor `#id` akurat setelah pin, mati saat reduced-motion. Mengekspos
  `lenis.velocity` (untuk Marquee).
- **`Parallax`** (`components/motion/Parallax.tsx`): `y` scrub, `speed` -1..1,
  `MAX_TRAVEL` 200px. Mati saat reduced-motion/mobile (kecuali prop `mobile`).
  Dipakai hemat di About (kartu profil) demi clean look — bukan di tiap elemen.
- **`Reveal`** & **`RevealGroup`**: fade + slide-up halus saat masuk viewport
  (`start "top 85%"`, `once`); grid pakai `ScrollTrigger.batch`. Reduced-motion →
  tampil tanpa translate.
- **`ScrollProgress`**: bar Frost tipis di tepi atas (`scaleX`, GPU).
- **`HeroScene`**: lihat §6 (pin + scrub + handoff parallax).
- **Guard**: `gsap.matchMedia()` desktop/mobile/reduced terpusat;
  `ScrollTrigger.config({ ignoreMobileResize: true })`.

> Mobile: `.parallax-layer { transform: none !important }`; HeroScene statis.
> Reduced-motion: shimmer/border-beam/marquee/text-gradient `animation: none`,
> HeroScene statis.

---

## 8. Efek Visual (CSS) — dijaga minimal

| Efek            | Class             | Deskripsi                                                  |
| --------------- | ----------------- | ---------------------------------------------------------- |
| Gradient text   | `.text-gradient`  | Teks nama/logo kilau gradient Frost (`#88C0D0`→`#8FBCBB`→`#81A1C1`) |
| Shimmer CTA     | `.shimmer-btn`    | Sapuan kilau Frost halus pada CTA utama                    |
| Border beam     | `.border-beam`    | Cahaya conic Frost di tepi kartu unggulan (hemat, opsional)|
| Marquee         | `.marquee`        | Strip teknologi Skills; kecepatan ikut velocity scroll; pause hover; mask fade tepi |
| Card            | `.hud-card`       | Border tipis + frosted glass Nord; hover → border Frost + soft shadow |
| Spotlight       | `.spotlight-card` | Glow Frost ikut kursor (`--mx/--my`), tanpa re-render      |
| Frosted glass   | `.glass`          | Background blur untuk badge/header                         |
| Eyebrow         | `.eyebrow`        | Mono Frost, uppercase, tracking lebar                      |
| Scene seam      | `.scene-seam`     | Fog tipis `--bg-base`→transparan di pertemuan Hero/About   |

> **Dihapus**: `.aurora`, `.grid-lines`, `.meteor`, `.cursor-glow` (backdrop clean).

---

## 9. Komponen

### Button (`ui/Button.tsx`)
```
primary : bg-frost text-bg-base, hover bg-frost-cyan + lift + shadow frost
outline : border frost/40 text-frost, hover bg-frost/10 + border frost
ghost   : text-secondary, hover text-frost + bg-elevated
prop shimmer → tambahkan .shimmer-btn. Polymorphic: <Link>/<a external>/<button>.
focus-visible ring Frost global.
```

### SectionWrapper (`ui/SectionWrapper.tsx`)
`max-w-6xl px-6 py-24`. Props `eyebrow`/`title`/`subtitle` → heading dalam
`<Reveal>`. Dipakai About, Skills, Projects, Blog, Contact (Hero pakai `HeroScene`).

### Navbar (`Navbar.tsx`)
- Logo `Nama.` — gradient text Frost + titik Frost.
- Desktop: pill mengambang; indikator aktif geser mulus (`motion.span layoutId`).
- Scrollspy via `IntersectionObserver` → `aria-current="location"`.
- Scrolled: border-bottom Frost/20 + `bg-base/80` blur. Mobile: hamburger.

### SpotlightCard
`hud-card` + glow kursor Frost. `as` polymorphic (`div`/`article`/`li`).

### Skills (`sections/Skills.tsx`)
- Marquee strip teknologi (velocity-linked) di atas.
- Grid kategori (`SpotlightCard`); tile 3-kolom (ikon `react-icons` + label).
  Reveal via `ScrollTrigger.batch`. Hover: lift + border Frost.
- **Tidak ada**: node-graph, konektor, level/XP bar, persentase.

### Projects (`sections/Projects.tsx`)
- Filter tab by tag (pill Frost saat aktif); `key={filter}` re-stagger (batch).
- `SpotlightCard as="article"`; unggulan `.border-beam` + pill "Featured".
- Link "GitHub →" / "Live Demo →" `aria-label` unik + `rel`.

### About (`sections/About.tsx`)
- Penerima handoff parallax `HeroScene`.
- Kiri: kartu Profil (`Parallax speed -0.12` → `Reveal` → `SpotlightCard`).
- Kanan: timeline "Perjalanan" (`RevealGroup`).

### ChatWidget (`chat/ChatWidget.tsx`)
- Trigger floating bottom-right (ikon `react-icons/lu`, `aria-expanded`). Window
  frosted glass Nord, header "Digital Twin", bubble user=Frost / bot=bg-elevated,
  typing indicator, streaming. Buka/tutup Framer Motion.

---

## 10. Animasi & Interaksi (ringkasan)

| Elemen                 | Animasi                                   | Owner          |
| ---------------------- | ----------------------------------------- | -------------- |
| Hero scene gunung      | Pin + scrub parallax berlapis + handoff   | GSAP ScrollTrigger |
| Section masuk viewport | Fade + slide-up (batch stagger)           | GSAP (Reveal)  |
| Parallax kartu About   | `y` scrub (hemat)                         | GSAP           |
| Stats counter          | Count-up di-scrub (opsional)              | GSAP           |
| Scroll progress bar    | `scaleX` scrub                            | GSAP           |
| Nav pill aktif         | Geser `layoutId`                          | Framer Motion  |
| Chat open/close        | Scale + fade                              | Framer Motion  |
| Marquee Skills         | Kecepatan ikut velocity Lenis             | JS + CSS       |
| Shimmer/border-beam/text-gradient | transform/opacity loop         | CSS (GPU)      |
| Card hover / spotlight | border + shadow + glow kursor             | CSS            |

**Prinsip**: durasi 200–600ms, ease-out masuk; hanya `transform`/`opacity`; semua
dimatikan/diredam saat `prefers-reduced-motion`.

---

## 11. Responsif

| Breakpoint | Min  | Perilaku                                                            |
| ---------- | ---- | ------------------------------------------------------------------- |
| Mobile     | 320  | Single column; HeroScene gunung statis (tanpa pin); parallax off    |
| Tablet     | 768  | Grid 2 kolom; parallax & pin aktif                                  |
| Desktop    | 1024 | Full layout + HeroScene pin/scrub parallax gunung                   |
| Wide       | 1280 | `max-w-6xl` terpusat                                                |

---

## 12. Aksesibilitas

| Aspek          | Implementasi                                                       |
| -------------- | ------------------------------------------------------------------ |
| Kontras        | `--text-muted` = `#9AA4B8` (~5:1, AA); bukan Nord3                  |
| Focus keyboard | `:focus-visible` global (outline Frost 2px)                        |
| Reduced motion | CSS + `MotionProvider` (`reducedMotion="user"`) + guard tiap GSAP; HeroScene statis |
| Dekoratif      | `aria-hidden` pada backdrop, layer gunung scene, ikon, indikator   |
| Skip link      | `Skip to content` → `#main`                                        |
| Form           | `<label>` terhubung + `autoComplete` + status `aria-live`          |
| Link berulang  | `aria-label` unik per proyek (GitHub/Live Demo)                    |
| Navbar         | scrollspy + `aria-current="location"`; hamburger `aria-expanded`   |
| Pin            | Pin hanya visual; urutan & fokus DOM tidak berubah                 |

---

## 13. Aset & Ikon

| Kebutuhan          | Sumber                                                  |
| ------------------ | ------------------------------------------------------- |
| UI / tech icons    | `react-icons` (Lucide `Lu`, Simple `Si`, Tabler `Tb`)   |
| Gunung/scene Hero  | **SVG path siluet inline, satu fill solid Nord per layer** (bukan raster, bukan gradient) |
| Foto profil/thumb  | Placeholder — `next/image` saat tersedia                |
| OG image           | `public/images/og.png`                                  |
| Favicon            | Inisial / ikon Frost                                    |
