import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { emergencyIntervention } from '@/lib/monitor/EmergencyInterventionService';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(['ADMIN', 'HOST']);
    if (authResult instanceof NextResponse) return authResult;
    
    // Using any for now to extract the user object from the mock auth
    const user = (authResult as any).user;
    const adminName = user?.name || 'Unknown Admin';

    const { action, clientId } = await request.json();

    if (!clientId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'HOT_SWAP') {
      emergencyIntervention.hotSwapStream('court_unknown', '192.168.1.100', adminName);
    } else if (action === 'RESET_CONN') {
      emergencyIntervention.forceConnectionReset(clientId, adminName);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/Monitor/Intervene]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
