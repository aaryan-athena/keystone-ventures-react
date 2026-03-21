import { useEffect, useState } from 'react';
import { navigate } from '../utils/router';
import { getCapital, getPortfolio, setCapital, setPortfolio, type Portfolio } from '../utils/storage';

function fmt(n: number) { return Number(n).toLocaleString(); }

function badgeInfo(pct: number, valued: boolean) {
  if (!valued) return { col: '#ffb35a', bg: 'rgba(255,168,76,0.11)', lbl: 'ACTIVE' };
  if (pct >= 20) return { col: '#4aff8c', bg: 'rgba(74,255,140,0.11)', lbl: `▲ +${pct.toFixed(1)}%` };
  if (pct >= 0)  return { col: '#b4ff8c', bg: 'rgba(180,255,140,0.10)', lbl: `▲ +${pct.toFixed(1)}%` };
  if (pct >= -30) return { col: '#ff8c4a', bg: 'rgba(255,140,74,0.11)', lbl: `▼ ${pct.toFixed(1)}%` };
  return { col: '#ff4a4a', bg: 'rgba(255,74,74,0.11)', lbl: `▼ ${pct.toFixed(1)}%` };
}

export default function PortfolioScreen() {
  const [capital, setCapitalState] = useState(1_000_000);
  const [portfolio, setPortfolioState] = useState<Portfolio>({});
  const [sellConfirm, setSellConfirm] = useState<{ key: string; name: string; curr: number } | null>(null);

  useEffect(() => {
    setCapitalState(getCapital());
    setPortfolioState(getPortfolio());
  }, []);

  const entries = Object.entries(portfolio);
  let totalDep = 0;
  let totalCurr = 0;
  for (const [, e] of entries) {
    totalDep += e.amount || 0;
    totalCurr += e.current_value ?? e.amount ?? 0;
  }
  const pnl = totalCurr - totalDep;
  const netWorth = capital + totalCurr;

  function confirmSell() {
    if (!sellConfirm) return;
    const p = { ...portfolio };
    const e = p[sellConfirm.key];
    if (e) {
      const curr = e.current_value ?? e.amount;
      setCapital(capital + curr);
      setCapitalState(capital + curr);
      delete p[sellConfirm.key];
      setPortfolio(p);
      setPortfolioState(p);
    }
    setSellConfirm(null);
  }

  const cellStyle: React.CSSProperties = {
    flex: 1, textAlign: 'center', padding: '10px 8px',
    borderRight: '1px solid rgba(255,168,76,0.10)',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#040509', color: '#f4dab4', fontFamily: "'Courier New', monospace" }}>
      {/* Back button */}
      <button
        onClick={() => navigate('home')}
        style={{
          display: 'inline-block', padding: '5px 14px', margin: '16px 0 0 16px',
          background: 'rgba(5,5,8,0.88)', color: '#f4dab4',
          border: '1px solid rgba(255,168,76,0.6)', borderRadius: '4px',
          fontFamily: "'Courier New', monospace", fontSize: '13px',
          letterSpacing: '0.08em', textShadow: '0 0 6px #ff8c1a', cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(12,12,18,0.96)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(5,5,8,0.88)')}
      >
        ← BACK
      </button>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '20px 20px 60px' }}>
        <div style={{ fontSize: '10px', color: '#ffb35a', letterSpacing: '0.25em', textAlign: 'center', marginBottom: '8px' }}>
          PORTFOLIO VAULT
        </div>
        <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '0.06em', textAlign: 'center', textShadow: '0 0 20px rgba(255,140,26,0.38)', marginBottom: '16px' }}>
          YOUR INVESTMENTS
        </div>

        {/* HUD */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', background: 'rgba(4,5,9,0.80)', border: '1px solid rgba(255,168,76,0.14)', borderRadius: '6px', overflow: 'hidden' }}>
          {[
            { lbl: 'CAPITAL', val: '$' + fmt(capital), col: '#ffb35a' },
            { lbl: 'PORTFOLIO', val: '$' + fmt(totalCurr), col: '#f4dab4' },
            { lbl: 'NET WORTH', val: '$' + fmt(netWorth), col: '#f4dab4' },
            { lbl: 'P&L', val: (pnl >= 0 ? '+' : '') + '$' + fmt(Math.abs(pnl)), col: pnl >= 0 ? '#4aff8c' : '#ff4a4a' },
          ].map((cell, i, arr) => (
            <div key={cell.lbl} style={{ ...cellStyle, borderRight: i === arr.length - 1 ? 'none' : cellStyle.borderRight }}>
              <div style={{ fontSize: '8px', color: '#5a4a3a', letterSpacing: '0.16em', marginBottom: '4px' }}>{cell.lbl}</div>
              <div style={{ fontSize: '13px', color: cell.col }}>{cell.val}</div>
            </div>
          ))}
        </div>

        {/* Investment list */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#3a2a18', fontSize: '12px', padding: '36px 20px', lineHeight: 2, border: '1px solid rgba(255,168,76,0.07)', borderRadius: '6px' }}>
            No investments yet.<br />Complete a game level to see companies here.
          </div>
        ) : (
          entries.map(([key, e]) => {
            const amt = e.amount || 0;
            const curr = e.current_value ?? amt;
            const pct = e.return_pct ?? 0;
            const valued = e.status === 'valued';
            const bi = badgeInfo(pct, valued);

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', marginBottom: '8px', background: 'rgba(4,5,9,0.85)', border: '1px solid rgba(255,168,76,0.16)', borderRadius: '6px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f4dab4', fontSize: '12px', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name || '—'}</div>
                  <div style={{ color: '#7a6a58', fontSize: '10px', marginTop: '2px' }}>{e.tagline || ''}</div>
                  <div style={{ color: '#3a2a18', fontSize: '9px', marginTop: '2px' }}>LEVEL {e.level || '?'}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: bi.col }}>${fmt(curr)}</div>
                  {valued && <div style={{ fontSize: '10px', color: '#7a6a58', marginTop: '2px' }}>${fmt(amt)} cost</div>}
                  <div style={{ marginTop: '3px' }}>
                    <span style={{ display: 'inline-block', fontSize: '10px', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.07em', background: bi.bg, color: bi.col }}>{bi.lbl}</span>
                  </div>
                </div>
                {valued && (
                  <button
                    onClick={() => setSellConfirm({ key, name: e.name || '', curr })}
                    style={{ flexShrink: 0, background: 'transparent', border: '1px solid rgba(255,168,76,0.30)', color: '#7a6a58', fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '0.08em', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    onMouseEnter={e2 => { e2.currentTarget.style.borderColor = 'rgba(255,168,76,0.65)'; e2.currentTarget.style.color = '#ffb35a'; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.borderColor = 'rgba(255,168,76,0.30)'; e2.currentTarget.style.color = '#7a6a58'; }}
                  >
                    SELL
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sell confirm overlay */}
      {sellConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,4,8,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'rgba(4,5,9,0.98)', border: '1px solid rgba(255,168,76,0.32)', borderRadius: '8px', padding: '26px 28px', maxWidth: '320px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#ffb35a', letterSpacing: '0.2em', marginBottom: '10px' }}>CONFIRM SELL</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{sellConfirm.name}</div>
            <div style={{ fontSize: '12px', color: '#4aff8c', marginBottom: '16px' }}>${fmt(sellConfirm.curr)} proceeds</div>
            <div style={{ fontSize: '10px', color: '#7a6a58', marginBottom: '18px' }}>Proceeds added to liquid capital.</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setSellConfirm(null)}
                style={{ background: 'rgba(4,5,9,0.90)', border: '1px solid rgba(255,168,76,0.22)', color: '#7a6a58', fontFamily: "'Courier New', monospace", fontSize: '11px', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmSell}
                style={{ background: 'rgba(74,255,140,0.10)', border: '1px solid rgba(74,255,140,0.38)', color: '#4aff8c', fontFamily: "'Courier New', monospace", fontSize: '11px', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                SELL →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
