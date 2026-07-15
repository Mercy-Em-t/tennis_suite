# Monthly Treasury Reconciliation

## Overview
This document outlines the Monthly Financial Ledger (The Treasury) loop. The financial agent is responsible for auditing Webhooks, balancing Ledgers, and ensuring zero-discrepancy distributions among the host, rainmaker (platform), and partners.

## Verification Agents
- **`loop2_treasury.test.ts`**: Simulates the financial agent operations.
  - Validates **Webhook Audit**, rejecting fraudulent or incorrectly signed payloads to maintain the integrity of the ledger.
  - Validates **Split-Transaction Balancing**, verifying that the mathematical splits across `LedgerEntry`, `RainmakerFee`, and `PartnerPayout` sum perfectly to the `grossAmount` ensuring a strict $0 discrepancy.

## Status
- **Tests Passing**: Verified
- **Discrepancy**: $0.00
- **State**: ACTIVE
