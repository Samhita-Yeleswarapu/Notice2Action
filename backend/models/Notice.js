const mongoose = require('mongoose');

const ChecklistItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const DeadlineSchema = new mongoose.Schema(
  {
    date: { type: Date, default: null },
    label: { type: String, default: null },
    urgency: {
      type: String,
      enum: ['high', 'medium', 'low', 'none'],
      default: 'none',
    },
  },
  { _id: false }
);

const SubmissionDetailsSchema = new mongoose.Schema(
  {
    method: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const NoticeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Scholarship',
        'Exam',
        'Internship',
        'Event',
        'Fee Payment',
        'Registration',
        'Academic',
        'Other',
      ],
      default: 'Other',
    },
    originalText: { type: String, required: true },

    summary: { type: String, default: '' },
    eligibility: { type: [String], default: [] },
    ineligible: { type: [String], default: [] },
    deadline: { type: DeadlineSchema, default: () => ({}) },
    documents: { type: [String], default: [] },
    checklist: { type: [ChecklistItemSchema], default: [] },
    submissionDetails: { type: SubmissionDetailsSchema, default: () => ({}) },
    importantNotes: { type: [String], default: [] },
    isDemo: { type: Boolean, default: false },

    sourceType: { type: String, enum: ['text', 'pdf'], default: 'text' },
    pdfUrl: { type: String, default: '' },
    pdfPublicId: { type: String, default: '' },
  },
  { timestamps: true }
);

NoticeSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
