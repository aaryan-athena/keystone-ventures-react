import { type Company } from '../data/gameData';
import StarRating from './StarRating';

interface Metric { label: string; value: number; }

function getMetrics(company: Company): Metric[] {
  return [
    { label: 'TEAM',       value: company.team },
    { label: 'MARKET',     value: company.market },
    { label: 'TRACTION',   value: company.traction },
    { label: 'TECHNOLOGY', value: company.technology },
    { label: 'ECONOMICS',  value: company.unit_economics },
    { label: 'MOAT',       value: company.moat },
  ];
}

// Full card with all metrics visible
interface FullCardProps {
  company: Company;
  focus?: string | string[];
}

export function CompanyCard({ company, focus }: FullCardProps) {
  const focusSet = new Set(
    Array.isArray(focus) ? focus.map(f => f.toUpperCase()) :
    focus ? [focus.toUpperCase()] : []
  );

  return (
    <div style={{
      background: 'rgba(4,5,9,0.92)',
      border: '1px solid rgba(255,168,76,0.38)',
      borderRadius: '6px',
      padding: '16px',
      fontFamily: "'Courier New', monospace",
      color: '#f4dab4',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '3px' }}>
        {company.name}
      </div>
      <div style={{ fontSize: '10px', color: '#6a5a48', fontStyle: 'italic', marginBottom: '14px', lineHeight: '1.4' }}>
        {company.tagline}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,168,76,0.15)', paddingTop: '10px', marginBottom: '10px' }}>
        {getMetrics(company).map(({ label, value }) => {
          const hl = focusSet.has(label);
          return (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 6px',
              background: hl ? 'rgba(255,168,76,0.07)' : 'transparent',
              borderRadius: '3px',
              marginBottom: '1px',
            }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: hl ? '#ffb35a' : '#7a6a58' }}>
                {label}
              </span>
              <StarRating score={value} />
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '10px', color: '#5a4a38', lineHeight: '1.55', borderTop: '1px solid rgba(255,168,76,0.10)', paddingTop: '8px' }}>
        {company.description}
      </div>
    </div>
  );
}

// Quiz card — only visible metrics shown, others hidden
interface QuizCardProps {
  company: Company;
  visibleMetrics: string[];
}

export function CompanyCardQuiz({ company, visibleMetrics }: QuizCardProps) {
  const visible = visibleMetrics.map(m => m.toUpperCase());
  const nHidden = 6 - visible.length;
  const focusStr = visible.join(' & ');

  return (
    <div style={{
      background: 'rgba(4,5,9,0.92)',
      border: '1px solid rgba(255,168,76,0.38)',
      borderRadius: '8px',
      padding: '22px',
      fontFamily: "'Courier New', monospace",
      color: '#f4dab4',
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '5px' }}>
        {company.name}
      </div>
      <div style={{ fontSize: '11px', color: '#6a5a48', fontStyle: 'italic', marginBottom: '18px', lineHeight: '1.5' }}>
        {company.tagline}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,168,76,0.15)', paddingTop: '12px', marginBottom: '12px' }}>
        {getMetrics(company).map(({ label, value }) => {
          if (visible.includes(label)) {
            return (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', background: 'rgba(255,168,76,0.08)',
                borderRadius: '4px', marginBottom: '3px',
              }}>
                <span style={{ fontSize: '12px', letterSpacing: '0.09em', color: '#ffb35a', fontWeight: 'bold' }}>
                  {label}
                </span>
                <StarRating score={value} size="lg" />
              </div>
            );
          }
          return (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 8px', borderRadius: '4px', marginBottom: '3px',
            }}>
              <span style={{ fontSize: '12px', letterSpacing: '0.09em', color: '#1e1812' }}>{label}</span>
              <span style={{ fontSize: '16px', color: '#18160e' }}>★★★★★</span>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '10px', color: '#2e2418', lineHeight: '1.55', borderTop: '1px solid rgba(255,168,76,0.08)', paddingTop: '8px' }}>
        ■ {nHidden} metrics classified. Evaluate {focusStr} only.
      </div>
    </div>
  );
}
