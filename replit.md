# ShopFlow

A full e-commerce web application with product catalog, cart, checkout, user authentication, and an admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, accessible at `/api`)
- `pnpm --filter @workspace/store run dev` — run the storefront (port varies, accessible at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, wouter (routing), TanStack Query
- API: Express 5, JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/store/` — React + Vite frontend (storefront)
  - `src/pages/` — all page components (home, products, cart, checkout, orders, auth, admin)
  - `src/components/layout.tsx` — main nav/footer layout
  - `src/lib/auth.tsx` — AuthContext + useAuth hook
  - `src/lib/queryClient.ts` — TanStack Query client + API setup
- `artifacts/api-server/` — Express 5 API server
  - `src/routes/` — route handlers (auth, products, categories, cart, orders, users, stats)
  - `src/middlewares/auth.ts` — JWT requireAuth / requireAdmin middleware
  - `src/db/schema.ts` — Drizzle ORM schema (source of truth for DB)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/api.ts` — generated TanStack Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas

## Architecture decisions

- JWT stored in localStorage; `setAuthTokenGetter` injects Bearer token into every API call via the custom fetch wrapper.
- Admin vs User roles enforced both in API middleware (`requireAdmin`) and frontend route guards.
- OpenAPI-first: all hooks and Zod schemas are generated from `openapi.yaml` — never edit generated files directly.
- Orval-generated hooks require `queryKey` in the `query` option object (React Query v5 strict typing); always pass it explicitly.
- API and frontend served through a shared reverse proxy — use relative URLs in app code, `localhost:80/api/...` for curl.

## Product

- **Storefront**: hero section, product catalog with category + search filters, product detail pages, add-to-cart, cart management, checkout flow, order history and tracking.
- **Auth**: JWT-based sign-in / sign-up. Roles: `admin` and `user`.
- **Admin dashboard**: stats overview, top-selling products, recent orders, product CRUD, order status management, user list.

## Demo accounts

- Admin: `admin@shopflow.com` / `admin123`
- User: `user@shopflow.com` / `user123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always pass `queryKey` explicitly when using generated hooks with conditional `enabled`: `{ query: { queryKey: getXxxQueryKey(), enabled: condition } }`
- CSS `@import url(...)` for Google Fonts must come before `@import "tailwindcss"` to avoid PostCSS warnings.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before editing frontend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
