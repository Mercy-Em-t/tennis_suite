# Backlog & Technical Debt

This document tracks identified issues, UX improvements, and feature requests discovered during Sprint 6 Testing.

## Critical Priority
- [x] Handle Prisma/Supabase connection errors gracefully (`Can't reach database server at aws-0-eu-west-1.pooler.supabase.com:5432`). Currently, an unhandled rejection during login crashes the Next.js process completely.

## High Priority
- [x] Implement a Global Logout mechanism (`/api/auth/signout` is broken or inaccessible from UI).
- [x] Fix tournament access for Players (`/tournaments` redirects back to `/team`).

## Medium Priority
- [x] Add a "Back to Hub" button on the Player Passport (`/team/profile`).
- [x] Fix Chatbot message display (input clears but message doesn't appear).

## Low Priority / Polish
- [x] Add email field to Private Settings view on Player Passport.
