import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real production system, this would pipe to an internal notification service 
    // (e.g. SendGrid, Resend, Slack webhook, or a database).
    console.log('[Contact Us Submission]', data);
    
    return NextResponse.json({ success: true, message: 'Message received. We will be in touch shortly.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
