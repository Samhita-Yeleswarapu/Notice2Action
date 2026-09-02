const CATEGORIES = [
  'Scholarship',
  'Exam',
  'Internship',
  'Event',
  'Fee Payment',
  'Registration',
  'Academic',
  'Other',
];
const URGENCIES = ['high', 'medium', 'low', 'none'];

function asStringArray(v) {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
}

function parseAndValidateNoticeJSON(rawText, fallbackTitle = 'Untitled notice') {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    const error = new Error('AI response was not valid JSON.');
    error.code = 'AI_INVALID_JSON';
    throw error;
  }

  if (!parsed || typeof parsed !== 'object') {
    const error = new Error('AI response was not a JSON object.');
    error.code = 'AI_INVALID_JSON';
    throw error;
  }

  const deadlineRaw = parsed.deadline && typeof parsed.deadline === 'object' ? parsed.deadline : {};
  const submissionRaw =
    parsed.submissionDetails && typeof parsed.submissionDetails === 'object' ? parsed.submissionDetails : {};

  let deadlineDate = null;
  if (deadlineRaw.date) {
    const d = new Date(deadlineRaw.date);
    if (!Number.isNaN(d.getTime())) deadlineDate = d;
  }

  const normalized = {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : fallbackTitle,
    category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Other',
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    eligibility: asStringArray(parsed.eligibility),
    ineligible: asStringArray(parsed.ineligible),
    deadline: {
      date: deadlineDate,
      label: typeof deadlineRaw.label === 'string' ? deadlineRaw.label : null,
      urgency: URGENCIES.includes(deadlineRaw.urgency) ? deadlineRaw.urgency : 'none',
    },
    documents: asStringArray(parsed.documents),
    checklist: asStringArray(parsed.checklist).map((task) => ({ task, completed: false })),
    submissionDetails: {
      method: typeof submissionRaw.method === 'string' ? submissionRaw.method : '',
      location: typeof submissionRaw.location === 'string' ? submissionRaw.location : '',
      website: typeof submissionRaw.website === 'string' ? submissionRaw.website : '',
    },
    importantNotes: asStringArray(parsed.importantNotes),
  };

  return normalized;
}

module.exports = { parseAndValidateNoticeJSON };
