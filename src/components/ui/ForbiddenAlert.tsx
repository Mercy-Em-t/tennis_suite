'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ForbiddenAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'forbidden') {
      setShow(true);
      // Clean up URL without triggering a refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete('error');
      const newUrl = pathname + (params.toString() ? `?${params.toString()}` : '');
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#ef4444',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <span style={{ fontSize: '1.2rem' }}>⛔</span>
      <div>
        <strong>Forbidden Action</strong>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>You do not have permission to access that area.</div>
      </div>
      <button 
        onClick={() => setShow(false)}
        style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '12px', cursor: 'pointer', opacity: 0.7 }}
      >
        ✕
      </button>
    </div>
  );
}
