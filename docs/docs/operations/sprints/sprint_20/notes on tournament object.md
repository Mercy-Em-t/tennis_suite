# Notes on The Tournament Object

THE TOURNAMENT OBJECT IS THE MASTER OBJECT THAT HOLD ALL THE DATA FOR THE TOURNAMENT. IT IS THE SINGLE SOURCE OF TRUTH FOR THE TOURNAMENT.

the tournamnet object is the one that encapsulates allit data and method into a single object.


as seen in the tournamnet architecture map.

the tournament follows a life cycle.
its like a living object that goes through several stages in its life cycle.

## Core Data Requirements
- a tournamnet blue print exists in the system , but it does not begin ot show itself until it is launched.

a turnament has a starting point where the blue print is invoked.

we can broadly split it into initialisation step, pretournamnet, during tournamnet, post tournamnet, and its life cycle completees once archived. from where it becomes read only.

must explicitly be initialised - which creates a live tournamnet instance. 

the tournamnet should be aware of its stage, its associated data. , what it owns its relationships. needs to always validate the actions taken on it, and document them.

ie tournamnet created on date, by who, . data of which begins populating its log as soon as it is created, provided the process has started we can began logging events of the tournamnet..
we can preload its enxt stages so that there is smooth transition into the next stage. we do this optimistically. assuming that all create tournamnet activities will lead to the creation of a tournamnet. to prevent massive data on user devices we send the data as needed.

also if we can sandbox a tournamnet visualisation please do
- 
- 
