import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import NoticeInput from '../components/NoticeInput.jsx';
import NoticeHistory from '../components/NoticeHistory.jsx';
import ResultDashboard from '../components/ResultDashboard.jsx';
import { analyseText, analysePdf, getNotices } from '../services/api.js';

export default function AppPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(-1);
  const [error, setError] = useState('');

  const [notice, setNotice] = useState(null);
  const [notices, setNotices] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (err) {
      // Non-fatal — history is a convenience, not the core flow.
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleAnalyse() {
    setError('');
    if (!text.trim() && !file) {
      setError('Paste some notice text or upload a PDF first.');
      return;
    }

    setLoading(true);
    setProcessingStep(0);
    try {
      let result;
      if (file) {
        setProcessingStep(1);
        result = await analysePdf(file);
        setProcessingStep(2);
      } else {
        setProcessingStep(2);
        result = await analyseText(text);
      }
      setProcessingStep(3);
      setNotice(result);
      setProcessingStep(4);
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setProcessingStep(-1);
    }
  }

  return (
    <>
      <Header
        rightSlot={
          <button className="pill-btn" onClick={() => navigate('/')}>
            Home
          </button>
        }
      />
      <section className="hero">
        <h2>From information overload to clear action.</h2>
        <p>
          Paste a college notice or upload the PDF. Notice2Action reads the fine print and hands you back a
          summary, your eligibility, the real deadline, the documents to gather, and a checklist you can
          actually work through.
        </p>
      </section>

      <div className="stage">
        <div>
          <NoticeInput
            text={text}
            onTextChange={setText}
            file={file}
            onFileSelected={setFile}
            onFileRemoved={() => setFile(null)}
            onAnalyse={handleAnalyse}
            loading={loading}
            processingStep={processingStep}
            error={error}
          />
          <NoticeHistory notices={notices} loading={historyLoading} />
        </div>

        <ResultDashboard notice={notice} onNoticeUpdate={setNotice} />
      </div>
      <Footer />
    </>
  );
}
