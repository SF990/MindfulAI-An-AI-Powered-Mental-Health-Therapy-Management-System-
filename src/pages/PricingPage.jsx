import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: '#8A9499',
    icon: '🌱',
    description: 'Start your wellness journey',
    features: [
      '5 AI therapy messages/day',
      'Browse therapist profiles',
      'Access to wellness resources',
      'Basic mood tracking',
    ],
    missing: ['Book appointments', 'Unlimited AI sessions', 'Priority support'],
  },
  {
    id: 'monthly',
    name: 'Wellness',
    monthlyPrice: 999,
    yearlyPrice: 799,
    color: '#7C9E8A',
    icon: '🌿',
    description: 'For your ongoing mental wellness',
    popular: true,
    features: [
      'Unlimited AI therapy sessions',
      'Book appointments with any therapist',
      '10% discount on session fees',
      'Full mood & progress tracking',
      'Session summaries & insights',
      'Priority email support',
    ],
    missing: [],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    color: '#C4855A',
    icon: '✨',
    description: 'Complete mental health care',
    features: [
      'Everything in Wellness',
      '20% discount on session fees',
      '1 free therapist session/month',
      'Dedicated care coordinator',
      'Family account (up to 4 members)',
      '24/7 crisis support line',
      'Personalized wellness plans',
    ],
    missing: [],
  },
];

function PaymentModal({ plan, billing, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: method, 2: details, 3: success
  const [method, setMethod] = useState('');
  const [form, setForm] = useState({ name: '', card: '', expiry: '', cvv: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const label = billing === 'yearly' ? '/mo (billed yearly)' : '/month';

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000)); // Simulate payment
    setLoading(false);
    setStep(3);
    setTimeout(() => { onSuccess(plan.id); }, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'fadeUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
        {step === 3 ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</h3>
            <p style={{ color: 'var(--muted)' }}>Your <strong>{plan.name}</strong> plan is now active. Enjoy your wellness journey!</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{step === 1 ? 'Select Payment Method' : 'Enter Payment Details'}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{plan.name} Plan — Rs. {price.toLocaleString()}{label}</p>
              </div>
              <button onClick={onClose} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
            </div>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { id: 'card', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, UnionPay' },
                  { id: 'easypaisa', icon: '📱', label: 'Easypaisa', desc: 'Mobile wallet payment' },
                  { id: 'jazzcash', icon: '📱', label: 'JazzCash', desc: 'Mobile wallet payment' },
                  { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: 'HBL, MCB, UBL, Meezan' },
                ].map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setStep(2); }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: '2px solid #e8e4de', borderRadius: '14px', cursor: 'pointer', background: 'white', transition: 'all 0.2s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.background = '#f5faf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4de'; e.currentTarget.style.background = 'white'; }}>
                    <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(method === 'easypaisa' || method === 'jazzcash') ? (
                  <>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Registered Phone Number</label>
                      <input type="tel" placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.95rem' }}
                        onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                        onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                    </div>
                    <div style={{ background: '#fffbf0', border: '1px solid #f0d890', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem', color: '#8a7040' }}>
                      📲 A payment request of <strong>Rs. {price.toLocaleString()}</strong> will be sent to your {method === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} number. Approve it in your app.
                    </div>
                  </>
                ) : method === 'bank' ? (
                  <div style={{ background: '#f5faf8', borderRadius: '14px', padding: '1.25rem', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Transfer to:</p>
                    <p><strong>Account Title:</strong> MindfulAI Technologies</p>
                    <p><strong>Account #:</strong> 0123-4567890-101</p>
                    <p><strong>Bank:</strong> Meezan Bank, Faisalabad</p>
                    <p><strong>Amount:</strong> Rs. {price.toLocaleString()}</p>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--muted)' }}>After transfer, email receipt to: payments@mindfulai.pk</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Cardholder Name</label>
                      <input type="text" placeholder="As on card" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.95rem' }}
                        onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                        onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} maxLength={19}
                        style={{ width: '100%', padding: '0.8rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.95rem' }}
                        onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                        onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Expiry</label>
                        <input type="text" placeholder="MM/YY" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} maxLength={5}
                          style={{ width: '100%', padding: '0.8rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.95rem' }}
                          onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                          onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>CVV</label>
                        <input type="password" placeholder="•••" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} maxLength={4}
                          style={{ width: '100%', padding: '0.8rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.95rem' }}
                          onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                          onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                      </div>
                    </div>
                  </>
                )}

                <button className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }} onClick={handlePay} disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ animation: 'pulse-soft 1s infinite' }}>⏳</span> Processing payment…
                    </span>
                  ) : `Pay Rs. ${price.toLocaleString()} →`}
                </button>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem' }}>← Change payment method</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage({ setPage }) {
  const [billing, setBilling] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, updatePlan } = useAuth();

  const handleSelect = (plan) => {
    if (plan.monthlyPrice === 0) {
      if (user) { updatePlan('Free'); setPage('home'); }
      else setPage('register');
      return;
    }
    if (!user) { setPage('register'); return; }
    setSelectedPlan(plan);
  };

  const handleSuccess = (planId) => {
    updatePlan(planId === 'monthly' ? 'Wellness' : 'Premium');
    setSelectedPlan(null);
    setTimeout(() => setPage('home'), 500);
  };

  const savings = (plan) => {
    if (!plan.monthlyPrice) return null;
    const saved = (plan.monthlyPrice - plan.yearlyPrice) * 12;
    return saved;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f5f2 0%, var(--warm-white) 60%)', paddingTop: '90px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeUp 0.5s ease' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--charcoal)' }}>
            Invest in your <span style={{ color: 'var(--sage-dark)', fontStyle: 'italic' }}>mental wellness</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
            Affordable plans for every journey. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', background: 'white', border: '2px solid #e8e4de', borderRadius: '50px', padding: '4px' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: '0.5rem 1.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer',
                background: billing === b ? 'var(--sage-dark)' : 'transparent',
                color: billing === b ? 'white' : 'var(--muted)',
                fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
              }}>
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: billing === 'yearly' ? 'rgba(255,255,255,0.25)' : 'var(--sage-light)', color: billing === 'yearly' ? 'white' : 'var(--sage-dark)', padding: '1px 7px', borderRadius: '20px' }}>Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', animation: 'fadeUp 0.6s ease 0.1s both' }}>
          {plans.map((plan) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const saved = savings(plan);
            const isCurrent = user?.plan === plan.name;
            return (
              <div key={plan.id} style={{
                background: 'white', borderRadius: '24px', padding: '2rem',
                border: plan.popular ? `2px solid ${plan.color}` : '2px solid transparent',
                boxShadow: plan.popular ? `0 8px 40px rgba(124,158,138,0.2)` : '0 2px 20px rgba(0,0,0,0.06)',
                position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s',
                transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 50px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = plan.popular ? 'scale(1.02)' : 'scale(1)'; e.currentTarget.style.boxShadow = plan.popular ? '0 8px 40px rgba(124,158,138,0.2)' : '0 2px 20px rgba(0,0,0,0.06)'; }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', padding: '4px 20px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ⭐ Most Popular
                  </div>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{plan.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plan.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{plan.description}</p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, color: plan.color }}>
                    {price === 0 ? 'Free' : `Rs.${price.toLocaleString()}`}
                  </span>
                  {price > 0 && <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>/mo</span>}
                  {billing === 'yearly' && saved > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--sage-dark)', fontWeight: 500, marginTop: '2px' }}>
                      Save Rs. {saved.toLocaleString()} per year
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent}
                  style={{
                    width: '100%', padding: '0.85rem', borderRadius: '50px', border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? '#e8e4de' : (plan.popular ? plan.color : 'var(--charcoal)'),
                    color: 'white', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '0.95rem',
                    transition: 'all 0.2s', marginBottom: '1.5rem',
                  }}>
                  {isCurrent ? '✓ Current Plan' : price === 0 ? 'Start Free' : 'Choose Plan →'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      <span style={{ color: plan.color, fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--charcoal)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      <span style={{ color: '#d0d0d0', fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>—</span>
                      <span style={{ color: '#c0c0c0' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          {['🔒 SSL Secured', '📱 Easypaisa & JazzCash', '💳 All Cards Accepted', '↩️ Cancel Anytime', '🏦 Bank Transfer Available'].map(b => (
            <span key={b} style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{b}</span>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} billing={billing} onClose={() => setSelectedPlan(null)} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
