import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ResultDashboard from '../components/ResultDashboard.jsx';
import { getNotice, deleteNotice } from '../services/api.js';

export default function NoticePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getNotice(id)
      .then((data) => {
        if (!cancelled) setNotice(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this notice.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this notice? This cannot be undone.')) return;
    try {
      await deleteNotice(id);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Could not delete this notice.');
    }
  }

  return (
    <>
      <Header
        rightSlot={
          <>
            <button className="pill-btn" onClick={() => navigate('/app')}>
              Back to app
            </button>
            {notice && (
              <button className="pill-btn" onClick={handleDelete} title="Delete notice">
                <Trash2 size={12} style={{ display: 'inline', verticalAlign: -2 }} />
              </button>
            )}
          </>
        }
      />
      <div className="stage" style={{ gridTemplateColumns: '1fr', maxWidth: 820 }}>
        {loading && <p style={{ color: 'var(--ink-light)' }}>Loading notice…</p>}
        {error && <div className="error-note">{error}</div>}
        {!loading && !error && <ResultDashboard notice={notice} onNoticeUpdate={setNotice} />}
      </div>
      <Footer />
    </>
  );
}
