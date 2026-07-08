# Sprint 21 Walkthrough: Registration & Draws Sandbox

I have fully implemented the **Registration & Draws Engine Sandbox**!

You can test how players are funneled into brackets by navigating to:
**http://localhost:3000/sandbox/draws**

## Key Features Implemented

### 1. Category-Aware Registration Pool
On the left sidebar, you'll see a mock pool of players who have registered. You can toggle between **Men's Singles** and **Women's Singles** in the header. The draw engine will *only* pull from the active category.

### 2. Automated & Manual Seeding
By default, the algorithm sorts the players by their ITF Ranking points.
However, I've added a **"Seed"** input box next to each player. If the Tournament Director wants to manually force a player to be Seed 1, they just type "1" in the box. The algorithm prioritizes manual seeds over points when generating the bracket.

### 3. The Draw Engine (Bracket Sizer & Byes)
When you click **GENERATE NEW DRAFT**, the engine does the heavy lifting:
- If there are 21 players, it automatically knows the closest valid knockout size is a **Round of 32**.
- It calculates that `32 - 21 = 11 BYES` are needed.
- It distributes the BYES to the top seeds (e.g., placing the BYE in the "Player 2" slot for the highest-ranked players).

### 4. Format Flexibility (Knockouts vs Pools)
You can change the format before generating:
- **Standard Knockout (Tree)**: Generates the classic R32 / R16 bracket structure.
- **Pools / Round Robin**: Instead of a tree, it performs a "snake draft" to distribute the players evenly across 4 groups (Group A, B, C, D) based on their seed, ensuring the best players don't all end up in the same pool.

### 5. Draft Versioning & Publishing
Because draw generation is a heavy process, clicking generate creates a **"DRAFT"**. 
You can keep changing settings and re-generating drafts (Version 1, Version 2...). Once you are happy with the bracket, you click the green **"PUBLISH DRAW"** button. 

All of these high-level actions (Generation, Validation, Publishing) are recorded in the **Draw Meta-Logs** on the right sidebar.
