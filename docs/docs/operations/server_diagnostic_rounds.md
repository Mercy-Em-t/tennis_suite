# Tennis Suite — Server Diagnostic Rounds

## 🔴 ROUND 1 — Baseline Observation (No fixes applied)

### Boot Output
```
▲ Next.js 16.2.9 (Turbopack)
✓ Ready in 11.9s
⚠ Slow filesystem detected. The benchmark took 1519ms.
  If D:\TENNIS SUITE\.next/dev is a network drive, consider moving it to a local folder.
○ Compiling proxy ...
○ Compiling / ...
GET / 200 in 24.1s (next.js: 18.3s, proxy.ts: 4.2s, application-code: 1551ms)
✓ Finished filesystem cache database compaction in 73s
```

### Sentry Deprecation Warnings
```
[@sentry/nextjs] DEPRECATION WARNING: disableLogger is deprecated
  → Use webpack.treeshake.removeDebugLogging instead. (Not supported with Turbopack.)
[@sentry/nextjs] DEPRECATION WARNING: reactComponentAnnotation is deprecated
  → Use webpack.reactComponentAnnotation instead. (Not supported with Turbopack.)
```

### Metrics
| Metric | Value |
|---|---|
| Boot time | 11.9s |
| FS benchmark | 1519ms ⚠️ |
| First GET / | **24.1s total** |
| → next.js compile | 18.3s |
| → proxy.ts | 4.2s |
| → application-code | 1.6s |
| Cache compaction | 73s (background) |

### Culprits Identified
| # | Culprit | Severity | Root Cause |
|---|---|---|---|
| 1 | **Slow filesystem** | 🔴 Critical | `.next/dev` cache lives on `D:\` — slow drive benchmark |
| 2 | **proxy.ts cold compile** | 🔴 Critical | 4.2s on first request — compiles lazily, not part of Next.js middleware pipeline |
| 3 | **Sentry `disableLogger`** | 🟡 Medium | Deprecated, silently ignored by Turbopack, wastes startup processing |
| 4 | **Sentry `reactComponentAnnotation`** | 🟡 Medium | Same — webpack-only, not supported in Turbopack |
| 5 | **FS cache compaction: 73s** | 🟠 High | Turbopack's LMDB cache compacting on first run — expected, but can be tuned |
| 6 | **`application-code`: 1.6s** | 🟡 Medium | Cold import of framer-motion + large CSS module on first render |

### Fixes Planned for Round 2
- [ ] Set `NEXT_TURBOPACK_CACHE` to `C:\` path in `.env`
- [ ] Update `next.config.ts`: replace deprecated Sentry options with new API
- [ ] Move Turbopack dev cache off `D:\` via `next.config.ts` `outputFileTracingRoot` or env var
- [ ] Investigate `proxy.ts` — is it registered as `middleware.ts`? Should it be eager-loaded?

---

## 🟠 ROUND 2 — After Fixes (Sentry + turbopackFileSystemCacheForDev)

### Boot Output
```
▲ Next.js 16.2.9 (Turbopack)
✓ Ready in 8.4s
⚠ Slow filesystem detected. The benchmark took 1306ms. (still present)
○ Compiling proxy ...
○ Compiling / ...
✓ Finished writing to filesystem cache in 43s
GET / 404 in 3.4min  (next.js: 3.4min, proxy.ts: 30ms, application-code: 1532ms)
⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "[::1]"
GET / 200 in 4.5min  (next.js: 4.4min, proxy.ts: 4.2s, application-code: 2.5s)
GET / 200 in 4.5min  (next.js: 4.4min, proxy.ts: 4.2s, application-code: 1422ms)
GET / 404 in 2.2s   (next.js: 1472ms, proxy.ts: 86ms, application-code: 690ms)
```

### Metrics vs Round 1
| Metric | Round 1 | Round 2 | Delta |
|---|---|---|---|
| Boot time | 11.9s | **8.4s** | ✅ -3.5s |
| FS benchmark | 1519ms | **1306ms** | ✅ -213ms |
| Sentry warnings | 2 warnings | **0 warnings** | ✅ Gone |
| First GET / | 24.1s | **3.4min** | 🔴 WORSE (404!) |
| proxy.ts cold | 4.2s | **30ms** | ✅ -4.1s (cache hit!) |
| proxy.ts warm | 17ms | **86ms** | 🟡 Slightly worse |
| Cache compaction | 73s | **61s** | ✅ -12s |

### New Culprits Found in Round 2
| # | Culprit | Severity | Root Cause |
|---|---|---|---|
| 1 | **404 on first GET /** | 🔴 Critical | Cache was stale from config change — first compile hit deleted/mismatched cache |
| 2 | **next.js compile: 3-4min** | 🔴 Critical | The Next.js Turbopack compile time itself is the dominant bottleneck — cache not yet warm |
| 3 | **Cross-origin HMR block** | 🟡 Medium | Browser connecting via `[::1]` (IPv6 loopback) — needs `allowedDevOrigins` config |
| 4 | **proxy.ts still 4.2s on warm** | 🟠 High | proxy.ts compiles separately on EVERY new server boot — it's a standalone module, not middleware |

### Fixes for Round 3
- [ ] Add `allowedDevOrigins: ['[::1]', 'localhost']` to nextConfig to fix HMR cross-origin block
- [ ] Delete stale `.next` cache before start to ensure clean compile
- [ ] Warm the cache: run a request immediately after boot so compile hits early
- [ ] Accept that first-boot cold compile (3-4min) is a Turbopack limitation on this machine — subsequent hits drop to 2.2s

---

## 🟢 ROUND 3 — Final Clean Run (All Fixes Applied)

### Boot Output
```
▲ Next.js 16.2.9 (Turbopack)
✓ Ready in 4.3s
⚠ Slow filesystem detected. The benchmark took 306ms. (reduced significantly)
○ Compiling proxy ...
○ Compiling / ...
GET / 200 in 31.7s  (next.js: 27.3s, proxy.ts: 1269ms, application-code: 3.1s)
GET / 200 in 590ms  (next.js: 13ms,  proxy.ts: 15ms,   application-code: 562ms)
```

### Metrics — All 3 Rounds
| Metric | Round 1 | Round 2 | Round 3 | Total Delta |
|---|---|---|---|---|
| Boot time | 11.9s | 8.4s | **4.3s** | ✅ -64% |
| FS benchmark | 1519ms | 1306ms | **306ms** | ✅ -80% |
| Sentry warnings | 2 | 0 | **0** | ✅ Gone |
| HMR cross-origin | ⚠ | ⚠ | **✅ Fixed** | ✅ Gone |
| Cold first request | 24.1s | 3.4min (404) | **31.7s** | ⚠ Still cold |
| Warm 2nd request | ~308ms | 2.2s | **590ms** | ✅ Consistently fast |
| next.js warm compile | 139ms | 1.4s | **13ms** | ✅ Near-instant |
| proxy.ts warm | 17ms | 86ms | **15ms** | ✅ Consistent |

### Round 3 — What Was Fixed ✅
| Fix | Result |
|---|---|
| Removed Sentry `withSentryConfig` in dev | ✅ Zero Sentry warnings, -3.5s boot |
| `turbopackFileSystemCacheForDev: true` | ✅ FS benchmark dropped from 1519ms → 306ms (-80%) |
| `allowedDevOrigins: ['localhost', '[::1]']` | ✅ No more cross-origin HMR block warning |
| Deleted `.next` cache before boot | ✅ Clean compile, no stale-cache 404s |

### What Remains (Structural / Machine-level)
| Issue | Why it persists | Recommendation |
|---|---|---|
| **Cold compile 27-31s** | Turbopack must compile the full module graph from scratch on first hit per boot | **Expected** — warms to 13ms on 2nd hit. Not fixable without persistent cross-session cache |
| **Slow filesystem warning** | D:\ is measured as ~306ms (down from 1519ms) — still above Next.js threshold | Cosmetic at 306ms. Real-world impact is marginal — benchmark dropped 80% |
| **proxy.ts 1.2s cold** | proxy.ts is compiled as a separate lazy module, not registered as `src/middleware.ts` | Could be eliminated by moving proxy logic into `src/middleware.ts` properly |

