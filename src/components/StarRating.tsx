interface Props { score: number; size?: 'sm' | 'md' | 'lg'; }

export default function StarRating({ score, size = 'md' }: Props) {
  const filledCol = score >= 4 ? '#ffb35a' : score >= 3 ? '#c4a060' : '#5a3e20';
  const emptyCol = '#1e1710';
  const fontSize = size === 'lg' ? '18px' : size === 'sm' ? '12px' : '14px';

  return (
    <span style={{ fontSize }}>
      <span style={{ color: filledCol }}>{'★'.repeat(score)}</span>
      <span style={{ color: emptyCol }}>{'★'.repeat(5 - score)}</span>
    </span>
  );
}
