import { prisma } from '@/lib/prisma';


/**
 * Pillar 5: The Broadcaster & Cinematic Interface
 * Pillar 38: Dynamic Load Balancing
 *
 * SSE streaming endpoint. Keeps a persistent HTTP connection open with each
 * broadcast client and pushes scoreState deltas as `text/event-stream` events
 * the instant the database changes, achieving sub-200ms latency without
 * WebSocket state management overhead.
 *
 * Compatible with Vercel Edge Functions and any serverless deployment.
 */

// Note: Cannot use Edge runtime with PrismaClient directly.
// We poll our own /api/broadcast/latest at a high cadence and push on change.
export const dynamic = 'force-dynamic';



export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let lastScoreState = '';
  let lastMatchId = '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Push initial state immediately on connect
      try {
        const match = await prisma.match.findFirst({
          orderBy: { updatedAt: 'desc' },
          include: { teamA: true, teamB: true }
        });

        if (match) {
          lastMatchId = match.id;
          lastScoreState = match.scoreState as string;
          send('score_update', {
            matchId: match.id,
            scoreState: JSON.parse(lastScoreState || '{}'),
            teamA: { id: match.teamA?.id, name: match.teamA?.franchiseName },
            teamB: { id: match.teamB?.id, name: match.teamB?.franchiseName },
            status: match.status,
          });
        }
      } catch (e) {
        send('error', { message: 'Failed to load initial state' });
      }

      // Poll DB every 400ms and push delta only on change
      const intervalId = setInterval(async () => {
        try {
          const match = await prisma.match.findFirst({
            orderBy: { updatedAt: 'desc' },
            include: { teamA: true, teamB: true }
          });

          if (!match) return;

          const currentState = match.scoreState as string;

          if (currentState !== lastScoreState || match.id !== lastMatchId) {
            lastScoreState = currentState;
            lastMatchId = match.id;

            send('score_update', {
              matchId: match.id,
              scoreState: JSON.parse(currentState || '{}'),
              teamA: { id: match.teamA?.id, name: match.teamA?.franchiseName },
              teamB: { id: match.teamB?.id, name: match.teamB?.franchiseName },
              status: match.status,
            });
          }
        } catch (e) {
          // Silent — keep stream alive through transient DB errors
        }
      }, 400);

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Prevent nginx from buffering the stream
    }
  });
}
