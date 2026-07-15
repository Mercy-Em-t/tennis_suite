import Link from 'next/link';
import styles from '@/app/(dashboards)/layout.module.css';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { ShieldAlert, Users, Landmark, Activity, Gavel, CalendarClock } from 'lucide-react';

export function DirectorSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Tennis <span>Suite</span></div>
      
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <h3 className={styles.navHeading}>COMMAND AREAS</h3>
          <Link href="/director/crisis" className={styles.link}>
            <ShieldAlert size={18} className={styles.icon} />
            CRISIS CONTROL
          </Link>
          <Link href="/director/operations" className={styles.link}>
            <Activity size={18} className={styles.icon} />
            OPERATIONS & HEALTH
          </Link>
          <Link href="/director/financials" className={styles.link}>
            <Landmark size={18} className={styles.icon} />
            FINANCIALS
          </Link>
          <Link href="/director/compliance" className={styles.link}>
            <Gavel size={18} className={styles.icon} />
            ARCHIVE & COMPLIANCE
          </Link>
        </div>

        <div className={styles.logoutWrapper}>
          <LogoutButton />
        </div>
      </nav>
      
      <div className={styles.user}>
        <div className={styles.roleBadge}>DELEGATE</div>
        System Status: <span className={styles.statusOk}>SECURE</span>
      </div>
    </aside>
  );
}
