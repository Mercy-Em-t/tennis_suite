# Notes on Court Marshall

the court marshall is the on ground person in charge of the running of matches for that specific tournamnet. (please correct tournamnet to its correct spelling lol)

he is assigned to a tournamnet during the pre tournamnet stage by the host. and can even be assigned after. (but the earlier the better, so host should try to assign as early as possible)

he is the main link between the host and the referee and the umpire(s).

he is mobile and moving throughout the facility, his interface must prioritize high-speed, status-focused updates over deep analytical data.

he requires:
A "Court Grid" View: A simplified visual layout of all physical courts.
Status Awareness: Immediate visibility into which courts are EMPTY, in WARMUP, IN_PROGRESS, or currently under MAINTENANCE.
Quick-Action Controls: The ability to execute core tasks with minimal taps, such as checking in players or dispatching matches.


High-Priority Communication: A direct line to the Tournament Delegate for emergency interventions.
## Core Responsibilities
- manage court status and updates
Physical Flow Control: They manage court turnarounds and player check-ins.


System Dispatch: Using a "Drag-and-Drop" interface, they map scheduled matches to physical courts, which automatically updates the system record.(under referee direction)


Match Status Transitioning: They are responsible for triggering the transition of a match from SCHEDULED to WARMUP, which subsequently notifies the Referee.


Infrastructure Oversight: They act as the "eyes and ears" for any issues (e.g., net damage, lighting, or weather).


Resource Coordination: They assist with staff rotations (such as ball kids) and the distribution of equipment.
- 
- Permissions & Constraints
To maintain system integrity, the Court Marshal operates within specific "Walled Garden" boundaries:


Read Access: Full visibility of tournament schedules and team rosters.


Write Access: Restricted specifically to courtAssignment and matchStatus (specifically moving matches into WARMUP).


Strict Prohibitions: They cannot mutate scores (reserved for the Referee) and cannot alter tournament-wide rules or financial settings (reserved for the Delegate).


the marshall flow:

landing page->login

is he a registerd user?
if no ->go to signup
if yes ->login

successfully logged in?
if no-> trigger retry login max attempts 3
if yes ->direct to marshall dashboard

in marshall dashboard they see their list of assigned tournamnets

clicking on tournmnae card takes them to their marshall dashboard with respect to that tournamnet. this dashboard prioritize the running of matches

they should be able to have a court inspection section

see amtch schedule and rotation
update match status within their capacity

can recommend matches to move to idle courts or reschedule matches, provided it is a progressive reschedule and not retrogressive,


can request staff or resources (ball kids, towels, etc) to the delegate


