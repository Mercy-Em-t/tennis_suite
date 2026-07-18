# Sprint 18 Walkthrough: Broadcaster Sandbox

I have fully implemented the Broadcaster / Graphics Sandbox incorporating the new **Dual-Layer Architecture** and **"Baddie" Aesthetic**!

You can test the Control Room by navigating to **http://localhost:3000/sandbox/broadcaster**.

## How to Test the Dual-Layer Setup
Because this sandbox relies on cross-window communication, you need to open both screens side-by-side:
1. Open the **Control Room** in your main browser window.
2. Click the **"Open Public Presentation Screen ↗"** button in the header. This will pop out the "Public Face" of the broadcast in a new window.
3. Align them side-by-side. 
4. Click any of the "Graphics Switcher" buttons (like *Sponsor Ribbon* or *Score Bug*) in the Control Room and watch them instantly animate in/out on the Presentation Screen!

## Key Features Implemented

### 1. Presentation Mode (Auto-Cycling)
The public screen is not just a static feed. In the Control Room, you can toggle:
- **AUTO CYCLE**: The public screen automatically rotates between the live Match Feed (10 seconds) and the full Tournament Standings/Bracket (5 seconds). This keeps audience engagement high even during downtime.
- **LOCK MATCH / LOCK BRACKET**: Overrides the auto-cycle to hold on a specific view indefinitely.

### 2. State-Driven Scorebug Binding
The Broadcaster has no write access to the score. The active match feed automatically consumes state data. When you change the "Active Match Feed" dropdown in the Control Room, the Scorebug on the public screen updates instantly with the new match details and simulated live score.

### 3. "Baddie" Aesthetic & CSS Animations
The Presentation Screen features:
- **Smooth cubic-bezier transitions** for lower-thirds sliding in/out.
- High-contrast, dynamic background gradients (simulating different camera angles you select from the Control Room).
- A continuous **"Next Up" animated ticker** running along the bottom.
- Glassmorphism effects (blurred backgrounds) on the standings board to elevate the professional feel.

### 4. Sponsor & Overlay Management
Dedicated toggles for the Rolex sponsor ribbon, player profiles, and the Tournament Watermark, all operating independently of the live scorebug. Also responds to global system suspensions from the Delegate.

---
Let me know if you want to tweak the auto-cycling timing or add any specific visual flourishes!
