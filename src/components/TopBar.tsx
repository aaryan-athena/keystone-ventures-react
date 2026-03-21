import { navigate } from '../utils/router';

interface Props {
  capital: number;
  netWorth: number;
}

export default function TopBar({ capital, netWorth }: Props) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 28px',
      background: 'rgba(3,4,8,0.96)',
      borderBottom: '1px solid rgba(255,168,76,0.20)',
    }}>
      <button
        onClick={() => navigate('explore')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'Courier New', monospace", fontSize: '13px',
          color: '#f4dab4', textShadow: '0 0 6px #ff8c1a',
          padding: 0,
        }}
      >
        ← MAP
      </button>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', color: '#5a4a3a', letterSpacing: '0.18em', marginBottom: '2px' }}>
            CAPITAL
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: '14px', color: '#ffb35a', textShadow: '0 0 8px #ff8c1a', letterSpacing: '0.04em' }}>
            ${capital.toLocaleString()}
          </div>
        </div>
        <div style={{ width: '1px', height: '28px', background: 'rgba(255,168,76,0.15)' }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', color: '#5a4a3a', letterSpacing: '0.18em', marginBottom: '2px' }}>
            NET WORTH
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: '14px', color: '#f4dab4', letterSpacing: '0.04em' }}>
            ${netWorth.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
