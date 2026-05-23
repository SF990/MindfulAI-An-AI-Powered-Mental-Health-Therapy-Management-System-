import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ setPage }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      setPage('pricing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.85rem 1.1rem', border: '2px solid #e8e4de',
    borderRadius: '12px', fontSize: '0.95rem', outline: 'none',
    transition: 'border 0.2s', background: 'white',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f5f2 0%, #fdf8f3 100%)', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌱</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Begin your healing journey</h2>
          <p style={{ color: 'var(--muted)' }}>Create your free account in seconds</p>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 4px 40px rgba(0,0,0,0.07)', border: '1px solid rgba(124,158,138,0.15)' }}>
          {error && (
            <div style={{ background: '#fef0f0', border: '1px solid #f5c6c6', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: 'var(--error)', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                onBlur={e => e.target.style.borderColor = '#e8e4de'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                onBlur={e => e.target.style.borderColor = '#e8e4de'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 chars" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                  onBlur={e => e.target.style.borderColor = '#e8e4de'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Confirm</label>
                <input type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                  onBlur={e => e.target.style.borderColor = '#e8e4de'} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.25rem' }} disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Free Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: 'var(--sage-dark)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
              Sign in
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
          By registering, you agree to our Terms of Service & Privacy Policy.<br />
          Your mental health data is always encrypted and protected.
        </p>
      </div>
    </div>
  );
}
