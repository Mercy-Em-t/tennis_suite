import { NextResponse } from 'next/server';
import { matchEventEmitter } from '@/lib/eventEmitter';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const handleEvent = (type: string) => (data: any) => {
        try {
          const payload = JSON.stringify({ type, data });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {}
      };

      const onShiftHandover = handleEvent('SHIFT_HANDOVER');
      // We also listen for any SESSION_EXPIRED events to relay them globally for monitoring
      const onSessionExpired = handleEvent('SESSION_EXPIRED_GLOBAL');

      matchEventEmitter.on('SHIFT_HANDOVER', onShiftHandover);
      
      // A hack to listen to all SESSION_EXPIRED events by wrapping the emit if we had to, 
      // but since we emit dynamically per court `SESSION_EXPIRED:${courtId}`, we'll just 
      // rely on the POST response for the Operations Dashboard UI.

      request.signal.addEventListener('abort', () => {
        matchEventEmitter.off('SHIFT_HANDOVER', onShiftHandover);
        try { controller.close(); } catch (e) {}
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
