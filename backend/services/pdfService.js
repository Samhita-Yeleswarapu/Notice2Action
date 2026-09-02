const pdfParse = require('pdf-parse');

const MIN_READABLE_CHARS = 20;
async function extractTextFromPdf(buffer) {
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    console.error('[pdf-parse] raw error:', err);
    const error = new Error('This PDF could not be read — it may be corrupted or encrypted.');
    error.code = 'PDF_CORRUPTED';
    throw error;
  }

  const text = (data.text || '').trim();
  const hasReadableText = text.length >= MIN_READABLE_CHARS;

  return {
    text,
    pageCount: data.numpages || 0,
    hasReadableText,
  };
}

module.exports = { extractTextFromPdf, MIN_READABLE_CHARS };
