export const MPESA_ENV = process.env.MPESA_ENVIRONMENT || 'sandbox';
export const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
export const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
export const PASSKEY = process.env.MPESA_PASSKEY || '';
export const SHORTCODE = process.env.MPESA_SHORTCODE || '9022868';
export const TILL_NUMBER = process.env.MPESA_TILL_NUMBER || '5758419';

const BASE_URL = MPESA_ENV === 'live' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

export async function getMpesaAccessToken(): Promise<string> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(`Missing M-Pesa Credentials. KEY: ${!!CONSUMER_KEY}, SECRET: ${!!CONSUMER_SECRET}`);
  }
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  try {
    const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Safaricom API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    return data.access_token;
  } catch (error: any) {
    throw new Error(`M-Pesa token generation error: ${error.message}`);
  }
}

function generatePassword(timestamp: string): string {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
}

export async function initiateStkPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string) {
  const token = await getMpesaAccessToken();

  // Phone number needs to be in 2547XXXXXXXX format
  let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = `254${formattedPhone.substring(1)}`;
  if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.substring(1);

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
  const password = generatePassword(timestamp);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tennis-suite.vercel.app';
  const callbackUrl = `${baseUrl}/api/payments/mpesa/callback`;

  // For Buy Goods, PartyB is the Till Number, but BusinessShortCode (and Password) uses the Head Office Shortcode.
  const isBuyGoods = !!TILL_NUMBER && TILL_NUMBER !== SHORTCODE;

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: isBuyGoods ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: isBuyGoods ? TILL_NUMBER : SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.errorMessage || 'M-Pesa STK Push failed');
  }

  return data;
}
