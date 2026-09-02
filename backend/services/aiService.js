const OpenAI = require('openai');
let client = null;
function getClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set on the server.');
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Notice2Action',
      },
    });
  }
  return client;
}

const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

const ANALYSIS_SYSTEM_PROMPT = `You are the analysis engine inside Notice2Action, a tool that turns long
college notices into clear action plans for students.

You will be given the raw text of a college notice (scholarship, exam,
internship, event, fee payment, registration, or academic notice).

Respond with ONLY a single valid JSON object — no preamble, no markdown
code fences, no commentary before or after it.

The JSON schema is exactly:
{
  "title": string, 
  "category": one of ["Scholarship","Exam","Internship","Event","Fee Payment","Registration","Academic","Other"],
  "summary": string,             
  "eligibility": string[],       
  "ineligible": string[],       
  "deadline": {
    "date": string | null,       
    "label": string | null,    
    "urgency": one of ["high","medium","low","none"]
  },
  "documents": string[],        
  "checklist": string[],        
  "submissionDetails": {
    "method": string,          
    "location": string,         
    "website": string           
  },
  "importantNotes": string[]   

Rules:
- Base everything ONLY on the notice text given. Never invent dates, facts,
  or eligibility rules that are not present in the notice.
- If a field is not present in the notice, return null (for scalar fields)
  or an empty array (for list fields) — never guess or fabricate a value.
- Judge "urgency" relative to today's date, which will be provided to you
  in the user message.
- Output must be valid, parseable JSON and nothing else.`;

const ASK_SYSTEM_PROMPT = `You are answering a student's question about ONE specific college notice
inside Notice2Action.

Only use the notice text provided below — never invent facts, dates, or
eligibility rules that are not present in it. If the answer isn't in the
notice, say so plainly: "I couldn't find that information in the notice."
and suggest checking with the issuing office.

Keep answers to 2-4 short, plain-English sentences.`;

function stripCodeFences(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function extractText(response) {
  return response.choices?.[0]?.message?.content || '';
}
async function analyseNoticeText(noticeText) {
  const today = new Date().toISOString().slice(0, 10);
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Today's date is ${today}. Analyse the following notice:\n\n${noticeText}`,
      },
    ],
  });
  return stripCodeFences(extractText(response));
}
async function askAboutNotice(noticeText, question, history = []) {
  const messages = [
    { role: 'system', content: `${ASK_SYSTEM_PROMPT}\n\nNOTICE TEXT:\n${noticeText}` },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages,
  });
  return extractText(response).trim();
}

module.exports = { analyseNoticeText, askAboutNotice, MODEL };