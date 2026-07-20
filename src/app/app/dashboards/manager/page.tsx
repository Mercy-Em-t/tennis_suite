import { getGlobalMetrics, getTournaments, getFinancialOverview } from '@/lib/services/managerService';
import ManagerDashboardClient from '@/components/manager/ManagerDashboardClient';
import { requireAuth } from '@/lib/auth/require-auth';
import { redirect } from 'next/navigation';

export default async function ManagerDashboardPage() {
  const payload = await requireAuth();
  
  if (payload instanceof Response) {
    return payload; // Redirect handled by requireAuth
  }

  // Verify role
  if (payload.role !== 'MANAGER') {
    redirect('/login?error=forbidden');
  }

  // Fetch all data server-side
  const [metrics, tournaments, financials] = await Promise.all([
    getGlobalMetrics(),
    getTournaments(),
    getFinancialOverview()
  ]);

  return (
    <ManagerDashboardClient 
      metrics={metrics}
      tournaments={tournaments}
      financials={financials}
    />
  );
}
