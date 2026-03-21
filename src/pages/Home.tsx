import { useEffect } from 'react';
import { navigate } from '../utils/router';
import { resetGame } from '../utils/storage';

export default function Home() {
  // Reset game state on home load (fresh session)
  useEffect(() => {
    resetGame();
  }, []);

  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    cursor: 'pointer',
    background: 'rgba(4,5,9,0.78)',
    border: '1px solid rgba(255,168,76,0.65)',
    borderRadius: '4px',
    color: '#f4dab4',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    letterSpacing: '0.12em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 0 8px #ff8c1a',
    transition: 'background 80ms ease, box-shadow 80ms ease',
    userSelect: 'none',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: 'url(/home_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
    }}>
      {/* PORTFOLIO button */}
      <button
        onClick={() => navigate('portfolio')}
        style={{ ...btnStyle, left: '18%', top: '72%', width: '220px', height: '56px' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(14,10,4,0.93)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(255,140,26,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(4,5,9,0.78)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        PORTFOLIO
      </button>

      {/* EXPLORE button */}
      <button
        onClick={() => navigate('explore')}
        style={{ ...btnStyle, left: '39%', top: '72%', width: '220px', height: '56px' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(14,10,4,0.93)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(255,140,26,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(4,5,9,0.78)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        EXPLORE
      </button>

      {/* SETTINGS button */}
      <button
        onClick={() => navigate('settings')}
        style={{ ...btnStyle, left: '62%', top: '72%', width: '110px', height: '56px' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(14,10,4,0.93)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(255,140,26,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(4,5,9,0.78)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        ★
      </button>
    </div>
  );
}
