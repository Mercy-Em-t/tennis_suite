import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiateStkPush } from '@/lib/mpesa';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { phoneNumber, amount, tournamentId, name, categories, email } = await request.json();

    if (!phoneNumber || !amount || !tournamentId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attempt the STK Push via Gateway
    const accountRef = name.substring(0, 12).replace(/[^a-zA-Z0-9]/g, '');
    const transactionDesc = `Payment for ${accountRef}`;

    const gatewayRes = await fetch('https://pay.tmsavannah.com/api/mpesa-initiate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GATEWAY_API_KEY}`
      },
      body: JSON.stringify({
        source_app: 'sports',
        source_reference: accountRef,
        amount,
        phone_number: phoneNumber,
        webhook_url: 'https://sports.tmsavannah.com/api/payments/mpesa/callback',
        customer_email: email
      })
    });
    
    const mpesaRes = await gatewayRes.json();
    if (!gatewayRes.ok || !mpesaRes.success) {
      throw new Error(mpesaRes.error || mpesaRes.message || 'Gateway STK Push failed');
    }

    // Save the pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        phoneNumber,
        merchantRequestId: mpesaRes.MerchantRequestID,
        checkoutRequestId: mpesaRes.CheckoutRequestID,
        tournamentId,
        teamName: name,
        categories: JSON.stringify({ list: categories || [], email }),
      }
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: mpesaRes.CheckoutRequestID,
      transactionId: transaction.id
    });
  } catch (error: any) {
    console.error('[stkpush]', error);
    return NextResponse.json({ error: error.message || 'STK Push failed' }, { status: 500 });
  }
}
