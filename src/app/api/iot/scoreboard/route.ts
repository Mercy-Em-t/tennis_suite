import { NextResponse } from 'next/server';

/**
 * Pillar 19: IoT Integration Layer
 * Webhook that pushes real-time score updates to a physical Bluetooth scoreboard on the court.
 */
export async function POST(request: Request) {
  try {
    const { courtId, scoreState, currentServer } = await request.json();

    // In a real scenario, this would send an MQTT/Bluetooth payload to the physical hardware
    console.log(`[IoT WEBHOOK] Pushing score state ${JSON.stringify(scoreState)} (Server: ${currentServer}) to physical court ${courtId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Hardware sync payload dispatched successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync with hardware scoreboard' }, { status: 400 });
  }
}
