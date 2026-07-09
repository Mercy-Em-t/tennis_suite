# Subdomain Architecture & Routing Strategy

## Overview
Tennis Suite has transitioned to a **Subdomain-Driven Architecture**. This design physically decouples the heavy Application State Machine (React Contexts, WebSockets, Dashboards) from the fast, SEO-optimized Marketing Gateway.

- **`yourdomain.com` (Marketing Domain)**: Serves static, high-performance landing pages, public brackets, and onboarding documentation.
- **`app.yourdomain.com` (Application Domain)**: Serves the active dashboards, secure referee portals, and real-time operations.

---

## Directory Structure
To support this separation within a single Next.js Monorepo, the `src/app` directory was split using Next.js Edge Routing:

```text
src/
└── app/
    ├── (marketing)/         # Handled by yourdomain.com
    │   ├── page.tsx         # The Core Landing Page
    │   ├── about/
    │   └── contact/
    ├── app/                 # Handled by app.yourdomain.com
    │   ├── admin/           # Host / Admin Portal
    │   ├── referee/         # Referee / Umpire Portal
    │   ├── sandbox/         # Dev Sandbox Environments
    │   └── monitor/         # Real-time Telemetry
    └── api/                 # Global Backend API (Shared)
```

---

## Edge Proxy Execution (`src/proxy.ts`)
The `proxy.ts` file acts as the primary traffic controller for the entire ecosystem. It operates at the Edge, meaning it intercepts the HTTP request before the server even starts rendering a page.

### The Execution Order (How Authentication Works)
The proxy executes its logic in a strict, top-to-bottom sequence. This is how we guarantee that the `app.` subdomain does **NOT** bypass authentication.

1. **Step 1: The RBAC Gatekeeper**
   When a user requests `http://app.yourdomain.com/admin`:
   - The proxy reads the raw path: `/admin`.
   - It checks our `protectedPrefixes` array and identifies `/admin` as a highly classified route.
   - It immediately pauses the request and inspects the HTTP Cookies for a valid `auth_token` (JWT).
   - If the token is missing or invalid, the proxy **intercepts and redirects** the user back to `/login`.
   - If the token is valid, it decodes the payload, checks the user's `ROLE`, and ensures a `PLAYER` isn't trying to access the `/admin` portal.

2. **Step 2: The Gateway Redirects**
   - If an already-authenticated user accidentally navigates to the public `yourdomain.com/login`, the proxy intercepts this and auto-forwards them to their specific dashboard based on their role (e.g., auto-routing a referee to `/referee`).

3. **Step 3: The Subdomain Rewrite (The Magic)**
   - Only **after** the RBAC Gatekeeper has approved the user does the proxy look at the Hostname (`app.yourdomain.com`).
   - It sees the `app.` prefix and transparently **rewrites** the internal file path from `/admin` to `/app/admin`.
   - Next.js then serves the heavy React components from `src/app/app/admin/page.tsx` without the user's URL bar ever changing!

**Security Note:** Because the RBAC logic sits at the top of `proxy.ts` and the Subdomain Rewrite sits at the bottom, **it is mathematically impossible for a user to bypass authentication by typing `app.domain.com`.** The security gate triggers first!
