import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplateEmail } from '@/lib/mail/dispatch';

export async function POST(request: Request) {
  try {
    // Verify Gateway Webhook Secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.GATEWAY_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    if (!payload.gateway_transaction_id) {
      console.error("Invalid Gateway Callback Payload", payload);
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid Payload" });
    }

    const { status, amount: gatewayAmount, mpesa_receipt, raw_result_code, raw_result_desc, source_reference } = payload;
    const isSuccess = status === 'COMPLETED';

    // Find the pending transaction using teamName (which was passed as source_reference)
    const transaction = await prisma.transaction.findFirst({
      where: { teamName: { startsWith: source_reference } },
      orderBy: { createdAt: 'desc' }
    });

    if (!transaction) {
      console.warn("Callback received for unknown source_reference", source_reference);
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
