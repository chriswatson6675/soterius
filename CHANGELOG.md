# Soterius Changelog

---

## 2026-06-14

### Benchmark Regeneration — Cohort 001

Following the email scanner bug fix (www. prefix DNS lookup issue), all 42 benchmark prospects in Cohort 001 were rescanned using the corrected scanner. Statistics and BENCHMARK_REPORT_001.md generated from corrected scan data.

**Script:** `backend/scripts/regenerate-benchmark.js`

**Regeneration results:**
- Prospects loaded: 42
- Successful scans: 42
- Scan failures: 0
- Excluded (invalid/duplicate): 0

**Benchmark statistics — Cohort 001 (42 firms):**

| Metric | Value |
|---|---|
| Average rating | 500 / 999 |
| Median rating | 539 / 999 |
| Rating range | 30 – 909 |
| Excellent | 2 (5%) |
| Good | 3 (7%) |
| Moderate Risk | 10 (24%) |
| High Risk | 17 (40%) |
| Critical Risk | 10 (24%) |
| High Risk + Critical Risk | 27 (64%) |
| SPF adoption | 79% |
| DKIM adoption | 43% |
| DMARC adoption (any record) | 48% |
| DMARC enforcement (quarantine/reject) | 33% |

**Category averages:**
- SSL/TLS: 76% · Email: 43% · Headers: 18% · Vulnerable Components: 64% · GDPR: 67%

**Top failed checks:** Referrer-Policy (90%), CSP (86%), HSTS (81%), X-Frame-Options (81%), X-Content-Type-Options (74%), DKIM (57%), DMARC (52%)

**Anomalies identified (require cohort cleanup):**
- `darwingray.co.uk` (score 30) — inactive/parked; same firm as `darwingray.com`
- `tudotowne.co.uk` (score 30) — typo; correct domain is `tudurowen.co.uk`
- `tudorowen.co.uk` (score 30) — likely inactive; active site is `tudurowen.co.uk`
- `averprimelaw.co.uk` (score 30) — likely typo or old domain vs `acerprimelaw.co.uk`
- `edwardhughes.co.uk` (score 30) — inactive; same firm as `edwardhugheslaw.co.uk`
- Sector field empty for all 42 firms — sector benchmarking not yet possible

**Files created/modified:**
- `backend/scripts/regenerate-benchmark.js` — new regeneration script
- `BENCHMARK_REPORT_001.md` — first Soterius benchmark report

---

### Bug Fix — Email Scanner: Zero Score for Valid SPF/DMARC (Scanner Accuracy Validation)

**Issue identified during scanner accuracy validation against darwingray.com.**

Independent verification (MXToolbox) confirmed:
- SPF: record exists and is valid
- DMARC: record exists, policy `p=none`

Soterius stored `email: { achieved: 0, maximum: 56, percentage: 0 }` — inconsistent with the scoring model.

**Root cause:**

DNS email authentication records (SPF, DMARC, DKIM) are always published at the apex/organisational domain (e.g. `darwingray.com`), never on `www.` subdomains. The email scanner was performing all DNS lookups against the domain string as received, without stripping a `www.` prefix. If the domain was entered or stored as `www.darwingray.com`:

- `resolveTxt('www.darwingray.com')` → no SPF record → SPF: FAIL → 0 pts
- `resolveTxt('_dmarc.www.darwingray.com')` → no DMARC record → DMARC: FAIL, `points: 0` → 0 pts
- All 10 DKIM selectors queried at `www.darwingray.com` → no records → DKIM: FAIL → 0 pts
- Total email score: 0/56

**Secondary issue:** The public `POST /api/scan` route passed the raw `req.body.domain` value directly to `executeScan()` without normalising (stripping scheme, `www.`, or path). The `validateDomain()` helper strips these internally for validation but never returns the cleaned value to the caller, meaning a domain entered with a scheme or `www.` prefix would be scanned incorrectly.

**Fix:**

- `backend/scanners/dns-check.js` — strip `www.` prefix before all DNS lookups (`apex = domain.replace(/^www\./, '')`)
- `backend/routes/scan.js` — normalise domain from `req.body` (strip scheme, `www.`, and path) before calling `executeScan`

**Expected result after fix:** A domain with valid SPF (`p=~all`) and DMARC (`p=none`) but no detected DKIM should score 28/56 (50%): SPF PASS = 8 pts, DMARC WARNING with `points: 20` = 20 pts, DKIM FAIL = 0 pts.

**Files Modified:**
- `backend/scanners/dns-check.js`
- `backend/routes/scan.js`

---

## 2026-06-13

### Research Mode — Internal Benchmark Scanning

**Changes:**
- **`POST /api/prospects/quick-scan`** — new single-call endpoint: find-or-create prospect by website, run full scan, persist with `prospect_id`, update `last_scanned`, return result. No gate form required. Returns `created: true/false` to indicate whether a new prospect was created.
- **`findOrCreateProspect`** — new database function; looks up prospect by `website`, creates if not found (firm_name defaults to domain if omitted)
- **`/research` frontend page** — admin-token gated research scanner:
  - Token entry screen on first visit; token stored in `localStorage`
  - Form: website (required, auto-focused), firm name, sector (dropdown, sticky), location (sticky), source
  - Sector and location persist between scans for efficient batch scanning of similar firms
  - After each scan: website and firm name clear, focus returns to website field automatically
  - Result panel: 0–999 score, risk band, category scores, FAIL checks listed
  - Session log: running table of all scans done in the current session (up to 50)
  - Session counter in header
  - Sign-out clears stored token
- Public scan workflow unchanged — `/results` and gate form unaffected

**Files Created:**
- `frontend/src/pages/Research.jsx`

**Files Modified:**
- `backend/services/database.js` — `findOrCreateProspect` added; `module.exports` updated
- `backend/routes/prospects.js` — `POST /quick-scan` added (before `/:id` routes); `findOrCreateProspect` imported
- `frontend/src/services/api.js` — `quickScan(token, payload)` added
- `frontend/src/App.jsx` — `/research` route registered

**Database Changes:**
- None — uses existing `prospects` and `scans` tables

---

### Calibration Workflow

**Changes:**
- Created `CALIBRATION.md` — authoritative document for the market calibration programme
- Defines the end-to-end workflow: add prospect → scan → record analyst notes → query benchmarks
- Documents all data fields and how they map to `prospects` and `scans` tables
- Six benchmark queries (exact SQL): avg score by sector, avg score by region, risk band distribution, most common failed checks, DMARC adoption rate, security header adoption rate
- First 50 firms process: sector distribution (20 solicitors / 15 accountants / 10 advisers / 5 other), location mix, register sources, per-firm note format, anomaly flags, milestone checkpoints
- Findings section template for post-collection analysis and credibility verdict framework
- Success criteria checklist

**Files Created:**
- `CALIBRATION.md`

**Files Modified:**
- None — all implementation was done in the previous session (benchmarking data foundation)

---

### Benchmarking Data Foundation

**Version:** Data Layer v1.1

**Changes:**
- **`prospects` table** — stores professional services firms for market calibration: `firm_name`, `website` (unique, lowercased), `sector`, `location`, `source`, `first_seen`, `last_scanned`, `notes`
- **`prospect_id` FK on `scans`** — every scan record can be linked to a prospect; all historical scans remain valid with `prospect_id = NULL`
- **`saveScan` updated** — accepts optional `prospectId` parameter; all existing callers unaffected (default `null`)
- **`scanService.js` extracted** — `executeScan`, `getRiskLevel`, `getRiskBand`, `SCANNERS`, `MAX_POINTS` moved from `scan.js` into a shared service module; prevents code duplication between the public scan route and the admin prospects route
- **`/api/prospects` route** — full admin-only CRUD and scan trigger, protected by `X-Admin-Token`:
  - `GET /api/prospects/benchmarks` — aggregated stats: avg/min/max score by sector, by location, risk band distribution, top 20 most commonly failed checks
  - `GET /api/prospects` — list all prospects (ordered: unscanned first, then least recently scanned); optional `?sector=`, `?location=`, `?source=` filters
  - `POST /api/prospects` — create a prospect; website normalised to bare domain; returns 409 on duplicate
  - `GET /api/prospects/:id` — single prospect + its full scan history
  - `PATCH /api/prospects/:id` — update `firm_name`, `sector`, `location`, `source`, `notes`; `website` not patchable
  - `POST /api/prospects/:id/scan` — triggers full 5-scanner scan, persists with `prospect_id` set, updates `last_scanned` on prospect

**Files Created:**
- `backend/db/migrations/003_create_prospects_table.sql`
- `backend/db/migrations/004_add_prospect_id_to_scans.sql`
- `backend/services/scanService.js`
- `backend/routes/prospects.js`

**Files Modified:**
- `backend/services/database.js` — `saveScan` gains optional `prospectId`; six prospect functions added; `module.exports` updated
- `backend/routes/scan.js` — imports `executeScan`, `getRiskLevel`, `MAX_POINTS` from `scanService`; scan logic removed (no duplication)
- `backend/server.js` — `prospectsRouter` registered at `/api/prospects`

**Database Changes:**
- New `prospects` table (run `db/migrations/003_create_prospects_table.sql` in Supabase)
- `prospect_id` UUID FK added to `scans` (run `db/migrations/004_add_prospect_id_to_scans.sql`)

---

## 2026-06-13

### Score History, Trend Analysis, and Change Detection

**Version:** UX v1.0

**Changes:**
- **Business Headline** — plain-English summary displayed immediately after scan; leads with outcome ("Security Rating improved by 13 points"), notes band changes, resolved risks, and new issues
- **Score History panel** — current score vs previous score side-by-side with a Change column (diff + direction arrow + Improved/Declined/Unchanged)
- **Category Trends** — per-scanner progress bars with current % and +/- diff vs previous scan; overall verdict badge (Improving / Declining / Stable)
- **Change Detection** — check-level comparison between current and previous scan, grouped into: Resolved (was FAIL/WARNING, now PASS), Improved (FAIL→WARNING), New Issues (PASS→FAIL/WARNING or newly appeared), Deteriorated (WARNING→FAIL)
- **First-scan notice** — shown on a domain's first scan to set expectation that history will accumulate
- All history sections visible to all users before gate — they demonstrate value and make the gate more compelling
- Graceful degradation: history fetch failure is silent, sections simply don't render
- Backend: `GET /api/scan/history/:domain` now returns `scanner_results` for check-level comparison

**Files Modified:**
- `frontend/src/pages/Results.jsx` — `BusinessHeadline`, `ScoreHistory`, `TrendPanel`, `ChangeDetection`, `FirstScanNotice` components; `detectChanges()` algorithm; `Results` root fetches history; all CSS inline
- `frontend/src/services/api.js` — `getScanHistory(domain, limit)` function added
- `backend/services/database.js` — `getScanHistory` SELECT updated to include `scanner_results`

**Database Changes:**
- None (uses existing `scans` table; `scanner_results` column was already stored)

---

## 2026-06-13

### Permanent Scan History

**Version:** Data Layer v1.0

**Changes:**
- Every `POST /api/scan` now creates an immutable record in a new `scans` table — scans never overwrite previous results
- Each scan stores: domain, timestamp, scoring version, overall score, risk band, full score object (JSONB), and full scanner results with individual check findings (JSONB)
- New `GET /api/scan/history/:domain` endpoint returns full scan history for any domain ordered newest first
- Gate submissions now carry `scan_id` FK linking the submission to the scan record that preceded it
- `scanId` returned in scan API response and passed through to gate submit
- Indexes on domain, domain+date, and GIN indexes on JSONB columns for efficient history and benchmarking queries

**Files Modified:**
- `backend/services/database.js` — added `saveScan`, `getScanHistory`, `getScanById`; `saveSubmission` gains `scanId` parameter
- `backend/routes/scan.js` — `POST /api/scan` persists scan record and returns `scanId`; `submit-gate` links to scan; `GET /history/:domain` added
- `frontend/src/pages/Results.jsx` — `scanId` and `scoreObject` passed through `GateModal` to `submitGate`

**Database Changes:**
- New `scans` table (run `db/migrations/001_create_scans_table.sql` in Supabase)
- `scan_id` FK column added to `submissions` (run `db/migrations/002_add_scan_id_to_submissions.sql`)

---

## 2026-06-13

### Security Rating Version 1.0

**Version:** Scoring v1.0

**Changes:**
- Five-band risk system: Critical Risk (0–39%) / High Risk (40–59%) / Moderate Risk (60–74%) / Good (75–89%) / Excellent (90–100%) — applied to overall score and all category scores
- DMARC four-state scoring: No Protection (0pts) / Monitoring Only — p=none (20pts) / Partial Protection — p=quarantine (30pts) / Full Protection — p=reject (40pts)
- CVE severity scoring: PASS = 40pts (no CVEs) / WARN = 20pts (CVSS < 7.0) / FAIL = 0pts (CVSS ≥ 7.0)
- Security header weights updated: HSTS = 15pts, CSP = 13pts, X-Frame-Options = 10pts, X-Content-Type-Options = 8pts, Referrer-Policy = 4pts (total 50pts); CSP check added
- Per-check `points` field introduced — scanners carry explicit points for non-standard scoring; engine falls back to category default otherwise
- Category breakdown in every API response: per-scanner achieved/maximum/percentage/rating
- `scoreObject` structure with `scoringVersion: "v1.0"` returned in scan API and stored in submissions
- PDF ratingBand thresholds aligned to new percentage bands (≥899 Excellent / ≥749 Good / ≥599 Moderate / ≥400 High / <400 Critical)
- Category breakdown table added to PDF scorecard section (Page 1)
- `normaliseRisk` in report.js updated for five bands

**Files Modified:**
- `backend/scanners/dns-check.js` — DMARC check returns `points` field with four-state graduated scoring
- `backend/scanners/tech-detect.js` — CVE check returns `points: 40/20/0` based on severity
- `backend/scanners/headers-check.js` — five checks with per-check `points`; CSP check added; `maxPoints` now 50
- `backend/routes/scan.js` — `getRiskLevel` / `getRiskBand` five-band; `SCANNERS` config uses `maxPoints`; scoring engine respects `check.points`; `scoreObject` in response
- `backend/routes/report.js` — `normaliseRisk` updated for five bands; `scoreObject` passed to PDF generator
- `backend/pdf-generator/generator.js` — `ratingBand` thresholds updated; `categoryBreakdownHtml` added; scale bar labels updated
- `backend/services/database.js` — `saveSubmission` stores `{results, scoreObject}` in `scan_details`
- `frontend/src/pages/Results.jsx` — `getRiskKey` / `getRiskLabel` five-band; CSS badge classes updated; `scoreObject` passed to PDF download

**Database Changes:**
- `scan_details` column format changed from raw array to `{results: [...], scoreObject: {...}}`; backward-compatible read logic handles both formats

---

## 2026-06-12

### PDF Report Redesign

**Version:** PDF v2.0

**Changes:**
- Complete rebuild of the PDF report as an executive Security Rating document
- 0–999 Security Rating scale (mapped from percentage)
- Four-page structure: Executive Dashboard / Priority Actions / Technical Findings / Continuous Monitoring
- Business language throughout — impact first, technical detail second
- Navy #0B2545 brand palette
- Rating scale bar with five-band labels on Page 1
- Priority action cards on Page 2 with Business Impact and Recommended Action per finding
- Technical findings section for IT providers on Page 3
- PDF now served correctly on Railway (Uint8Array → Buffer conversion, system Chromium)

**Files Modified:**
- `backend/pdf-generator/generator.js` — complete rewrite (881 → 484 lines)
- `backend/routes/report.js` — `normaliseRisk` added; Buffer conversion applied
- `backend/routes/scan.js` — Buffer conversion applied to email PDF route
- `backend/utils/pdfAdapter.js` — maps scanner name format to PDF key format
- `frontend/src/pages/Results.jsx` — PDF download button added to results page

---

## 2026-06-12

### PDF Download Bug Fixes

**Changes:**
- Fixed PDF download silently failing after gate completion — three bugs resolved:
  1. `downloadReport` in `api.js` had inner `try/catch` swallowing the real server error
  2. `RISK_KEY_MAP` in `generator.js` did not handle already-normalised risk level keys
  3. Server error handler logged only "Internal server error" — Puppeteer stack trace lost
- Fixed Railway 500 error — Dockerfile switched from manually listed Chrome libs to `apt-get install chromium` (resolves all dependencies automatically)
- Fixed PDF downloading but failing to open — Puppeteer 22+ returns `Uint8Array` not `Buffer`; Express 4 `res.send()` was JSON-stringifying it; fixed with `Buffer.isBuffer(raw) ? raw : Buffer.from(raw)` in both PDF routes

**Files Modified:**
- `frontend/src/services/api.js` — error propagation fixed in `downloadReport`
- `backend/pdf-generator/generator.js` — `RISK_KEY_MAP` normalisation fixed
- `backend/server.js` — error handler logs full stack
- `backend/Dockerfile` — switched to `apt-get install chromium`; `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` set

---

## 2026-06 (pre-session)

### Initial Platform Build

**Changes:**
- 5-scanner security engine: SSL/TLS, Security Headers, Email Security (SPF/DKIM/DMARC), Vulnerable Components, GDPR / Cookie Compliance
- Scan results page with score gauge, scanner cards, and gate overlay
- Email gate modal — captures name, email, firm, main concern, IT management, confidence
- Gate submission → Supabase persistence + Resend confirmation email
- PDF report generation via Puppeteer on Railway
- Admin CSV download endpoint (`GET /api/gate/submissions.csv`)
- Landing page with domain input
- Railway (backend) + Vercel (frontend) + Supabase deployment

**Files Modified:**
- Initial codebase
