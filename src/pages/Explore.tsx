import { useEffect, useRef, useState } from 'react';
import { LEVELS, LEVEL_INDEX, level_top_px, map_inner_height_px } from '../data/gameData';
import { getCompleted, getCapital, getPortfolioTotal } from '../utils/storage';
import { navigate } from '../utils/router';

interface Props {
  selectedLevelId?: number;
}

export default function Explore({ selectedLevelId }: Props) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const innerH = map_inner_height_px();

  useEffect(() => {
    setCompleted(getCompleted());
  }, []);

  // Scroll to bottom (level 1) on mount
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = overlayRef.current.scrollHeight;
    }
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleTorchClick(lvlId: number) {
    if (lvlId >= 2 && !completed.includes(lvlId - 1)) {
      showToast(`Complete Level ${lvlId - 1} first to unlock`);
      return;
    }
    const capital = getCapital();
    const portfolioTotal = getPortfolioTotal();
    navigate('level', { level: lvlId, capital, portfolio_total: portfolioTotal });
  }

  const selectedLevel = selectedLevelId ? LEVEL_INDEX[selectedLevelId] : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050609',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        style={{
          position: 'fixed', top: '18px', left: '24px', zIndex: 9999,
          padding: '5px 14px',
          background: 'rgba(5,5,8,0.88)', color: '#f4dab4',
          border: '1px solid rgba(255,168,76,0.6)', borderRadius: '4px',
          fontFamily: "'Courier New', monospace", fontSize: '13px',
          letterSpacing: '0.08em', textShadow: '0 0 6px #ff8c1a',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(12,12,18,0.96)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(5,5,8,0.88)')}
      >
        ← BACK
      </button>

      {/* Level info panel */}
      {selectedLevel && (
        <div style={{
          position: 'fixed', right: '24px', top: '56px',
          width: '260px', padding: '14px 16px',
          background: 'rgba(4,5,9,0.96)',
          border: '1px solid rgba(255,168,76,0.6)', borderRadius: '8px',
          boxShadow: '0 0 15px rgba(0,0,0,0.7)',
          color: '#f4dab4', fontFamily: 'monospace',
          zIndex: 9000,
        }}>
          <div style={{ fontSize: '17px', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: '8px' }}>
            LEVEL {selectedLevel.id}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>Risk</span><span>{selectedLevel.risk}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>Capital</span><span>{selectedLevel.capital}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>Reward</span><span>{selectedLevel.reward}</span>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#b7a288', lineHeight: '1.5' }}>
            {selectedLevel.narrative}
          </div>
        </div>
      )}

      {/* Scrollable map */}
      <div
        ref={overlayRef}
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* Background image */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/map_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'repeat-y',
          imageRendering: 'pixelated',
          zIndex: -1,
        }} />

        {/* Inner map with torches */}
        <div style={{ position: 'relative', width: '100%', height: `${innerH}px`, pointerEvents: 'none' }}>
          {/* Vertical path line */}
          <div style={{
            position: 'absolute', left: '49%', top: 0,
            width: '3px', height: '100%',
            background: '#1e262f', opacity: 0.5,
            pointerEvents: 'none',
          }} />

          {/* Torches */}
          {LEVELS.map(lvl => {
            const topPx = level_top_px(lvl.id);
            const isSelected = lvl.id === selectedLevelId;
            const isLocked = lvl.id >= 2 && !completed.includes(lvl.id - 1);
            const color = isSelected ? '#ffe6b5' : '#ffb35a';
            const shadow = isSelected
              ? '0 0 5px #ffe0a0, 0 0 14px #ffb35a, 0 0 26px #ff8c1a'
              : '0 0 4px #ff8c1a, 0 0 10px #ff8c1a, 0 0 18px #ff8c1a';

            return (
              <button
                key={lvl.id}
                onClick={() => handleTorchClick(lvl.id)}
                style={{
                  position: 'absolute',
                  left: `${lvl.x}%`,
                  top: `${topPx}px`,
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  pointerEvents: 'auto',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color,
                  textShadow: shadow,
                  opacity: isLocked ? 0.22 : 1,
                  transition: 'transform 80ms ease-out',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={e => {
                  if (!isLocked) (e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)');
                }}
                onMouseLeave={e => {
                  (e.currentTarget.style.transform = '');
                }}
              >
                🔥 <span>{lvl.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(4,5,9,0.96)', border: '1px solid rgba(255,168,76,0.55)',
          color: '#f4dab4', fontFamily: 'monospace', fontSize: '13px',
          padding: '10px 24px', borderRadius: '4px', zIndex: 9999,
          letterSpacing: '0.08em', whiteSpace: 'nowrap', pointerEvents: 'none',
          textShadow: '0 0 8px rgba(255,140,26,0.38)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
