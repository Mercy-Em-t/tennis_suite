"use client";

import styles from "./page.module.css";
import { useState } from 'react';

export default function GatewayStorefront() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [service, setService] = useState('ORGANIZER');

  const handleLogin = async (role: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Login failed");
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, service })
      });
      if (res.ok) alert("Thanks! We'll be in touch.");
    } catch (error) {
      console.error("Lead capture failed");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>The Elite Tournament Suite</h1>
        <p className={styles.subtitle}>Unified Operations & Broadcasting for Pro-Am Events</p>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <h2>Interested in Hosting?</h2>
          <form onSubmit={submitLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--bg-main)', color: 'white' }} />
            <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--bg-main)', color: 'white' }} />
            <select value={service} onChange={e => setService(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--bg-main)', color: 'white' }}>
              <option value="ORGANIZER">Tournament Organizer</option>
              <option value="PLAYER">Franchise Player</option>
              <option value="BROADCASTER">Broadcaster</option>
            </select>
            <button type="submit" style={{ padding: '0.75rem', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Join the Waitlist</button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Staff Login Portal</h2>
          <div className={styles.roleGrid}>
            <button className={styles.roleBtn} onClick={() => handleLogin('host')}>Log in as Host</button>
            <button className={styles.roleBtn} onClick={() => handleLogin('marshall')}>Log in as Marshall</button>
            <button className={styles.roleBtn} onClick={() => handleLogin('referee')}>Log in as Referee</button>
            <button className={styles.roleBtn} onClick={() => handleLogin('broadcaster')}>Log in as Broadcaster</button>
          </div>
        </section>
      </main>
    </div>
  );
}
