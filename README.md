# Agus Wira — Portfolio

[![CI](https://github.com/agvswira/portfolio-website/actions/workflows/ci.yml/badge.svg)](https://github.com/agvswira/portfolio-website/actions/workflows/ci.yml)
[![Live Site](https://img.shields.io/badge/live-aguswira.dev-5E81AC)](https://aguswira.dev)

Portfolio pribadi Agus Wira yang berisi profil, proyek, case study, tulisan, contact form, dan asisten AI. Situs dibangun dengan Astro untuk menjaga halaman konten tetap ringan, cepat, dan mudah dirawat.

![Preview Agus Wira Portfolio](public/images/og.png)

## Highlights

- Halaman profil, blog, dan project case study berbasis MDX.
- Content Collections dengan schema Zod untuk menjaga konsistensi konten.
- Contact form dengan Resend dan fallback native tanpa JavaScript.
- Asisten AI dengan respons streaming melalui API OpenAI-compatible.
- Sliding-window rate limiting menggunakan Upstash Redis.
- Metadata sosial, JSON-LD, sitemap, CSP berbasis hash, dan security headers.
- Pengujian unit, integrasi, aksesibilitas, E2E, visual regression, dan Lighthouse.

## Architecture

Semua halaman publik diprerender. Hanya `/api/contact` dan `/api/chat` yang berjalan sebagai Vercel Serverless Functions. Interaksi browser menggunakan vanilla TypeScript; GSAP hanya dimuat untuk motion di homepage.

```text
src/
├── content/          # Blog dan project case study
├── layouts/          # Document shell dan metadata
├── pages/            # Static routes dan API endpoints
├── scripts/          # Interaksi browser
├── sections/         # Homepage sections
├── server/           # Validation, rate limit, dan provider adapters
├── styles/           # Global styles
└── ui/               # Reusable Astro components
tests/
├── e2e/              # Browser, accessibility, dan visual tests
└── *.test.ts         # Unit dan integration tests
```

## Tech stack

- Astro 7, TypeScript, Content Collections, MDX, dan Zod
- Tailwind CSS, GSAP, dan Astro Icon
- Upstash Redis dan Resend
- OpenAI-compatible streaming API
- Vitest, Playwright, axe, dan Lighthouse CI
- Vercel

## Local development

Gunakan Node.js 24 dan npm.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Development server tersedia di `http://localhost:4321`. Halaman publik tetap dapat dijalankan tanpa secret; endpoint contact dan chat mengembalikan HTTP 503 sampai environment variable yang dibutuhkan tersedia.

## Environment variables

| Variable                   | Digunakan oleh   | Keterangan                                    |
| -------------------------- | ---------------- | --------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Contact dan chat | REST URL database Upstash                     |
| `UPSTASH_REDIS_REST_TOKEN` | Contact dan chat | Token database Upstash                        |
| `RATE_LIMIT_SALT`          | Contact dan chat | Salt acak untuk hash identitas client         |
| `RESEND_API_KEY`           | Contact          | API key Resend                                |
| `CONTACT_EMAIL`            | Contact          | Alamat penerima                               |
| `CONTACT_FROM_EMAIL`       | Contact          | Sender yang sudah terverifikasi               |
| `AI_API_KEY`               | Chat             | API key provider                              |
| `AI_BASE_URL`              | Chat             | Opsional; default `https://api.openai.com/v1` |
| `AI_MODEL`                 | Chat             | Opsional; default `gpt-4o-mini`               |

Gunakan nilai `RATE_LIMIT_SALT` yang berbeda untuk Preview dan Production. Jangan pernah commit file environment atau nilai secret.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
npm run check:server
npm run check:csp
npm run check:links
npm run check:bundles
npm run test:lighthouse
npm audit --audit-level=high
```

Test provider menggunakan mock dan tidak mengirim email, memakai kuota provider AI, atau mengakses database Upstash live.

## Deployment

Repository dikonfigurasi untuk Vercel melalui adapter resmi Astro. Atur seluruh environment variable secara terpisah untuk Preview dan Production, validasi deployment Preview, lalu promosikan deployment yang sudah lolos pemeriksaan.

Security headers didefinisikan di `vercel.json`. Setelah mengubah structured data atau inline script, jalankan build dan `npm run check:csp` untuk memastikan hash CSP tetap sesuai.

## Live site

[aguswira.dev](https://aguswira.dev)
