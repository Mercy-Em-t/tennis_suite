import { logger } from './logger';

const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

const BASE_URL = MPESA_ENVIRONMENT === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

/**
 * Generates an OAuth token for Safaricom Daraja API
 */
export async function generateMpesaToken(): Promise<string> {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  try {
    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      next: { revalidate: 3500 } // Cache token for nearly 1 hour (expires in 3600s)
    });

    if (!response.ok) {
      throw new Error(`Failed to generate M-Pesa token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logger.error('M-Pesa Token Generation Error', {}, error);
    throw error;
  }
}

/**
 * Initiates an STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateStkPush(phoneNumber: string, amount: number, reference: string, callbackUrl: string) {
  try {
    const token = await generateMpesaToken();

    // Format phone number to 254XXXXXXXXX
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount).toString(), // M-Pesa expects integer string
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference.substring(0, 12), // Max 12 chars
      TransactionDesc: 'Tennis Suite Registration'
    };

    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.ResponseCode !== '0') {
      logger.error('M-Pesa STK Push Failed', data);
      throw new Error(data.errorMessage || data.CustomerMessage || 'STK Push Failed');
    }

    return data;
  } catch (error) {
    logger.error('M-Pesa STK Push Error', {}, error);
    throw error;
  }
}
