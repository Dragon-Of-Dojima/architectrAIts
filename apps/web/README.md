# web

The Next.js 16 (App Router, React Server Components) UI and BFF for ArchitectrAIts. Served on port **3300**.

## Routes

- `/` — static landing hero (CC0 Bellotto painting) with links to the catalog and analyze flows.
- `/catalog` — paginated thumbnail grid of the catalog (8 per page, newest first, via `?page=`). `force-dynamic`; presigns only the current page's S3 keys.
- `/buildings/[slug]` — building detail: large image, AI metadata (style, era, year, description), source/license, and a pgvector "Related buildings" grid. `force-dynamic`.
- `/analyze` — visitor upload-and-analyze (client component): upload a photo, see the AI analysis and nearest catalog matches.
- `/api/analyze` — BFF route that forwards the uploaded image to the `apps/api` inference service, then runs the pgvector nearest-neighbor query.

Workspace packages (`architectraits-db`, `architectraits-storage`, `architectraits-ai`, `architectraits-shared`) are transpiled directly by Next (`transpilePackages`), so there is no separate build step for them.

## Local development

Create `apps/web/.env.local`:

```
DATABASE_URL=postgresql://architect:devpassword@localhost:5432/architectraits
S3_BUCKET=tradarchitecture-062214186260-us-east-1-an
AWS_REGION=us-east-1
ANALYZE_API_URL=http://localhost:3301   # for /analyze; points at apps/api
```

AWS credentials are read from `~/.aws` via the default credential chain (not set here).

```bash
pnpm db:up              # from repo root: Postgres (pgvector) in Docker
pnpm --filter web dev   # http://localhost:3300
```

For the `/analyze` flow, also run `apps/api` (`pnpm --filter api dev`). See the repo-root `README.md` for the full stack, data model, and deployment.

## Scripts

- `pnpm --filter web dev` — dev server on :3300
- `pnpm --filter web build` — standalone production build (used by the Docker image)
- `pnpm --filter web typecheck` — `tsc --noEmit`
- `pnpm --filter web lint` — ESLint
