import { useState } from 'react';
import ProgressBar from './ProgressBar.jsx';
import { updateChecklist } from '../services/api.js';

export default function ChecklistCard({ notice, onNoticeUpdate }) {
  const [savingIndex, setSavingIndex] = useState(null);
  const checklist = notice.checklist || [];
  const done = checklist.filter((c) => c.completed).length;

  async function toggle(idx, checked) {
    // Optimistic update — flip the UI immediately, then persist.
    const next = { ...notice, checklist: checklist.map((c, i) => (i === idx ? { ...c, completed: checked } : c)) };
    onNoticeUpdate(next);
    setSavingIndex(idx);
    try {
      const saved = await updateChecklist(notice._id, idx, checked);
      onNoticeUpdate(saved);
    } catch (err) {
      // Revert on failure
      onNoticeUpdate(notice);
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <div className="section-card checklist-card">
      <div className="s-label">Action checklist</div>
      {checklist.length ? (
        <ul className="checklist">
          {checklist.map((item, i) => (
            <li key={i} className={item.completed ? 'done' : ''}>
              <input
                type="checkbox"
                id={`chk${i}`}
                checked={item.completed}
                disabled={savingIndex === i}
                onChange={(e) => toggle(i, e.target.checked)}
              />
              <label htmlFor={`chk${i}`}>{item.task}</label>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>No steps generated.</p>
      )}
      <ProgressBar done={done} total={checklist.length} />
    </div>
  );
}
