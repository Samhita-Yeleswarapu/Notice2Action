const Notice = require("../models/Notice");
const { extractTextFromPdf } = require("../services/pdfService");
const { analyseNoticeText, askAboutNotice } = require("../services/aiService");
const {
  uploadPdfBuffer,
  deletePdfByPublicId,
} = require("../services/storageService");
const { parseAndValidateNoticeJSON } = require("../utils/validateNoticeJSON");
const asyncHandler = require("../utils/asyncHandler");

const MAX_TEXT_LENGTH = 20000;

async function runAnalysis({ text, userId, sourceType, pdfUrl, pdfPublicId }) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    const error = new Error("Notice text is empty.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    const error = new Error(
      `Notice text is too long (max ${MAX_TEXT_LENGTH} characters).`,
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  let rawAiText;
  try {
    rawAiText = await analyseNoticeText(trimmed);
  } catch (err) {
    console.error(
      "[aiService] analyseNoticeText failed:",
      err.response?.data || err.message || err,
    );
    const error = new Error("AI analysis request failed.");
    error.code = "AI_REQUEST_FAILED";
    throw error;
  }

  const normalized = parseAndValidateNoticeJSON(rawAiText);

  const notice = await Notice.create({
    userId: userId || null,
    title: normalized.title,
    category: normalized.category,
    originalText: trimmed,
    summary: normalized.summary,
    eligibility: normalized.eligibility,
    ineligible: normalized.ineligible,
    deadline: normalized.deadline,
    documents: normalized.documents,
    checklist: normalized.checklist,
    submissionDetails: normalized.submissionDetails,
    importantNotes: normalized.importantNotes,
    sourceType,
    pdfUrl: pdfUrl || "",
    pdfPublicId: pdfPublicId || "",
  });

  return notice;
}

// POST /api/notices/analyse-text
const analyseText = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const notice = await runAnalysis({
    text,
    userId: req.userId,
    sourceType: "text",
  });
  res.status(201).json({ success: true, notice });
});
const analysePdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error(
      'No file uploaded. Attach a PDF under the "file" field.',
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const { text, hasReadableText } = await extractTextFromPdf(req.file.buffer);

  if (!hasReadableText) {
    const error = new Error("No readable text found in PDF.");
    error.code = "PDF_NO_TEXT";
    throw error;
  }
  let pdfUrl = "";
  let pdfPublicId = "";
  try {
    const uploaded = await uploadPdfBuffer(
      req.file.buffer,
      req.file.originalname,
    );
    if (uploaded) {
      pdfUrl = uploaded.url;
      pdfPublicId = uploaded.publicId;
    }
  } catch (err) {
    console.error("[storage] PDF upload failed (non-fatal):", err.message);
  }

  const notice = await runAnalysis({
    text,
    userId: req.userId,
    sourceType: "pdf",
    pdfUrl,
    pdfPublicId,
  });
  res.status(201).json({ success: true, notice });
});

const getNotices = asyncHandler(async (req, res) => {
  const filter = req.userId ? { userId: req.userId } : { userId: null };
  const notices = await Notice.find(filter)
    .select("title category deadline createdAt isDemo")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, notices });
});
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    const error = new Error("Notice not found.");
    error.code = "NOT_FOUND";
    throw error;
  }
  if (
    notice.userId &&
    req.userId &&
    String(notice.userId) !== String(req.userId)
  ) {
    const error = new Error("Unauthorized.");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  res.json({ success: true, notice });
});
const updateChecklistItem = asyncHandler(async (req, res) => {
  const { id, itemIndex } = req.params;
  const { completed } = req.body;
  const idx = Number(itemIndex);

  const notice = await Notice.findById(id);
  if (!notice) {
    const error = new Error("Notice not found.");
    error.code = "NOT_FOUND";
    throw error;
  }
  if (
    notice.userId &&
    req.userId &&
    String(notice.userId) !== String(req.userId)
  ) {
    const error = new Error("Unauthorized.");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  if (Number.isNaN(idx) || idx < 0 || idx >= notice.checklist.length) {
    const error = new Error("Invalid checklist item index.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  notice.checklist[idx].completed = Boolean(completed);
  await notice.save();

  res.json({ success: true, notice });
});
const askNotice = asyncHandler(async (req, res) => {
  const { question, history } = req.body;
  if (!question || !question.trim()) {
    const error = new Error("Question is required.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    const error = new Error("Notice not found.");
    error.code = "NOT_FOUND";
    throw error;
  }
  if (
    notice.userId &&
    req.userId &&
    String(notice.userId) !== String(req.userId)
  ) {
    const error = new Error("Unauthorized.");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  let answer;
  try {
    answer = await askAboutNotice(
      notice.originalText,
      question.trim(),
      Array.isArray(history) ? history : [],
    );
  } catch (err) {
    const error = new Error("AI request failed.");
    error.code = "AI_REQUEST_FAILED";
    throw error;
  }

  res.json({ success: true, answer });
});
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    const error = new Error("Notice not found.");
    error.code = "NOT_FOUND";
    throw error;
  }
  if (
    notice.userId &&
    req.userId &&
    String(notice.userId) !== String(req.userId)
  ) {
    const error = new Error("Unauthorized.");
    error.code = "UNAUTHORIZED";
    throw error;
  }

  if (notice.pdfPublicId) {
    try {
      await deletePdfByPublicId(notice.pdfPublicId);
    } catch (err) {
      console.error("[storage] PDF cleanup failed (non-fatal):", err.message);
    }
  }

  await notice.deleteOne();
  res.json({ success: true });
});

module.exports = {
  analyseText,
  analysePdf,
  getNotices,
  getNoticeById,
  updateChecklistItem,
  askNotice,
  deleteNotice,
};
