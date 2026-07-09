import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, TennisSuiteToken } from '@/lib/auth';

export default async function CentralSortingHatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // Route 1: Unauthenticated context goes straight back to auth shell
  if (!token) {
    redirect('/login');
  }

  const session = await verifyToken(token);
  if (!session) {
    redirect('/login?error=invalid_token');
  }

  const { activeRole, organizationId, hasClub } = session.context;

  // Route 2: Contextual Sorting Evaluators
  switch (activeRole.toUpperCase()) {
    case 'HOST':
    case 'ADMIN':
      // Check if the host has initialized an organization container yet
      if (!organizationId && !hasClub) {
        redirect('/app/onboarding');
      }
      redirect('/app/dashboards/host');

    case 'REFEREE':
      redirect('/app/dashboards/referee');

    case 'MARSHAL':
    case 'MARSHALL':
      redirect('/app/dashboards/marshal');

    case 'PLAYER':
      redirect('/app/dashboards/player');

    case 'BROADCASTER':
      redirect('/app/dashboards/broadcast');

    case 'DIRECTOR':
    case 'DELEGATE':
      redirect('/app/dashboards/delegate');

    case 'MONITOR':
      redirect('/monitor'); // Technical director command center root bypass

    default:
      console.warn(`Unmapped entity profile context signature observed: ${activeRole}`);
      redirect('/login?error=invalid_context');
  }
}
