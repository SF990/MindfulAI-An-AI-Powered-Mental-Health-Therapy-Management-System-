import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', key: 'home' },
    { label: 'AI Therapy', key: 'ai-therapy' },
    { label: 'Therapists', key: 'therapists' },
    { label: 'Pricing', key: 'pricing' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(253,250,246,0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(124,158,138,0.15)',
      padding: '0 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Logo */}
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--sage-dark), var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '18px' }}>🌿</span>
          </div>
          <span style={{ fontFamily: 'Playfair Display', fontSize: '1.3rem', fontWeight: 700, color: 'var(--charcoal)' }}>
            MindfulAI
          </span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {navLinks.map(link => (
            <button key={link.key} onClick={() => setPage(link.key)} style={{
              background: page === link.key ? 'var(--sage-dark)' : 'none',
              color: page === link.key ? 'white' : 'var(--charcoal)',
              border: 'none', cursor: 'pointer', padding: '0.5rem 1.1rem',
              borderRadius: '50px', fontFamily: 'DM Sans', fontSize: '0.9rem',
              fontWeight: 500, transition: 'all 0.2s',
            }}>
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: 'var(--cream)', borderRadius: '50px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)' }}>{user.name?.split(' ')[0]}</span>
                {user.plan && <span style={{ fontSize: '0.7rem', background: 'var(--sage-dark)', color: 'white', padding: '1px 7px', borderRadius: '20px' }}>{user.plan}</span>}
              </div>
              <button onClick={logout} style={{ background: 'none', border: '1.5px solid var(--muted)', borderRadius: '50px', padding: '0.4rem 1rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--error)'; e.target.style.color = 'var(--error)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--muted)'; e.target.style.color = 'var(--muted)'; }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" style={{ padding: '0.45rem 1.2rem', fontSize: '0.9rem' }} onClick={() => setPage('login')}>Log In</button>
              <button className="btn-primary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.9rem' }} onClick={() => setPage('register')}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
