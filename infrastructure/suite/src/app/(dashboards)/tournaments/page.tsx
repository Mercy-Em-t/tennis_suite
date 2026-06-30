"use client";

export default function TournamentsDashboard() {
  const handleLogout = () => {
    document.cookie = 'mock_auth_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Organizer Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome to your isolated walled garden. Only users with the 'host' or 'admin' role can access this page.</p>
      
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <h2>The Pure Doubles Tournament</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <h3>Active Pools</h3>
            <ul style={{ color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Pool A (4 Teams)</li>
              <li>Pool B (4 Teams)</li>
            </ul>
          </div>
          <div>
            <h3>Recent Actions</h3>
            <ul style={{ color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>System routed you here automatically.</li>
              <li>Mock authorization granted.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
