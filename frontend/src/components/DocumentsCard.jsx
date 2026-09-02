export default function DocumentsCard({ documents }) {
  return (
    <div className="section-card">
      <div className="s-label">Required documents</div>
      {documents && documents.length ? (
        <ul className="doc-list">
          {documents.map((doc, i) => (
            <li key={i}>{doc}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>No documents specified.</p>
      )}
    </div>
  );
}
