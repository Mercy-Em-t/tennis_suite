require('ts-node').register({ transpileOnly: true });
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('./src/lib/auth');

async function run() {
  const prisma = new PrismaClient();
  try {
    const tournament = await prisma.tournament.findFirst({
      include: { host: true }
    });
    if (!tournament) {
      console.log('No tournament found in DB');
      return;
    }
    
    console.log('Tournament ID:', tournament.id);
    console.log('Host ID:', tournament.hostId);
    
    // Create token
    const token = await signToken({
      sub: tournament.hostId || 'some-id',
      roles: ['HOST'],
      context: {
        activeRole: 'HOST',
        organizationId: tournament.clubId,
        activeTournamentId: null,
        assignedCourtId: null,
        hasClub: !!tournament.clubId
      }
    });
    
    // Fetch API
    const res = await fetch(`http://localhost:3000/api/tournaments/${tournament.id}`, {
      headers: {
        'Cookie': `auth_token=${token}`
      }
    });
    
    const data = await res.json();
    console.log('API Status:', res.status);
    console.log('API Response Success:', data.success);
    if (!data.success) {
      console.log('API Error Data:', data);
    }
  } catch (e) {
    console.error('Script Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
