'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type OnboardingState = 'ORG_PROVISIONING' | 'FINANCIAL_SETUP' | 'INFRASTRUCTURE' | 'SYNCING';

export default function HostOnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<OnboardingState>('ORG_PROVISIONING');
  const [loading, setLoading] = useState(false);
  
  // Unified Data Bundle for the Tournament Factory
  const [formData, setFormData] = useState({
    orgName: '',
    courtsCount: 4,
    surfaceType: 'HARD',
  });

  // Watch for Stripe mock return redirect
  useEffect(() => {
    if (searchParams.get('stripe_mock_success') === 'true') {
      setStep('INFRASTRUCTURE');
    }
  }, [searchParams]);

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('FINANCIAL_SETUP');
  };

  const handleStripeConnectLink = async () => {
    setLoading(true);
    // Fires request to generate Stripe Express/Custom account onboarding link
    try {
      const res = await fetch('/api/onboarding/stripe-link', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url; // Redirects out to Stripe, returns back with auth code
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const finalizeOnboarding = async () => {
    setStep('SYNCING');
    
    try {
      const response = await fetch('/api/onboarding/initialize-factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Token was automatically mutated by the backend in the response cookie.
        // We just cleanly push to the dashboard.
        router.push('/app/dashboards/host');
      } else {
        setStep('INFRASTRUCTURE');
        alert('Tournament Factory provisioning collision detected.');
      }
    } catch (e) {
      setStep('INFRASTRUCTURE');
      alert('Network failure while communicating with Factory Engine.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '448px', width: '100%', background: 'rgba(23, 23, 23, 0.5)', backdropFilter: 'blur(12px)', border: '1px solid #262626', borderRadius: '12px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {step === 'ORG_PROVISIONING' && (
          <form onSubmit={handleOrgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#a3e635' }}>01 / Create Your Organization</h2>
            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600 }}>Club or Association Name</label>
              <input 
                type="text" 
                required
                style={{ width: '100%', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '4px', padding: '8px 12px', marginTop: '4px', outline: 'none', color: 'white' }}
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              />
            </div>
            <button type="submit" style={{ width: '100%', background: '#f5f5f5', color: '#0a0a0a', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
              Next Step
            </button>
          </form>
        )}

        {step === 'FINANCIAL_SETUP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#a3e635' }}>02 / Ledger Clearing Configuration</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Tennis Suite utilizes secure automated split-ledgers. Connect your bank account via Stripe to instantly receive tournament registration entries minus platform fees.
            </p>
            <button 
              onClick={handleStripeConnectLink}
              disabled={loading}
              style={{ width: '100%', background: '#84cc16', color: '#0a0a0a', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Generating Gateway Request...' : 'Link via Stripe Connect'}
            </button>
            {/* For Dev bypass simulation purposes, clicking step changes configuration */}
            <button onClick={() => setStep('INFRASTRUCTURE')} style={{ fontSize: '0.75rem', color: '#737373', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
              Simulate Callback Complete
            </button>
          </div>
        )}

        {step === 'INFRASTRUCTURE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#a3e635' }}>03 / Infrastructure Grid Mapping</h2>
            <div>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600 }}>Number of Physical Courts Available</label>
              <input 
                type="number" 
                min={1} 
                max={32}
                style={{ width: '100%', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '4px', padding: '8px 12px', marginTop: '4px', color: 'white' }}
                value={formData.courtsCount}
                onChange={(e) => setFormData({ ...formData, courtsCount: parseInt(e.target.value) || 4 })}
              />
            </div>
            <button onClick={finalizeOnboarding} style={{ width: '100%', background: '#f5f5f5', color: '#0a0a0a', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Provision Tournament Factory
            </button>
          </div>
        )}

        {step === 'SYNCING' && (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #a3e635', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', letterSpacing: '0.025em' }}>Executing database generation block...</p>
          </div>
        )}

      </div>
    </div>
  );
}
