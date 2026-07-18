# Notes on Registration and Draws

(Please fill in the detailed requirements, edge cases, and business logic for how players register and how brackets are drawn in your tournaments)

for the draws.
draws are created based on registerded players.
it is categrory aware ie only draft players into the categories which they have registersed for



## Registration Requirements
- while drafting the draw user should be able to choose if to start in pools or go straight to knockout( if knockout then the system automatically draws up a suitable knockout tree determining the level to start ie r16,r32 etc.
add bytes as apprpritate. player can even decide to toggle rounds ie if system recommended to start at r32 they can cadd rounds to start at r64, or reduce to start at round16. of course be intelligen twith it. system can reject some movements such as reducing r32 to r16 which may results in players not getting places to play)
- 

## Draw / Bracket Rules
- 
- draw according to the category

allow saving drafts. published draws can be versioned incase they need editing
since drawing is a complex and potentially costly operation, we should allow saving drafts. published draws can be versioned incase they need editing

no need to log all intricate details of the rawing. we can record draw started, draft saved, draft saved. draw published, draw edited etc. 
but we need to capture the high level info metadata. draw generated started at this orund, seeded players