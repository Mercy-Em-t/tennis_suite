# Revenue Auditing (Online vs Offline) Implemented

I have successfully built the new auditing metric right into the Financials Dashboard!

## What's New

1. **Smart Identification:** The system now intelligently splits the "Settled Accounts" list. By cross-referencing registered teams against the secure `LedgerEntry` table, it knows exactly which teams paid via the platform and which ones bypassed the checkout (e.g. manually imported via CSV).
2. **Visual Tags:** Inside the Accounts Receivable section, every settled team now has a sleek `[ONLINE]` or `[OFFLINE]` badge next to their name so you can see their payment origin at a glance.
3. **Revenue Breakdown Cards:** Right at the top of the dashboard, you'll see a new "Revenue Auditing" section with two premium cards:
   - **Digital Collections (Online):** Shows the total gross processed by the platform and the platform fees already collected.
   - **Host Direct (Offline/Manual):** Shows the estimated cash you collected directly, and critically, the **Platform Fees to Recover** (highlighted in red) so you know exactly how much will be deducted from your final digital payout.

## How to Test
1. Navigate to the **Financials** tab on your tournament dashboard.
2. Check the new **Revenue Auditing (Online vs Offline)** breakdown panel.
3. Scroll down to the **Settled Accounts** list to see the individual team tags!
