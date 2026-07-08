# Sprint 17 Walkthrough: God-Mode Delegate Sandbox

I have successfully implemented the "God-Mode" Delegate Sandbox based on the strict UI/UX guidelines! You can test it by navigating to **http://localhost:3000/sandbox/delegate**.

## Sandbox Features Implemented

### 1. Global Dashboard Abstraction
Just like the Host, the Delegate first lands on a global view of all tournaments they oversee. Clicking a tournament card routes them into the high-stakes "Command Center".

### 2. The 4-Tier Module Architecture
The dashboard is split into the logical blocks you requested:
- **I. Command (Broadcasts)**: Allows the delegate to inject messages to specific roles (Hosts, Referees, Marshalls) or ALL roles. Checking "Emergency Override" flags the message critically in the audit log.
- **II. Direct (Interventions)**: Houses the high-impact actions like *Manual Score Override*, *Disqualify Player*, and *Reseed Bracket*.
- **III. Audit Trail**: An immutable, real-time scroll of every action taken in the tournament.
- **IV. Treasury**: Displays high-level financials and includes a "Mock Issue Refund" capability.

### 3. "Safety-First" Protocols
To prevent accidental or unauthorized high-impact actions, we implemented several safety layers:
- **The "Unlock" Protocol**: By default, all Direct Interventions and Treasury actions are disabled/grayed out. The Delegate must manually check the **Safety Protocol: UNLOCKED** toggle.
- **High-Contrast Shift**: When unlocked, the UI shifts its accents from standard blue to a jarring red (`#f85149`) to visually signify danger.
- **The "Why" Prompt**: Clicking any override action (or a refund) opens a massive, dark overlay modal demanding a typed justification. You cannot commit the action if the text box is empty. This reasoning is automatically appended to the public Audit Trail.
- **Auto-Locking**: Once an action is committed, the Safety Protocol automatically locks itself back down.

### 4. The Kill Switch
- Placed prominently in the header.
- Triggering it opens the mandatory "Why" prompt.
- Once committed, it throws a massive, translucent red `SYSTEM SUSPENDED` overlay across the entire screen (simulating the halting of all matches). 
- The Delegate can easily click the Kill Switch again to revoke the suspension and bring the tournament back online.

## Next Steps
> **Tip:** This environment is running on local storage! I encourage you to hit the "Unlock" toggle, trigger the Kill Switch, type out a justification, and watch it populate the Audit Trail!

If there are any further refinements for the Delegate's layout, feel free to update the sprint notes!
