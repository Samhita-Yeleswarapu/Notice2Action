const multer = require('multer');

function errorHandler(err, req, res, next) {

  console.error('[error]', err && err.message ? err.message : err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'File is too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ success: false, error: 'File upload failed: ' + err.message });
  }

  const codeMap = {
    INVALID_FILE_TYPE: [400, 'Only PDF files are allowed.'],
    PDF_CORRUPTED: [422, 'This PDF could not be read — it may be corrupted or encrypted.'],
    PDF_NO_TEXT: [422, 'Unable to extract readable text from this PDF. It may be a scanned image — try pasting the text instead.'],
    AI_INVALID_JSON: [502, 'The AI analysis could not be processed. Please try again.'],
    AI_REQUEST_FAILED: [502, 'The AI service is temporarily unavailable. Please try again in a moment.'],
    NOT_FOUND: [404, 'Notice not found.'],
    UNAUTHORIZED: [401, 'You are not authorized to access this notice.'],
    VALIDATION_ERROR: [400, err.message || 'Invalid request.'],
  };

  if (err.code && codeMap[err.code]) {
    const [status, message] = codeMap[err.code];
    return res.status(status).json({ success: false, error: message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid notice ID.' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: 'Invalid data: ' + err.message });
  }

  if (err.name === 'MongoServerError' || err.name === 'MongooseServerSelectionError') {
    return res.status(503).json({ success: false, error: 'Could not connect to the database. Please try again shortly.' });
  }

  return res.status(500).json({ success: false, error: 'Something went wrong on our end. Please try again.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: 'Route not found.' });
}

module.exports = { errorHandler, notFoundHandler };
