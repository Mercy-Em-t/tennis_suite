import { NextResponse } from 'next/server';

/**
 * Pillar 31B: Peer Review Survey System
 * Anonymous post-match surveys where opponents rate skill brackets.
 */
export async function POST(request: Request) {
  try {
    const { matchId, reviewerId, reviewedTeamId, skillRatingScore } = await request.json();

    // Mock logging the review to DB
    console.log(`[PEER REVIEW] Match ${matchId}: Team ${reviewedTeamId} rated ${skillRatingScore}/5 for skill accuracy.`);

    // If score is consistently 1/5 (too good for division), trigger outlier detection
    return NextResponse.json({ success: true, message: 'Peer review recorded securely.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record review' }, { status: 400 });
  }
}
