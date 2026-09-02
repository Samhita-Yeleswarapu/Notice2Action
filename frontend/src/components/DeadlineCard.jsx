import { useEffect, useState } from 'react';
import { urgencyMeta } from '../utils/urgency.js';

export default function DeadlineCard({ deadline }) {
  const urgency = deadline?.urgency || 'none';
  const meta = urgencyMeta(urgency);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`deadline-card urgency-${urgency}`}>
      <div className={`stamp-badge ${show ? 'show' : ''}`}>{meta.word}</div>
      <div className="deadline-text">
        <div className="d-label">Deadline</div>
        <div className="d-date">{deadline?.label || 'Not specified'}</div>
        <div className="d-sub">{meta.label}</div>
      </div>
    </div>
  );
}
