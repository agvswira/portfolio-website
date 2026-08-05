# Agus Wira Portfolio

Portfolio Astro yang memuat proyek, case study MDX, tulisan, contact form, dan
asisten AI streaming. Halaman publik diprerender; hanya `/api/contact` dan
`/api/chat` yang berjalan sebagai Vercel Serverless Functions.

## Stack

- Astro 7, TypeScript, Astro Content Collections, MDX, dan Zod
- Tailwind CSS dengan design system Nord
- Vanilla TypeScript dan GSAP ScrollTrigger khusus homepage
- Upstash Redis untuk sliding-window rate limiting
- Resend untuk contact form
- Provider AI OpenAI-compatible dengan streaming SSE
- Vitest, Playwright, axe, dan Lighthouse CI

Tidak ada React/Preact runtime. Route blog dan proyek mengirim nol JavaScript
eager; client streaming chat dimuat setelah pesan pertama dikirim.

## Menjalankan secara lokal

Gunakan Node 24 (lihat `.nvmrc`) dan npm yang menyertai Node tersebut.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Situs tersedia di `http://localhost:4321`. Halaman tetap dapat dibuka tanpa
secret, tetapi contact dan chat akan fail closed dengan HTTP 503 sampai semua
environment variable terkait diisi.

## Struktur

```text
src/
├── content/          # MDX blog dan project case study
├── layouts/          # document shell, canonical/social metadata, JSON-LD
├── pages/            # static routes dan dua endpoint Astro on-demand
├── scripts/          # vanilla browser behavior; chat client lazy-loaded
├── sections/         # homepage sections
├── server/           # validation, limits, providers, HTTP contracts
├── styles/           # global Nord/Tailwind styles
└── ui/               # reusable Astro components
tests/
├── e2e/              # Playwright + axe browser journeys
└── *.test.ts         # Vitest unit/integration tests
```

## Environment variables

| Variable                   | Required for | Keterangan                                    |
| -------------------------- | ------------ | --------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Both APIs    | REST URL database Upstash                     |
| `UPSTASH_REDIS_REST_TOKEN` | Both APIs    | Token database Upstash                        |
| `RATE_LIMIT_SALT`          | Both APIs    | Salt acak panjang untuk hash identitas client |
| `RESEND_API_KEY`           | Contact      | API key Resend                                |
| `CONTACT_EMAIL`            | Contact      | Alamat penerima                               |
| `CONTACT_FROM_EMAIL`       | Contact      | Sender terverifikasi, termasuk display name   |
| `AI_API_KEY`               | Chat         | API key provider OpenAI-compatible            |
| `AI_BASE_URL`              | Chat         | Opsional; default `https://api.openai.com/v1` |
| `AI_MODEL`                 | Chat         | Opsional; default `gpt-4o-mini`               |

Contact dibatasi 5 request/menit dan chat 20 request/menit per identitas
ter-hash, dengan namespace terpisah untuk development, Preview, dan production.
Jangan memakai salt production untuk Preview.

## Perintah kualitas

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run check:csp
npm audit --omit=dev --audit-level=high
```

Test provider selalu memakai mock; suite tidak mengirim email, memakai kuota AI,
atau menyentuh database Upstash live.

## Deployment dan rollback

Project ditujukan untuk Vercel melalui adapter resmi Astro. Tambahkan environment
variable secara terpisah untuk Preview dan Production, deploy branch kandidat ke
Preview, lalu jalankan seluruh smoke test sebelum memindahkan production alias.

Header keamanan ada di `vercel.json`. CSP memakai hash untuk seluruh JSON-LD
inline; jika structured data berubah, build ulang, perbarui hash berdasarkan
HTML hasil build, lalu jalankan `npm run check:csp` sebelum deploy.

Rollback dilakukan dengan mempromosikan deployment production terakhir yang
sehat dari Vercel Dashboard/CLI. Selama cutover migrasi, deployment Next.js
terakhir dipertahankan sebagai target rollback dan production alias tidak boleh
dipindahkan sebelum Preview lulus seluruh gate.

## Live site

[aguswira.dev](https://aguswira.dev)
