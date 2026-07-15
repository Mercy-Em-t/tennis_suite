import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { systemHealth } from '@/lib/monitor/SystemHealthService';
import { emergencyIntervention } from '@/lib/monitor/EmergencyInterventionService';

export async function GET() {
  try {
    const authResult = await requireAuth(['ADMIN', 'HOST']);
    if (authResult instanceof NextResponse) return authResult;

    // Fetch the overview and audit logs from the mock telemetry engine
    const overview = systemHealth.getSystemOverview();
    const auditLog = emergencyIntervention.getAuditTrail();

    return NextResponse.json({ overview, auditLog });
  } catch (error) {
    console.error('[API/Monitor/Telemetry]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
