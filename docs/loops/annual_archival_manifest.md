# Annual Archival Manifest

## Overview
This document outlines the Annual Regulatory Archival (Data Cleanup) loop. It is designed to export finalized tournament data to cold storage and prune heavy JSON blobs and log rows from the active PostgreSQL database, optimizing indexing trees for current tournaments.

## Verification Agents
- **`loop3_archival.test.ts`**: Simulates the system teardown of a finalized tournament.
  - Validates **Flat-File Export**, ensuring `Match` and `AuditLog` rows are serialized and written to a secure `.json` backup file.
  - Validates **Active DB Pruning**, guaranteeing the transaction safely deletes raw `AuditLog` rows and nullifies the heavyweight `previousScoreState` JSON string field to prevent indexing bloat.

## Status
- **Tests Passing**: Verified
- **Active Size Reduction**: Pruned efficiently
- **State**: ACTIVE
