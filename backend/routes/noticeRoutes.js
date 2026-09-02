const express = require('express');
const { upload } = require('../middleware/upload');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  analyseText,
  analysePdf,
  getNotices,
  getNoticeById,
  updateChecklistItem,
  askNotice,
  deleteNotice,
} = require('../controllers/noticeController');

const router = express.Router();

router.post('/analyse-text', aiLimiter, analyseText);
router.post('/analyse-pdf', aiLimiter, upload.single('file'), analysePdf);

router.get('/', getNotices);
router.get('/:id', getNoticeById);

router.patch('/:id/checklist/:itemIndex', updateChecklistItem);
router.post('/:id/ask', aiLimiter, askNotice);

router.delete('/:id', deleteNotice);

module.exports = router;
