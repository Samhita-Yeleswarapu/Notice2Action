export default function AnalyseButton({ loading, onClick, disabled }) {
  return (
    <button className="analyse-btn" onClick={onClick} disabled={disabled || loading}>
      {loading && <span className="spinner" />}
      <span>{loading ? 'Analysing…' : '② Analyse notice'}</span>
    </button>
  );
}
