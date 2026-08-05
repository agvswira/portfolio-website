# Next.js to Astro Migration

## Migration status

| Field              | Value                                      |
| ------------------ | ------------------------------------------ |
| Overall status     | In progress                                |
| Current phase      | Phase 6 — SEO, headers, cleanup, and docs  |
| Source branch      | `content/case-study-foundation`            |
| Baseline commit    | `bdbb71824c4d32faaa152c6b6b5de05bc66c2981` |
| Checkpoint commit  | `03e9168`                                  |
| Migration branch   | `migration/astro`                          |
| Migration worktree | `.worktrees/migration-astro`               |
| Target platform    | Astro 7.1.x on Vercel                      |
| Last updated       | 2026-08-05                                 |

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

| Phase                                       | Status      | Exit evidence                                            |
| ------------------------------------------- | ----------- | -------------------------------------------------------- |
| 0. Tracker and checkpoint                   | Completed   | Checkpoint `03e9168`; lint, type-check, and build passed |
| 1. Next.js baseline hardening               | Completed   | All gates passed; production audit reports 0 findings    |
| 2. Astro foundation                         | Completed   | Astro/Vercel build passed; no React/Next dependency      |
| 3. Content and static pages                 | Completed   | 10 content tests and full static Astro build passed      |
| 4. Interactions, motion, and accessibility  | Completed   | Playwright/axe: 5 passed, 1 intentionally skipped        |
| 5. APIs, rate limiting, and security        | Completed   | 46 unit/integration tests; 9 E2E passed, 1 skipped       |
| 6. SEO, headers, cleanup, and documentation | In Progress | Pending                                                  |
| 7. Quality and performance gates            | Pending     | Pending                                                  |
| 8. Preview, cutover, and closeout           | Pending     | Pending                                                  |

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

- Upgraded `next` and `eslint-config-next` from 15.5.19 to 15.5.22.
- Added Node `>=22.12.0`, `npm run typecheck`, and patched dependency
  resolutions for `js-yaml`, PostCSS, and Sharp.
- `npm run format:check`: passed after formatting the 14 reported files.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and generated all 15 routes on Next.js 15.5.22.
- `npm audit --omit=dev --audit-level=high`: passed with 0 vulnerabilities.

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

- Installed Astro 7.1.x, Vercel/MDX integrations, self-hosted variable fonts,
  Tailwind, GSAP, Astro Icon, and Astro-native lint/type-check tooling.
- Added a shared Astro layout plus static page, dynamic route, robots, sitemap,
  and on-demand API skeletons.
- `npm run lint`: passed.
- `npm run typecheck`: 14 Astro files checked with 0 errors, warnings, or hints.
- `npm run build`: passed; ten static routes were prerendered and both API
  functions were bundled for Vercel.
- `npm ls react react-dom next preact --all`: empty.
- Built output contains no `react`, `nextjs`, or `__next` runtime marker.
- `npm audit --omit=dev --audit-level=high`: passed with 0 production findings.

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

- Added Astro Content Collections with strict blog/project Zod schemas and
  build-time guards for H1, slug, and case-study section order.
- Added Vitest during this phase to follow test-first development; the guards
  and schemas were observed failing before implementation and now pass 10/10.
- Replaced invalid URL placeholders with `null`, removed the duplicate article
  H1, added explicit content dates, visible list markers, and Nord Shiki output.
- Ported the complete static homepage, blog index/details, project details,
  footer, sitemap, and robots output to Astro components.
- Every rendered route has exactly one H1 and `main#main`; static pages contain
  zero external/eager script tags.
- Desktop and 390 px mobile headless screenshots confirm the Nord design,
  Sora/Geist fonts, mountain layers, and content layout render correctly.

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

- Added vanilla TypeScript modules for navigation/scrollspy, project filters,
  pointer spotlight, native contact enhancement, chat shell, and focus return.
- Added GSAP ScrollTrigger only to the homepage for mountain parallax and
  reveals; CSS owns the marquee and all continuous animation stops under
  reduced motion.
- Added a non-modal chat dialog with an explicit label, log/live regions,
  labelled input, Escape close, and focus return.
- Added Playwright and axe earlier than Phase 7 so this phase could be gated on
  behavior: 5 tests passed and the desktop-only mobile-menu case was skipped.
- Axe exposed a 4.01:1 muted-text contrast regression; the token was adjusted
  to `#A8B2C2`, after which the axe scan returned zero violations.
- Homepage eager JavaScript is approximately 46 kB gzip; content routes still
  ship no eager JavaScript.

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

- Replaced both route skeletons with Astro server endpoints and an explicit
  dependency boundary around Upstash, Resend, and the OpenAI-compatible AI
  provider; tests perform no live external requests.
- Added fail-closed Upstash sliding-window limits (5/minute contact and
  20/minute chat), salted SHA-256 client identifiers, environment namespaces,
  limit/reset headers, and `Retry-After` on denial.
- Enforced media types, 8 kB/25 kB bodies, strict contact/chat schemas, ten
  messages, 2,000 characters per chat message, and a final user role.
- Added the JSON contact contract, native 303 fallback, Resend/AI timeouts,
  client abort propagation, SSE content checks, and a buffered client parser.
- Fresh verification passed format, lint, Astro typecheck (zero diagnostics),
  46 Vitest tests, 9 Playwright tests with one intentional desktop skip, the
  Vercel serverless build, and production audit with zero vulnerabilities.

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

| Date       | Decision                                             | Reason                                                                                                                                             |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-05 | Use a root-level `MIGRATION_PLAN.md`                 | `docs/` is ignored; the tracker must be versioned.                                                                                                 |
| 2026-08-05 | Checkpoint the current dirty branch before isolation | Existing case-study work must be preserved before creating a migration worktree.                                                                   |
| 2026-08-05 | Temporarily override Next's PostCSS and Sharp        | New advisories remained after Next 15.5.22; overrides avoid a second framework migration to Next 16 before Astro and are verified by a full build. |
| 2026-08-05 | Keep legacy Next source temporarily but exclude it   | Old components remain as a parity reference while Astro builds only the new source; they will be deleted after parity.                             |
| 2026-08-05 | Override `path-to-regexp` to 6.3.0                   | The Vercel adapter resolved vulnerable 6.1.0 transitively; patched compatible 6.x passes the complete adapter build.                               |
| 2026-08-05 | Add Vitest in Phase 3 rather than Phase 7            | Content behavior was implemented test-first; Phase 7 will expand the suite and CI instead of adding tests after production code.                   |
| 2026-08-05 | Use explicit content dates in frontmatter            | File mtimes are unstable in deployments; frontmatter now drives sorting, structured metadata, and sitemap `lastModified`.                          |
| 2026-08-05 | Pull Playwright/axe setup into Phase 4               | Keyboard, focus, reduced-motion, filter, chat-shell, and contrast behavior had to be verified before declaring the interaction phase complete.     |
| 2026-08-05 | Lighten `text-muted` to `#A8B2C2`                    | Axe measured only 4.01:1 on elevated cards; the new token exceeds WCAG AA while preserving the Nord hierarchy.                                     |
| 2026-08-05 | Fail closed when Upstash times out                   | SDK timeouts are permissive by default; timeout results are converted to 503 so missing rate-limit state never silently permits requests.          |
| 2026-08-05 | Lazy-load the streaming chat client                  | The accessible shell remains eager, while the SSE parser and request/history logic load only after the visitor submits the first message.          |

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

### 2026-08-05 — Phase 1 completed

- Upgraded the temporary Next.js baseline and patched all production
  dependency findings without moving to Next 16.
- Added deterministic engine/type-check configuration and normalized Prettier
  formatting.
- Verified format, lint, TypeScript, production build, and production audit.
- Started Phase 2 Astro foundation work.

### 2026-08-05 — Phase 2 completed

- Replaced the runtime/tooling foundation with Astro 7 and the official Vercel
  adapter without a React or Preact integration.
- Added Astro-native route skeletons, layout metadata, local fonts, Tailwind,
  MDX, icon, lint, and type-check configuration.
- Verified the Vercel build, empty React/Next dependency tree, clean production
  audit, and generated output without Next runtime markers.
- Started Phase 3 content collection and static-page migration.

### 2026-08-05 — Phase 3 completed

- Migrated blog posts and projects into typed Astro Content Collections.
- Ported every static public page and homepage section with server-rendered
  Iconify SVGs and no client framework runtime.
- Verified content guards/schemas, one-H1 structure, stable sitemap dates, zero
  eager static-page scripts, and desktop/mobile visual parity.
- Started Phase 4 vanilla interactions, GSAP motion, and accessibility work.

### 2026-08-05 — Phase 4 completed

- Replaced React interaction code with small vanilla TypeScript modules and
  limited GSAP to homepage motion.
- Added accessible mobile navigation, filters, native form enhancement,
  spotlight cards, and a keyboard-operable non-modal chat shell.
- Verified five Playwright scenarios, a zero-violation axe scan, reduced motion,
  desktop/mobile focus return, and the 46 kB gzip homepage script budget.
- Started Phase 5 API, Upstash, SSE, and server-side security work.

### 2026-08-05 — Phase 5 completed

- Ported contact and streaming chat to bounded Astro server endpoints backed
  by hashed, environment-scoped Upstash sliding windows.
- Added safe provider adapters, upstream deadlines, abort propagation, strict
  validation/status contracts, native form fallback, and buffered SSE parsing.
- Verified all server branches without live provider calls, browser-tested the
  mocked contact/chat journeys on desktop and mobile, and retained a zero-findings
  production dependency audit.
- Started Phase 6 SEO, security headers, legacy cleanup, and documentation.
