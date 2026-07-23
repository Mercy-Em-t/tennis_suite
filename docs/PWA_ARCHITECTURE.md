# PWA Architecture: Tennis Suite

We have implemented a native Next.js Progressive Web App (PWA) configuration explicitly tuned for the **Referee Console** (`/referee`). This document explains the architecture and how to scale it for additional PWAs (e.g., a "Generic User Dashboard") in the future.

## Current Setup (Route A: Dedicated Referee App)
- **Manifest:** Handled programmatically via `src/app/manifest.ts`. Next.js automatically mounts this at `/manifest.webmanifest`.
- **Service Worker:** A highly optimized vanilla `public/sw.js` script handles Network-First caching. It completely bypasses API routes so the live scoring dashboard never gets stuck on stale data.
- **Offline Fallback:** `public/offline.html` is served when the referee's device loses network connection.
- **Registry:** `src/components/PwaRegistry.tsx` attaches the Service Worker on load.

## Future Path: Adding a Second Generic PWA (Multi-PWA Setup)

When you are ready to have a second installable PWA for Directors or Players that defaults to `/` instead of `/referee`, you cannot simply have two root manifests. However, Next.js allows you to route manifests dynamically.

### Steps to Implement a Multi-Manifest Strategy

1. **Convert `manifest.ts` into a dynamic API route or middleware rewrite:**
   Instead of a static `manifest.ts`, create a dynamic route like `src/app/api/manifest/route.ts` that detects the user's role (or URL subdomain) and serves the appropriate JSON.

   *Example snippet:*
   ```typescript
   export async function GET(request: Request) {
     const isReferee = request.url.includes('referee'); // Or check cookies
     
     const manifest = {
       name: isReferee ? 'Referee Console' : 'Tennis Suite',
       start_url: isReferee ? '/referee' : '/',
       display: 'standalone',
       // ...
     };

     return Response.json(manifest);
   }
   ```

2. **Dynamically Inject the Manifest Link in Layout:**
   Update `src/app/layout.tsx` to conditionally link the correct manifest endpoint based on where the user is currently browsing.

3. **Service Worker Scoping:**
   If the two apps have vastly different offline requirements, you can register two different service workers by specifying their `scope`.
   *Example:*
   ```javascript
   navigator.serviceWorker.register('/sw-referee.js', { scope: '/referee/' });
   navigator.serviceWorker.register('/sw-main.js', { scope: '/' });
   ```

By following this trail, you can effortlessly branch out from the current Dedicated Referee App to a massive Multi-App Ecosystem while reusing the same underlying Next.js server!
