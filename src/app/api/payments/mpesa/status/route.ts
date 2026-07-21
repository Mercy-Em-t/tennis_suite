import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json({ error: 'Missing checkoutRequestId' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestId }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: transaction.status, // 'PENDING', 'COMPLETED', 'FAILED'
      receiptNumber: transaction.mpesaReceiptNumber
    });
  } catch (error) {
    console.error('[mpesa/status]', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
