# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is a Next.js App Router frontend for a Sprint Rating System backed by a NestJS GraphQL API.

- Framework: Next.js 15 with React 19 and TypeScript.
- Styling: Tailwind CSS with small shared UI primitives in `app/components/ui.tsx`.
- Forms: React Hook Form with Zod validation.
- Client mutations: TanStack Query hooks in `app/hooks/use-admin-mutations.ts`.
- Backend access: `graphql-request` clients and GraphQL documents under `app/lib`.
- Database reference: `db/schema.sql` is the checked-in source of truth for fresh environments.
- Membership model: users are assigned to projects through `project_members`; there is no `sprint_members` table or sprint-member GraphQL API.

## Project Structure

```txt
app/
  (public)/rate/[token]/        Public magic-link rating flow
  (public)/sprint/rating         Public sprint rating form
  api/admin/*/route.ts          Server API wrappers for admin mutations
  components/                   Shared UI and domain components
  dashboard/                    Admin dashboard pages and nested resource views
  hooks/                        Client-side React Query mutation hooks
  lib/
    api/                        Domain API functions, client fetch wrappers, shared types
    graphql/                    GraphQL client, queries, and mutations
    utils/                      Small utilities such as auth and class merging
db/
  schema.sql                    Database schema reference
```

## Sprint Rating Flow

- The sprint rating page is rendered from `app/(public)/sprint/rating/page.tsx` and expects `spmId` or `spmid` in the query string.
- Data is loaded through `app/lib/api/public-api.ts` using `getSprintRatingRequest()`.
- The GraphQL query `GENERATE_SPRINT_RATING_REQUEST` in `app/lib/graphql/queries.ts` aliases backend `sprId` to `spr_id` for frontend state.
- The public form currently supports prefilled `rating` and `answer` values and hides submission when all questions are already rated.
- Submission uses `app/api/sprint-rating/submit/route.ts` as a same-origin proxy to the backend mutation `updateSprintRatingRequests`.
- The backend expects `UpdateSprintRatingItemInput` with `spr_id`, `rating`, and `answer`.


Important files:

- `app/lib/api/types.ts`: shared domain types used across pages and components.
- `app/lib/api/admin-api.ts`: server-side GraphQL calls and mapping between GraphQL payloads and UI types.
- `app/lib/api/admin-client.ts`: browser-facing fetch helpers for `app/api/admin/*` routes.
- `app/lib/graphql/queries.ts` and `app/lib/graphql/mutations.ts`: GraphQL documents.
- `app/components/ui.tsx`: local UI primitives; prefer extending these before adding one-off component styles.
- `app/components/project-team-manager.tsx`: project membership management; this is the only assignment flow for users.

## Commands

Use npm; this repo includes `package-lock.json`.

```bash
npm install
npm run dev
npm run build
npm run lint
```

Notes:

- `npm run dev` starts the Next.js development server.
- `npm run build` is the best available full verification command.
- There is no dedicated test script in `package.json` at the moment.
- The frontend usually runs on `http://localhost:3000`; the GraphQL backend is expected at `http://localhost:3001/graphql` unless `NEXT_PUBLIC_GRAPHQL_ENDPOINT` overrides it.
- Environment variables commonly needed for local work:

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
ADMIN_API_TOKEN=your-admin-service-token
MOCK_ADMIN_AUTH=true
```

## Coding Rules

- Keep TypeScript strict. Avoid `any` unless the surrounding code already requires it and a narrower type would be misleading.
- Use the existing `@/*` path alias for imports.
- Preserve the App Router split between Server Components and Client Components.
- Add `'use client'` only to components or hooks that need browser-only behavior, state, effects, forms, or TanStack Query.
- Keep server-side data access in `app/lib/api/*` and GraphQL documents in `app/lib/graphql/*`.
- Keep browser mutation calls in `app/lib/api/admin-client.ts`, routed through `app/api/admin/*/route.ts`.
- API route handlers should authenticate with `requireAdmin()` before admin mutations.
- Normalize optional IDs consistently: UI forms use empty strings for unassigned values; API/server layers should convert them to `null` when sending GraphQL input.
- Do not add `getSprintMembers`, `addSprintMembers`, `/api/admin/assign-members`, or references to `sprint_members`. Sprint-level screens should derive member counts from the sprint's project membership when needed.
- Manage user assignment through project membership APIs only: `getProjectMembers`, `addProjectMembers`, `removeProjectMember`, and `updateProjectMemberStatus`.
- When adding or changing GraphQL fields, update all relevant layers together: GraphQL document, API mapping, shared type, client helper, hook, and UI.
- Prefer small mapper functions for translating GraphQL payloads into UI/domain types.
- Keep validation schemas close to the form that owns them unless they are reused.
- Use existing UI primitives (`Button`, `Input`, `Select`, `Textarea`, `Card`) and Tailwind conventions before introducing new component patterns.
- Keep dashboard views practical and data-focused; avoid marketing-style layouts for admin workflows.
- Do not edit generated or cache-like files such as `.next/` or `tsconfig.tsbuildinfo`.
- Do not modify `db/schema.sql` unless the task explicitly includes schema changes. If schema work is requested, keep it aligned with the current backend shape and do not reintroduce removed tables such as `sprint_members`.

## Verification

Before handing off code changes, run the narrowest useful checks:

```bash
npm run build
```

Also run `npm run lint` when touching broad UI or TypeScript structure. If a command cannot run because required services or environment variables are missing, report that clearly with the exact command attempted.

## Git Hygiene

- Check `git status --short` before editing and before final handoff.
- Treat existing uncommitted changes as user work. Do not revert or overwrite them unless explicitly asked.
- Keep changes scoped to the requested behavior and nearby supporting files.
- Avoid unrelated formatting churn.
