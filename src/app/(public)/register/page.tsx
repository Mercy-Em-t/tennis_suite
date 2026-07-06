'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function OnboardingWizard() {
  const searchParams = useSearchParams();
  const t = searchParams.get('t'); // tournamentId

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [skillLevel, setSkillLevel] = useState('');
  const [playstyle, setPlaystyle] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [category, setCategory] = useState('');
  const [franchiseName, setFranchiseName] = useState('');

  const totalSteps = t ? 3 : 2;

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!name || !email || !password) {
        setError('Please fill in all required identity fields.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (t && (!category || !franchiseName)) {
      setError('Please select a category and franchise name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        skillLevel,
        playstyle,
        emergencyContact,
        tournamentId: t,
        category,
        franchiseName
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = '/team/profile';
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Card style={{ padding: '2rem', width: '480px', background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f6fc', margin: 0 }}>
          {t ? 'Tournament Registration' : 'Create Player Account'}
        </h1>
        <p style={{ color: '#8b949e', fontSize: '0.875rem', marginTop: '4px' }}>
          Step {step} of {totalSteps}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              background: i + 1 <= step ? '#58a6ff' : '#30363d',
              borderRadius: '2px',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(248, 81, 73, 0.1)', color: '#f85149', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(248,81,73,0.3)' }}>
          {error}
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Phone Number (Optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Skill Level (NTRP / UTR)</label>
                <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none', appearance: 'none' }}>
                  <option value="">Select Level</option>
                  <option value="3.0">3.0 (Beginner)</option>
                  <option value="3.5">3.5 (Intermediate)</option>
                  <option value="4.0">4.0 (Advanced Intermediate)</option>
                  <option value="4.5">4.5 (Advanced)</option>
                  <option value="5.0">5.0+ (Elite / Pro)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Playstyle</label>
                <select value={playstyle} onChange={e => setPlaystyle(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none', appearance: 'none' }}>
                  <option value="">Select Style</option>
                  <option value="Aggressive Baseliner">Aggressive Baseliner</option>
                  <option value="Serve and Volley">Serve and Volley</option>
                  <option value="Counterpuncher">Counterpuncher</option>
                  <option value="All-Court Player">All-Court Player</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Emergency Contact Info</label>
                <input type="text" placeholder="Name & Phone Number" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
              </div>
            </motion.div>
          )}

          {step === 3 && t && (
            <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(126, 231, 135, 0.1)', border: '1px solid #7ee787', padding: '0.75rem', borderRadius: '6px', color: '#7ee787', fontSize: '0.875rem', textAlign: 'center' }}>
                Joining Tournament: <strong>{t}</strong>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none', appearance: 'none' }}>
                  <option value="">Select Category</option>
                  <option value="Mens Singles">Men's Singles</option>
                  <option value="Womens Singles">Women's Singles</option>
                  <option value="Mens Doubles">Men's Doubles</option>
                  <option value="Womens Doubles">Women's Doubles</option>
                  <option value="Mixed Doubles">Mixed Doubles</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>Franchise / Team Name *</label>
                <input type="text" placeholder="e.g. Federer / Nadal" value={franchiseName} onChange={e => setFranchiseName(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#f0f6fc', outline: 'none' }} />
                <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '0.5rem' }}>This name will appear on public brackets.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        {step > 1 && (
          <Button onClick={handleBack} style={{ flex: 1, background: '#21262d', color: '#c9d1d9', border: '1px solid rgba(240, 246, 252, 0.1)' }}>
            Back
          </Button>
        )}
        
        {step < totalSteps ? (
          <Button onClick={handleNext} style={{ flex: 2 }}>
            Next Step
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Processing...' : (t ? 'Proceed to Checkout' : 'Complete Setup')}
          </Button>
        )}
      </div>
      
      {step === 1 && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#8b949e' }}>
          Already registered? <a href="/login" style={{ color: '#58a6ff', textDecoration: 'none' }}>Login Here</a>
        </p>
      )}
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#c9d1d9', fontFamily: 'Inter, sans-serif' }}>
      <Suspense fallback={<div>Loading Onboarding...</div>}>
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
