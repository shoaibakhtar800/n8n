# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Next.js (App Router, TypeScript, Turbopack), Tailwind via PostCSS, tRPC, Prisma (PostgreSQL), Better Auth (+ Polar), Inngest, Sentry.
- Source root: src/ with feature-based modules (e.g., features/workflows) and app routes under src/app/.

Common commands
- Install deps: npm install
- Dev server: npm run dev (http://localhost:3000)
- Inngest local worker (run in a second terminal): npm run inngest
- Build: npm run build
- Start (prod): npm start
- Lint: npm run lint
- Format: npm run format
- Prisma
  - Generate client (required after schema changes): npx prisma generate
  - Create/migrate DB: npx prisma migrate dev
  - DB UI: npx prisma studio
- Tests: No test runner configured in this repo.

Environment
- DATABASE_URL (required by Prisma; provider: postgresql; see prisma/schema.prisma)
- POLAR_ACCESS_TOKEN and POLAR_SUCCESS_URL (Polar integration)
- VERCEL_URL (affects tRPC client base URL when server-side)
- Sentry is configured via @sentry/nextjs; upload of source maps is tuned for CI in next.config.ts
- Inngest AI functions use provider SDKs (@ai-sdk/*); set the SDKs’ standard API keys to execute those steps locally as needed

High-level architecture
- App routing (Next.js)
  - src/app/(auth)/*: public auth pages and layout
  - src/app/(dashboard)/*: authenticated app (split into (rest) and (editor) route groups)
  - API routes: /api/trpc (tRPC adapter), /api/auth (Better Auth handler), /api/inngest (Inngest serve)
- Data layer (Prisma)
  - prisma/schema.prisma defines models (User, Session, Account, Verification, Workflow)
  - Prisma client output is configured to src/generated/prisma and imported via src/lib/db.ts (singleton)
- Authentication and subscriptions
  - Better Auth with Prisma adapter (provider: postgresql)
  - Polar plugin provides checkout/portal; requireAuth/requireUnauth guards live in src/lib/auth-utils.ts
- tRPC
  - Server setup in src/trpc: init.ts (context, protectedProcedure, premiumProcedure), routers/_app.ts (root router)
  - Feature routers live with features (e.g., features/workflows/server/routers.ts)
  - Server utilities: server.tsx exposes trpc, prefetch(), HydrateClient for SSR + React Query hydration
  - Client: src/trpc/client.tsx creates the tRPC client and QueryClient provider
- Inngest
  - Client configured in src/inngest/client.ts; functions in src/inngest/functions.ts (examples call multiple AI providers)
  - Local development via npm run inngest alongside the Next dev server
- Observability
  - Sentry integrated via instrumentation.ts and wrapped Next config (withSentryConfig in next.config.ts)
- UI
  - Design system components in src/components/ui (Radix-based wrappers); higher-level app components in src/components

Conventions and config
- TypeScript path alias @/* -> ./src/* (see tsconfig.json)
- Linting/formatting via Biome (biome.json)
- Tailwind configured via @tailwindcss/postcss (postcss.config.mjs)
