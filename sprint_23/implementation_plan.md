# Sprint 23 — Tennis Suite Smartwatch Extension

## Overview

This sprint builds a smartwatch-compatible extension of the Tennis Suite platform. The goal is to allow referees, players, marshals, and broadcasters to interact with live tournament data from their wrists.

---

## 🔬 Research Findings — How Smartwatches Actually Connect

### The Hard Truth About Web Apps & Watches

> **PWAs cannot be installed on smartwatches.** Neither Apple Watch nor Wear OS support installable PWAs or WebViews on the watch face. This is a platform-level restriction.

The only viable paths are:

| Approach | Description | Feasibility |
|---|---|---|
| **Native Wear OS app** (Kotlin + Compose for Wear) | Connects directly to Tennis Suite REST/WS API | ✅ Best for Android |
| **Native watchOS app** (Swift + WatchKit) | Uses URLSessionWebSocketTask to hit the API | ✅ Best for iOS |
| **Push Notification mirroring** | Web server → mobile push → OS mirrors to watch | ✅ Works now, zero code |
| **Web Bluetooth (BLE)** | Browser ↔ smartwatch direct | ❌ Not supported by watchOS/Wear OS |
| **Watch-optimized web page** | Tiny HTML page for Samsung Internet browser | 🟡 Limited, no install |

---

## 🏗️ Architecture — The Bridge Model

```
┌─────────────────────────────────────────────────────────┐
│                   TENNIS SUITE BACKEND                   │
│         (Supabase + Next.js API + WebSocket)            │
└────────────────────┬────────────────────────────────────┘
                     │  REST / WebSocket
         ┌───────────┼───────────┐
         ▼           ▼           ▼
   ┌──────────┐ ┌─────────┐ ┌──────────────┐
   │  Browser │ │ Android │ │     iOS      │
   │  (Web)   │ │  Phone  │ │    Phone     │
   └──────────┘ └────┬────┘ └──────┬───────┘
                     │ BT/WiFi     │ BT
                     ▼             ▼
              ┌─────────────┐ ┌──────────┐
              │  Wear OS    │ │  watchOS │
              │  Watch App  │ │ Watch App│
              │  (Kotlin)   │ │  (Swift) │
              └─────────────┘ └──────────┘
```

### How the phone-to-watch bridge works

**Android (Wear OS):**
- Wear OS watch app connects via Wi-Fi or Bluetooth tethering to reach the internet
- App uses Retrofit for REST calls + OkHttp WebSocket for real-time
- No phone app required — watch connects to Tennis Suite API directly when on Wi-Fi
- When on BT only: phone acts as relay via Wearable Data Layer API

**Apple Watch (watchOS):**
- URLSessionWebSocketTask available since watchOS 6 — native WebSocket support
- Foreground-only connection (Apple kills background sockets)
- APNs push notifications used for background score alerts
- iPhone companion app optional but recommended for auth token relay

---

## 📱 Phase 1 — What We Build First (This Sprint)

### Part A: Backend API Enhancements (Next.js — this repo)

Add watch-optimized API endpoints that return minimal payloads suitable for small screens.

#### New endpoints:
```
GET  /api/watch/match/:matchId        → compact score state
GET  /api/watch/tournament/:id        → minimal tournament status
POST /api/watch/score                 → referee submits a point
GET  /api/watch/notifications/:userId → pending alerts
WS   /api/watch/live/:matchId         → real-time score stream
```

#### Watch payload format (ultra-minimal JSON):
```json
{
  "m": "Federer v Nadal",
  "s": "3-2, 40-15",
  "st": "serving",
  "t": 1720595234
}
```

### Part B: Watch-Optimized UI (Browser Simulator)

Build /watch route in Next.js as a visual design playground — a web-rendered simulation of the watch UI at 390x390px circular viewport, so we can design and iterate without needing a physical watch.

#### Watch screen routes:
```
/watch                → watch home / role selector
/watch/score/:matchId → referee scoring interface
/watch/live/:matchId  → live score display (player/fan)
/watch/alert          → notification center
/watch/status         → tournament status at a glance
```

### Part C: Wear OS Native App Scaffold

Kotlin + Jetpack Compose for Wear OS project that:
- Authenticates using the same JWT token from the Next.js API
- Opens a WebSocket to /api/watch/live/:matchId
- Displays score in real-time with haptic feedback on point scored
- Allows referee to tap + buttons to add points

### Part D: Push Notification Bridge (Zero-cost quick win)

Wire APNs/FCM push through the existing notification system so that:
- Score updates are pushed to phone, mirrored to watch automatically
- Works on ALL watches immediately with no native app
- Referee sees point-scored haptic pulse on wrist

---

## 📐 Watch UI Design Principles

| Constraint | Rule |
|---|---|
| Screen size | Design for 390x390px (Galaxy Watch 6) and 44mm (Apple Watch) |
| Shape | Circular — avoid corners, keep content in the center 70% |
| Interaction | Tap targets min 48px — finger on a wrist is imprecise |
| Content | Max 3 lines of text visible at once |
| Colors | High contrast dark theme — OLED displays, readability in sunlight |
| Animations | Minimal — battery and GPU constrained |
| Haptics | On every point scored — tactile confirmation |

---

## 🗂️ Files to Create

### Backend (this Next.js repo)
```
src/app/api/watch/
  match/[matchId]/route.ts
  tournament/[id]/route.ts
  score/route.ts
  live/[matchId]/route.ts
  notifications/[userId]/route.ts

src/app/watch/
  layout.tsx
  page.tsx
  score/[matchId]/page.tsx
  live/[matchId]/page.tsx
  alert/page.tsx
  status/page.tsx

src/components/watch/
  WatchFrame.tsx
  WatchScoreDisplay.tsx
  WatchScoringPad.tsx
  WatchAlertCard.tsx
  WatchStatusPill.tsx
```

### Watch App (Kotlin / Wear OS)
```
watch-app/
  README.md
  app/src/main/
    MainActivity.kt
    screens/
      HomeScreen.kt
      ScoringScreen.kt
      LiveScoreScreen.kt
    data/
      TennisSuiteApi.kt
      WatchWebSocketClient.kt
    theme/
      WatchTheme.kt
```

---

## 🎯 Use Cases Per Role

| Role | Watch Use Case |
|---|---|
| Referee | Tap to award points mid-match, hands-free scoring |
| Player | See live score / set progress between games |
| Marshal | Receive court assignment alerts, match start pings |
| Broadcaster | Live score ticker on wrist during commentary |
| Host/Organizer | Tournament dashboard at a glance, incident alerts |

---

## ✅ Acceptance Criteria

- [ ] /api/watch/* endpoints return compact payloads under 200 bytes
- [ ] /watch route renders a circular 390x390 watch simulator in browser
- [ ] Referee can award a point from the watch scoring pad
- [ ] Live score updates via WebSocket within 200ms
- [ ] Push notifications mirror to watch via FCM/APNs
- [ ] Wear OS scaffold compiles and connects to local API
- [ ] All watch UI components pass 48px minimum tap target check
- [ ] Dark OLED theme applied throughout watch views

---

## 🔗 Platform Prerequisites for Users

### Android (Galaxy Watch / Pixel Watch)
1. Install Galaxy Wearable or Wear OS by Google app on phone
2. Pair watch via Bluetooth
3. Install Tennis Suite for Wear from Play Store (once published)
4. Sign in — JWT shared via Data Layer API

### Apple Watch
1. Apple Watch must be paired to iPhone via the Watch app
2. Install Tennis Suite iOS companion app
3. Watch app appears automatically after iPhone install
4. Auth token synced from iPhone to watch via WatchConnectivity WCSession

---

## ⚠️ Open Questions

1. Which watch platform first? Recommendation: Wear OS (Android) — Kotlin is more accessible, emulator works well
2. Standalone or companion? Recommendation: Direct API connection (standalone) — more resilient, no phone dependency
3. Referee scoring from watch — full point-by-point UI, or just +Point and Fault buttons?
