import { useEffect, useReducer, useRef } from 'react';
import {
  LEVEL_TUTORIALS, type TutorialConfig, METRIC_PROFILES, MK_LABEL,
  generateTutorialCompany, calcReturnMultiplier, type Company,
  COIN_REWARD, ROUNDS_PER_LEVEL,
} from '../data/gameData';
import { CompanyCard, CompanyCardQuiz } from '../components/CompanyCard';
import TopBar from '../components/TopBar';
import { navigate } from '../utils/router';
import {
  getCapital, setCapital, getPortfolio, setPortfolio, getPortfolioTotal,
  markCompleted, getCompleted, revaluePortfolio,
} from '../utils/storage';

// ── State ───────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'question' | 'result' | 'complete';

interface Investment {
  name: string; tagline: string; amount: number; ask: number;
  team: number; market: number; traction: number;
  technology: number; unit_economics: number; moat: number;
  return_seed: number; portfolio_key: string;
  // filled after complete
  multiplier?: number; current_value?: number; pnl?: number; return_pct?: number;
}

interface LevelState {
  phase: Phase;
  seed: number;
  round: number;
  answer: 'invest' | 'pass' | null;
  investAmount: number;
  investments: Investment[];
  coinsEarned: number;
  rewarded: Record<number, true>;
  processed: Record<number, true>;
  returnsApplied: boolean;
  capital: number;
  portfolioTotal: number;
}

type Action =
  | { type: 'BEGIN' }
  | { type: 'ANSWER'; answer: 'invest' | 'pass'; amount?: number }
  | { type: 'NEXT'; seed: number }
  | { type: 'COMPLETE' }
  | { type: 'AWARD_COIN'; round: number; correct: boolean }
  | { type: 'PROCESS_INVEST'; round: number; inv: Investment; capital: number }
  | { type: 'APPLY_RETURNS'; investments: Investment[] };

function initState(levelId: number): LevelState {
  return {
    phase: 'intro',
    seed: levelId * 9973 + 12345,
    round: 0,
    answer: null,
    investAmount: 0,
    investments: [],
    coinsEarned: 0,
    rewarded: {},
    processed: {},
    returnsApplied: false,
    capital: getCapital(),
    portfolioTotal: getPortfolioTotal(),
  };
}

function reducer(state: LevelState, action: Action): LevelState {
  switch (action.type) {
    case 'BEGIN':
      return { ...state, phase: 'question' };
    case 'ANSWER':
      return { ...state, answer: action.answer, investAmount: action.amount ?? 0, phase: 'result' };
    case 'AWARD_COIN':
      if (state.rewarded[action.round]) return state;
      return {
        ...state,
        coinsEarned: state.coinsEarned + (action.correct ? COIN_REWARD : 0),
        rewarded: { ...state.rewarded, [action.round]: true },
      };
    case 'PROCESS_INVEST':
      if (state.processed[action.round]) return state;
      return {
        ...state,
        capital: action.capital,
        investments: [...state.investments, action.inv],
        processed: { ...state.processed, [action.round]: true },
      };
    case 'NEXT':
      return { ...state, answer: null, investAmount: 0, round: state.round + 1, seed: action.seed, phase: 'question' };
    case 'COMPLETE':
      return { ...state, phase: 'complete' };
    case 'APPLY_RETURNS':
      return { ...state, investments: action.investments, returnsApplied: true };
    default:
      return state;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function KvButton({ onClick, children, variant = 'primary' }: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(4,5,9,0.90)',
        border: `1px solid ${variant === 'primary' ? 'rgba(255,168,76,0.58)' : 'rgba(255,168,76,0.28)'}`,
        color: variant === 'primary' ? '#f4dab4' : '#9a8a78',
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        letterSpacing: '0.10em',
        textShadow: variant === 'primary' ? '0 0 8px #ff8c1a' : '0 0 6px rgba(255,140,26,0.4)',
        width: '100%',
        padding: '10px 0',
        cursor: 'pointer',
        borderRadius: '4px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(14,10,4,0.96)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(255,140,26,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(4,5,9,0.90)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {children}
    </button>
  );
}

function LessonBlock({ text }: { text: string }) {
  return (
    <div style={{ background: 'rgba(255,168,76,0.04)', borderLeft: '3px solid rgba(255,168,76,0.50)', padding: '14px 18px', fontSize: '12px', color: '#9a8878', lineHeight: '1.75', marginBottom: '26px' }}>
      {text}
    </div>
  );
}

// ── Intro ───────────────────────────────────────────────────────────────────
function TutorialIntro({ levelId, cfg, onBegin }: { levelId: number; cfg: TutorialConfig; capital: number; onBegin: () => void }) {
  const focus = cfg.focus as string[];
  const rounds = cfg.rounds ?? ROUNDS_PER_LEVEL;
  const threshold = cfg.threshold ?? 3;

  return (
    <div style={{ maxWidth: '600px', margin: '10px auto 0', fontFamily: "'Courier New', monospace", color: '#f4dab4' }}>
      <div style={{ fontSize: '10px', color: '#ffb35a', letterSpacing: '0.25em', marginBottom: '8px' }}>
        LEVEL {levelId} — TUTORIAL
      </div>
      <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '0.06em', marginBottom: '22px' }}>
        {cfg.title}
      </div>
      <LessonBlock text={cfg.lesson} />

      <div style={{ background: 'rgba(4,5,9,0.80)', border: '1px solid rgba(255,168,76,0.18)', borderRadius: '6px', padding: '18px 20px', fontSize: '12px', lineHeight: '1.9', color: '#6a5a4a', marginBottom: '28px' }}>
        <div style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.18em', marginBottom: '12px' }}>■ YOUR MISSION</div>
        You will evaluate <span style={{ color: '#f4dab4' }}>{rounds} companies.</span> Only these metrics are visible — all others are classified:<br />
        <div style={{ margin: '10px 0 6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {focus.map(m => (
            <span key={m} style={{ display: 'inline-block', background: 'rgba(255,168,76,0.12)', color: '#ffb35a', fontSize: '10px', letterSpacing: '0.12em', padding: '3px 8px', borderRadius: '3px' }}>{m}</span>
          ))}
        </div>
        <span style={{ color: '#f4dab4' }}>INVEST</span> when <em>every</em> visible metric reaches{' '}
        <span style={{ color: '#ffb35a' }}>{threshold}★ or higher.</span><br />
        <span style={{ color: '#f4dab4' }}>PASS</span> if any metric falls below.<br /><br />
        Correct calls earn <span style={{ color: '#ffb35a' }}>★ {COIN_REWARD} coins</span> each round.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '33%' }}>
          <KvButton onClick={onBegin}>BEGIN ASSESSMENT</KvButton>
        </div>
      </div>
    </div>
  );
}

function GameIntro({ levelId, cfg, capital, onBegin }: { levelId: number; cfg: TutorialConfig; capital: number; onBegin: () => void }) {
  return (
    <div style={{ maxWidth: '600px', margin: '10px auto 0', fontFamily: "'Courier New', monospace", color: '#f4dab4' }}>
      <div style={{ fontSize: '10px', color: '#ffb35a', letterSpacing: '0.25em', marginBottom: '8px' }}>
        LEVEL {levelId} — INVESTMENT RUN
      </div>
      <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '0.06em', marginBottom: '22px' }}>
        {cfg.title}
      </div>
      <LessonBlock text={cfg.lesson} />

      <div style={{ background: 'rgba(4,5,9,0.80)', border: '1px solid rgba(255,168,76,0.18)', borderRadius: '6px', padding: '18px 20px', fontSize: '12px', lineHeight: '1.9', color: '#6a5a4a', marginBottom: '28px' }}>
        <div style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.18em', marginBottom: '12px' }}>■ YOUR BRIEF</div>
        Deployable capital: <span style={{ color: '#f4dab4' }}>${capital.toLocaleString()}</span><br /><br />
        You will evaluate <span style={{ color: '#f4dab4' }}>{ROUNDS_PER_LEVEL} companies.</span> All six metrics are visible. Choose whether to{' '}
        <span style={{ color: '#f4dab4' }}>INVEST</span> and how much, or <span style={{ color: '#f4dab4' }}>PASS</span>.<br /><br />
        Companies you back are added to your <span style={{ color: '#ffb35a' }}>portfolio</span>.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '33%' }}>
          <KvButton onClick={onBegin}>BEGIN RUN</KvButton>
        </div>
      </div>
    </div>
  );
}

// ── Question ─────────────────────────────────────────────────────────────────
function TutorialQuestion({ cfg, company, round, onAnswer }: {
  levelId?: number; cfg: TutorialConfig; company: Company; round: number;
  onAnswer: (a: 'invest' | 'pass') => void;
}) {
  const focus = cfg.focus as string[];
  const rounds = cfg.rounds ?? ROUNDS_PER_LEVEL;

  return (
    <div>
      <div style={{ textAlign: 'center', fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#ffb35a', letterSpacing: '0.22em', marginBottom: '18px' }}>
        {focus.join(' & ')} ASSESSMENT — COMPANY {round + 1} OF {rounds}
      </div>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <CompanyCardQuiz company={company} visibleMetrics={focus} />
        <div style={{ height: '18px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <KvButton onClick={() => onAnswer('invest')}>INVEST ↑</KvButton>
          <KvButton onClick={() => onAnswer('pass')}>PASS →</KvButton>
        </div>
      </div>
    </div>
  );
}

function GameQuestion({ cfg, company, round, capital, onAnswer }: {
  levelId?: number; cfg: TutorialConfig; company: Company; round: number;
  capital: number; onAnswer: (a: 'invest' | 'pass', amount?: number) => void;
}) {
  const investSteps = cfg.invest_steps ?? [50_000, 100_000, 250_000, 500_000];
  const validAmounts = investSteps.filter(a => a <= capital);

  return (
    <div>
      <div style={{ textAlign: 'center', fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#ffb35a', letterSpacing: '0.22em', marginBottom: '18px' }}>
        INVESTMENT DECISION — COMPANY {round + 1} OF {ROUNDS_PER_LEVEL}
      </div>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <CompanyCard company={company} />
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#7a6a58', textAlign: 'center', margin: '14px 0 18px', letterSpacing: '0.08em' }}>
          SEEKING <span style={{ color: '#f4dab4' }}>${company.ask.toLocaleString()}</span>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          YOUR CAPITAL <span style={{ color: '#f4dab4' }}>${capital.toLocaleString()}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${validAmounts.length + 1}, 1fr)`, gap: '8px' }}>
          {validAmounts.map(amount => (
            <KvButton key={amount} onClick={() => onAnswer('invest', amount)}>
              ${Math.floor(amount / 1000)}K
            </KvButton>
          ))}
          <KvButton onClick={() => onAnswer('pass')} variant="secondary">PASS</KvButton>
        </div>
      </div>
    </div>
  );
}

// ── Result ───────────────────────────────────────────────────────────────────
function TutorialResult({ cfg, company, answer, isLast, onNext }: {
  levelId?: number; cfg: TutorialConfig; company: Company; round?: number;
  answer: 'invest' | 'pass'; coinsEarned?: number; isLast: boolean; onNext: () => void;
}) {
  const metricKeys = cfg.metric_keys ?? [];
  const threshold = cfg.threshold ?? 3;
  const focus = cfg.focus as string[];
  const scores: Record<string, number> = {};
  for (const mk of metricKeys) {
    scores[mk] = (company as unknown as Record<string, number>)[mk] ?? 0;
  }
  const allAbove = Object.values(scores).every(s => s >= threshold);
  const correctAction = allAbove ? 'invest' : 'pass';
  const isCorrect = answer === correctAction;

  const verdictColor = isCorrect ? '#4aff8c' : '#ff5a5a';
  const verdictIcon = isCorrect ? '✓' : '✗';
  const verdictLabel = isCorrect ? 'CORRECT CALL' : 'WRONG CALL';
  const verdictSub = isCorrect ? `+${COIN_REWARD} coins awarded` : 'No coins awarded';

  const correctStr = allAbove
    ? `INVEST — all metrics ≥ ${threshold}★`
    : `PASS — ${metricKeys.filter(mk => scores[mk] < threshold).map(mk => MK_LABEL[mk]).join(' & ')} below ${threshold}★`;

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', fontFamily: "'Courier New', monospace", color: '#f4dab4' }}>
      <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: verdictColor, letterSpacing: '0.08em', textShadow: `0 0 16px ${verdictColor}80` }}>
          {verdictIcon} {verdictLabel}
        </div>
        <div style={{ fontSize: '12px', color: '#7a6a58', marginTop: '8px', letterSpacing: '0.06em' }}>{verdictSub}</div>
      </div>

      <div style={{ background: 'rgba(4,5,9,0.85)', border: '1px solid rgba(255,168,76,0.18)', borderRadius: '6px', padding: '16px 18px', fontSize: '12px', color: '#6a5a4a', lineHeight: '1.8', marginBottom: '20px' }}>
        <div style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.18em', marginBottom: '12px' }}>
          ■ {focus.join(' & ')} ANALYSIS
        </div>
        {metricKeys.map(mk => {
          const s = scores[mk];
          const profile = METRIC_PROFILES[mk]?.[s];
          const above = s >= threshold;
          return (
            <div key={mk} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid rgba(255,168,76,0.06)' }}>
              <span style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.10em', minWidth: '90px' }}>{MK_LABEL[mk]}</span>
              <span style={{ color: '#f4dab4', flex: 1, padding: '0 10px' }}>{s}★ — {profile?.label}</span>
              <span style={{ color: above ? '#4aff8c' : '#ff5a5a', fontSize: '13px' }}>{above ? '✓' : '✗'}</span>
            </div>
          );
        })}
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,168,76,0.10)' }}>
          Correct call: <span style={{ color: '#f4dab4' }}>{correctStr}</span>
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <CompanyCard company={company} focus={focus} />
        <div style={{ height: '18px' }} />
        <KvButton onClick={onNext}>{isLast ? 'SEE RESULTS →' : 'NEXT COMPANY →'}</KvButton>
      </div>
    </div>
  );
}

function GameResult({ company, answer, investAmount, capital, isLast, onNext }: {
  company: Company; answer: 'invest' | 'pass'; investAmount: number;
  capital: number; round?: number; isLast: boolean; onNext: () => void;
}) {
  const verdictColor = answer === 'invest' ? '#4aff8c' : '#7a6a58';
  const verdictLabel = answer === 'invest' ? `INVESTED $${investAmount.toLocaleString()}` : 'PASSED';
  const verdictSub = `Capital remaining: $${capital.toLocaleString()}`;

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', fontFamily: "'Courier New', monospace", color: '#f4dab4' }}>
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <div style={{ fontSize: '26px', fontWeight: 'bold', color: verdictColor, letterSpacing: '0.08em', textShadow: `0 0 16px ${verdictColor}60` }}>
          {verdictLabel}
        </div>
        <div style={{ fontSize: '12px', color: '#7a6a58', marginTop: '8px' }}>{verdictSub}</div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <CompanyCard company={company} />
        <div style={{ height: '18px' }} />
        <KvButton onClick={onNext}>{isLast ? 'CLOSE RUN →' : 'NEXT COMPANY →'}</KvButton>
      </div>
    </div>
  );
}

// ── Complete ─────────────────────────────────────────────────────────────────
function TutorialComplete({ levelId, cfg, coinsEarned }: {
  levelId: number; cfg: TutorialConfig; coinsEarned: number;
}) {
  const focus = cfg.focus as string[];
  const rounds = cfg.rounds ?? ROUNDS_PER_LEVEL;
  const correct = Math.floor(coinsEarned / COIN_REWARD);
  const nextLevel = levelId + 1;
  const hasNext = nextLevel in LEVEL_TUTORIALS;
  const nextCfg = hasNext ? LEVEL_TUTORIALS[nextLevel] : null;
  const isNextGame = nextCfg?.mode === 'game';

  return (
    <div style={{ maxWidth: '560px', margin: '20px auto', fontFamily: "'Courier New', monospace", color: '#f4dab4', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: '#ffb35a', letterSpacing: '0.25em', marginBottom: '10px' }}>LEVEL {levelId} COMPLETE</div>
      <div style={{ fontSize: '30px', fontWeight: 'bold', letterSpacing: '0.06em', marginBottom: '8px', textShadow: '0 0 20px rgba(255,140,26,0.38)' }}>
        ★ {focus.join(' & ')} ASSESSED
      </div>
      <div style={{ fontSize: '13px', color: '#7a6a58', marginBottom: '30px' }}>
        {correct}/{rounds} correct &nbsp;•&nbsp; ★ {coinsEarned} coins earned
      </div>

      <div style={{ background: 'rgba(255,168,76,0.04)', border: '1px solid rgba(255,168,76,0.18)', borderRadius: '6px', padding: '16px 20px', fontSize: '12px', color: '#6a5a4a', lineHeight: '1.8', marginBottom: '30px', textAlign: 'left' }}>
        <div style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>■ KEY LESSON</div>
        {cfg.lesson}
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('explore')}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 28px', background: 'rgba(4,5,9,0.90)', border: '1px solid rgba(255,168,76,0.30)', borderRadius: '4px', color: '#9a8a78', fontFamily: "'Courier New', monospace", fontSize: '13px', letterSpacing: '0.10em', cursor: 'pointer' }}
        >
          ← MAP
        </button>
        {hasNext && (
          <button
            onClick={() => navigate('level', { level: nextLevel })}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 28px', background: 'rgba(4,5,9,0.90)', border: '1px solid rgba(255,168,76,0.58)', borderRadius: '4px', color: '#f4dab4', fontFamily: "'Courier New', monospace", fontSize: '13px', letterSpacing: '0.10em', textShadow: '0 0 8px #ff8c1a', cursor: 'pointer' }}
          >
            {isNextGame ? 'BEGIN RUN' : `LEVEL ${nextLevel}`} →
          </button>
        )}
      </div>
    </div>
  );
}

function GameComplete({ levelId, investments, capital }: {
  levelId: number; cfg?: TutorialConfig; investments: Investment[]; capital: number;
}) {
  const totalDeployed = investments.reduce((s, i) => s + i.amount, 0);
  const totalPnl = investments.reduce((s, i) => s + (i.pnl ?? 0), 0);
  const pnlColor = totalPnl >= 0 ? '#4aff8c' : '#ff4a4a';
  const pnlSign = totalPnl >= 0 ? '+' : '';

  return (
    <div style={{ maxWidth: '560px', margin: '20px auto', fontFamily: "'Courier New', monospace", color: '#f4dab4', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: '#ffb35a', letterSpacing: '0.25em', marginBottom: '10px' }}>LEVEL {levelId} COMPLETE</div>
      <div style={{ fontSize: '30px', fontWeight: 'bold', letterSpacing: '0.06em', marginBottom: '8px', textShadow: '0 0 20px rgba(255,140,26,0.38)' }}>
        RUN CLOSED
      </div>
      <div style={{ fontSize: '13px', color: '#7a6a58', marginBottom: '30px' }}>
        {investments.length}/{ROUNDS_PER_LEVEL} backed &nbsp;•&nbsp; 💰 ${totalDeployed.toLocaleString()} deployed &nbsp;•&nbsp;{' '}
        <span style={{ color: pnlColor }}>{pnlSign}${totalPnl.toLocaleString()} P&L</span>
      </div>

      <div style={{ background: 'rgba(4,5,9,0.85)', border: '1px solid rgba(255,168,76,0.18)', borderRadius: '6px', padding: '16px 20px', fontSize: '12px', lineHeight: '1.8', marginBottom: '16px', textAlign: 'left' }}>
        <div style={{ color: '#ffb35a', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>■ PORTFOLIO RETURNS</div>
        {investments.length === 0 ? (
          <div style={{ color: '#3a2a18', fontSize: '11px', padding: '8px 0' }}>No investments made this run.</div>
        ) : investments.map((inv, i) => {
          const pct = inv.return_pct ?? 0;
          const curr = inv.current_value ?? inv.amount;
          const arrow = pct >= 0 ? '▲' : '▼';
          const col = pct >= 5 ? '#4aff8c' : pct < -5 ? '#ff4a4a' : '#ffb35a';
          const sign = pct >= 0 ? '+' : '';
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,168,76,0.08)' }}>
              <span style={{ color: '#f4dab4', fontSize: '12px' }}>{inv.name}</span>
              <span style={{ fontSize: '12px', textAlign: 'right' }}>
                <span style={{ color: col }}>{arrow} {sign}{pct.toFixed(1)}%</span>
                {'  '}
                <span style={{ color: '#7a6a58' }}>${inv.amount.toLocaleString()}</span>
                <span style={{ color: '#3a2a18' }}> → </span>
                <span style={{ color: col }}>${curr.toLocaleString()}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'rgba(4,5,9,0.60)', border: '1px solid rgba(255,168,76,0.10)', borderRadius: '6px', padding: '12px 20px', fontSize: '12px', color: '#6a5a4a', marginBottom: '30px', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
        <span>Capital remaining:</span>
        <span style={{ color: '#f4dab4' }}>${capital.toLocaleString()}</span>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('explore')}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 28px', background: 'rgba(4,5,9,0.90)', border: '1px solid rgba(255,168,76,0.30)', borderRadius: '4px', color: '#9a8a78', fontFamily: "'Courier New', monospace", fontSize: '13px', letterSpacing: '0.10em', cursor: 'pointer' }}
        >
          ← MAP
        </button>
        <button
          onClick={() => navigate('portfolio')}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '11px 28px', background: 'rgba(4,5,9,0.90)', border: '1px solid rgba(255,168,76,0.58)', borderRadius: '4px', color: '#f4dab4', fontFamily: "'Courier New', monospace", fontSize: '13px', letterSpacing: '0.10em', textShadow: '0 0 8px #ff8c1a', cursor: 'pointer' }}
        >
          PORTFOLIO →
        </button>
      </div>
    </div>
  );
}

// ── Main Level Component ──────────────────────────────────────────────────────
interface Props {
  levelId: number;
}

export default function Level({ levelId }: Props) {
  const cfg = LEVEL_TUTORIALS[levelId];
  const [state, dispatch] = useReducer(reducer, levelId, initState);
  const returnsRef = useRef(false);
  const completedRef = useRef(false);

  const isGame = cfg?.mode === 'game';
  const investSteps = cfg?.invest_steps;
  const company = generateTutorialCompany(state.seed, isGame ? investSteps : undefined);

  const rounds = cfg?.rounds ?? ROUNDS_PER_LEVEL;

  // Apply returns once on complete
  useEffect(() => {
    if (state.phase === 'complete' && !returnsRef.current && isGame && state.investments.length > 0) {
      returnsRef.current = true;
      const updated = state.investments.map(inv => {
        const avg = (inv.team + inv.market + inv.traction + inv.technology + inv.unit_economics + inv.moat) / 6.0;
        const mult = calcReturnMultiplier(avg, inv.return_seed);
        const curr_val = Math.round(inv.amount * mult);
        return { ...inv, multiplier: mult, current_value: curr_val, pnl: curr_val - inv.amount, return_pct: Math.round((mult - 1.0) * 100 * 10) / 10 };
      });
      dispatch({ type: 'APPLY_RETURNS', investments: updated });
    }
  }, [state.phase]);

  // Persist completion + revalue portfolio once
  useEffect(() => {
    if (state.phase === 'complete' && state.returnsApplied && !completedRef.current) {
      completedRef.current = true;
      markCompleted(levelId);

      // Persist capital
      setCapital(state.capital);

      if (isGame && state.investments.length > 0) {
        // Add investments to portfolio
        const p = getPortfolio();
        for (const inv of state.investments) {
          p[inv.portfolio_key] = {
            name: inv.name, tagline: inv.tagline, level: levelId,
            amount: inv.amount, ask: inv.ask,
            current_value: inv.current_value ?? inv.amount,
            return_pct: inv.return_pct ?? 0,
            status: 'valued',
            team: inv.team, market: inv.market, traction: inv.traction,
            technology: inv.technology, unit_economics: inv.unit_economics,
            moat: inv.moat, return_seed: inv.return_seed,
          };
        }
        setPortfolio(p);
        // Re-value with updated completion count
        const completedCount = getCompleted().length;
        revaluePortfolio(completedCount);
      }
    }
  }, [state.phase, state.returnsApplied]);

  // Award coins for tutorial correct answers (only once per round)
  useEffect(() => {
    if (state.phase === 'result' && !isGame && state.answer !== null && !state.rewarded[state.round]) {
      const metricKeys = cfg?.metric_keys ?? [];
      const threshold = cfg?.threshold ?? 3;
      const scores: Record<string, number> = {};
      for (const mk of metricKeys) {
        scores[mk] = (company as unknown as Record<string, number>)[mk] ?? 0;
      }
      const allAbove = Object.values(scores).every(s => s >= threshold);
      const correctAction = allAbove ? 'invest' : 'pass';
      dispatch({ type: 'AWARD_COIN', round: state.round, correct: state.answer === correctAction });
    }
  }, [state.phase, state.answer]);

  // Process game investments
  useEffect(() => {
    if (state.phase === 'result' && isGame && state.answer === 'invest' && state.investAmount > 0) {
      if (!state.processed[state.round]) {
        const newCapital = state.capital - state.investAmount;
        const returnSeed = state.seed + levelId * 37 + state.round * 7919;
        const portfolioKey = `${levelId}_${state.round}_${company.id}`;
        const inv: Investment = {
          name: company.name, tagline: company.tagline,
          amount: state.investAmount, ask: company.ask,
          team: company.team, market: company.market, traction: company.traction,
          technology: company.technology, unit_economics: company.unit_economics,
          moat: company.moat, return_seed: returnSeed, portfolio_key: portfolioKey,
        };
        dispatch({ type: 'PROCESS_INVEST', round: state.round, inv, capital: newCapital });
      }
    } else if (state.phase === 'result' && isGame && state.answer === 'pass') {
      if (!state.processed[state.round]) {
        dispatch({ type: 'PROCESS_INVEST', round: state.round, inv: null as unknown as Investment, capital: state.capital });
      }
    }
  }, [state.phase, state.answer]);

  const currentLevelValue = isGame
    ? state.investments.reduce((s, inv) => s + (inv.current_value ?? inv.amount), 0)
    : 0;
  const netWorth = state.capital + state.portfolioTotal + currentLevelValue;

  if (!cfg) {
    return (
      <div style={{ paddingTop: '80px', textAlign: 'center', color: '#3a2a18', fontFamily: "'Courier New', monospace" }}>
        Level {levelId} has not yet been mapped.
        <br /><br />
        <button onClick={() => navigate('explore')} style={{ background: 'none', border: '1px solid rgba(255,168,76,0.3)', color: '#7a6a58', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>← MAP</button>
      </div>
    );
  }

  function handleAnswer(answer: 'invest' | 'pass', amount?: number) {
    dispatch({ type: 'ANSWER', answer, amount });
  }

  function handleNext() {
    const isLast = (state.round + 1) >= rounds;
    if (isLast) {
      dispatch({ type: 'COMPLETE' });
    } else {
      const newSeed = (state.seed * 6364136223846793005 + 1442695040888963407) >>> 0;
      dispatch({ type: 'NEXT', seed: newSeed % 100000 });
    }
  }

  return (
    <div style={{ background: '#060709', minHeight: '100vh' }}>
      <TopBar capital={state.capital} netWorth={netWorth} />
      <div style={{ height: '62px' }} />
      <div style={{ padding: '16px' }}>
        {state.phase === 'intro' && (
          isGame
            ? <GameIntro levelId={levelId} cfg={cfg} capital={state.capital} onBegin={() => dispatch({ type: 'BEGIN' })} />
            : <TutorialIntro levelId={levelId} cfg={cfg} capital={state.capital} onBegin={() => dispatch({ type: 'BEGIN' })} />
        )}

        {state.phase === 'question' && (
          isGame
            ? <GameQuestion levelId={levelId} cfg={cfg} company={company} round={state.round} capital={state.capital} onAnswer={handleAnswer} />
            : <TutorialQuestion levelId={levelId} cfg={cfg} company={company} round={state.round} onAnswer={a => handleAnswer(a)} />
        )}

        {state.phase === 'result' && state.answer && (
          isGame
            ? <GameResult
                company={company} answer={state.answer} investAmount={state.investAmount}
                capital={state.capital} round={state.round}
                isLast={(state.round + 1) >= rounds} onNext={handleNext}
              />
            : <TutorialResult
                levelId={levelId} cfg={cfg} company={company} round={state.round}
                answer={state.answer} coinsEarned={state.coinsEarned}
                isLast={(state.round + 1) >= rounds} onNext={handleNext}
              />
        )}

        {state.phase === 'complete' && (
          isGame
            ? <GameComplete levelId={levelId} cfg={cfg} investments={state.investments} capital={state.capital} />
            : <TutorialComplete levelId={levelId} cfg={cfg} coinsEarned={state.coinsEarned} />
        )}
      </div>
    </div>
  );
}
