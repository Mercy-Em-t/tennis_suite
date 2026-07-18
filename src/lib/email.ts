import { logger } from './logger';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Scaffolding for the active SMTP server.
 * The user will wire this into their provider (e.g. Resend, SendGrid) later.
 */
export async function sendEmail(payload: EmailPayload) {
  logger.info(`[Email Scaffolding] Sending Email to ${payload.to}`, {
    subject: payload.subject,
    htmlPreview: payload.html.substring(0, 150) + '...'
  });
  
  // Simulate success
  return true;
}
