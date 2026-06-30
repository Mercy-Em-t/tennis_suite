import styles from './layout.module.css';
import Link from 'next/link';

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Tennis <span>Suite</span></div>
        <nav className={styles.nav}>
          <Link href="/tournaments" className={styles.link}>Tournament Hub</Link>
          <Link href="/broadcast" className={styles.link}>Broadcaster View</Link>
        </nav>
        <div className={styles.user}>Walled Garden Access</div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
