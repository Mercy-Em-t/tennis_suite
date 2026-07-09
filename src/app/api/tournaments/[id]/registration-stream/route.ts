import { matchEventEmitter } from '@/lib/eventEmitter';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tournamentId } = await params;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`retry: 1000\n\n`);

      const handleUpdate = (data: any) => {
        if (isClosed) return;
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(payload);
        } catch (error) {
          logger.error('Error stringifying registration SSE payload:', error);
        }
      };

      const eventName = `registrationUpdated:${tournamentId}`;
      matchEventEmitter.on(eventName, handleUpdate);

      const keepAlive = setInterval(() => {
        if (!isClosed) {
          controller.enqueue(`: keep-alive\n\n`);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(keepAlive);
        matchEventEmitter.off(eventName, handleUpdate);
        try { controller.close(); } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
