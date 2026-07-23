# 1 Introduction

## 1.1 Purpose

This document is intended to clearly describe an overview of the requirements and specifications for Tennis Suite (`sports.tmsavannah.com`), a comprehensive SaaS application that facilitates amateur tennis matchmaking, scoring, and tournament coordination. It contains detailed outlines of the major use cases of this application in the form of various models and diagrams. Furthermore, this document contains implementation details that can help bring these use cases to fruition.

The intended audience of this document consists primarily of software developers who will be implementing the final product, facility managers who manage tennis courts, and amateur tennis players. This document is to be used as a standard guide or reference for developers as it highlights the requirements and specifications from a technical perspective.

## 1.2 Scope

The web application described by this document, entitled Tennis Suite, is aimed at providing amateur tennis players and facility managers a unified ecosystem to organize, score, and broadcast tennis matches while minimizing administrative overhead. Specifically, Tennis Suite assists users in:
- Automatically allocating available courts to scheduled matches without overlaps.
- Facilitating matchmaking using an AI-assisted drafter (LFG Drafter) based on XP/Elo.
- Logging match scores point-by-point via a deterministic Event-Sourced Scoring Engine.
- Generating tournament brackets automatically.
- Providing a real-time (sub-200ms) scoreboard overlay for broadcasting.

The main benefit of Tennis Suite is capturing value across the entire amateur tennis vertical by replacing disjointed systems (like WhatsApp groups, manual spreadsheets, and legacy POS systems) with a vertically integrated solution. The application acts as a responsive progressive web app (PWA) to ensure low barrier access for players on mobile devices, while providing a comprehensive dashboard for administrators and facility managers.

## 1.3 Acronyms, Abbreviations, Definitions, Notational Conventions

### Abbreviations

| Abbreviation | Expansion                                   |
|--------------|---------------------------------------------|
| API          | Application Programming Interface           |
| UI           | User Interface                              |
| URL          | Uniform Resource Locators                   |
| POV          | Point of View                               |
| UML          | Unified Modeling Language                   |
| MVP          | Minimum Viable Product                      |
| SaaS         | Software as a Service                       |
| PWA          | Progressive Web App                         |
| SSE          | Server-Sent Events                          |

### Conventions

| Convention   | Meaning                                                                 |
|--------------|-------------------------------------------------------------------------|
| Application  | Also used to refer to our system (Tennis Suite)                         |
| Player       | Refers to an amateur tennis player using the system                     |
| Host         | Refers to the organizer/creator of a match or tournament                |
| Admin        | Refers to facility managers or club owners overseeing courts            |
| Referee      | Refers to an official who can override scores or resolve disputes       |
| Broadcaster  | Refers to users utilizing the live scoreboard overlay to broadcast play |
| ""           | Text inside "" is used to refer to button names or UI content           |
| Underline    | Something that is underlined represents a template statement.           |
| <...>        | Something in <...> serves as a placeholder for dynamic variables.       |
| Italics      | Denotes figure captions.                                                |
| [#]          | The # in square brackets corresponds to the No. in UI sketches.         |
