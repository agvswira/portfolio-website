# Next.js to Astro Migration

## Migration status

| Field | Value |
| --- | --- |
| Overall status | In progress |
| Current phase | Phase 1 — Next.js baseline hardening |
| Source branch | `content/case-study-foundation` |
| Baseline commit | `bdbb71824c4d32faaa152c6b6b5de05bc66c2981` |
| Checkpoint commit | `03e9168` |
| Migration branch | `migration/astro` |
| Migration worktree | `.worktrees/migration-astro` |
| Target platform | Astro 7.1.x on Vercel |
| Last updated | 2026-08-05 |

This file is the source of truth for the migration. A phase can only be marked
`Completed` after its exit criteria have been run and their actual results have
been recorded here. Implementation changes and this status update belong in the
same phase commit.

## Goals and fixed decisions

- Preserve the current Nord visual design, copy, public URLs, mountain
  parallax, project filters, contact form, streaming AI chat, domain, and
  Vercel deployment.
- Use Astro-native components with no React or Preact runtime.
- Prerender all pages except `/api/contact` and `/api/chat`.
- Keep Tailwind CSS as a build-time styling tool. Use GSAP and CSS for motion;
  remove Framer Motion, Lenis, and the canvas background.
- Use Astro Content Collections with Zod for blog posts and project case
  studies.
- Use Upstash Redis sliding-window rate limiting.
- Do not add a CMS, content database, i18n, PWA, analytics, or a redesign.

## Audit baseline

### Repository

- Node: `v26.4.0`; npm: `12.0.1`.
- Source branch: `content/case-study-foundation`.
- The pre-migration working tree contains uncommitted case-study, project,
  contact, sitemap, homepage, and `.gitignore` changes. These changes must be
  checkpointed and must not be discarded.
- Lint, TypeScript, and the production build passed during the audit.
- Prettier check failed on 13 files.
- No project-owned unit, E2E, accessibility, or Lighthouse CI suite exists.

### Performance and runtime

- Next.js reports approximately 462 kB First Load JS for the homepage and
  344 kB for content routes.
- Local production resource measurement found approximately 517 kB gzip of
  scripts on the homepage and 447 kB on a blog page.
- The canvas background is covered by an opaque layer but continues to render;
  its animation/listener cleanup is incomplete.
- Global MotionConfig, Framer Motion, Lenis, chat code, and animation code add
  JavaScript to routes that do not need it.

### Correctness, security, and content

- `npm audit --omit=dev` reported four high-severity dependency findings.
- Chat accepts malformed array entries that can produce HTTP 500, has no firm
  body limit, and parses each SSE network chunk without retaining partial
  frames.
- Rate limiting uses process-local memory, which is not reliable on serverless
  instances.
- Contact only accepts JSON even though the form advertises an HTML action.
- `/images/og.png` returns 404; canonical and per-content structured data are
  incomplete; sitemap dates currently change with the build.
- Some pages lack the skip-link target and accessible focus management.
- Content includes an H1 duplicate, URL placeholders, stale statistics, list
  markers hidden by CSS, and unstyled syntax highlighting.

## Phase tracker

| Phase | Status | Exit evidence |
| --- | --- | --- |
| 0. Tracker and checkpoint | Completed | Checkpoint `03e9168`; lint, type-check, and build passed |
| 1. Next.js baseline hardening | In Progress | Pending |
| 2. Astro foundation | Pending | Pending |
| 3. Content and static pages | Pending | Pending |
| 4. Interactions, motion, and accessibility | Pending | Pending |
| 5. APIs, rate limiting, and security | Pending | Pending |
| 6. SEO, headers, cleanup, and documentation | Pending | Pending |
| 7. Quality and performance gates | Pending | Pending |
| 8. Preview, cutover, and closeout | Pending | Pending |

## Phase 0 — Tracker and checkpoint

### Work

- Create and track this migration document before application migration work.
- Record repository state and audit baseline.
- Preserve the complete existing working tree in a checkpoint commit.
- Create an isolated migration branch/worktree from that checkpoint.

### Exit criteria

- `MIGRATION_PLAN.md` is tracked.
- Existing user changes are present in the checkpoint commit.
- Baseline commit and migration branch/worktree path are recorded.
- The checkpoint can be checked out without losing content work.

### Evidence

- Tracker committed with all pre-existing case-study and configuration changes
  in checkpoint `03e9168`.
- Isolated branch `migration/astro` created at
  `.worktrees/migration-astro` from that checkpoint.
- `npm install`: completed; baseline audit reported five high-severity findings
  for Phase 1.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; 15 static/dynamic routes generated. The build needed
  network font retries but completed successfully.

## Phase 1 — Next.js baseline hardening

### Work

- Upgrade the temporary Next.js baseline to `15.5.22` and resolve the vulnerable
  `js-yaml` lockfile entry.
- Add an explicit Node engine (`>=22.12`) and type-check script.
- Make the current codebase pass Prettier without behavior changes.
- Keep this phase isolated so its security patch can be deployed independently
  if the Astro migration takes longer than expected.

### Exit criteria

- `npm run lint`, `npm run typecheck`, `npm run format:check`, and
  `npm run build` exit successfully.
- `npm audit --omit=dev` contains no high-severity finding.

### Evidence

Pending.

## Phase 2 — Astro foundation

### Work

- Install Astro 7.1.x, the Vercel adapter, MDX, strict TypeScript, Tailwind 3,
  GSAP, and server-rendered SVG icons.
- Configure static output with on-demand rendering only for both API routes.
- Build the base layout, global tokens/styles, font loading, metadata shell,
  and route skeletons as `.astro` components.
- Do not install React or Preact integration.

### Exit criteria

- All public route skeletons build successfully.
- The dependency graph and generated HTML contain no React runtime.
- A Vercel-compatible production build succeeds.

### Evidence

Pending.

## Phase 3 — Content and static pages

### Work

- Define Astro Content Collections and Zod schemas for blog posts and projects.
- Require valid titles, descriptions, dates, tags, slugs, and project outline;
  permit `demoUrl` and `coverImage` to be `null` instead of placeholder text.
- Port the homepage, blog index/detail, and project detail routes.
- Derive statistics and reading time from content.
- Enforce one H1, visible prose lists, and Shiki code highlighting.
- Use explicit publish/update dates as sitemap `lastModified` sources.

### Exit criteria

- Every content entry validates during build.
- All existing public content URLs render and internal links resolve.
- No content body introduces a second H1 or placeholder URL.

### Evidence

Pending.

## Phase 4 — Interactions, motion, and accessibility

### Work

- Port navigation, project filters, contact enhancement, and chat UI to small
  vanilla TypeScript modules.
- Load GSAP only on the homepage; load chat after interaction or idle.
- Replace canvas and smooth scrolling with CSS layers and native scrolling.
- Stop nonessential motion when `prefers-reduced-motion` is enabled.
- Add `main#main`, labels, live status, focus return, Escape behavior,
  `aria-pressed`, native form validation, and AA-compliant error text.

### Exit criteria

- Keyboard flows and axe checks pass on desktop and mobile layouts.
- Reduced-motion mode has no continuous decorative animation.
- Visual comparison confirms design parity at supported breakpoints.

### Evidence

Pending.

## Phase 5 — APIs, rate limiting, and security

### Work

- Port contact and chat to Astro server endpoints with `prerender = false`.
- Use Upstash Redis sliding windows: contact 5/minute and chat 20/minute.
- Hash `x-vercel-forwarded-for` with `RATE_LIMIT_SALT` and namespace keys by
  deployment environment.
- Limit contact bodies to 8 kB and chat bodies to 25 kB, ten messages, and
  2,000 characters per message.
- Preserve JSON contracts; add a 303 form fallback for no-JavaScript contact.
- Add upstream timeouts, client abort propagation, SSE content-type checks, and
  a buffered SSE parser.
- Return consistent 400, 413, 415, 429, 502, and 503 responses without leaking
  internal exceptions.

### Exit criteria

- Unit/integration tests cover success, validation, rate limit, malformed
  upstream, timeout, and abort behavior.
- CI tests do not make live Resend, AI, or Upstash requests.

### Evidence

Pending.

## Phase 6 — SEO, headers, cleanup, and documentation

### Work

- Add a real 1200×630 OG PNG, canonical metadata, Open Graph/Twitter cards,
  Person JSON-LD, BlogPosting JSON-LD, and CreativeWork JSON-LD.
- Preserve `/robots.txt` and `/sitemap.xml` with real content dates.
- Configure a hash-based CSP plus HSTS, nosniff, referrer, permissions, COOP,
  frame, form, and connect restrictions.
- Remove Next.js, React, Framer Motion, Lenis, canvas code, obsolete loaders,
  unused packages, duplicate constants, and default assets after parity.
- Update README, `.env.example`, architecture, local setup, test, deployment,
  and rollback documentation.

### Exit criteria

- OG, canonical, JSON-LD, robots, sitemap, and security headers validate.
- No obsolete framework runtime remains in dependencies or built output.

### Evidence

Pending.

## Phase 7 — Quality and performance gates

### Work

- Add Vitest coverage for schemas, validation, reading time, rate-limit keys,
  and buffered SSE parsing.
- Add Playwright and axe coverage for routes, navigation, filters, contact,
  chat, errors, keyboard flows, and reduced motion.
- Add Lighthouse CI and desktop/mobile visual regression checks.
- Add all gates to CI.

### Exit criteria

- Mobile Lighthouse: Performance ≥95, Accessibility ≥95, SEO ≥95.
- CLS ≤0.05.
- Homepage eager JavaScript ≤120 kB gzip.
- Blog/project eager JavaScript ≤20 kB gzip.
- Format, lint, type-check, unit, E2E, build, link, and dependency audit gates
  all pass.

### Evidence

Pending.

## Phase 8 — Preview, cutover, and closeout

### Work

- Deploy the final candidate to Vercel Preview with isolated environment keys.
- Run full desktop/mobile/reduced-motion visual and API smoke tests.
- Record the Preview URL, commit, metrics, and cutover evidence.
- Move the production alias only after every prior gate passes.
- Smoke-test production; retain the last Next.js deployment as rollback target.

### Exit criteria

- Preview and production verification results are recorded.
- Production serves the Astro build and all critical journeys pass.
- Rollback target and procedure are documented.
- Overall migration status is `Completed`.

### Evidence

Pending.

## Public interfaces and environment

- Public routes and permalinks remain unchanged, including `/sitemap.xml`.
- Contact JSON remains `{ "success": true }` or `{ "error": "..." }`.
- Chat remains an OpenAI-compatible SSE response.
- New required variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `RATE_LIMIT_SALT`
  - `CONTACT_FROM_EMAIL`
- Existing AI, Resend API key, and recipient variables remain supported.

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-05 | Use a root-level `MIGRATION_PLAN.md` | `docs/` is ignored; the tracker must be versioned. |
| 2026-08-05 | Checkpoint the current dirty branch before isolation | Existing case-study work must be preserved before creating a migration worktree. |

## Progress log

### 2026-08-05 — Phase 0 started

- Created the migration tracker structure.
- Recorded the audit baseline and fixed implementation decisions.
- Checkpoint and isolated migration workspace are still pending.

### 2026-08-05 — Phase 0 completed

- Saved the full working tree in checkpoint `03e9168`.
- Created isolated branch/worktree `migration/astro` at
  `.worktrees/migration-astro`.
- Re-ran lint, TypeScript, and the production build successfully in the
  isolated workspace.
- Started Phase 1 baseline hardening; dependency audit remediation is pending.
