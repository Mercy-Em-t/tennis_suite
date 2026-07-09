import { signToken } from './src/lib/auth';

async function main() {
  const token = await signToken({ 
    sub: 'delegate-123', 
    roles: ['DIRECTOR'],
    context: {
      activeRole: 'DIRECTOR',
      organizationId: 'org-123',
      activeTournamentId: 'tournament-123',
      assignedCourtId: null,
      hasClub: true
    }
  });
  console.log('---TOKEN---');
  console.log(token);
  console.log('---END---');
}

main().catch(console.error);
