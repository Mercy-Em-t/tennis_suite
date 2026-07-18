import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Safaricom Daraja STK Push Callback Structure
    const stkCallback = data?.Body?.stkCallback;
    
    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // We passed the Team ID as the AccountReference during STK Push.
    // However, Safaricom's callback doesn't echo the AccountReference. 
    // In a real production app, we would store the `CheckoutRequestID` returned from `initiateStkPush` 
    // in the DB alongside the team, and look up the Team by `CheckoutRequestID` here.
    // For this scaffolding, we will parse the metadata and log the success.
    
    let amount = 0;
    let mpesaReceiptNumber = '';
    let phoneNumber = '';

    if (CallbackMetadata?.Item) {
      const items = CallbackMetadata.Item;
      amount = items.find((i: any) => i.Name === 'Amount')?.Value || 0;
      mpesaReceiptNumber = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value || '';
      phoneNumber = items.find((i: any) => i.Name === 'PhoneNumber')?.Value || '';
    }

    logger.info(`M-Pesa Callback Received: ${ResultCode} - ${ResultDesc}. Receipt: ${mpesaReceiptNumber}`);

    if (ResultCode === 0) {
      // Payment Successful
      // TODO: Lookup the Team by CheckoutRequestID (or a tracking ID)
      // Since this is scaffolded, we'll just log it for now.
      logger.info(`Payment of KES ${amount} successful from ${phoneNumber}. Receipt: ${mpesaReceiptNumber}`);
      
      // Example DB Update (Needs the tracking ID in a real implementation):
      /*
      const team = await prisma.team.findFirst({ where: { mpesaTrackingId: stkCallback.CheckoutRequestID } });
      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: { paymentStatus: 'REGISTERED' }
        });
        
        // Ledger entries...
      }
      */
    } else {
      // Payment Failed or Cancelled
      logger.warn(`M-Pesa Payment Failed. Reason: ${ResultDesc}`);
    }

    // Safaricom expects a success response so they don't retry
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error) {
    logger.error('M-Pesa Callback Processing Error', {}, error);
    // Even on error, we should return 200 to Safaricom if possible, but 500 logs it on our end
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
