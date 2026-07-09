import { NextResponse } from 'next/server';
import { telemetryStore } from '@/lib/telemetry';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial state immediately
      const initialData = JSON.stringify(telemetryStore.getAll());
      controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

      // Listen for updates from the in-memory store
      const handleUpdate = (data: any[]) => {
        try {
          const payload = JSON.stringify(data);
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          console.error("Stream enqueue error:", err);
        }
      };

      telemetryStore.on('update', handleUpdate);

      request.signal.addEventListener('abort', () => {
        telemetryStore.off('update', handleUpdate);
        try {
          controller.close();
        } catch (e) {}
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
