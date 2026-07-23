/**
 * ============================================================
 *  CALENDAR SERVICE STUB
 *  Location : src/lib/stubs/calendar_service.stub.ts
 *  SRS Ref  : docs/SRS/stubs/calendar_service.md
 *  Status   : STUB – NOT WIRED. Replace with real provider SDK.
 * ============================================================
 *
 * This file is the authoritative connection plug-in point for
 * any calendar/scheduling provider (e.g. Google Calendar API,
 * Cal.com, Outlook API). Swap only this file when wiring.
 *
 * HOW TO WIRE:
 *   1. Install provider SDK  (e.g. `npm i @googleapis/calendar`)
 *   2. Implement each method below with real logic.
 *   3. Delete STUB warnings and replace simulated returns.
 *   4. Update docs/SRS/stubs/calendar_service.md with provider
 *      name and environment variables.
 */

// ─────────────────────────────────────────────
//  ATTRIBUTES  (environment config)
// ─────────────────────────────────────────────
export const CALENDAR_PROVIDER_NAME: string  = process.env.CALENDAR_PROVIDER_NAME  ?? 'STUB';
export const CALENDAR_API_KEY: string        = process.env.CALENDAR_API_KEY         ?? '';
export const CALENDAR_BASE_URL: string       = process.env.CALENDAR_BASE_URL        ?? 'https://stub.calendar.local';
/** Default buffer time (minutes) between bookings on the same court */
export const CALENDAR_BUFFER_MINUTES: number = Number(process.env.CALENDAR_BUFFER_MINUTES ?? 10);

// ─────────────────────────────────────────────
//  TYPES / INTERFACES
// ─────────────────────────────────────────────

/** A time window representing a resource's availability. */
export interface TimeSlot {
  startISO: string;   // ISO 8601 e.g. "2026-07-24T09:00:00+03:00"
  endISO:   string;
  available: boolean;
}

/** Data required to book a court or schedule a match. */
export interface CalendarBookingRequest {
  /** Internal court or resource ID */
  resourceId: string;
  /** ISO 8601 start */
  startISO: string;
  /** ISO 8601 end */
  endISO: string;
  /** Title of the event shown in the calendar */
  title: string;
  /** Participant IDs to invite */
  participantIds: string[];
  notes?: string;
}

export interface CalendarBookingResult {
  success: boolean;
  eventId: string;
  /** Provider-canonical URL (e.g. Google Calendar link) */
  eventUrl?: string;
  providerRaw?: unknown;
}

/** Represents a request to cancel or update an existing event. */
export interface CalendarUpdateRequest {
  eventId: string;
  startISO?: string;
  endISO?: string;
  notes?: string;
}

export interface CalendarCancelResult {
  success: boolean;
  cancelled: boolean;
}

// ─────────────────────────────────────────────
//  METHODS  (stub implementations)
// ─────────────────────────────────────────────

/**
 * Initialise / authenticate against the calendar provider.
 */
export async function initCalendarService(): Promise<void> {
  console.warn(`[CalendarStub] initCalendarService called. Provider: ${CALENDAR_PROVIDER_NAME}. NOT WIRED.`);
  // TODO: OAuth2 handshake or API key validation
}

/**
 * Fetch available time slots for a given resource (court) between two dates.
 * Enforces the CALENDAR_BUFFER_MINUTES constraint.
 */
export async function getAvailableSlots(
  resourceId: string,
  fromISO: string,
  toISO: string,
): Promise<TimeSlot[]> {
  console.warn('[CalendarStub] getAvailableSlots called. Returning mock data.', { resourceId, fromISO, toISO });
  // TODO: Query provider free/busy API for resourceId
  return [
    { startISO: fromISO, endISO: toISO, available: true },
  ];
}

/**
 * Book a court / resource. Checks for conflicts and buffer time before confirming.
 */
export async function bookResource(req: CalendarBookingRequest): Promise<CalendarBookingResult> {
  console.warn('[CalendarStub] bookResource called. Returning simulated booking.', req);
  // TODO: POST event to provider with participants and resource ID
  return {
    success: true,
    eventId: `stub_evt_${Date.now()}`,
    eventUrl: `${CALENDAR_BASE_URL}/events/stub_evt_${Date.now()}`,
  };
}

/**
 * Update an existing calendar event (e.g. reschedule a match).
 */
export async function updateBooking(req: CalendarUpdateRequest): Promise<CalendarBookingResult> {
  console.warn('[CalendarStub] updateBooking called.', req);
  // TODO: PATCH event on provider
  return {
    success: true,
    eventId: req.eventId,
  };
}

/**
 * Cancel / delete a calendar event.
 */
export async function cancelBooking(eventId: string): Promise<CalendarCancelResult> {
  console.warn('[CalendarStub] cancelBooking called.', { eventId });
  // TODO: DELETE event on provider
  return { success: true, cancelled: true };
}
