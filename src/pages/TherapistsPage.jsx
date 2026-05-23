import { useState } from 'react';
import { therapists, saveAppointment } from '../data/therapists.js';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.floor(rating) ? '#D4A847' : '#e0e0e0', fontSize: '0.8rem' }}>★</span>
      ))}
      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '4px' }}>{rating} ({therapists.find(t => t.rating === rating)?.reviews || ''})</span>
    </div>
  );
}

function AppointmentModal({ therapist, onClose, user, setPage }) {
  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState('in-person');
  const [booked, setBooked] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const availableDates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    if (therapist.available.includes(dayName)) {
      availableDates.push({ date: d, dayName, label: d.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }) });
    }
  }

  const handleBook = async () => {
    setIsBooking(true);
    await saveAppointment({
      therapistId: therapist.id,
      therapistName: therapist.name,
      userId: user?.id,
      userName: user?.name,
      date: selectedDay,
      time: selectedTime,
      mode,
      reason,
      fee: therapist.fee,
    });
    setIsBooking(false);
    setBooked(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '540px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'fadeUp 0.3s ease' }} onClick={e => e.stopPropagation()}>

        {booked ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Appointment Booked!</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
              Your session with <strong>{therapist.name}</strong> is confirmed for<br />
              <strong>{selectedDay}</strong> at <strong>{selectedTime}</strong>
            </p>
            <div style={{ background: 'var(--cream)', borderRadius: '14px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Appointment Summary</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8 }}>
                📍 {mode === 'in-person' ? therapist.clinic : 'Online (link will be emailed)'}<br />
                💰 Consultation Fee: Rs. {therapist.fee.toLocaleString()}<br />
                📱 You'll receive a confirmation SMS shortly
              </p>
            </div>
            <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
          </div>
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Login to Book</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create a free account to book appointments with our therapists.</p>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={() => { onClose(); setPage('register'); }}>Create Free Account</button>
            <button className="btn-outline" style={{ width: '100%' }} onClick={() => { onClose(); setPage('login'); }}>Sign In</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: therapist.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{therapist.initials}</div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{therapist.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Rs. {therapist.fee.toLocaleString()} per session</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
            </div>

            {/* Steps indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              {['Date & Time', 'Details', 'Confirm'].map((s, i) => (
                <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > i + 1 ? 'var(--sage-dark)' : step === i + 1 ? 'var(--sage)' : '#e8e4de', color: step >= i + 1 ? 'white' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: step === i + 1 ? 'var(--sage-dark)' : 'var(--muted)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Select a date</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                  {availableDates.map(d => (
                    <button key={d.label} onClick={() => setSelectedDay(d.label)} style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: `2px solid ${selectedDay === d.label ? 'var(--sage-dark)' : '#e8e4de'}`, background: selectedDay === d.label ? 'var(--sage-dark)' : 'white', color: selectedDay === d.label ? 'white' : 'var(--charcoal)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Select a time</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                  {therapist.times.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: `2px solid ${selectedTime === t ? 'var(--sage-dark)' : '#e8e4de'}`, background: selectedTime === t ? 'var(--sage-dark)' : 'white', color: selectedTime === t ? 'white' : 'var(--charcoal)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  ))}
                </div>
                <button className="btn-primary" style={{ width: '100%' }} disabled={!selectedDay || !selectedTime} onClick={() => setStep(2)}>Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Session mode</p>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[{ id: 'in-person', label: '🏥 In-Person', sub: therapist.clinic.split(',')[0] }, { id: 'online', label: '💻 Online', sub: 'Video call link via email' }].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: `2px solid ${mode === m.id ? 'var(--sage-dark)' : '#e8e4de'}`, background: mode === m.id ? '#f0f8f4' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{m.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.sub}</div>
                    </button>
                  ))}
                </div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Reason for visit <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></p>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe what you'd like to discuss..." rows={4}
                  style={{ width: '100%', padding: '0.85rem', border: '2px solid #e8e4de', borderRadius: '12px', outline: 'none', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'DM Sans', marginBottom: '1.25rem' }}
                  onFocus={e => e.target.style.borderColor = 'var(--sage)'}
                  onBlur={e => e.target.style.borderColor = '#e8e4de'} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Review →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ background: 'var(--cream)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Booking Summary</h4>
                  {[
                    ['Doctor', therapist.name],
                    ['Specialty', therapist.title],
                    ['Date', selectedDay],
                    ['Time', selectedTime],
                    ['Mode', mode === 'in-person' ? 'In-Person' : 'Online'],
                    ['Location', mode === 'in-person' ? therapist.clinic : 'Video call (link via email)'],
                    ['Fee', `Rs. ${therapist.fee.toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(124,158,138,0.15)', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--muted)' }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fffbf0', border: '1px solid #f0d890', borderRadius: '12px', padding: '0.85rem', fontSize: '0.82rem', color: '#8a7040', marginBottom: '1.25rem' }}>
                  💰 Please pay the consultation fee (Rs. {therapist.fee.toLocaleString()}) directly to the doctor at the time of the appointment.
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)} disabled={isBooking}>← Back</button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={handleBook} disabled={isBooking}>
                    {isBooking ? 'Booking...' : 'Confirm Booking ✓'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TherapistsPage({ setPage }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const specialties = ['All', 'Psychiatrist', 'Psychologist', 'Counselor', 'Addiction'];
  const filtered = therapists.filter(t => {
    const matchFilter = filter === 'All' || t.title.toLowerCase().includes(filter.toLowerCase()) || t.specialty.some(s => s.toLowerCase().includes(filter.toLowerCase()));
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm-white)', paddingTop: '90px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeUp 0.5s ease' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--charcoal)' }}>
            Find Your <span style={{ color: 'var(--sage-dark)', fontStyle: 'italic' }}>Therapist</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Verified psychiatrists & therapists in Faisalabad. Book in 60 seconds.
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text" placeholder="🔍  Search by name or specialty…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '0.8rem 1.2rem', border: '2px solid #e8e4de', borderRadius: '50px', fontSize: '0.9rem', outline: 'none', background: 'white' }}
            onFocus={e => e.target.style.borderColor = 'var(--sage)'}
            onBlur={e => e.target.style.borderColor = '#e8e4de'}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {specialties.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.5rem 1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: filter === s ? 'var(--sage-dark)' : 'white', color: filter === s ? 'white' : 'var(--charcoal)', fontSize: '0.85rem', fontFamily: 'DM Sans', fontWeight: 500, border: `1.5px solid ${filter === s ? 'var(--sage-dark)' : '#e8e4de'}`, transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Therapist Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((t, i) => (
            <div key={t.id} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(124,158,138,0.12)', transition: 'transform 0.2s, box-shadow 0.2s', animation: `fadeUp 0.5s ease ${i * 0.05}s both`, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)'; }}
            >
              {/* Card top strip */}
              <div style={{ height: '6px', background: `linear-gradient(90deg, ${t.color}, ${t.color}aa)` }} />
              
              <div style={{ padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Playfair Display', fontSize: '1.3rem', fontWeight: 700, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '2px' }}>{t.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: t.color, fontWeight: 600, marginBottom: '4px' }}>{t.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t.qualification}</p>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= Math.floor(t.rating) ? '#D4A847' : '#e0e0e0', fontSize: '0.85rem' }}>★</span>
                  ))}
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.rating} · {t.reviews} reviews</span>
                </div>

                {/* Info pills */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span style={{ background: 'var(--cream)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--charcoal)' }}>⏱ {t.experience}</span>
                  <span style={{ background: 'var(--cream)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--charcoal)' }}>💰 Rs. {t.fee.toLocaleString()}</span>
                  <span style={{ background: 'var(--cream)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--charcoal)' }}>📍 FSD</span>
                </div>

                {/* Specialties */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {t.specialty.slice(0, 3).map(s => (
                    <span key={s} style={{ background: `${t.color}18`, color: t.color, padding: '2px 9px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: 500 }}>{s}</span>
                  ))}
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {t.bio.slice(0, 120)}…
                </p>

                {/* Available days */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} style={{ width: '32px', height: '24px', borderRadius: '6px', background: t.available.includes(d) ? t.color : '#f0f0f0', color: t.available.includes(d) ? 'white' : '#ccc', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{d[0]}</div>
                  ))}
                </div>

                <button onClick={() => setSelected(t)} className="btn-primary" style={{ width: '100%', background: t.color }}>
                  Book Appointment →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <AppointmentModal therapist={selected} onClose={() => setSelected(null)} user={user} setPage={setPage} />}
    </div>
  );
}
