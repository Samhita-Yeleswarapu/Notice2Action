# Notice2Action

Turn long, dense college notices into a clear action plan: summary, eligibility, deadline, required documents,
and a step-by-step checklist — powered by Claude, backed by MongoDB, deployable on Vercel.

This is a full-stack rebuild of the original static prototype. The design (manila/cork/paper theme, stamp
badge, dashboard layout) is preserved; everything else — PDF extraction, AI calls, and storage — now runs on
a real backend instead of in the browser.

```
Frontend (React) → Backend API (Express, serverless on Vercel) → PDF/Text extraction → Claude → MongoDB Atlas
```

---

## 1. Architecture & why it's structured this way

```
notice2action/
├── frontend/              # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/    # Header, Hero, NoticeInput, ResultDashboard, cards, etc.
│   │   ├── pages/         # Landing, AppPage, NoticePage, Login, Register
│   │   ├── services/api.js  # the ONLY place the frontend calls the backend
│   │   └── utils/          # urgency helper, jsPDF export
│   └── package.json
│
├── backend/                # Express app — organized as models/controllers/routes/services/middleware
│   ├── app.js               # assembled Express app (no app.listen here)
│   ├── server.js            # local dev entry point (calls app.listen)
│   ├── config/db.js         # cached MongoDB connection (safe for serverless reuse)
│   ├── models/               # Notice.js, User.js (Mongoose)
│   ├── controllers/          # noticeController.js, authController.js
│   ├── routes/                # noticeRoutes.js, authRoutes.js
│   ├── services/               # aiService.js (Anthropic), pdfService.js (pdf-parse), storageService.js (Cloudinary, optional)
│   ├── middleware/              # upload (Multer), auth (JWT), rateLimiter, errorHandler
│   └── utils/                    # validation, asyncHandler, demo seed script
│
├── api/
│   └── index.js             # Vercel serverless function — re-exports backend/app.js
│
├── vercel.json
├── package.json              # backend dependencies (used by the api/ function)
├── .env.example
└── README.md
```

**Why a single Express app wrapped by one serverless function, instead of one file per route?**
Vercel treats every file under `/api` as its own isolated function. Splitting every route into its own
file would mean re-implementing CORS, rate limiting, DB connection, and error handling in each one, and
would also complicate local development (you'd need a router just to dispatch between them). Instead,
`backend/app.js` is a normal Express app with real controllers/routes/middleware — exactly the code
structure the task calls for — and `api/index.js` simply hands that whole app to Vercel as one function.
`vercel.json` rewrites all `/api/*` traffic to it, and Express's own router does the path matching
internally, the same way it would on a normal long-running server. Locally, `backend/server.js` runs
that same `app.js` with a real `app.listen()`, so the code path is identical in both environments.

**Why Multer uses memory storage instead of writing a temp file:**
Vercel's serverless filesystem is read-only outside of `/tmp`, and files there aren't guaranteed to
survive or get cleaned up reliably between invocations. Keeping the uploaded PDF only in memory,
extracting its text with `pdf-parse`, and letting the buffer be garbage-collected when the request ends
is a stronger guarantee than "write to disk, then remember to delete it" — the file is never written to
disk at all.

---

## 2. Local development

You'll need Node.js 18+ and a MongoDB connection string (Atlas, or local `mongod`) and an Anthropic API key.

### Backend

```bash
# from the project root
cp .env.example .env
# edit .env: set MONGODB_URI, ANTHROPIC_API_KEY, ANTHROPIC_MODEL

npm install
npm run dev
# → Notice2Action API listening on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3001` (see `frontend/vite.config.js`),
so you don't need to configure `VITE_API_URL` locally unless you want to point at a different backend.

### (Optional) seed a demo notice

```bash
node backend/utils/seedDemoNotice.js
```

This inserts one notice with `isDemo: true` so you can see the dashboard/checklist/export UI without
spending an API call. It's clearly flagged and never mixed with real analyses.

---

## 3. MongoDB Atlas setup

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Cluster** (the free M0 tier is enough to develop and demo with).
3. Under **Database Access**, create a database user with a username and password (not your Atlas login).
4. Under **Network Access**, add an IP access entry:
   - For local development, add your current IP.
   - For Vercel, add `0.0.0.0/0` (allow access from anywhere), since Vercel's serverless functions run
     from a changing pool of IP addresses. Restrict this further only if you're on a paid Atlas tier with
     a static IP / VPC peering option.
5. Click **Connect → Drivers**, copy the connection string, and replace `<username>`, `<password>`, and
   add a database name, e.g.:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/notice2action?retryWrites=true&w=majority
   ```
6. Put that string in `MONGODB_URI` — in your local `.env` for development, and in Vercel's environment
   variables (see below) for production.
7. Deploy, then verify the connection by opening `/api/health` on your deployed URL — it should return
   `{"success":true,"status":"ok", ...}`. If `MONGODB_URI` is missing or wrong, any `/api/notices*` call
   will return a `503` with "Could not connect to the database."

---

## 3b. (Optional) Cloudinary setup — keep the original PDF

By default, an uploaded PDF's text is extracted and analysed, then the file itself is discarded — nothing
is stored except the extracted text. If you'd like a "View original PDF" link on each notice, wire up
Cloudinary:

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. On your Dashboard, copy the **Cloud name**, **API Key**, and **API Secret**.
3. Put them in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — in your local `.env`
   for development, and in Vercel's environment variables for production.
4. That's it — no restart-required config beyond that. Leave these three blank and the app keeps working
   exactly as before; `backend/services/storageService.js` detects the missing config and simply skips
   the upload (analysis is unaffected either way).

PDFs are uploaded as Cloudinary's `raw` resource type (not `image` — Cloudinary rejects non-image files
under the default resource type) into a `notice2action/pdfs` folder, and deleted from Cloudinary automatically
when the corresponding notice is deleted.

---

## 4. Environment variables

See `.env.example` for the full list with comments. Summary:

| Variable | Where it's used | Exposed to browser? |
|---|---|---|
| `MONGODB_URI` | backend only | **No** |
| `ANTHROPIC_API_KEY` | backend only | **No** |
| `ANTHROPIC_MODEL` | backend only | **No** |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | backend only (optional auth) | **No** |
| `CORS_ORIGINS` | backend only | **No** |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | backend only, optional | **No** |
| `VITE_API_URL` | frontend build | Yes — safe, it's just a URL |

The frontend never imports or references `ANTHROPIC_API_KEY` or `MONGODB_URI` anywhere — search the
`frontend/` folder and you won't find them. All AI and database calls happen inside `backend/`.

---

## 5. Deploying to Vercel

### Step 1 — Create a GitHub repository
Create a new repo and push this project to it.

```bash
cd notice2action
git init
git add .
git commit -m "Notice2Action full-stack app"
git branch -M main
git remote add origin https://github.com/<you>/notice2action.git
git push -u origin main
```

### Step 2 — Push project to GitHub
(done above)

### Step 3 — Connect the repository to Vercel
Go to [vercel.com/new](https://vercel.com/new), import the GitHub repository. Vercel will detect
`vercel.json`; you don't need to change the build settings it suggests — `vercel.json` already defines
the build and output directory.

### Step 4 — Configure environment variables
In the Vercel project → **Settings → Environment Variables**, add (for Production, and Preview if you
want PR previews to work):

- `MONGODB_URI`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `CORS_ORIGINS` — include your Vercel domain, e.g. `https://notice2action.vercel.app`
- `JWT_SECRET` (only if you're using the optional auth module)
- `VITE_API_URL` — set this to `/api` (a relative path works because the frontend and API are served
  from the same Vercel deployment/domain)

### Step 5 — Deploy
Click **Deploy**. Vercel runs `npm install && cd frontend && npm install` then
`cd frontend && npm install && npm run build`, publishes `frontend/dist` as the static site, and deploys
`api/index.js` as a serverless function for all `/api/*` routes.

### Step 6 — Test the full flow
On your deployed URL, verify:
- Homepage loads
- Paste text → Analyse → dashboard appears
- Upload a PDF → Analyse → dashboard appears (with a "View original PDF" link if Cloudinary is configured)
- Refresh → notice history loads from MongoDB
- Check a checklist item → refresh → it's still checked
- Ask the Notice → get an answer
- Export PDF → downloads an action-plan PDF

### Redeploying after changes
Push to your connected branch (usually `main`) and Vercel redeploys automatically. You can also trigger
a manual redeploy from the Vercel dashboard's **Deployments** tab.

---

## 6. Security notes

- Helmet, CORS (explicit allowlist, no `*` in production), and rate limiting (general + a tighter limit
  on AI-calling routes) are applied in `backend/app.js`.
- PDFs are validated by MIME type and extension, capped at 10 MB, and processed entirely in memory —
  never written to disk or exposed via a public URL.
- Claude's response is always parsed and validated (`backend/utils/validateNoticeJSON.js`) before being
  saved or returned; invalid JSON returns a clean `502` instead of crashing the server.
- Error responses never leak stack traces, connection strings, or API keys — see
  `backend/middleware/errorHandler.js`.
- **Known limitation:** Vercel's default serverless function body-size limit (roughly 4.5 MB on typical
  plans) is lower than the 10 MB PDF limit enforced here. If large PDFs fail to upload in production,
  either raise your Vercel plan's limit or lower `MAX_FILE_SIZE_BYTES` in
  `backend/middleware/upload.js` to match your plan.

## 7. Authentication (optional)

The app works fully with `userId: null` (anonymous) — no login required. To turn on accounts:

1. Set `JWT_SECRET` in your environment.
2. Users can register/login at `/register` and `/login`, which call `POST /api/auth/register` and
   `POST /api/auth/login`.
3. Once logged in, the frontend automatically attaches the JWT to every API request (see
   `frontend/src/services/api.js`), and the backend scopes notices to that user
   (`backend/middleware/auth.js`, `backend/controllers/noticeController.js`) so one user can never see
   another's notices.

## 8. Tech stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide React, jsPDF
**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Multer, pdf-parse, dotenv, cors, helmet,
express-rate-limit, jsonwebtoken, bcryptjs
**AI:** Anthropic Claude API (`@anthropic-ai/sdk`) — server-side only

Before deploying, double check the current recommended model name/alias at
[docs.claude.com](https://docs.claude.com/en/docs/about-claude/models), since model names are updated
over time — set whatever's current in `ANTHROPIC_MODEL`.
