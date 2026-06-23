# Tasks — Portfolio Website

> Refactor v2.1 — 2026-06-22. Status: `[x]` selesai (sudah ada di v1) · `[ ]` belum ·
> `[~]` ada tapi wajib diubah/migrasi. Detail di `design.md` & `requirements.md`.
>
> Tema fokus v2.1: **backdrop CLEAN** + **Hero parallax gunung warna solid Nord**
> + transisi parallax ke bawah.

---

## Migrasi v2.1 (Nord · src/ · GSAP-first · clean) — prioritas

- [x] Pindahkan seluruh kode ke `src/` (`src/app`, `src/components`, `src/lib`,
      `src/content`). Alias `@/*` → `./src/*` di `tsconfig.json`.
- [x] Ganti token warna teal → **Nord** di `globals.css` + `tailwind.config.ts`.
- [x] Cari-ganti kelas/var lama (`teal-*`, `--teal*`) → `frost-*` / `--frost*`.
- [x] Set `--text-muted` = `#9AA4B8` (AA) di kedua sumber token.
- [x] **Hapus komponen backdrop ramai** (aurora, grid, constellation, meteor,
      cursor-glow) demi clean look.
- [x] Update seluruh path docs/kode root → `src/`.

---

## Fondasi

- [x] Proyek Next.js 15 (App Router, TS, Tailwind) — pindahkan ke `src/`.
- [x] Tailwind custom theme — re-theme ke **Nord**.
- [x] `src/lib/constants.ts` (data personal, nav, stats, timeline) — pindah path.
- [x] Prettier (`.prettierrc`, `npm run format`).
- [~] Inisialisasi & push Git repo publik (jika belum).

---

## Sistem Animasi & Scroll (GSAP-first + Lenis)

- [~] `src/lib/gsap.ts` — registrasi ScrollTrigger + `useGSAP`, helper
      `prefersReducedMotion()`, `isMobile()`, `gsap.matchMedia()`, util
      `refreshAfterAssets()`.
- [x] `SmoothScroll` (Lenis) sinkron `ScrollTrigger.update`; expose `velocity`;
      anchor `#id` akurat setelah pin; mati saat reduced-motion.
- [x] `Parallax` (scrub, transform-only; mati mobile/reduced) — dipakai hemat.
- [x] `Reveal` & `RevealGroup` — tambah varian `ScrollTrigger.batch`.
- [x] `ScrollProgress` — GSAP `scrub` (boleh tetap Framer).
- [x] `MotionProvider` (`MotionConfig reducedMotion="user"`).
- [ ] Guard `gsap.matchMedia()` desktop/tablet/mobile/reduced terpusat.

---

## HeroScene — Parallax Gunung Solid + Transisi (BARU, fitur utama)

- [x] `src/components/motion/HeroScene.tsx` — wrapper scene gunung berlapis.
- [x] Susun layer z-stack: sky polos → gunung jauh `#3B4252` → gunung tengah
      `#434C5E` → gunung depan `#4C566A` → konten. **Semua FLAT SOLID**.
- [x] Gunung = **SVG path siluet inline, satu `fill` solid per layer** (bukan
      raster, bukan gradient/blur).
- [x] Aksen opsional: 1 garis horizon Frost-deep `#5E81AC` (default boleh mati).
- [x] Timeline ScrollTrigger `pin + scrub` (`start "top top"`, `end "+=120%"`,
      `pinSpacing`, `anticipatePin: 1`, `invalidateOnRefresh`).
- [x] Gerak `y`/`scale`/`opacity` beda per `data-depth` (kecepatan → kedalaman).
- [x] **Transisi parallax ke bawah**: About `z` lebih tinggi meluncur menimpa
      scene + `.scene-seam` (fog tipis `--bg-base`→transparan).
- [x] Stats counter count-up di-scrub (opsional).
- [x] Fallback reduced-motion/mobile: gunung statis bertumpuk, tanpa pin/scrub.
- [x] Judul tetap LCP (SSR opacity 1) & tanpa CLS dari pin.
- [x] `ScrollTrigger.refresh()` setelah font + SVG scene siap.

---

## Backdrop — CLEAN / Minimal

- [x] `Backdrop` disederhanakan: hanya base wash solid `#242933` + vignette tipis
      opsional. `fixed z-0`, `aria-hidden`.
- [x] **Hapus**: aurora mesh, grid lines, `ConstellationCanvas`, meteor,
      cursor-glow (beserta listener & CSS terkait).
- [x] Hapus class CSS `.aurora`, `.grid-lines`, `.meteor`, `.cursor-glow`.
- [x] Tambah `.scene-seam` untuk transisi Hero→About.

---

## Efek Visual (dijaga minimal, re-theme Nord)

- [x] `.text-gradient`, `.shimmer-btn`, `.border-beam`, `.marquee`, `.hud-card`,
      `.spotlight-card`, `.glass`, `.eyebrow` — warna → **Frost**.
- [x] Marquee Skills velocity-linked (baca `lenis.velocity`).

---

## Komponen UI (re-theme Nord)

- [x] `Navbar` (pill + `layoutId`, scrollspy, hamburger) — aksen Frost.
- [x] `Footer`, `Button` (primary/outline/ghost + `shimmer`), `Badge` — Frost.
- [x] `SectionWrapper` (eyebrow/title/subtitle, `max-w-6xl py-24`).
- [x] `SpotlightCard` (glow Frost), `Marquee` (velocity-linked).
- [x] Hapus/lebur `ParallaxBanner` — tidak diperlukan (latar sudah clean; parallax
      kaya hanya di HeroScene).

---

## Section Halaman Utama

### Hero
- [x] Judul = LCP (SSR opacity 1) gradient text **Frost**.
- [x] Badge "Available" (dot Frost), tagline, bio, 2 CTA, stats, chevron.
- [x] Bungkus Hero dengan `HeroScene` gunung solid (lihat blok HeroScene).
- [~] Avatar/foto profil + row ikon sosial (menunggu asset).

### About
- [x] Kartu Profil (Parallax hemat + Reveal + SpotlightCard) + timeline "Perjalanan".
- [x] Jadikan penerima handoff parallax dari `HeroScene` (z + seam).

### Skills
- [x] `src/lib/data/skills.ts` (grup + ikon `react-icons`).
- [x] Marquee teknologi (velocity-linked) + grid kategori; reveal `ScrollTrigger.batch`.

### Projects
- [x] `src/lib/data/projects.ts`, filter tab by tag (restagger batch), border-beam
      Frost + pill "Featured", link GitHub/Live Demo `aria-label`.
- [~] Thumbnail proyek (`next/image`) saat asset tersedia.

### Contact
- [x] Form (Nama/Email/Pesan) + validasi, honeypot, rate limit, Resend API.
- [x] Field dark Nord + focus Frost, status `aria-live` (sukses=Aurora green,
      error=Aurora red), social links.

---

## Blog (MDX)

- [x] `src/lib/blog.ts` (gray-matter), `next-mdx-remote/rsc`.
- [x] Index `src/app/blog/page.tsx` + detail `src/app/blog/[slug]/page.tsx`.
- [x] `.prose-dark` (re-theme Nord), `generateMetadata`, prev/next, card clickable.
- [x] Konten demo di `src/content/blog/`.
- [~] Featured article full-width + filter tag di index.

---

## Chatbot Digital Twin

- [x] `src/app/api/chat/route.ts` — OpenAI-compatible, streaming, system prompt,
      filter role `system`, rate limit per-IP, validasi panjang.
- [x] `ChatWidget` — re-theme Nord (bubble user=Frost).

---

## SEO & Performa

- [x] Metadata global + OG/Twitter, JSON-LD Person, `src/app/sitemap.ts`,
      `src/app/robots.ts`.
- [x] Font `display: "swap"`.
- [x] Parallax `will-change: transform`, mati di mobile; **pin pakai `pinSpacing`**.
- [x] Hero LCP terjaga walau di-pin.
- [~] Import GSAP/ScrollTrigger dinamis di komponen klien (jaga LCP).
- [x] Security headers (HSTS, XFO, X-CTO, Referrer-Policy, Permissions-Policy, COOP).
- [~] `public/images/og.png` (default OG image).
- [~] `next/image` untuk avatar/thumbnail saat asset tersedia.

---

## Aksesibilitas

- [x] Skip-to-content, `:focus-visible` (outline Frost), kontras `--text-muted` AA.
- [x] Reduced-motion (CSS + MotionProvider + guard GSAP) — termasuk HeroScene statis.
- [x] `aria-hidden` dekoratif (+ layer gunung), `aria-label` chat/hamburger/link,
      `aria-expanded`, `aria-current`, `rel="noopener noreferrer"`.
- [x] Pastikan pin tidak mengubah urutan/fokus DOM.
- [ ] Audit manual keyboard + screen reader (NVDA/VoiceOver).
- [ ] Alt text saat gambar ditambahkan.

---

## Deploy & QA (terbuka)

- [ ] Set env production (`AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`,
      `RESEND_API_KEY`, `CONTACT_EMAIL`), `npm run build`, deploy.
- [ ] Domain custom (opsional).
- [ ] QA lintas browser/mobile: scene gunung + transisi parallax, pin/scrub, link,
      form, chatbot, Lighthouse final (CLS=0 walau ada pin).

---

## Backlog

- [ ] Halaman `/uses`, loading splash, newsletter, guestbook, analytics (Umami),
      i18n (ID/EN), PWA.
- [ ] Opsi ScrollSmoother (GSAP Club) pengganti Lenis bila lisensi tersedia.
