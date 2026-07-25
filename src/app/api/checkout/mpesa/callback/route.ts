import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.GATEWAY_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    
    if (!payload.gateway_transaction_id) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    const { status, amount, mpesa_receipt, raw_result_code, raw_result_desc, source_reference } = payload;
    const isSuccess = status === 'COMPLETED';

    logger.info(`Gateway Callback Received: ${raw_result_code} - ${raw_result_desc}. Receipt: ${mpesa_receipt}`);

    if (isSuccess) {
      logger.info(`Payment of KES ${amount} successful for ${source_reference}. Receipt: ${mpesa_receipt}`);
      // Find team and update paymentStatus
      const team = await prisma.team.findFirst({ 
        where: { franchiseName: { startsWith: source_reference } }
      });
      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: { paymentStatus: 'REGISTERED' }
        });
      }
    } else {
      logger.warn(`Gateway Payment Failed. Reason: ${raw_result_desc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error) {
    logger.error('M-Pesa Callback Processing Error', {}, error);
    // Even on error, we should return 200 to Safaricom if possible, but 500 logs it on our end
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
