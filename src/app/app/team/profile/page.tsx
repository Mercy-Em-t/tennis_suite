import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

import { PlayerPassport } from '@/components/tennis/PlayerPassport';
import styles from './profile.module.css';



export default async function PlayerProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect('/login');
  }

  // Fetch the current user from DB
  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user) {
    // If the user doesn't exist, redirect to a safe place
    redirect('/login');
  }

  return (
    <div className={styles.pageWrapper}>
      <PlayerPassport user={user} isOwner={true} />
    </div>
  );
}
