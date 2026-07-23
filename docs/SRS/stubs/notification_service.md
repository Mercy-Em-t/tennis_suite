# Notification Service Stub

> **Code Stub →** [`src/lib/stubs/notification_service.stub.ts`](../../../src/lib/stubs/notification_service.stub.ts)  
> **Registry →** [`src/lib/stubs/index.ts`](../../../src/lib/stubs/index.ts)

## Overview
- **Purpose**: Sends emails and SMS for match reminders, tournament updates, and referee overrun alerts.
- **Connection**: Swap the code stub file to wire a real provider (e.g. Resend, SendGrid, Twilio).

## Attributes (Environment Variables)
| Variable | Default | Description |
|---|---|---|
| `EMAIL_PROVIDER_NAME` | `STUB` | Email provider label |
| `EMAIL_API_KEY` | `` | Email provider API key |
| `EMAIL_FROM_ADDRESS` | `no-reply@tmsavannah.com` | Sender address |
| `SMS_PROVIDER_NAME` | `STUB` | SMS provider label |
| `SMS_API_KEY` | `` | SMS provider API key |
| `SMS_FROM_NUMBER` | `` | Sender phone number (E.164) |
| `REFEREE_ALERT_THRESHOLD_MINS` | `15` | Overrun minutes before a referee is alerted (SRS UR-4.2) |

## Interfaces
- `EmailPayload` — to, subject, html, optional text, replyTo
- `EmailResult` — success flag, optional messageId
- `SmsPayload` — to (E.164), body
- `SmsResult` — success flag, optional messageId
- `RefereeAlertPayload` — refereeEmail, optional phone, matchId, courtId, overrunMinutes
- `MatchReminderPayload` — playerEmail, optional phone, matchId, courtLocation, scheduledStartISO, opponentName

## Methods
| Method | Signature | Description |
|---|---|---|
| `initNotificationService` | `() → Promise<void>` | Initialise / authenticate SDK |
| `sendEmail` | `(payload: EmailPayload) → Promise<EmailResult>` | Send a transactional email |
| `sendSms` | `(payload: SmsPayload) → Promise<SmsResult>` | Send an SMS |
| `sendRefereeAlert` | `(payload: RefereeAlertPayload) → Promise<void>` | Alert referee on match overrun |
| `sendMatchReminder` | `(payload: MatchReminderPayload) → Promise<void>` | Remind player of upcoming match |

*(Replace stub methods with real SDK calls to wire this service.)*
