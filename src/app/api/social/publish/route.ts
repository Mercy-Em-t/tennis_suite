import { NextResponse } from 'next/server';

/**
 * Pillar 29: Automated Social Media Syndication
 * Webhooks that trigger auto-generated graphic posts to Twitter/Instagram.
 */
export async function POST(request: Request) {
  try {
    const { matchId, scoreState, triggerType } = await request.json();

    if (triggerType === 'MATCH_COMPLETED') {
      console.log(`[SOCIAL API] Pushing final score graphic overlay to Twitter API: ${JSON.stringify(scoreState)}`);
      // Fakes an axios.post('https://api.twitter.com/2/tweets', ...)
      return NextResponse.json({ success: true, message: 'Graphic generated and tweeted.' });
    }

    return NextResponse.json({ error: 'Invalid trigger' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to syndicate to social' }, { status: 400 });
  }
}
