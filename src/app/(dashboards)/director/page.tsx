import { redirect } from 'next/navigation';

export default async function DirectorDashboard() {
  redirect('/director/crisis');
}
