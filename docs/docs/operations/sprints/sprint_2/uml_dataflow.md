# Workflow & Systems Modeling

## 1. Activity UML: Matchmaking & Scoring (Player Journey)

```mermaid
stateDiagram-v2
    [*] --> LFG_Queue
    LFG_Queue --> Matching: System analyzes Elo
    
    state Matching {
        [*] --> CheckPool
        CheckPool --> WithinThreshold: Diff < 10%
        CheckPool --> Wait: Diff > 10%
        WithinThreshold --> [*]
    }
    
    Matching --> MatchConfirmed: Players Accept
    MatchConfirmed --> MatchInProgress: Court Scheduled
    
    state MatchInProgress {
        [*] --> PlayPoint
        PlayPoint --> UpdateScore: Submit via App
        UpdateScore --> BroadcastSSE: Emit to listeners
        UpdateScore --> CheckWinCondition
        CheckWinCondition --> PlayPoint: Match continues
        CheckWinCondition --> [*]: Match won
    }
    
    MatchInProgress --> MatchComplete
    MatchComplete --> UpdateRankings: Increment/Decrement XP & Elo
    UpdateRankings --> [*]
```

## 2. Activity UML: Automated Court Scheduling (Facility Manager Journey)

```mermaid
stateDiagram-v2
    [*] --> MatchConfirmed
    MatchConfirmed --> CheckAvailability
    
    state CheckAvailability {
        [*] --> ScanGrid
        ScanGrid --> FindSlot: Duration + 10m Buffer
        FindSlot --> Conflict: Overlap detected
        FindSlot --> ValidSlot: Space clear
        Conflict --> ScanGrid: Next time block
        ValidSlot --> [*]
    }
    
    CheckAvailability --> CourtAssigned
    CourtAssigned --> UpdateLedger: Log facility fee
    UpdateLedger --> [*]
```

## 3. Dataflow Diagram (Context Level 0)

```mermaid
flowchart TD
    Player[Player] -->|Score Input| ScoringEngine((Scoring Engine))
    Player -->|LFG Request| Matchmaker((LFG Drafter))
    
    ScoringEngine -->|State Update| DB[(Supabase DB)]
    ScoringEngine -->|SSE Payload| Broadcaster[Broadcaster UI]
    ScoringEngine -->|Match Complete Event| ProgressionEngine((Progression Engine))
    
    ProgressionEngine -->|Elo/XP Update| DB
    
    Manager[Facility Manager] -->|Configure Settings| Scheduler((Court Scheduler))
    Scheduler -->|Booking Block| DB
    
    Referee[Referee] -->|Dispute Flag| DisputeResolution((Dispute Engine))
    ScoringEngine -->|Timeout Alert| DisputeResolution
```
