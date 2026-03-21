import { navigate } from '../utils/router';

export default function Settings() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050609', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={() => navigate('home')}
        style={{
          position: 'fixed', top: '24px', left: '32px',
          padding: '6px 14px',
          fontFamily: "'Courier New', monospace", fontSize: '14px',
          background: 'rgba(5,5,8,0.88)', color: '#f4dab4',
          border: '1px solid rgba(255,168,76,0.6)', borderRadius: '4px',
          cursor: 'pointer', textShadow: '0 0 6px #ff8c1a', zIndex: 9001,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(12,12,18,0.96)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(5,5,8,0.88)')}
      >
        ← BACK
      </button>

      <div style={{ textAlign: 'center', color: '#f4dab4', fontFamily: "'Courier New', monospace", maxWidth: '480px' }}>
        <h2 style={{ letterSpacing: '0.15em', color: '#f4dab4', fontFamily: "'Courier New', monospace" }}>★ SETTINGS</h2>
        <p style={{ opacity: 0.8, lineHeight: 1.6, color: '#9a8878' }}>
          Starting capital, difficulty, and tutorial options will be configurable here.
        </p>
      </div>
    </div>
  );
}
