# Soterius Architecture

**Authoritative source:** This file. Do not derive architecture from code comments or conversation history.  
**Last updated:** 2026-06-13

---

## Stack Overview

| Layer | Technology | Host |
|---|---|---|
| Frontend | React 18 + Vite | Vercel |
| Backend | Node.js + Express | Railway (Docker) |
| Database | PostgreSQL via Supabase | Supabase |
| PDF generation | Puppeteer + system Chromium | Railway (same container as backend) |
| Email | Resend | Resend API |

---

## Infrastructure

### Frontend — Vercel

- Framework: React 18 with Vite
- Build output: static files deployed to Vercel CDN
- Environment variable: `VITE_API_URL` — points to the Railway backend URL
- CORS: backend whitelist includes `https://soterius-frontend.vercel.app` and `https://soterius-*.vercel.app` (Vercel preview deployments)

### Backend — Railway

- Runtime: Node.js 20 in Docker container
- Entry point: `backend/server.js`
- Port: `process.env.PORT` (default 3001; Railway sets this automatically)
- Dockerfile: uses `apt-get install chromium` for Puppeteer (see PDF section)
- Auto-deploy: triggered by pushes to the `main` branch of the `soterius-backend` submodule

### Database — Supabase

- PostgreSQL (managed)
- Client: `@supabase/supabase-js` with service role key (full access)
- Tables: `submissions`, `scans` (see Database Schema)
- Connection is lazy-initialised: `getClient()` in `backend/services/database.js` creates the client on first call

---

## Repository Structure

```
soterius/                        ← root repo (this repository)
├── backend/                     ← git submodule (soterius-backend)
│   ├── server.js                ← Express app entry point
│   ├── routes/
│   │   ├── scan.js              ← scan, history, gate, PDF-by-submission
│   │   ├── report.js            ← in-memory PDF generation
│   │   └── gate.js              ← admin CSV export
│   ├── scanners/
│   │   ├── ssl-check.js
│   │   ├── dns-check.js         ← email security (SPF, DKIM, DMARC)
│   │   ├── headers-check.js
│   │   ├── tech-detect.js       ← vulnerable components
│   │   └── gdpr-check.js
│   ├── pdf-generator/
│   │   └── generator.js         ← Puppeteer HTML→PDF
│   ├── services/
│   │   └── database.js          ← Supabase client + all DB functions
│   ├── utils/
│   │   ├── emailService.js      ← Resend integration
│   │   ├── pdfAdapter.js        ← maps scanner format to PDF format
│   │   ├── validators.js        ← domain validation
│   │   ├── errors.js            ← AppError, ValidationError
│   │   ├── logger.js
│   │   └── csvExporter.js       ← legacy CSV for admin endpoint
│   └── db/
│       └── migrations/
│           ├── 001_create_scans_table.sql
│           └── 002_add_scan_id_to_submissions.sql
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Home.jsx
│       │   └── Results.jsx      ← main results page (all history/trend UI)
│       ├── components/
│       │   └── ScannerCard.jsx
│       └── services/
│           └── api.js           ← all API calls
├── ARCHITECTURE.md              ← this file
├── BOARD.md
├── CHANGELOG.md
├── DECISIONS.md
├── ROADMAP.md
├── SCORING.md
└── VISION.md
```

---

## API Endpoints

All endpoints are prefixed with the Railway backend URL. Frontend uses `VITE_API_URL` env var.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ status: "ok", timestamp }` |

### Scan

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/scan` | None | Runs all 5 scanners, persists to `scans` table, returns score + scanId |
| GET | `/api/scan/history/:domain` | None | Returns scan history for domain, newest first. Query param: `?limit=N` (max 500, default 100) |
| POST | `/api/scan/submit-gate` | None | Captures lead form data, persists to `submissions`, fires confirmation email |
| GET | `/api/scan/download-pdf/:submissionId` | None | Generates PDF from stored submission and streams it |

### Report

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/report` | None | Generates PDF from request body (live scan data). Used by frontend "Download PDF" button |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/gate/submissions.csv` | `X-Admin-Token` header | Downloads CSV of all submissions |

---

## Database Schema

### `submissions` table

Stores gate form submissions (lead capture). Each row is one form submission linked to the scan that preceded it.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| email | text | submitter email |
| domain | text | scanned domain |
| score | numeric | overall percentage score (duplicate of scan_score for legacy queries) |
| scan_score | numeric | overall percentage score |
| risk_level | text | risk band label |
| ssl | numeric | SSL category % |
| headers | numeric | Headers category % |
| email_sec | numeric | Email category % |
| vuln_comp | numeric | Vulnerable Components category % |
| gdpr | numeric | GDPR category % |
| scan_details | jsonb | `{ results: [...scanners], scoreObject: {...} }` |
| scan_id | uuid FK → scans.id | ON DELETE SET NULL |
| name | text | |
| firm_name | text | |
| main_concern | text | |
| it_management | text | |
| data_incidents | boolean | |
| confidence | integer | 1–5 |
| created_at | timestamptz | auto |

### `scans` table

Permanent, immutable record of every scan. Never updated after insert.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| domain | text NOT NULL | lowercase |
| scanned_at | timestamptz NOT NULL | from scoreObject.timestamp |
| scoring_version | text NOT NULL | e.g. `"v1.0"` |
| overall_score | numeric | percentage 0–100 (queryable) |
| risk_band | text | Excellent / Good / Moderate Risk / High Risk / Critical Risk |
| score_object | jsonb | full scoreObject including categoryBreakdown |
| scanner_results | jsonb | full scanners array with per-check findings |
| created_at | timestamptz NOT NULL | auto |

**Indexes on `scans`:**
- `idx_scans_domain` — domain lookup
- `idx_scans_domain_scanned_at` — domain history ordered by time (primary query pattern)
- `idx_scans_scanned_at` — global date index (dashboards, benchmarking)
- `idx_scans_score_object` — GIN on score_object JSONB
- `idx_scans_scanner_results` — GIN on scanner_results JSONB

**Migrations:** Run in Supabase SQL Editor in order:
1. `backend/db/migrations/001_create_scans_table.sql`
2. `backend/db/migrations/002_add_scan_id_to_submissions.sql`

---

## Scan Flow

```
User enters domain on landing page
         ↓
Frontend: POST /api/scan { domain }
         ↓
Backend: validate domain → run 5 scanners in parallel (Promise.allSettled)
         ↓
Scoring engine: apply per-check points or category defaults → compute percentage → derive risk band
         ↓
Build scoreObject { achievedPoints, totalMaximum, percentage, riskBand, categoryBreakdown, timestamp, scoringVersion }
         ↓
saveScan(domain, scoreObject, scanners) → INSERT into scans table → returns scanId
         ↓
Response: { success, domain, scannedAt, score, riskLevel, totalPoints, maxPoints, scanners, scoreObject, scanId }
         ↓
Frontend: display Results page (score card always visible, scanner grid blurred)
         ↓
Frontend: GET /api/scan/history/:domain (parallel, after scan returns)
         ↓
If history length > 1: render BusinessHeadline + ScoreHistory + TrendPanel + ChangeDetection
If history length = 1: render FirstScanNotice
         ↓
User completes gate modal → POST /api/scan/submit-gate
         ↓
Backend: persist submission → link to scanId → fire confirmation email with PDF link
         ↓
Frontend: scanner grid unblurred, PDF download button appears
```

---

## PDF Generation Flow

Two PDF routes exist:

**1. Live download (frontend "Download PDF" button):**
```
Frontend: POST /api/report { domain, timestamp, scanners, overallScore, riskLevel, scoreObject }
         ↓
report.js: adaptScannersForPDF(scanners) → normaliseRisk(riskLevel)
         ↓
generatePDF({ domain, timestamp, results, overallScore, riskLevel, scoreObject })
         ↓
Puppeteer: launch Chromium (/usr/bin/chromium on Railway) → render HTML → print to PDF
         ↓
Buffer.isBuffer(raw) ? raw : Buffer.from(raw)   ← Puppeteer 22+ returns Uint8Array, not Buffer
         ↓
res.send(pdf) with Content-Disposition: attachment
```

**2. Email link (stored submission):**
```
User clicks PDF link in confirmation email
         ↓
GET /api/scan/download-pdf/:submissionId
         ↓
getSubmissionById(id) → parse scan_details (handles old array format and new { results, scoreObject } format)
         ↓
adaptScannersForPDF(rawScanResults) → generatePDF(...)
         ↓
Same Buffer conversion → res.send(pdf)
```

**Railway Puppeteer setup:**
```dockerfile
RUN apt-get install -y chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

---

## Email Flow

```
Gate submission received → saveSubmission() succeeds → dbResult.id available
         ↓
Construct PDF link: ${BACKEND_URL}/api/scan/download-pdf/${dbResult.id}
         ↓
sendConfirmationEmail(email, domain, score, pdfLink)   ← fire-and-forget (void)
         ↓
Resend API: sends branded email to submitter with their score summary and PDF link
```

Email failure is non-blocking — logged but does not fail the gate submission response.

If `BACKEND_URL` env var is not set, the PDF link is omitted from the email and a warning is logged.

---

## Historical Scan Architecture

The `scans` table is the foundation for all history, trend, and monitoring features.

**Data flow:**
```
Every POST /api/scan → INSERT scans (permanent, never updated)
Every POST /api/scan/submit-gate → UPDATE submissions.scan_id = scans.id
GET /api/scan/history/:domain → SELECT from scans WHERE domain = ? ORDER BY scanned_at DESC
```

**Frontend consumption:**
- `getScanHistory(domain, limit)` in `api.js` calls the history endpoint
- Called immediately after scan completes (adds ~200ms, imperceptible after a 30–60s scan)
- Returns newest-first; `history[0]` = current scan, `history[1]` = previous scan
- `prevScan = history.find(h => h.id !== data.scanId)` — safely identifies the previous scan even if history[0] is the current scan
- `detectChanges(currentScanners, prevScan.scanner_results)` — compares check names between scans

**`score_object` fields used by history UI:**
- `score_object.categoryBreakdown[key].percentage` — per-category trend
- `overall_score` column — overall score for history table (denormalised for query performance)

---

## Monitoring Architecture (Foundations)

Phase 2 (Security Rating + Monitoring) will build on top of the existing `scans` table.

**Planned `monitoring_subscriptions` table (not yet created):**
```sql
CREATE TABLE monitoring_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain      text NOT NULL,
  email       text NOT NULL,
  frequency   text NOT NULL DEFAULT 'monthly',
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_run_at timestamptz
);
```

**Planned cron job (Railway scheduled task):**
- Fetches active subscriptions
- For each subscription: POST /api/scan (internal) → compare with previous scan → email diff report

---

## CORS Configuration

The backend CORS whitelist is configured via the `ALLOWED_ORIGINS` env var (comma-separated). Default whitelist:

```
http://localhost:5173
https://soterius-frontend.vercel.app
https://soterius-*.vercel.app
```

Wildcard `*` matches a single domain segment (not dots). Pattern is converted to regex at startup.

Non-browser requests (no `Origin` header) are always allowed — covers health checks, Postman, and server-to-server calls.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (full DB access) |
| `RESEND_API_KEY` | Yes | Resend API key for confirmation emails |
| `BACKEND_URL` | Yes | Public URL of the Railway backend (used in PDF email links) |
| `ADMIN_TOKEN` | Yes | Secret token for `GET /api/gate/submissions.csv` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS whitelist (defaults to Vercel URLs + localhost) |
| `PORT` | No | Server port (Railway sets this automatically; defaults to 3001) |
| `PUPPETEER_EXECUTABLE_PATH` | Railway | `/usr/bin/chromium` — set in Dockerfile |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | Railway | `true` — set in Dockerfile |
| `VITE_API_URL` | Frontend | Vercel env var pointing to Railway backend URL |
