import { NextResponse } from 'next/server';
import { serverSessionLayer } from '@/lib/osi/ServerSessionModule';
import { MessageObject } from '@/lib/osi/types';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    
    // Reconstruct the OSI MessageObject from the Transport wrapper
    const message: MessageObject = {
      header: {
        session_id: rawBody.session_id,
        sender_id: rawBody.metadata?.sender_id,
        recipient_id: rawBody.metadata?.recipient_id,
        timestamp: rawBody.metadata?.timestamp
      },
      payload: rawBody.payload
    };

    // Pass the message up the Server OSI stack starting from Session Layer (L5)
    const response = await serverSessionLayer.receive(message);
    
    // The response is either a success { payload: ... } or { status: 'failure', ... }
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      status: 'failure',
      error_code: 'ERR_TRANSPORT_LOST',
      message: 'Failed to process message at the network transport layer.',
      suggested_action: 'Check packet formatting.'
    }, { status: 500 });
  }
}
