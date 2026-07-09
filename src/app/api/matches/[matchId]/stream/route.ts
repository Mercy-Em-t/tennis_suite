import { NextResponse } from 'next/server';
import { matchEventEmitter } from '@/lib/eventEmitter';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  let streamClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connected message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', matchId })}\n\n`);

      const handleUpdate = (updatedMatch: any) => {
        if (streamClosed) return;
        const data = JSON.stringify({ type: 'update', match: updatedMatch });
        controller.enqueue(`data: ${data}\n\n`);
      };

      const eventName = `matchUpdated:${matchId}`;
      matchEventEmitter.on(eventName, handleUpdate);

      // Keep connection alive with SSE comments
      const keepAlive = setInterval(() => {
        if (!streamClosed) controller.enqueue(': keepalive\n\n');
      }, 15000);

      // Handle stream close
      request.signal.addEventListener('abort', () => {
        streamClosed = true;
        clearInterval(keepAlive);
        matchEventEmitter.off(eventName, handleUpdate);
      });
    },
    cancel() {
      streamClosed = true;
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
