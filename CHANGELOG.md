# Soterius Changelog

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
