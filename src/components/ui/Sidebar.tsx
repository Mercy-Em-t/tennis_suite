'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogOut, Menu, X, Trash2, LayoutDashboard, Trophy, Radio, 
  ShieldAlert, Settings, Briefcase, Users, Video, Activity,
  Gavel, Key
} from 'lucide-react';
import { LogoutButton } from '@/components/ui/LogoutButton';
import { DeleteAccountModal } from '@/components/ui/DeleteAccountModal';

function DynamicIcon({ name }: { name: string }) {
  const props = { size: 20 };
  switch (name) {
    case 'LayoutDashboard': return <LayoutDashboard {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    case 'Radio': return <Radio {...props} />;
    case 'ShieldAlert': return <ShieldAlert {...props} />;
    case 'Settings': return <Settings {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Video': return <Video {...props} />;
    case 'Activity': return <Activity {...props} />;
    case 'Gavel': return <Gavel {...props} />;
    case 'Key': return <Key {...props} />;
    default: return <LayoutDashboard {...props} />;
  }
}

interface NavItem {
  name: string;
  path: string;
  iconName: string;
}

interface SidebarProps {
  role: string;
  navItems: NavItem[];
}

export function Sidebar({ role, navItems }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile after clicking a link
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <>
      {/* Mobile Hamburger Header */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(13, 17, 23, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          zIndex: 40,
          gap: '16px'
        }}>
          <button 
            onClick={() => setIsOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}
          >
            <Menu size={24} />
          </button>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Tennis <span style={{ color: '#58a6ff', WebkitTextFillColor: 'initial' }}>Suite</span>
            </h1>
          </Link>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 45 }}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        style={{
          background: 'rgba(13, 17, 23, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '280px',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
              Tennis <span style={{ color: '#58a6ff', WebkitTextFillColor: 'initial' }}>Suite</span>
            </h1>
          </Link>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b949e', marginBottom: '8px', paddingLeft: '8px', fontWeight: 700 }}>
            {role} NAVIGATION
          </div>
          
          {navItems.map(item => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: isActive ? '#fff' : '#8b949e',
                    background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                    border: '1px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#8b949e';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ color: isActive ? '#58a6ff' : 'inherit' }}>
                    <DynamicIcon name={item.iconName} />
                  </span>
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#c9d1d9',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}>
            <LogOut size={20} />
            <span style={{ fontWeight: 500, flex: 1 }}>
              <LogoutButton />
            </span>
          </div>

          <button 
            onClick={() => setDeleteModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              width: '100%',
              fontSize: '1rem',
              fontWeight: 500,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>
      </aside>

      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />

      {/* Spacer for mobile layout so content isn't hidden under fixed header */}
      {isMobile && <div style={{ height: '60px' }} />}
    </>
  );
}
