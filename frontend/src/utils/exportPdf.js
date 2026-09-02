import { jsPDF } from 'jspdf';

function writeWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (y > 780) {
      doc.addPage();
      y = 48;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function section(doc, label, text, margin, y, pageWidth) {
  if (y > 740) {
    doc.addPage();
    y = 48;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(label.toUpperCase(), margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y = writeWrapped(doc, text, margin, y, pageWidth, 15);
  return y + 14;
}

function sectionList(doc, label, items, margin, y, pageWidth) {
  if (y > 740) {
    doc.addPage();
    y = 48;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(label.toUpperCase(), margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  if (!items || !items.length) {
    doc.text('None stated.', margin, y);
    y += 15;
  } else {
    items.forEach((it) => {
      if (y > 760) {
        doc.addPage();
        y = 48;
      }
      y = writeWrapped(doc, '• ' + it, margin, y, pageWidth, 15);
    });
  }
  return y + 12;
}

export function exportNoticeToPdf(notice) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Notice2Action — Action Plan', margin, y);
  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('Generated ' + new Date().toLocaleDateString(), margin, y);
  y += 22;
  doc.setTextColor(20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  y = writeWrapped(doc, notice.title, margin, y, pageWidth, 16);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CATEGORY: ' + (notice.category || '—').toUpperCase(), margin, y);
  y += 20;

  y = section(doc, 'Summary', notice.summary || '—', margin, y, pageWidth);
  y = sectionList(doc, 'Eligibility', notice.eligibility, margin, y, pageWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DEADLINE', margin, y);
  y += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    (notice.deadline?.label || 'Not specified') + '  (' + (notice.deadline?.urgency || 'none').toUpperCase() + ')',
    margin,
    y
  );
  y += 20;

  y = sectionList(doc, 'Required documents', notice.documents, margin, y, pageWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ACTION CHECKLIST', margin, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  (notice.checklist || []).forEach((item) => {
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
    const mark = item.completed ? '[x]' : '[ ]';
    y = writeWrapped(doc, mark + ' ' + item.task, margin, y, pageWidth, 15);
    y += 4;
  });

  doc.save((notice.title || 'notice').replace(/[^a-z0-9]+/gi, '_').toLowerCase() + '_action_plan.pdf');
}
