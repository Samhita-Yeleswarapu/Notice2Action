
require('dotenv').config();
const connectDB = require('../config/db');
const Notice = require('../models/Notice');

async function seed() {
  await connectDB();

  await Notice.deleteMany({ isDemo: true }); 

  await Notice.create({
    userId: null,
    isDemo: true,
    sourceType: 'text',
    title: 'Merit Scholarship — Fall 2026 Applications',
    category: 'Scholarship',
    originalText:
      'NOTICE: The Office of Financial Aid invites applications for the Merit Scholarship, Fall 2026 cycle. ' +
      'Open to full-time undergraduate students with a cumulative GPA of 3.5 or higher who have completed at ' +
      'least two semesters. Interested students must submit a completed application form, latest transcript, ' +
      'and a 500-word statement of purpose through the online student portal by 15 September 2026, 5:00 PM. ' +
      'Late submissions will not be considered. Selected candidates will be notified by email by 30 September 2026.',
    summary:
      'A merit-based scholarship for the Fall 2026 term, open to undergraduates with strong academic standing. Apply online before the deadline with the required documents.',
    eligibility: ['Full-time undergraduate students', 'Cumulative GPA of 3.5 or higher', 'Completed at least two semesters'],
    ineligible: [],
    deadline: { date: new Date('2026-09-15'), label: 'September 15, 2026, 5:00 PM', urgency: 'medium' },
    documents: ['Completed application form', 'Latest academic transcript', '500-word statement of purpose'],
    checklist: [
      { task: 'Confirm you meet the GPA and enrollment requirements', completed: false },
      { task: 'Download and fill out the application form', completed: false },
      { task: 'Request your latest transcript from the registrar', completed: false },
      { task: 'Write and proofread your 500-word statement of purpose', completed: false },
      { task: 'Submit everything through the student portal before the deadline', completed: false },
    ],
    submissionDetails: { method: 'Online student portal', location: '', website: '' },
    importantNotes: ['Late submissions will not be considered.'],
  });

  console.log('Demo notice seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
