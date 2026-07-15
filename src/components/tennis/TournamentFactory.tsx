'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TournamentFactory.module.css';

interface TournamentFactoryProps {
  onClose: () => void;
}

export default function TournamentFactory({ onClose }: TournamentFactoryProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    formatType: 'Round-Robin',
    matchDuration: '60',
    scoringRules: 'Advantage',
    categories: '',
    numCourts: '1',
    surfaceType: 'Hard',
    logoUrl: '',
    sponsorUrl: ''
  });

  const predefinedCategories = [
    "Men's Singles",
    "Women's Singles",
    "Men's Doubles",
    "Women's Doubles",
    "Mixed Doubles"
  ];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Tournament name is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.location.trim()) newErrors.location = 'Location/Venue is required';
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    if (currentStep === 2) {
      if (!formData.formatType) newErrors.formatType = 'Format type is required';
      if (selectedCategories.length === 0) newErrors.categories = 'At least one category is required';
      if (formData.matchDuration) {
        const duration = parseInt(formData.matchDuration);
        if (isNaN(duration) || duration <= 0) {
          newErrors.matchDuration = 'Match duration must be a positive number';
        }
      }
      if (!formData.scoringRules) newErrors.scoringRules = 'Scoring rules are required';
    }

    if (currentStep === 3) {
      const courts = parseInt(formData.numCourts);
      if (isNaN(courts) || courts <= 0) newErrors.numCourts = 'Number of courts must be at least 1';
      if (!formData.surfaceType) newErrors.surfaceType = 'Surface type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setErrors({});
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handlePrev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when editing the field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (val === '__custom__') {
      setShowCustomModal(true);
      e.target.value = ''; // Reset selection
      return;
    }
    if (!selectedCategories.includes(val)) {
      const updated = [...selectedCategories, val];
      setSelectedCategories(updated);
      setFormData(prev => ({ ...prev, categories: updated.join(', ') }));
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.categories;
        return copy;
      });
    }
    e.target.value = ''; // Reset selection
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updated = selectedCategories.filter(c => c !== catToRemove);
    setSelectedCategories(updated);
    setFormData(prev => ({ ...prev, categories: updated.join(', ') }));
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customCategoryName.trim();
    if (name) {
      if (!selectedCategories.includes(name)) {
        const updated = [...selectedCategories, name];
        setSelectedCategories(updated);
        setFormData(prev => ({ ...prev, categories: updated.join(', ') }));
        setErrors(prev => {
          const copy = { ...prev };
          delete copy.categories;
          return copy;
        });
      }
      setCustomCategoryName('');
      setShowCustomModal(false);
    }
  };

  const handleLaunch = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        // Clear all form data upon success
        setFormData({
          name: '',
          startDate: '',
          endDate: '',
          location: '',
          formatType: 'Round-Robin',
          matchDuration: '60',
          scoringRules: 'Advantage',
          categories: '',
          numCourts: '1',
          surfaceType: 'Hard',
          logoUrl: '',
          sponsorUrl: ''
        });
        setSelectedCategories([]);
        setErrors({});

        // Delay routing to let the user see the success message
        setTimeout(() => {
          onClose();
          router.push(`/tournaments/${data.tournament.id}`);
        }, 1500);
      } else {
        setSubmitError(data.error || 'Failed to provision tournament');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An error occurred during provisioning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const capacity = Math.floor((parseInt(formData.numCourts) || 0) * 2 / ((parseInt(formData.matchDuration) || 60) / 60));

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Tournament Factory</h2>
          <div className={styles.steps}>
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`${styles.stepIndicator} ${step === s ? styles.active : ''} ${step > s ? styles.completed : ''}`} 
              />
            ))}
          </div>
        </div>

        <div className={styles.content}>
          {submitSuccess && (
            <div className={styles.successBanner}>
              🎉 Tournament provisioned successfully! Redirecting...
            </div>
          )}

          {submitError && (
            <div className={styles.errorBanner}>
              ❌ {submitError}
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className={styles.stepTitle}>1. Identity</h3>
              <div className={styles.formGroup}>
                <label>Tournament Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`} 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Summer Slam 2026" 
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    className={`${styles.input} ${errors.startDate ? styles.inputError : ''}`} 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleChange} 
                  />
                  {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>End Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`} 
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleChange} 
                  />
                  {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Location / Venue Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  className={`${styles.input} ${errors.location ? styles.inputError : ''}`} 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. Central Park Tennis Center" 
                />
                {errors.location && <span className={styles.errorText}>{errors.location}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className={styles.stepTitle}>2. Structure</h3>
              <div className={styles.formGroup}>
                <label>Format Type <span style={{ color: '#ef4444' }}>*</span></label>
                <select className={styles.input} name="formatType" value={formData.formatType} onChange={handleChange}>
                  <option value="Round-Robin">Round-Robin</option>
                  <option value="Elimination">Elimination</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Categories (Select to add) <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  className={`${styles.input} ${errors.categories ? styles.inputError : ''}`} 
                  onChange={handleCategorySelect}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a Category --</option>
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat} disabled={selectedCategories.includes(cat)}>
                      {cat} {selectedCategories.includes(cat) ? '(Added)' : ''}
                    </option>
                  ))}
                  <option value="__custom__" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                    + Create Custom Category...
                  </option>
                </select>
                {errors.categories && <span className={styles.errorText}>{errors.categories}</span>}

                {selectedCategories.length > 0 && (
                  <div className={styles.badgeContainer}>
                    {selectedCategories.map((cat) => (
                      <span key={cat} className={styles.badge}>
                        {cat}
                        <button 
                          type="button" 
                          className={styles.removeBadgeBtn} 
                          onClick={() => handleRemoveCategory(cat)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Match Duration (minutes, optional)</label>
                  <input 
                    className={`${styles.input} ${errors.matchDuration ? styles.inputError : ''}`} 
                    type="number" 
                    name="matchDuration" 
                    value={formData.matchDuration} 
                    onChange={handleChange} 
                  />
                  {errors.matchDuration && <span className={styles.errorText}>{errors.matchDuration}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Scoring Rules <span style={{ color: '#ef4444' }}>*</span></label>
                  <select className={styles.input} name="scoringRules" value={formData.scoringRules} onChange={handleChange}>
                    <option value="Advantage">Advantage</option>
                    <option value="No-Ad">No-Ad</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className={styles.stepTitle}>3. Infrastructure</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Number of Courts <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    className={`${styles.input} ${errors.numCourts ? styles.inputError : ''}`} 
                    type="number" 
                    min="1" 
                    name="numCourts" 
                    value={formData.numCourts} 
                    onChange={handleChange} 
                  />
                  {errors.numCourts && <span className={styles.errorText}>{errors.numCourts}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Surface Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <select className={styles.input} name="surfaceType" value={formData.surfaceType} onChange={handleChange}>
                    <option value="Hard">Hard Court</option>
                    <option value="Clay">Clay</option>
                    <option value="Grass">Grass</option>
                  </select>
                </div>
              </div>
              <div className={styles.capacityPreview}>
                <span>Simultaneous Match Capacity</span>
                <strong>{isNaN(capacity) ? 0 : capacity} players/hr</strong>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className={styles.stepTitle}>4. Branding</h3>
              <div className={styles.formGroup}>
                <label>Logo URL (Optional)</label>
                <input className={styles.input} name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className={styles.formGroup}>
                <label>Sponsor URL (Optional)</label>
                <input className={styles.input} name="sponsorUrl" value={formData.sponsorUrl} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={step === 1 ? onClose : handlePrev} disabled={isSubmitting}>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button className={styles.nextBtn} onClick={handleNext}>Next</button>
          ) : (
            <button className={styles.launchBtn} onClick={handleLaunch} disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning courts and starting tournament...' : 'Launch'}
            </button>
          )}
        </div>
      </div>

      {/* --- Custom Category Creation Modal --- */}
      {showCustomModal && (
        <div className={styles.customModalOverlay}>
          <div className={styles.customModal}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Create Custom Category</h3>
            <form onSubmit={handleAddCustomCategory}>
              <div className={styles.formGroup}>
                <input 
                  className={styles.input} 
                  type="text"
                  placeholder="e.g. Mixed 45+ Doubles" 
                  value={customCategoryName} 
                  onChange={(e) => setCustomCategoryName(e.target.value)} 
                  autoFocus 
                  required
                />
              </div>
              <div className={styles.customModalButtons}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={() => { setShowCustomModal(false); setCustomCategoryName(''); }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.launchBtn} style={{ background: '#3b82f6', color: '#fff', padding: '0.5rem 1rem' }}>
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
