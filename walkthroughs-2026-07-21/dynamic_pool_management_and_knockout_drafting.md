# Walkthrough: Pool Management & Knockout Draft

I have implemented the dynamic pool management tools and the automatic knockout drafter inside the Pools Workspace!

## 1. Dynamic Pool Controls
- **Generation Configurations**: You can now define exactly how many pools to auto-generate using a number selector next to the Auto-Generate button.
- **Append Pools**: I added a "+ Add Pool" button next to the existing pools. Clicking this dynamically figures out the next letter in the sequence (e.g., if Pool A and Pool B exist, it will create "Pool C").
- **Delete Pools with Guardrails**: Every pool container now has a trash icon. As requested, if a pool contains players, deleting it is rejected. If it is empty, the pool is deleted and the remaining pools automatically shift their names to maintain sequential order (e.g., if Pool B is deleted, Pool C is renamed to Pool B).

## 2. Knockout Placeholder Draft
- A new **Knockout Draft** section appears at the bottom of the workspace when pools are active.
- Clicking "Generate Knockout Bracket" calculates the standard crossover math depending on how many pools exist.
- It inserts `Match` records into the database with the `stage="KNOCKOUTS"` and populates the `placeholderA` and `placeholderB` fields (e.g., `Pool A Pos 1`, `Pool B Pos 2`).

### Handling 3 Pools & Wildcards (Answering your question)
Currently, the drafter enforces exactly 2 or 4 pools because they neatly map to standard brackets without "Wildcards". If we start promoting the 3rd person, or giving out "Byes" / "Passives", the math becomes highly asymmetrical. 
To handle that in the future, we can add a **"Manual Draw Builder"** (a UI canvas where you drag `Pool A Pos 3` into a specific slot and drag a generic `BYE` into the opponent's slot). For now, the auto-generator will strictly cover the perfectly symmetrical 2 and 4 pool sizes to keep the MVP simple.
