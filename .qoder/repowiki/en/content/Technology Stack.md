# Technology Stack

<cite>
**Referenced Files in This Document**   
- [package.json](file://package.json)
- [next.config.ts](file://next.config.ts)
- [auth.ts](file://src/lib/auth.ts)
- [prisma.ts](file://src/lib/prisma.ts)
- [auth-client.ts](file://src/lib/auth-client.ts)
- [query-provider.tsx](file://src/lib/query-provider.tsx)
- [app/page.tsx](file://app/page.tsx)
- [components/ui/button.tsx](file://components/ui/button.tsx)
- [prisma/schema.prisma](file://prisma/schema.prisma)
</cite>

## Table of Contents
1. [Next.js 15 with React 19](#nextjs-15-with-react-19)
2. [TypeScript](#typescript)
3. [Prisma ORM](#prisma-orm)
4. [Better Auth](#better-auth)
5. [Tailwind CSS](#tailwind-css)
6. [React Query](#react-query)
7. [Radix UI](#radix-ui)
8. [PostgreSQL](#postgresql)
9. [Integration and Scalability](#integration-and-scalability)

## Next.js 15 with React 19

Next.js 15 serves as the full-stack framework for BigMatch, enabling server-side rendering (SSR), static site generation (SSG), and client-side rendering within a unified architecture. Paired with React 19, it leverages modern React features such as Actions, Server Components, and improved streaming capabilities for enhanced performance and developer experience.

The framework is configured via `next.config.ts`, where standard defaults are used, allowing seamless integration with other tools in the stack. API routes are colocated under the `app/api` directory, following the App Router pattern, enabling clean separation of concerns and file-based routing.

Next.js 15's React Server Components reduce client-side JavaScript payload, improving load times and SEO. The use of React 19 Actions in files like `app/actions/sign-in.ts` enables direct form handling on the server, reducing boilerplate and enhancing security.

This combination was chosen for its robust ecosystem, excellent TypeScript support, and ability to scale from small dashboards to complex real-time applications like live match tracking.

**Section sources**
- [next.config.ts](file://next.config.ts#L1-L8)
- [app/actions/sign-in.ts](file://app/actions/sign-in.ts)
- [app/page.tsx](file://app/page.tsx)

## TypeScript

TypeScript is used throughout the codebase to enforce type safety, improve code maintainability, and reduce runtime errors. It is configured via `tsconfig.json` (inferred from project structure) and integrated with all core tools including Next.js, Prisma, and React.

The `src/types` directory contains domain-specific type definitions for events, matches, rankings, and tournaments, ensuring consistent data structures across frontend and backend. These types are used in API route handlers, React components, and service utilities.

TypeScript's strict mode ensures null safety and enforces explicit typing, which is critical in a data-intensive application like BigMatch. Integration with Prisma generates type-safe database models, while React components benefit from precise prop typing via interfaces.

This choice enhances developer productivity through better autocompletion, refactoring support, and early error detection—key for a growing codebase with multiple contributors.

**Section sources**
- [src/types/event.ts](file://src/types/event.ts)
- [src/types/match.ts](file://src/types/match.ts)
- [tsconfig.json](file://tsconfig.json)

## Prisma ORM

Prisma ORM provides a type-safe and intuitive way to interact with the PostgreSQL database. It acts as the primary data access layer, abstracting raw SQL queries into a fluent, Promise-based API.

The Prisma Client is initialized in `src/lib/prisma.ts`, where it is enhanced with `@prisma/extension-accelerate` for improved performance through query acceleration. A global singleton pattern prevents multiple instances in development, ensuring efficient connection handling.

Database schema is defined in `prisma/schema.prisma`, with migrations managed via the Prisma CLI. The migration history in `prisma/migrations` shows incremental evolution of the schema, including user roles, event privacy settings, and match systems.

Prisma integrates tightly with Better Auth for user management and with API routes for CRUD operations. Its generated client ensures compile-time safety and eliminates SQL injection risks.

Chosen for its developer-friendly syntax, strong TypeScript integration, and powerful migration system, Prisma enables rapid iteration without sacrificing data integrity.

**Section sources**
- [src/lib/prisma.ts](file://src/lib/prisma.ts#L1-L14)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [prisma/migrations](file://prisma/migrations)

## Better Auth

Better Auth is the authentication solution powering user sessions, social login, and role-based access control. It is configured in `src/lib/auth.ts` using a Prisma adapter to persist user data in PostgreSQL.

The configuration includes Google OAuth integration via environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and telemetry settings for debugging. The auth instance is used in API routes under `app/api/auth/[...all]/route.ts` to handle sign-in, sign-up, and session validation.

On the client side, `createAuthClient` from `better-auth/react` is used in `src/lib/auth-client.ts` to provide hooks like `useSession`, `signIn`, and `signOut`. This enables seamless session management across server and client components.

Better Auth was selected for its modern API, excellent TypeScript support, and built-in security practices such as secure cookie handling and CSRF protection. It simplifies complex auth flows while remaining extensible for custom role logic.

**Section sources**
- [src/lib/auth.ts](file://src/lib/auth.ts#L1-L20)
- [src/lib/auth-client.ts](file://src/lib/auth-client.ts#L1-L8)
- [app/api/auth/[...all]/route.ts](file://app/api/auth/[...all]/route.ts)

## Tailwind CSS

Tailwind CSS is the utility-first styling framework used for rapid UI development. It is configured via `tailwind.config.mjs` (inferred from project structure) and integrated with Next.js using PostCSS.

Styles are applied directly in JSX using class names, enabling highly readable and maintainable UI components. The `components/ui` directory contains reusable styled components (e.g., buttons, cards, inputs) built with Tailwind and Radix UI.

The `app/globals.css` file includes Tailwind directives and custom theme extensions via `@layer` rules. Animations are enhanced with `tw-animate-css` for smooth transitions in dashboards and live views.

Tailwind was chosen for its developer velocity, responsive design capabilities, and consistency across devices. It eliminates the need for CSS-in-JS overhead while supporting dark mode via `next-themes`.

**Section sources**
- [app/globals.css](file://app/globals.css)
- [components/ui/button.tsx](file://components/ui/button.tsx)
- [postcss.config.mjs](file://postcss.config.mjs)

## React Query

React Query (TanStack Query) manages client-side data fetching, caching, and synchronization with the server. It is configured in `src/lib/query-provider.tsx`, where a `QueryClient` is initialized with a 1-minute stale time and single retry policy.

The provider wraps the application in layout components, making query hooks available throughout the component tree. Custom hooks like `useEvents`, `useMatches`, and `useEvent` in `src/hooks` abstract API calls using Axios and React Query’s `useQuery` and `useMutation`.

Devtools are included for debugging network requests and cache behavior during development. React Query reduces boilerplate by automatically handling loading, error, and refetch states.

This library was selected for its powerful caching strategy, background refetching, and mutation optimization—critical for real-time features like live score updates and dynamic dashboards.

**Section sources**
- [src/lib/query-provider.tsx](file://src/lib/query-provider.tsx#L1-L31)
- [src/hooks/useEvents.ts](file://src/hooks/useEvents.ts)
- [src/lib/api.ts](file://src/lib/api.ts)

## Radix UI

Radix UI provides accessible, unstyled UI primitives that form the foundation of the component library. Components like `AlertDialog`, `Select`, and `Label` are imported from `@radix-ui/react-*` packages and styled with Tailwind.

These primitives are re-exported and enhanced in the `components/ui` directory, ensuring consistent behavior and accessibility (ARIA compliance) across the app. For example, `alert-dialog.tsx` wraps Radix’s dialog with Tailwind styling and app-specific logic.

Radix UI was chosen for its focus on accessibility, keyboard navigation, and zero runtime overhead. It enables building fully accessible dashboards and forms without sacrificing design flexibility.

**Section sources**
- [components/ui/alert-dialog.tsx](file://components/ui/alert-dialog.tsx)
- [components/ui/select.tsx](file://components/ui/select.tsx)
- [package.json](file://package.json#L15-L18)

## PostgreSQL

PostgreSQL is the primary relational database, chosen for its reliability, extensibility, and support for complex queries and constraints. It stores all application data including users, events, matches, and rankings.

The schema is managed via Prisma Migrate, with versioned SQL files in `prisma/migrations`. Features like enums (e.g., event status), foreign keys, and unique constraints ensure data consistency.

PostgreSQL’s JSON support and full-text search capabilities are leveraged for event search and filtering. The use of Prisma’s PostgreSQL adapter ensures optimal query generation and type safety.

This database was selected for its ACID compliance, strong community support, and compatibility with Vercel’s Postgres offering for production deployment.

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [prisma/migrations](file://prisma/migrations)
- [src/lib/prisma.ts](file://src/lib/prisma.ts#L5-L6)

## Integration and Scalability

The BigMatch technology stack is designed for seamless integration and horizontal scalability. Next.js 15 with React 19 enables full-stack rendering, reducing latency and improving SEO. TypeScript ensures type safety across layers, while Prisma provides a unified data access interface.

Better Auth integrates with PostgreSQL via Prisma and exposes secure endpoints consumed by React Query on the client. Tailwind and Radix UI enable rapid, consistent UI development, while React Query manages data synchronization efficiently.

All components are loosely coupled, allowing independent scaling of API routes, authentication, and database layers. The use of Vercel Analytics and Prisma Accelerate further enhances observability and performance.

Best practices followed:
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://docs.better-auth.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs)
- [PostgreSQL Official Site](https://www.postgresql.org/docs/)

This stack balances developer experience with production readiness, making it ideal for scalable, maintainable full-stack applications.

**Section sources**
- [package.json](file://package.json)
- [next.config.ts](file://next.config.ts)
- [src/lib](file://src/lib)
- [app/api](file://app/api)