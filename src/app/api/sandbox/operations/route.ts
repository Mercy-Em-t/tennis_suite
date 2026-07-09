import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { telemetryStore } from '@/lib/telemetry';

export async function GET() {
  try {
    // 1. Create a tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Operations Sandbox',
        formatType: 'Standard',
        isActive: true,
        maxTeams: 8
      },
    });

    // 2. Create the Directors
    const morningDir = await prisma.user.create({
      data: { name: 'Morning Director (Shift A)', email: `dirA.${Date.now()}@example.com`, role: 'DIRECTOR' }
    });
    const afternoonDir = await prisma.user.create({
      data: { name: 'Afternoon Lead (Shift B)', email: `dirB.${Date.now()}@example.com`, role: 'DIRECTOR' }
    });

    // 3. Create Courts
    const court1 = await prisma.court.create({ data: { name: 'Court Alpha (Stale)', tournamentId: tournament.id } });
    const court2 = await prisma.court.create({ data: { name: 'Court Beta (Offline)', tournamentId: tournament.id } });
    const court3 = await prisma.court.create({ data: { name: 'Court Gamma (Online)', tournamentId: tournament.id } });

    // 4. Inject Telemetry Data
    const now = Date.now();
    
    // Court 1: Stagnant Session (> 12 hours ago = 43200000 ms)
    // To hack the store for testing, we manually set the Map entry because recordPing overwrites to Date.now()
    const storeMap = (telemetryStore as any).store;
    storeMap.set(court1.id, {
      courtId: court1.id,
      courtName: court1.name,
      lastPingAt: now - 45000000, // ~12.5 hours ago
      latencyMs: 50,
      status: 'OFFLINE'
    });

    // Court 2: Missing entirely (No telemetry injected)

    // Court 3: Online
    storeMap.set(court3.id, {
      courtId: court3.id,
      courtName: court3.name,
      lastPingAt: now - 1000,
      latencyMs: 40,
      status: 'ONLINE'
    });

    return NextResponse.json({
      success: true,
      message: 'Operations Sandbox ready.',
      tournamentId: tournament.id,
      directors: [morningDir, afternoonDir],
      activeDirectorId: morningDir.id,
      courts: [court1, court2, court3]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
