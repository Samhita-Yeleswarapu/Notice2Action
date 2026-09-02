import SummaryCard from './SummaryCard.jsx';
import EligibilityCard from './EligibilityCard.jsx';
import DeadlineCard from './DeadlineCard.jsx';
import DocumentsCard from './DocumentsCard.jsx';
import ChecklistCard from './ChecklistCard.jsx';
import AskNotice from './AskNotice.jsx';
import OriginalNotice from './OriginalNotice.jsx';
import ExportPDF from './ExportPDF.jsx';

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="glyph">✎</div>
      <h4>Your action dashboard appears here</h4>
      <p>Summary, eligibility, deadline, required documents and a step-by-step checklist — extracted the moment you analyse a notice.</p>
    </div>
  );
}

export default function ResultDashboard({ notice, onNoticeUpdate }) {
  if (!notice) {
    return (
      <div className="dashboard">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="result-head">
        <div>
          <span className="cat">{notice.category || 'Notice'}</span>
          <h3>{notice.title}</h3>
        </div>
        <ExportPDF notice={notice} />
      </div>

      <div className="grid-2">
        <SummaryCard summary={notice.summary} />
        <EligibilityCard eligibility={notice.eligibility} />
        <DocumentsCard documents={notice.documents} />
        <DeadlineCard deadline={notice.deadline} />
        <ChecklistCard notice={notice} onNoticeUpdate={onNoticeUpdate} />
        <AskNotice noticeId={notice._id} />
      </div>

      <OriginalNotice text={notice.originalText} pdfUrl={notice.pdfUrl} />
    </div>
  );
}
