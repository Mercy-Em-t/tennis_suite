# Calendar Service Stub

> **Code Stub →** [`src/lib/stubs/calendar_service.stub.ts`](../../../src/lib/stubs/calendar_service.stub.ts)  
> **Registry →** [`src/lib/stubs/index.ts`](../../../src/lib/stubs/index.ts)

## Overview
- **Purpose**: Scheduling matches, coordinating player availability, and court booking times.
- **Connection**: Swap the code stub file to wire a real provider (e.g. Google Calendar, Cal.com).

## Attributes (Environment Variables)
| Variable | Default | Description |
|---|---|---|
| `CALENDAR_PROVIDER_NAME` | `STUB` | Human-readable provider label |
| `CALENDAR_API_KEY` | `` | Provider API key / OAuth token |
| `CALENDAR_BASE_URL` | `https://stub.calendar.local` | Provider base URL |
| `CALENDAR_BUFFER_MINUTES` | `10` | Minimum buffer between court bookings (SRS UR-2.2) |

## Interfaces
- `TimeSlot` — startISO, endISO, available flag
- `CalendarBookingRequest` — resourceId, startISO, endISO, title, participantIds, notes
- `CalendarBookingResult` — success flag, eventId, optional eventUrl
- `CalendarUpdateRequest` — eventId, optional new start/end/notes
- `CalendarCancelResult` — success flag, cancelled flag

## Methods
| Method | Signature | Description |
|---|---|---|
| `initCalendarService` | `() → Promise<void>` | Initialise / authenticate SDK |
| `getAvailableSlots` | `(resourceId, fromISO, toISO) → Promise<TimeSlot[]>` | Fetch free slots for a court |
| `bookResource` | `(req: CalendarBookingRequest) → Promise<CalendarBookingResult>` | Book a court / resource |
| `updateBooking` | `(req: CalendarUpdateRequest) → Promise<CalendarBookingResult>` | Reschedule an existing event |
| `cancelBooking` | `(eventId: string) → Promise<CalendarCancelResult>` | Cancel / delete an event |

*(Replace stub methods with real SDK calls to wire this service.)*
