export default function SummaryCard({ summary }) {
  return (
    <div className="section-card" style={{ gridColumn: '1/-1' }}>
      <div className="s-label">Summary</div>
      <p>{summary || '—'}</p>
    </div>
  );
}
