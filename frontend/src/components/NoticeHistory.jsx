import { useNavigate } from 'react-router-dom';

export default function NoticeHistory({ notices, loading }) {
  const navigate = useNavigate();

  return (
    <div className="history">
      <h3>Previously analysed</h3>
      {loading && <div className="history-empty">Loading…</div>}
      {!loading && (!notices || notices.length === 0) && (
        <div className="history-empty">Nothing yet — analyse your first notice above.</div>
      )}
      {!loading &&
        notices?.map((item) => (
          <button key={item._id} className="history-item" onClick={() => navigate(`/notice/${item._id}`)}>
            <span>
              {item.title} {item.isDemo && <em style={{ color: 'var(--ink-light)' }}>(demo)</em>}
            </span>
            <span className="h-date">
              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </button>
        ))}
    </div>
  );
}
