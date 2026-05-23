import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_SYSTEM_PROMPT = `You are a compassionate, professional AI therapy companion named Serene. You are trained in evidence-based therapeutic approaches including:
- Cognitive Behavioral Therapy (CBT)
- Mindfulness-Based Stress Reduction (MBSR)
- Acceptance and Commitment Therapy (ACT)
- Motivational Interviewing
- Psychoeducation

Your role:
- Listen with deep empathy and without judgment
- Help users explore their thoughts, feelings, and patterns
- Provide practical coping strategies and psychoeducation
- Encourage self-awareness and emotional regulation
- Gently challenge cognitive distortions using CBT techniques
- Use reflective listening and open-ended questions
- Validate emotions before offering solutions

Important guidelines:
- Always prioritize safety. If someone mentions self-harm or crisis, immediately provide emergency resources (Umang helpline Pakistan: 0317-4288665, 051-111-741-741) and encourage professional help.
- You are a supportive tool, NOT a replacement for professional therapy.
- Respect Pakistani cultural context - be sensitive to family dynamics, religious values, and societal pressures.
- Speak warmly and naturally. Keep responses concise (3-6 sentences). End with a thoughtful question.`;

const suggestions = [
  "I've been feeling very anxious lately",
  "I'm struggling with relationship issues",
  "I can't stop overthinking everything",
  "I feel stuck and unmotivated",
  "I'm dealing with grief and loss",
  "I need help managing stress",
];

const BACKEND_URL = 'http://localhost:8000';
const SESSION_ID = `session_${Date.now()}`;

export default function AITherapyPage({ setPage }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(null);
  const [showMoodStart, setShowMoodStart] = useState(false);
  const [showMoodEnd, setShowMoodEnd] = useState(false);
  const [ratings, setRatings] = useState({});   // { messageIndex: 'good'|'bad' }
  const [mlInsight, setMlInsight] = useState(null); // latest ML analysis
  const [backendOnline, setBackendOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const startTime = useRef(Date.now());

  // Check if Python backend is running
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health`)
      .then(r => r.json())
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save session when user has 4+ messages
  useEffect(() => {
    if (messages.length > 0 && messages.length % 4 === 0 && backendOnline) {
      saveSession();
    }
  }, [messages]);

  const saveSession = async () => {
    if (!backendOnline) return;
    try {
      await fetch(`${BACKEND_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous',
          messages,
          moodBefore,
          moodAfter: moodAfter || moodBefore,
          duration: Math.floor((Date.now() - startTime.current) / 1000),
        }),
      });
    } catch (e) { /* silent fail */ }
  };

  const rateMessage = async (messageIndex, rating, aiResponse, userMessage) => {
    setRatings(prev => ({ ...prev, [messageIndex]: rating }));
    if (!backendOnline) return;
    try {
      await fetch(`${BACKEND_URL}/api/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          messageIndex,
          rating,
          aiResponse,
          userMessage,
          technique: mlInsight?.recommended_technique || '',
        }),
      });
    } catch (e) { /* silent fail */ }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    if (!started) {
      setShowMoodStart(true);
      // Store message to send after mood selection
      window._pendingMessage = content;
      return;
    }

    await _doSend(content);
  };

  const _doSend = async (content) => {
    setStarted(true);
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    let analysisData = null;
    let enrichedSystem = BASE_SYSTEM_PROMPT;

    // Step 1: Get ML analysis from Python backend (if online)
    if (backendOnline) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            userId: user?.id || 'anonymous',
            sessionId: SESSION_ID,
            messageCount: newMessages.length,
          }),
        });
        analysisData = await res.json();
        setMlInsight(analysisData);

        // Step 2: Enrich Claude's prompt with ML insights
        enrichedSystem = `${BASE_SYSTEM_PROMPT}

=== REAL-TIME ML PATIENT ANALYSIS ===
Detected emotion: ${analysisData.emotion} (${analysisData.emotion_confidence}% confidence)
Primary concern: ${analysisData.primary_topic}
Risk level: ${analysisData.risk_level}
Recommended technique: ${analysisData.recommended_technique}
Technique guidance: ${analysisData.technique_reason}
Sessions completed: ${analysisData.session_count}
Average mood improvement: ${analysisData.avg_improvement}/10

INSTRUCTIONS:
- Apply the "${analysisData.recommended_technique}" technique in your response
- ${analysisData.risk_level === 'high' ? '⚠️ HIGH RISK: Provide crisis helpline immediately: Umang 0317-4288665' : ''}
- ${analysisData.should_refer ? 'Gently recommend our verified Faisalabad therapists' : ''}
- Tailor your language to the detected emotion: ${analysisData.emotion}`;

      } catch (e) {
        console.log('Backend offline, using standard prompt');
      }
    }

    // Step 3: Send to Claude with enriched or standard prompt
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: enrichedSystem,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || '').join('')
        || "I'm here for you. Could you tell me more about what you're experiencing?";

      setMessages(prev => [...prev, { role: 'assistant', content: reply, index: newMessages.length }]);

      // Show mood check after 6 messages
      if (newMessages.length >= 6 && !moodAfter) {
        setTimeout(() => setShowMoodEnd(true), 2000);
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a moment of difficulty connecting. Please try again — I'm here for you. 💙",
        index: newMessages.length
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodStart = (mood) => {
    setMoodBefore(mood);
    setShowMoodStart(false);
    startTime.current = Date.now();
    const pending = window._pendingMessage;
    window._pendingMessage = null;
    if (pending) _doSend(pending);
  };

  const handleMoodEnd = async (mood) => {
    setMoodAfter(mood);
    setShowMoodEnd(false);
    await saveSession();
  };

  const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '🌟', '✨', '🎉'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #f0f5f2 0%, var(--warm-white) 30%)', paddingTop: '68px' }}>

      {/* Backend status banner */}
      {backendOnline && (
        <div style={{ background: 'rgba(74,112,96,0.1)', borderBottom: '1px solid rgba(74,112,96,0.2)', padding: '0.35rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--sage-dark)' }}>
          🧠 ML-Enhanced Mode Active — responses personalized using patient analysis
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', padding: '0 1rem' }}>

        {/* Mood Check — Before Session */}
        {showMoodStart && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💭</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Before we begin…</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>How are you feeling right now? (1 = very bad, 10 = great)</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => handleMoodStart(n)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '2px solid #e8e4de', background: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.background = '#f5faf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4de'; e.currentTarget.style.background = 'white'; }}>
                    <span style={{ fontSize: '1rem' }}>{moodEmojis[n-1]}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mood Check — After Session */}
        {showMoodEnd && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>How do you feel now?</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>You started at <strong>{moodBefore}/10</strong>. Has anything shifted?</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>This helps our AI learn what works for you.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => handleMoodEnd(n)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '2px solid #e8e4de', background: n > moodBefore ? '#f0f8f4' : 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4de'; }}>
                    <span style={{ fontSize: '1rem' }}>{moodEmojis[n-1]}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{n}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMoodEnd(false)} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Skip for now</button>
            </div>
          </div>
        )}

        {!started ? (
          /* Welcome screen */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--sage-dark), var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 30px rgba(74,112,96,0.3)' }}>
              🌿
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--charcoal)' }}>Meet <em>Serene</em></h1>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: '440px', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              Your AI therapy companion, trained in CBT, mindfulness, and evidence-based therapeutic approaches. Available 24/7, completely confidential.
            </p>
            {backendOnline && (
              <p style={{ color: 'var(--sage-dark)', fontSize: '0.82rem', marginBottom: '0.5rem', background: 'rgba(124,158,138,0.1)', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                🧠 ML-Enhanced — responses improve with every session
              </p>
            )}
            <p style={{ color: 'var(--sage-dark)', fontSize: '0.85rem', marginBottom: '2.5rem', fontWeight: 500 }}>
              Hello{user ? `, ${user.name?.split(' ')[0]}` : ''} — how are you feeling today?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', width: '100%', maxWidth: '560px', marginBottom: '2rem' }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{ padding: '0.85rem 1rem', background: 'white', border: '1.5px solid rgba(124,158,138,0.3)', borderRadius: '14px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--charcoal)', fontFamily: 'DM Sans', textAlign: 'left', transition: 'all 0.2s', lineHeight: 1.4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.background = '#f5faf8'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,158,138,0.3)'; e.currentTarget.style.background = 'white'; }}>
                  💬 {s}
                </button>
              ))}
            </div>
            <div style={{ background: 'rgba(196,133,90,0.1)', border: '1px solid rgba(196,133,90,0.25)', borderRadius: '12px', padding: '0.85rem 1.25rem', maxWidth: '480px', fontSize: '0.8rem', color: '#8a5a35' }}>
              ⚠️ Serene is a supportive tool, not a licensed therapist. For clinical treatment, please consult one of our <button onClick={() => setPage('therapists')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'underline', fontSize: '0.8rem' }}>verified Faisalabad therapists</button>.
            </div>
          </div>
        ) : (
          /* Chat area */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '1.5rem' }}>

            {/* ML Insight Bar */}
            {mlInsight && backendOnline && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(124,158,138,0.08)', borderRadius: '12px', border: '1px solid rgba(124,158,138,0.2)' }}>
                <span style={{ fontSize: '0.73rem', color: 'var(--sage-dark)', fontWeight: 500 }}>🧠 ML:</span>
                <span style={{ fontSize: '0.73rem', background: 'white', padding: '1px 8px', borderRadius: '10px', color: 'var(--charcoal)' }}>
                  {mlInsight.emotion} {mlInsight.emotion_confidence}%
                </span>
                <span style={{ fontSize: '0.73rem', background: 'white', padding: '1px 8px', borderRadius: '10px', color: 'var(--charcoal)' }}>
                  📌 {mlInsight.primary_topic}
                </span>
                <span style={{ fontSize: '0.73rem', background: 'white', padding: '1px 8px', borderRadius: '10px', color: 'var(--charcoal)' }}>
                  🎯 {mlInsight.recommended_technique}
                </span>
                {mlInsight.risk_level !== 'low' && (
                  <span style={{ fontSize: '0.73rem', background: mlInsight.risk_level === 'high' ? '#fef0f0' : '#fffbf0', padding: '1px 8px', borderRadius: '10px', color: mlInsight.risk_level === 'high' ? 'var(--error)' : '#8a7040', fontWeight: 600 }}>
                    ⚠️ {mlInsight.risk_level} risk
                  </span>
                )}
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem', minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--sage-dark), var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginRight: '10px', flexShrink: 0, alignSelf: 'flex-end' }}>
                        🌿
                      </div>
                    )}
                    <div style={{ maxWidth: '75%', padding: '0.9rem 1.2rem', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'var(--sage-dark)' : 'white', color: msg.role === 'user' ? 'white' : 'var(--charcoal)', fontSize: '0.92rem', lineHeight: 1.65, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: msg.role === 'assistant' ? '1px solid rgba(124,158,138,0.15)' : 'none' }}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Thumbs up/down for AI responses */}
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '46px', marginTop: '4px' }}>
                      <button onClick={() => rateMessage(i, 'good', msg.content, messages[i-1]?.content || '')}
                        style={{ background: ratings[i] === 'good' ? 'var(--sage-light)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px', borderRadius: '8px', opacity: ratings[i] && ratings[i] !== 'good' ? 0.3 : 1, transition: 'all 0.2s' }}
                        title="This helped me">👍</button>
                      <button onClick={() => rateMessage(i, 'bad', msg.content, messages[i-1]?.content || '')}
                        style={{ background: ratings[i] === 'bad' ? '#fef0f0' : 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px', borderRadius: '8px', opacity: ratings[i] && ratings[i] !== 'bad' ? 0.3 : 1, transition: 'all 0.2s' }}
                        title="This didn't help">👎</button>
                      {ratings[i] && <span style={{ fontSize: '0.72rem', color: 'var(--muted)', alignSelf: 'center' }}>Thanks for your feedback!</span>}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--sage-dark), var(--sage))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌿</div>
                  <div style={{ background: 'white', border: '1px solid rgba(124,158,138,0.15)', borderRadius: '18px 18px 18px 4px', padding: '0.9rem 1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0,1,2].map(j => (
                        <div key={j} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--sage)', animation: `pulse-soft 1.2s ease ${j * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: '1rem 0 1.5rem', borderTop: started ? '1px solid rgba(124,158,138,0.15)' : 'none', background: 'var(--warm-white)' }}>
          {started && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {['Tell me more', 'How do I cope?', 'That helps, thanks', 'I feel overwhelmed'].map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{ padding: '0.4rem 0.85rem', background: 'white', border: '1px solid rgba(124,158,138,0.3)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--sage-dark)', fontFamily: 'DM Sans', whiteSpace: 'nowrap' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Share what's on your mind…"
              rows={1} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex: 1, padding: '0.85rem 1.2rem', border: '2px solid rgba(124,158,138,0.3)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'DM Sans', background: 'white', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--sage)'}
              onBlur={e => e.target.style.borderColor = 'rgba(124,158,138,0.3)'} />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ width: '48px', height: '48px', borderRadius: '14px', border: 'none', background: input.trim() ? 'var(--sage-dark)' : '#e8e4de', color: 'white', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s', flexShrink: 0 }}>
              ↑
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
            Press Enter to send · Shift+Enter for new line · Not a substitute for professional therapy
          </p>
        </div>
      </div>
    </div>
  );
}
