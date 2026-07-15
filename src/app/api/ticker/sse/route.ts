import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');

  if (!tournamentId) {
    return new Response(JSON.stringify({ error: 'Tournament context is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const encoder = new TextEncoder();
  let lastStateHash = '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Poll DB every 2000ms for active or recently completed matches
      const intervalId = setInterval(async () => {
        try {
          const matches = await prisma.match.findMany({
            where: {
              tournamentId,
              OR: [
                { status: 'IN_PROGRESS' },
                { status: 'COMPLETED' }
              ]
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: { teamA: true, teamB: true }
          });

          // Generate a simple hash to detect changes
          const currentStateHash = matches.map(m => `${m.id}-${m.status}-${m.scoreState}`).join('|');

          if (currentStateHash !== lastStateHash) {
            lastStateHash = currentStateHash;

            const tickerData = matches.map(m => {
              let score = '';
              try {
                const s = typeof m.scoreState === 'string' ? JSON.parse(m.scoreState) : m.scoreState;
                if (s) {
                  // Format simply as "Sets: A-B, Games: A-B" or similar for ticker
                  score = `${s.setsA}–${s.setsB}`;
                  if (m.status === 'IN_PROGRESS') {
                    score += `, ${s.gamesA}–${s.gamesB}`;
                  }
                }
              } catch (_) {}

              return {
                id: m.id,
                teamA: m.teamA?.franchiseName || 'TBA',
                teamB: m.teamB?.franchiseName || 'TBA',
                score: score || '0-0',
                status: m.status === 'IN_PROGRESS' ? 'LIVE' : 'FINAL'
              };
            });

            send('ticker_update', tickerData);
          }
        } catch (e) {
          // Silent — keep stream alive through transient DB errors
        }
      }, 2000);

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
