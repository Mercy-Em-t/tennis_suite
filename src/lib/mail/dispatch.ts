import * as jose from 'jose';

const MAIL_SERVER_URL = process.env.MAIL_SERVER_URL || 'https://tms-mail.tmsavannah.com';
const CLIENT_ID = process.env.MAIL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.MAIL_SECRET || '';

/**
 * Generates a short-lived JWT for authenticating with the mail server.
 */
async function getHighwayToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Mail server credentials are not configured.');
  }

  const secret = new TextEncoder().encode(CLIENT_SECRET);
  const alg = 'HS256';

  return await new jose.SignJWT({ client_id: CLIENT_ID, domain: 'sports.tmsavannah.com' })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);
}

/**
 * Dispatches an email using a predefined template on the mail server.
 */
export async function sendTemplateEmail({
  to,
  template,
  variables = {},
  messageType = 'transactional'
}: {
  to: string;
  template: string;
  variables?: Record<string, string | number | boolean>;
  messageType?: string;
}) {
  try {
    const token = await getHighwayToken();
    const response = await fetch(`${MAIL_SERVER_URL}/api/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-highway-token': token
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        to,
        template,
        variables,
        message_type: messageType
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mail Server Error (${response.status}):`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send template email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Dispatches a raw HTML email.
 */
export async function sendRawEmail({
  to,
  subject,
  html,
  messageType = 'transactional',
  from,
  cc,
  replyTo,
  isNoReply
}: {
  to: string;
  subject: string;
  html: string;
  messageType?: string;
  from?: string;
  cc?: string;
  replyTo?: string;
  isNoReply?: boolean;
}) {
  try {
    const token = await getHighwayToken();
    const response = await fetch(`${MAIL_SERVER_URL}/api/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-highway-token': token
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        to,
        subject,
        html,
        message_type: messageType,
        ...(from && { from }),
        ...(cc && { cc }),
        ...(replyTo && { replyTo }),
        ...(isNoReply !== undefined && { isNoReply })
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mail Server Error (${response.status}):`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send raw email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
