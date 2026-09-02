import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <>
      <Header
        rightSlot={
          <button className="pill-btn primary" onClick={() => navigate('/app')}>
            Open the app
          </button>
        }
      />
      <section className="hero">
        <h2>From information overload to clear action.</h2>
        <p>
          Notice2Action reads scholarship circulars, exam notices, internship calls, fee reminders, and event
          announcements — and turns them into a plain-English summary, your eligibility, the real deadline, the
          documents to gather, and a checklist you can actually work through.
        </p>
        <button
          className="pill-btn primary"
          style={{ marginTop: 22, padding: '12px 22px' }}
          onClick={() => navigate('/app')}
        >
          Analyse your first notice →
        </button>
      </section>

      <div style={{ maxWidth: 1180, margin: '40px auto 0', padding: '0 clamp(20px,4vw,56px) 80px' }}>
        <div className="grid-2">
          <div className="section-card">
            <div className="s-label">Paste or upload</div>
            <p>Paste the notice text directly, or drop in a PDF — the backend extracts the text for you.</p>
          </div>
          <div className="section-card">
            <div className="s-label">Structured in seconds</div>
            <p>Claude reads the notice and returns a summary, eligibility, deadline, and required documents.</p>
          </div>
          <div className="section-card">
            <div className="s-label">A real checklist</div>
            <p>Work through an interactive action checklist with progress tracking, saved to your account.</p>
          </div>
          <div className="section-card">
            <div className="s-label">Ask follow-ups</div>
            <p>Not sure about a detail? Ask the notice directly — answers come only from that notice's text.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
