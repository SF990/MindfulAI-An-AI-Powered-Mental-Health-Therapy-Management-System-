import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      setPage('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #f0f5f2 0%, #fdf8f3 50%, #f5f0ea 100%)' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', background: 'linear-gradient(160deg, var(--sage-dark) 0%, #3d6b5a 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ textAlign: 'center', color: 'white', maxWidth: '380px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌿</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            Your mental wellness journey starts here
          </h1>
          <p style={{ opacity: 0.8, lineHeight: 1.7, fontSize: '1rem' }}>
            Connect with certified therapists in Faisalabad or chat with our AI companion — available 24/7, completely confidential.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['🔒 100% Confidential Sessions', '🤖 AI Therapy Available 24/7', '👨‍⚕️ Certified FSD Psychiatrists', '📱 Book Appointments Instantly'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1.25rem', textAlign: 'left' }}>
                <span style={{ fontSize: '0.9rem' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeUp 0.5s ease' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--charcoal)' }}>Welcome back</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>Sign in to continue your wellness journey</p>

          {error && (
            <div style={{ background: '#fef0f0', border: '1px solid #f5c6c6', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: 'var(--error)', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Email address</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '0.85rem 1.1rem', border: '2px solid #e8e4de', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', background: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                onBlur={e => e.target.style.borderColor = '#e8e4de'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.85rem 1.1rem', border: '2px solid #e8e4de', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s', background: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                onBlur={e => e.target.style.borderColor = '#e8e4de'}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <button onClick={() => setPage('register')} style={{ background: 'none', border: 'none', color: 'var(--sage-dark)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Create one free
              </button>
            </p>
          </div>

          <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'var(--cream)', borderRadius: '14px', border: '1px solid rgba(124,158,138,0.2)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
              🔒 Your data is private & encrypted. We never share personal information with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
