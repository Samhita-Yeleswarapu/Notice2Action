import { Download } from 'lucide-react';
import { exportNoticeToPdf } from '../utils/exportPdf.js';

export default function ExportPDF({ notice }) {
  return (
    <button className="export-btn" onClick={() => exportNoticeToPdf(notice)}>
      <Download size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: -2 }} />
      Export PDF
    </button>
  );
}
