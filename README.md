# Sprint Rating System Frontend (Next.js App Router)

Production-oriented frontend scaffold for a NestJS + GraphQL Sprint Rating System.

The checked-in database source of truth lives at [db/schema.sql](db/schema.sql). It is intended for fresh environments or full rebuilds, not an in-place production migration.

## Highlights

- Server-first App Router architecture (Server Components for data pages).
- Public magic-link route with strict API boundaries.
- Admin dashboard with project/sprint/report modules.
- GraphQL API layer separated into queries/mutations.
- Reusable UI and domain components.
- React Hook Form + Zod validation for interactive forms.
- TanStack Query for client-side mutations.

## Structure

```txt
app/
├── (public)/rate/[token]/
├── dashboard/
│   ├── projects/
│   ├── sprints/
│   └── reports/
├── components/
├── hooks/
└── lib/
    ├── api/
    ├── graphql/
    └── utils/
```

## Environment variables

```bash
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
ADMIN_API_TOKEN=your-admin-service-token
MOCK_ADMIN_AUTH=true
```

## Run

```bash
npm install
npm run dev
```
