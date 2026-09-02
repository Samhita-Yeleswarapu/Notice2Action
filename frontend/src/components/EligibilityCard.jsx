export default function EligibilityCard({ eligibility }) {
  return (
    <div className="section-card">
      <div className="s-label">Eligibility</div>
      {eligibility && eligibility.length ? (
        <ul>
          {eligibility.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>No eligibility criteria stated in the notice.</p>
      )}
    </div>
  );
}
