import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DynamicButton } from '@/components/ui/DynamicButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MapPin, Shield, Calendar, Users, Trophy, Mail, Phone, ChevronLeft } from 'lucide-react';
import styles from '@/app/(marketing)/landing.module.css';

export default async function PublicTournamentProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!tournament) return notFound();

  const isRegistrationOpen = tournament.registrationPhase === 'OPEN';

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none' }}>
          <span className={styles.brandDot} />
          Tennis <span className={styles.brandAccent}>Suite</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/login"><button className={styles.navLink}>Login</button></Link>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '120px 24px', position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />

        <div style={{ marginBottom: '32px' }}>
          <Link href="/tournaments" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <ChevronLeft size={20} /> Back to Directory
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <StatusBadge 
                  status={tournament.isActive ? 'success' : tournament.isArchived ? 'info' : 'warning'}
                >
                  {tournament.isActive ? 'LIVE' : tournament.isArchived ? 'COMPLETED' : 'UPCOMING'}
                </StatusBadge>
              </div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 16px 0', lineHeight: 1.1 }}>
                {tournament.name}
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: 0 }}>
                Join the ultimate competitive experience.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
              {isRegistrationOpen ? (
                <>
                  <Link href={`/tournaments/${tournament.id}/register`} style={{ textDecoration: 'none' }}>
                    <DynamicButton variant="primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}>
                      Register Now
                    </DynamicButton>
                  </Link>
                  <p style={{ textAlign: 'center', margin: 0, fontSize: '0.85rem', color: 'var(--success)' }}>Registration is Open!</p>
                </>
              ) : (
                <>
                  <DynamicButton variant="secondary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', opacity: 0.5, cursor: 'not-allowed' }}>
                    Registration Closed
                  </DynamicButton>
                  <p style={{ textAlign: 'center', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phase: {tournament.registrationPhase}</p>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
              <Shield size={24} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format</div>
                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{tournament.formatType}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
              <MapPin size={24} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{tournament.location || 'TBA'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
              <Trophy size={24} color="#e3b341" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prize Pool</div>
                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{tournament.prizeMoney || 'Glory & Honor'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
              <Calendar size={24} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dates</div>
                <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>Check Schedule</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '24px' }}>Tournament Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>Rules & Scoring</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {tournament.scoringRules || 'Standard ITF scoring rules apply. Matches are best of 3 tiebreak sets unless otherwise specified by the tournament director.'}
                </p>

                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>Venue Information</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {tournament.stationInfo || 'Players will be notified of specific court assignments and venue amenities upon check-in.'}
                </p>
              </div>

              <div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} color="var(--primary)" /> Contacts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Mail size={16} /> {tournament.contactEmail || 'director@tennissuite.com'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Phone size={16} /> {tournament.contactPhone || 'Contact via platform'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
