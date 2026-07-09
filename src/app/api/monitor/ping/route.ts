import { NextResponse } from 'next/server';
import { telemetryStore } from '@/lib/telemetry';

export async function POST(request: Request) {
  try {
    const { courtId, courtName, clientTimestamp } = await request.json();

    if (!courtId || !clientTimestamp) {
      return NextResponse.json({ error: 'courtId and clientTimestamp are required.' }, { status: 400 });
    }

    telemetryStore.recordPing(courtId, courtName || `Court ${courtId}`, clientTimestamp);

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
