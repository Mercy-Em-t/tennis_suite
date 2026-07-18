# Sprint 19 Walkthrough: Network Admin Sandbox

I have fully implemented the Network Admin (IT Command Center) Sandbox!

You can test the NOC (Network Operations Center) by navigating to **http://localhost:3000/sandbox/network**.

## Key Features Implemented

### 1. The Theme Toggle
By default, the dashboard launches in the requested **TERMINAL** aesthetic (Dark mode, Fira Code monospace font, bright green `#3fb950` borders, and terminal text-shadows). 
If a user prefers a standard view, they can click the Theme Toggle in the header to instantly switch to the **MODERN** aesthetic, aligning it with the rest of the Tennis Suite standard UI.

### 2. Device Fleet Management
The main grid displays a simulated fleet of Umpire, Marshall, Broadcast, and Host devices.
- It dynamically tracks simulated Battery Life, Signal Strength, and Ping Latency.
- **Critical Alerts**: If a device drops offline, its battery drops below 20%, or latency spikes above 500ms, the card visually shifts to a critical red state.
- **Remote Restart**: The Network Admin has remote intervention capabilities. Clicking "REMOTE RESTART" triggers a simulated reboot cycle (`REBOOTING...` -> `SYNCING...` -> `ONLINE`), demonstrating how the system recovers a dropped connection.

### 3. Edge Database Node & Coldstarts
The sidebar features the Database module.
- You can simulate a server failure by clicking **"SIMULATE NODE SLEEP"**. This drops the database latency to `N/A`.
- Once asleep, the Network Admin can click **"INITIATE COLDSTART"**, which simulates a multi-second boot sequence before the node returns to an `AWAKE` state.
- When awake, you can click **"PING DATABASE"** to force a manual latency check.

### 4. Dynamic State Simulation
Behind the scenes, `useNetworkState.ts` runs an interval every 3 seconds that slightly fluctuates the latency and signal strength of all online devices. This ensures the dashboard feels alive and reactive, exactly like a real NOC.

---
Let me know what you think of the Terminal mode!
