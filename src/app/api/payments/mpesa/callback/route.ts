import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/mail/dispatch';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Safaricom wraps the response in Body.stkCallback
    const callbackData = data?.Body?.stkCallback;
    
    if (!callbackData) {
      console.error("Invalid M-Pesa Callback Payload", data);
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid Payload" });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    // ResultCode 0 means success. Anything else is an error (e.g., cancelled by user)
    const isSuccess = ResultCode === 0;
    
    let mpesaReceiptNumber = null;
    let amount = 0;
    let phoneNumber = '';

    // If successful, extract the metadata
    if (isSuccess && CallbackMetadata && CallbackMetadata.Item) {
      const items = CallbackMetadata.Item;
      const receiptItem = items.find((item: any) => item.Name === 'MpesaReceiptNumber');
      const amountItem = items.find((item: any) => item.Name === 'Amount');
      const phoneItem = items.find((item: any) => item.Name === 'PhoneNumber');

      mpesaReceiptNumber = receiptItem?.Value?.toString();
      amount = amountItem?.Value;
      phoneNumber = phoneItem?.Value?.toString();
    }

    // Find the pending transaction
    const transaction = await prisma.transaction.findUnique({
      where: { checkoutRequestId: CheckoutRequestID }
    });

    if (!transaction) {
      console.warn("Callback received for unknown checkoutRequestId", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted but transaction not found" });
    }

    // Update the transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: isSuccess ? 'COMPLETED' : 'FAILED',
        mpesaReceiptNumber: mpesaReceiptNumber,
      }
    });

    // If successful, create the Team
    if (isSuccess && transaction.status !== 'COMPLETED') {
      try {
        const team = await prisma.team.create({
          data: {
            franchiseName: transaction.teamName,
            tournamentId: transaction.tournamentId,
            status: 'ACTIVE',
            // Assign dummy user id or leave without users for guest checkout.
            // A production app would link this to the user session if available.
          }
        });
        console.log(`[MPESA CALLBACK] Created team ${transaction.teamName} for tournament ${transaction.tournamentId}`);

        // Try sending confirmation email
        try {
          const catData = JSON.parse(transaction.categories || '{}');
          if (catData.email) {
            const tournament = await prisma.tournament.findUnique({ where: { id: transaction.tournamentId } });
            await sendTemplateEmail({
              to: catData.email,
              template: 'registration_success',
              variables: {
                team_name: team.franchiseName,
                tournament_name: tournament?.name || 'Tournament',
                cta_url: `https://sports.tmsavannah.com/tournaments/${tournament?.id}`,
                cta_label: 'View Tournament'
              }
            });
            console.log(`[MPESA CALLBACK] Registration email sent to ${catData.email}`);
          }
        } catch (emailErr) {
          console.error("Failed to send registration email:", emailErr);
        }

      } catch (teamError) {
        console.error("Error creating team after payment", teamError);
      }
    }

    // Safaricom requires this exact JSON response format to acknowledge receipt
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    });

  } catch (error) {
    console.error('[mpesa/callback] error', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Server Error" }, { status: 500 });
  }
}
