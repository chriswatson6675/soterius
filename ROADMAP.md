# Soterius Roadmap

This repository is the single source of truth for all product and technical decisions. See also: [VISION.md](VISION.md) · [SCORING.md](SCORING.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DECISIONS.md](DECISIONS.md) · [BOARD.md](BOARD.md)

**Current company phase: Benchmark Phase** — see [BOARD.md](BOARD.md)

| Company Phase | Status |
|---|---|
| Foundation Phase | ✅ Complete |
| Benchmark Phase | 🔄 Active |
| Growth Phase | Planned |

| Product Phase | Name | Status |
|---|---|---|
| 1 | Security Rating | ✅ Complete |
| 2 | Security Rating + Monitoring | Planned (after Benchmark Phase) |
| 3 | Digital Risk Management | Planned |

---

## Now

### Scanner Accuracy Validation ← immediate priority

**Objective:** Validate scanner findings against manual verification for representative firms across different risk bands.

**Validation Targets:**
- One Excellent firm
- One High Risk firm
- One Critical Risk firm

**Checks:**
- SPF
- DKIM
- DMARC
- HSTS
- CSP
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

**Success criteria:** Scanner findings align with manual verification.

---

### Benchmark Cohort 001 — North Wales Solicitor Benchmark ← active cohort

**Scope:** All solicitor firms within 25 miles of LL30 2UB.  
**Target:** 71 firms.

**Objectives:**
- Establish first regional benchmark dataset
- Validate Security Rating v1.0
- Measure adoption of key controls
- Identify common security weaknesses
- Produce first Soterius benchmark report

**Tasks:**
- [ ] Scan all 71 firms via Research Mode
- [ ] Record scores and risk bands
- [ ] Generate benchmark statistics
- [ ] Document findings
- [ ] Produce first Soterius benchmark report

**Success criteria:** All 71 firms scanned, benchmark statistics generated, findings documented.

---

### Build First Soterius Benchmark Dataset ← current priority — board approved

Scan 250 UK professional services firms and establish the first proprietary benchmark dataset. Full process documented in [CALIBRATION.md](CALIBRATION.md). Board decision recorded in [BOARD.md](BOARD.md).

**Objective:** Build a statistically meaningful benchmark dataset that validates Security Rating v1.0, informs marketing, and establishes the data foundation for monitoring and trust-mark features.

**Target:** 250 firms across solicitors, accountants, financial advisers, and surveyors.

**Tasks:**
- [ ] Scan 250 professional services firms
- [ ] Record analyst notes per firm
- [ ] Establish sector benchmarks (average score per sector)
- [ ] Establish risk band distribution
- [ ] Establish DMARC adoption rate
- [ ] Establish security header adoption rate
- [ ] Calculate average scores by sector
- [ ] Complete Findings section in CALIBRATION.md
- [ ] Record credibility verdict

**Success criteria:** All benchmark statistics above are established and recorded. Credibility verdict made in CALIBRATION.md.

**Why this comes first:** Benchmark data underpins the commercial proposition, validates the model, and provides the evidence base for every downstream feature — monitoring thresholds, trust-mark eligibility, and peer comparison.

---

## Next

Features approved for the next development cycle, ordered by dependency.

### Score Explainability

Allow every score and category rating to be traced back to the underlying evidence — the raw DNS record, header value, or policy string that caused a check to pass, warn, or fail.

**Requirements:**
- Store raw evidence for each check where possible (the actual record or value observed)
- Surface evidence in reports (PDF and scan results page)
- Display why points were awarded or deducted, not just the outcome
- Enable manual validation against external tools (MXToolbox, security header checkers)

**Examples of evidence display:**
- SPF PASS — `v=spf1 include:spf.protection.outlook.com -all`
- DMARC WARNING — `p=none`
- Headers FAIL — Missing: CSP, HSTS, X-Frame-Options

**Purpose:** Increase trust in the scoring model, support benchmark validation, and give firms actionable evidence rather than opaque verdicts.

**Dependencies:** No schema changes required if evidence is stored within the existing `scanner_results` JSON column. Scanners must return an `evidence` field alongside `status` and `details`.

### Monitoring Subscription
Allow a firm to opt in to monthly automated rescans. Stores `{domain, email, frequency}` in a new `monitoring_subscriptions` table. A cron job (Railway scheduled task) runs the scan and emails a comparison: new score vs. previous score, what changed, and recommended next actions. This is the direct commercial follow-on to the history features now live.

### Admin Dashboard
Web-based view of submissions: domain, score, risk band, date, firm name, concern — replacing the current CSV download. Filter and sort by risk band. Useful for identifying the highest-risk firms to contact proactively.

---

## Later

Features to consider after the Next cycle is complete.

### Industry Benchmarking
Compare a firm's score against the sector average. Requires sufficient scan volume to compute meaningful averages per sector (solicitors / accountants / financial advisers). Display: "Your score is in the top 30% of accountancy firms."

**Data foundation is live:** prospects table, `prospect_id` FK on scans, and `/api/prospects/benchmarks` aggregation endpoint are all in place. This feature now requires only scan volume and a frontend display layer.

### Peer Score Comparison
"Firms like yours" comparison — anonymised percentile ranking by sector and firm size. Requires minimum data volume before it's statistically meaningful.

### Automated Monthly Report Emails
For monitoring subscribers: a branded PDF summary emailed monthly showing score history, trend, top risks, and recommended actions. Generated from scan history data.

### Paid Monitoring Tier
Productised version of monitoring subscriptions with a payment gate (Stripe). Includes monthly email reports, score history dashboard, and priority support.

### White-label Reporting for IT Providers
Allow IT managed service providers to run scans and brand the PDF report for their clients. Requires API key management and PDF template customisation.

### Soterius Digital Trust Mark
A verification programme allowing firms to display a Soterius trust badge based on Security Rating and continuous monitoring.

**Concept:** Security Rating generates trust eligibility. Monitoring maintains it. The badge signals to clients, regulators, and counterparties that a firm actively manages and demonstrates its digital security posture.

**Potential tiers:**
- Soterius Verified — minimum Security Rating threshold met
- Soterius Trusted — Verified + active monitoring subscription
- Soterius Secure+ — Trusted + score above a higher threshold + regular rescanning

**Requirements (to be defined in future phase):**
- Minimum Security Rating threshold
- Active continuous monitoring subscription
- Regular automated rescanning
- Automatic badge expiry if requirements are no longer met

**Dependencies:** Requires Security Rating (Phase 1, complete), Monitoring (Phase 2), and sufficient scan volume to set meaningful thresholds. Not to be built until Phase 2 is validated in market.

---

## Completed

### Research Mode — 2026-06-13
`POST /api/prospects/quick-scan` (find-or-create + scan in one call). `/research` frontend page: token-gated, sticky sector/location, auto-focus after each scan, session log.

### Benchmarking Data Foundation — 2026-06-13
`prospects` table (firm_name, website, sector, location, source, notes, last_scanned) with FK to `scans`. Admin `/api/prospects` route with full CRUD, scan trigger, and `/benchmarks` aggregation. `executeScan` extracted into `scanService.js`. Four new migrations.

### Score History, Trend Analysis, Change Detection — 2026-06-13
Business Headline + Score History panel + Category Trends bar chart + check-level Change Detection. All visible before gate. First-scan notice for baseline scans. History fetch is async and degrades gracefully on failure.

### Scan History Storage — 2026-06-13
Every `POST /api/scan` creates an immutable record in a new `scans` table. `GET /api/scan/history/:domain` endpoint live. Gate submissions linked to scan records via `scan_id` FK.

### Security Rating Version 1.0 — 2026-06-13
Five-band risk model, DMARC four-state scoring, CVE severity scoring, per-check `points` field, Security Headers CSP check, category breakdown in API response, `scoringVersion: "v1.0"` stamped on all records, PDF updated to match.

### PDF Report Redesign — 2026-06-12
Executive-grade PDF: 0–999 Security Rating scale, four-page structure (Executive Dashboard / Priority Actions / Technical Findings / Continuous Monitoring), business-first language, navy brand palette.

### PDF Download Bug Fixes — 2026-06-12
Three bugs fixed: silent error swallowing, RISK_KEY_MAP normalisation, server error logging. Railway Chromium dependency fix. Puppeteer `Uint8Array → Buffer` conversion.

### Initial Platform Build — 2026-06
5-scanner security engine (SSL, Headers, Email, VulnComp, GDPR), scan results page with gate, Supabase persistence, Resend confirmation email, PDF generation on Railway, Vercel frontend deployment.
