# ArchitectrAIts

A traditional-architecture exploration platform. Browse and search a curated catalog of fine traditional architecture, or upload a photo of any building to get an AI-generated analysis and matches against the catalog.

**Status:** under construction.

## What's inside

- **`apps/web`** — Next.js frontend (gallery, detail pages, search, chat, visitor upload-and-analyze).
- **`apps/api`** — Node API serving the frontend and the visitor upload pipeline.
- **`apps/worker`** — Long-running ingest worker that processes new S3 objects.
- **`apps/admin`** — Internal admin for editing AI-tagged entries.
- **`packages/imgcore-node`** — C++ image-processing core, N-API addon target.
- **`packages/imgcore-wasm`** — Same C++ core, WebAssembly target via Emscripten.
- **`packages/shared`** — Zod schemas and TypeScript types shared across apps.
- **`infra/`** — Docker compose files, AWS CDK for Lambda@Edge, deploy scripts.

## Stack

- TypeScript end-to-end, pnpm monorepo.
- Next.js for the web frontend.
- Self-hosted Postgres (with `pgvector` + PostGIS) and Redis in Docker on a Lightsail VPS.
- AWS S3 for image storage; AWS Lambda@Edge for signed URLs and on-the-fly thumbnail transforms.
- Open-source LLMs via Together.ai or OpenRouter — Qwen VL for vision, an open chat model for chat, SigLIP/OpenCLIP for embeddings.
- C++ image processing built as both a Node N-API addon and a WebAssembly module from a single CMake source tree (perceptual hashing, dominant color extraction, gradient feature vector).
- Cloudflare Tunnel for ingress, Cloudflare Access on the admin route, Cloudflare Turnstile on the upload form.

## Development

(coming soon — populated as phases land)

## License

(TBD)
