<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
<!-- # AI Coding Agent Instructions - Tennis Suite Project

## Project Context
This project is a modern, full-stack tennis tournament management system built with Next.js 14 (App Router), TypeScript, PostgreSQL, and specialized AI/ML components for officiating and analytics.

## Coding Conventions & Style

### React & TypeScript Best Practices
- **Strict Typing**: Use strict TypeScript. No `any` types unless absolutely necessary (and if so, document why).
- **Component Structure**:
  - Functional components with arrow functions.
  - Server Components by default; use `'use client'` explicitly when client-side interactivity (hooks, state) is required.
  - Separate logic (hooks, services) from UI components.
- **Styling**:
  - Use [Tailwind CSS](https://tailwindcss.com/) for all styling.
  - Keep styles utility-first.
  - Use `cn()` function (e.g., `import { cn } from '@/lib/utils'`) for conditional class merging.
  - Avoid inline `style={}` objects for static values; use Tailwind classes instead.

### File Organization
- **App Router**: Follow the `app/` directory structure.
- **Component Location**: Place components in `src/components/`.
  - Reusable UI components: `src/components/ui/` (e.g., `Button.tsx`, `Card.tsx`).
  - Specialized components: `src/components/tennis/` (e.g., `Scoreboard.tsx`, `Bracket.tsx`).
- **Services & Hooks**: Place custom logic in `src/lib/` and `src/hooks/`.
- **Constants & Types**: Place shared constants and types in `src/lib/constants.ts` and `src/types/`.

## Code Quality Standards
- **DRY Principle**: Do not repeat code. Extract common logic into reusable components or hooks.
- **Immutability**: Do not mutate state directly. Always use `setState` or proper Redux/Zustand patterns.
- **Error Handling**: Implement robust error boundaries and user-friendly error messages.

## Specific Module Guidelines

### 1. Referees Module (Next.js Middleware)
- **Purpose**: Provides role-based access control (RBAC) for referees.
- **Key Files**:
  - `src/middleware.ts`: Main entry point for middleware logic.
  - `src/lib/auth.ts`: Authentication helpers.
- **Requirements**:
  - Strictly enforce the "Gate 2" policy: Referees can *only* access the referee dashboard via the dedicated `/referee` path.
  - No direct links to referee functionality from other pages.

### 2. AI & Data Analytics Modules
- **Services**: Use `src/lib/ai/` for all AI-related logic.
- **Data Layer**:
  - Use Prisma or Supabase client for database operations.
  - Ensure all queries are type-safe and optimized.

### 3. Tennis Engine & UI
- **Score Logic**: Implement using the `TennisEngine` class from `src/lib/tennis/`.
- **UI Components**:
  - Keep UI components clean and focused on presentation.
  - Use `framer-motion` for professional animations where appropriate.

## Testing Requirements
- **Unit Tests**: Create unit tests for complex logic (e.g., tennis engine, AI algorithms). -->
<!-- - **Test Files**: Place test files in a `__tests__` directory next to the file being tested.
- **Tooling**: Use Jest or Vitest (specify which one is configured in `.gitignore` or `package.json`). -->
