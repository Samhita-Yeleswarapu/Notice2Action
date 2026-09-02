const multer = require('multer');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const storage = multer.memoryStorage();

function pdfFileFilter(req, file, cb) {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
  if (!isPdfMime || !isPdfExt) {
    const error = new Error('Only PDF files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: pdfFileFilter,
});

module.exports = { upload, MAX_FILE_SIZE_BYTES };
