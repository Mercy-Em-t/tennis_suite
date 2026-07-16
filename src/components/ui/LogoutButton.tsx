'use client';

import { useRouter } from 'next/navigation';
import styles from '@/app/app/dashboards/layout.module.css'; // Adjust if you want inline styles or another module

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button className={styles.link} onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 0, color: 'inherit', fontSize: '1rem', fontWeight: 500 }}>
      Sign Out
    </button>
  );
}
