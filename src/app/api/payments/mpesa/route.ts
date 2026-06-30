import { NextResponse } from 'next/server';

/**
 * Mock endpoint for M-Pesa integration (Daraja API).
 * In production, this would trigger an STK Push (Lipa Na M-Pesa Online)
 * directly to the user's phone via the Safaricom API.
 */
export async function POST(request: Request) {
  try {
    const { phoneNumber, amount, teamId } = await request.json();

    if (!phoneNumber) {
       return NextResponse.json({ error: 'Phone number is required for M-Pesa STK Push' }, { status: 400 });
    }

    // Mock STK Push trigger
    return NextResponse.json({ 
      success: true, 
      paymentProvider: 'MPESA',
      message: `STK Push prompt sent to ${phoneNumber} for KES ${amount}. Awaiting user PIN.`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize M-Pesa payment' }, { status: 400 });
  }
}
