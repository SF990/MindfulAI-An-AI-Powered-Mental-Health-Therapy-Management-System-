import { useAuth } from '../context/AuthContext';

export default function HomePage({ setPage }) {
  const { user } = useAuth();

  return (
    <div style={{ paddingTop: '68px' }}>
      {/* Hero */}
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #ecf4f0 0%, #fdfaf6 50%, #f5ede5 100%)', position: 'relative', overflow: 'hidden', padding: '3rem 2rem' }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,158,138,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,133,90,0.1) 0%, transparent 70%)' }} />

        <div style={{ textAlign: 'center', maxWidth: '720px', position: 'relative', zIndex: 1, animation: 'fadeUp 0.7s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,158,138,0.12)', border: '1px solid rgba(124,158,138,0.3)', borderRadius: '50px', padding: '0.4rem 1.1rem', marginBottom: '1.75rem', fontSize: '0.85rem', color: 'var(--sage-dark)', fontWeight: 500 }}>
            🌿 Mental wellness, reimagined for Pakistan
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.5rem', color: 'var(--charcoal)' }}>
            You deserve to feel{' '}
            <span style={{ color: 'var(--sage-dark)', fontStyle: 'italic' }}>better</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '580px', margin: '0 auto 2.5rem' }}>
            Connect with Faisalabad's best psychiatrists & therapists, or start healing right now with our AI companion — trained in evidence-based therapy.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }} onClick={() => setPage('ai-therapy')}>
              🌿 Start AI Therapy — Free
            </button>
            <button className="btn-outline" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }} onClick={() => setPage('therapists')}>
              Find a Therapist →
            </button>
          </div>
          <p style={{ marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
            No credit card required · 100% confidential · Available 24/7
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '3.5rem', color: 'var(--charcoal)' }}>
            Everything you need to <em style={{ color: 'var(--sage-dark)' }}>heal & grow</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: '🤖', color: '#7C9E8A', title: 'AI Therapy Chat', desc: 'Serene, our AI companion, is trained in CBT, mindfulness, and psychotherapy. Talk anytime, about anything, judgment-free.', cta: 'Chat Now', page: 'ai-therapy' },
              { icon: '👨‍⚕️', color: '#C4855A', title: 'Expert Therapists', desc: '6 verified psychiatrists & psychologists from Faisalabad. See their profiles, specialties, fees, and book in minutes.', cta: 'Browse Therapists', page: 'therapists' },
              { icon: '✨', color: '#D4A847', title: 'Affordable Plans', desc: 'Monthly & yearly subscriptions starting from Rs. 999/mo. All plans include AI therapy + appointment discounts.', cta: 'See Pricing', page: 'pricing' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--cream)', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(124,158,138,0.12)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--charcoal)' }}>{f.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.65, fontSize: '0.9rem', marginBottom: '1.25rem' }}>{f.desc}</p>
                <button onClick={() => setPage(f.page)} style={{ background: 'none', border: 'none', color: f.color, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', padding: 0, fontFamily: 'DM Sans' }}>
                  {f.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '4rem 2rem', background: 'var(--sage-dark)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
          {[
            { num: '6+', label: 'Verified FSD Therapists' },
            { num: '24/7', label: 'AI Support Available' },
            { num: '100%', label: 'Confidential & Private' },
            { num: 'Rs.999', label: 'Starting Monthly Fee' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #f0f5f2, #fdf8f3)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--charcoal)' }}>
          Ready to begin?
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Your first step toward wellness is free.
        </p>
        {user ? (
          <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }} onClick={() => setPage('ai-therapy')}>
            Continue My Journey 🌿
          </button>
        ) : (
          <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }} onClick={() => setPage('register')}>
            Create Free Account →
          </button>
        )}
      </div>

      {/* Footer */}
      <footer style={{ padding: '2rem', background: 'var(--charcoal)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
          🌿 MindfulAI — Faisalabad's mental wellness platform. All sessions are private and encrypted.
          <br />If you're in crisis, call <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Umang Helpline: 0317-4288665</strong>
        </p>
      </footer>
    </div>
  );
}
