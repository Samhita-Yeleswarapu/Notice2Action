export default function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <>
      <div className="progress-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-caption">
        {done} of {total} steps complete
      </div>
    </>
  );
}
