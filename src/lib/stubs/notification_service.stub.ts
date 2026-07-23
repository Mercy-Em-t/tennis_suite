/**
 * ============================================================
 *  NOTIFICATION SERVICE STUB
 *  Location : src/lib/stubs/notification_service.stub.ts
 *  SRS Ref  : docs/SRS/stubs/notification_service.md
 *  Status   : STUB – NOT WIRED. Replace with real provider SDK.
 * ============================================================
 *
 * This file is the authoritative connection plug-in point for
 * email + SMS notification delivery (e.g. SendGrid, Resend,
 * Twilio). Swap only this file when wiring a provider.
 *
 * NOTE: A thin scaffolding already exists at src/lib/email.ts.
 * This stub supersedes it with a richer interface contract.
 * When wiring, point email.ts to call sendEmail() here.
 *
 * HOW TO WIRE:
 *   1. Install provider SDK  (e.g. `npm i resend` or `npm i twilio`)
 *   2. Implement each method below with real logic.
 *   3. Delete STUB warnings and replace simulated returns.
 *   4. Update docs/SRS/stubs/notification_service.md.
 */

import { Resend } from 'resend';

// ─────────────────────────────────────────────
//  ATTRIBUTES  (environment config)
// ─────────────────────────────────────────────
export const EMAIL_PROVIDER_NAME: string   = process.env.EMAIL_PROVIDER_NAME   ?? 'resend';
export const EMAIL_API_KEY: string         = process.env.EMAIL_API_KEY          ?? '';
export const EMAIL_FROM_ADDRESS: string    = process.env.EMAIL_FROM_ADDRESS     ?? 'alerts@tmsavannah.com';

export const SMS_PROVIDER_NAME: string     = process.env.SMS_PROVIDER_NAME      ?? 'STUB';
export const SMS_API_KEY: string           = process.env.SMS_API_KEY             ?? '';
export const SMS_FROM_NUMBER: string       = process.env.SMS_FROM_NUMBER         ?? '+000000000000';

/** After how many minutes of overrun a referee alert is triggered (SRS UR-4.2) */
export const REFEREE_ALERT_THRESHOLD_MINS: number = Number(
  process.env.REFEREE_ALERT_THRESHOLD_MINS ?? 15,
);

const resend = EMAIL_API_KEY ? new Resend(EMAIL_API_KEY) : null;

// ─────────────────────────────────────────────
//  TYPES / INTERFACES
// ─────────────────────────────────────────────

export interface EmailPayload {
  to: string | string[];
  subject: string;
  /** HTML body */
  html: string;
  /** Optional plaintext fallback */
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  providerRaw?: unknown;
}

export interface SmsPayload {
  /** E.164 format e.g. +254712345678 */
  to: string;
  body: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  providerRaw?: unknown;
}

/** A referee alert triggered when a match overruns its scheduled time. */
export interface RefereeAlertPayload {
  refereeEmail: string;
  refereePhone?: string;
  matchId: string;
  courtId: string;
  overrunMinutes: number;
}

/** A match reminder sent to players before their scheduled match. */
export interface MatchReminderPayload {
  playerEmail: string;
  playerPhone?: string;
  matchId: string;
  courtLocation: string;
  scheduledStartISO: string;
  opponentName: string;
}

// ─────────────────────────────────────────────
//  METHODS  (stub implementations)
// ─────────────────────────────────────────────

/**
 * Initialise / authenticate against both email and SMS providers.
 */
export async function initNotificationService(): Promise<void> {
  console.log(
    `[NotificationService] Initialised. Email: ${EMAIL_PROVIDER_NAME}, SMS: ${SMS_PROVIDER_NAME}.`
  );
}

/**
 * Send a transactional email.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!resend) {
    console.warn('[NotificationService] sendEmail failed: EMAIL_API_KEY is not set.');
    return { success: false };
  }
  
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM_ADDRESS,
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });

  if (error) {
    console.error('[NotificationService] Email error:', error);
    throw new Error(error.message);
  }

  return { success: true, messageId: data?.id };
}

/**
 * Send an SMS message.
 */
export async function sendSms(payload: SmsPayload): Promise<SmsResult> {
  console.warn('[NotificationStub] sendSms called. NOT WIRED.', { to: payload.to });
  // TODO: Call SMS_PROVIDER SDK e.g. twilio.messages.create(...)
  return { success: true, messageId: `stub_sms_${Date.now()}` };
}

/**
 * Fire a referee alert when a match exceeds its scheduled duration.
 * Satisfies SRS requirement UR-4.2.
 */
export async function sendRefereeAlert(payload: RefereeAlertPayload): Promise<void> {
  console.warn('[NotificationStub] sendRefereeAlert called. NOT WIRED.', payload);

  const emailBody = `
    <p>⚠️ Match Overrun Alert</p>
    <p>Match <strong>${payload.matchId}</strong> on court <strong>${payload.courtId}</strong>
    has exceeded its scheduled time by <strong>${payload.overrunMinutes} minutes</strong>.</p>
    <p>Please attend to this match immediately.</p>
  `;

  // TODO: Remove stub log and ensure real sendEmail is wired
  await sendEmail({
    to: payload.refereeEmail,
    subject: `[Tennis Suite] Overrun Alert – Match ${payload.matchId}`,
    html: emailBody,
  });

  if (payload.refereePhone) {
    await sendSms({
      to: payload.refereePhone,
      body: `Tennis Suite Alert: Match ${payload.matchId} is ${payload.overrunMinutes}m over schedule on court ${payload.courtId}.`,
    });
  }
}

/**
 * Send a pre-match reminder to a player.
 * Satisfies SRS use case requirement for scheduling awareness.
 */
export async function sendMatchReminder(payload: MatchReminderPayload): Promise<void> {
  console.warn('[NotificationStub] sendMatchReminder called. NOT WIRED.', payload);

  const emailBody = `
    <p>🎾 Match Reminder</p>
    <p>You have an upcoming match against <strong>${payload.opponentName}</strong>.</p>
    <ul>
      <li>Court: ${payload.courtLocation}</li>
      <li>Time: ${new Date(payload.scheduledStartISO).toLocaleString()}</li>
    </ul>
    <p>Good luck!</p>
  `;

  await sendEmail({
    to: payload.playerEmail,
    subject: `[Tennis Suite] Match Reminder vs ${payload.opponentName}`,
    html: emailBody,
  });

  if (payload.playerPhone) {
    await sendSms({
      to: payload.playerPhone,
      body: `Tennis Suite: Your match vs ${payload.opponentName} is at ${payload.courtLocation}. See you on court!`,
    });
  }
}
