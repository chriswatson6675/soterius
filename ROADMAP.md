# Soterius Roadmap

This repository is the single source of truth for all product and technical decisions. See also: [VISION.md](VISION.md) · [SCORING.md](SCORING.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DECISIONS.md](DECISIONS.md) · [BOARD.md](BOARD.md)

| Phase | Name | Status |
|---|---|---|
| 1 | Security Rating | ✅ Complete |
| 2 | Security Rating + Monitoring | 🔄 In Progress |
| 3 | Digital Risk Management | Planned |

---

## Now

### Market Calibration & Score Validation ← current priority

Validate Security Rating v1.0 against real-world professional services firms before continuing feature development.

**Objective:** Confirm that the Security Rating model produces commercially credible results across a representative sample of the target market.

**Tasks:**
- [ ] Scan 50 professional services firms (solicitors, accountants, financial advisers)
- [ ] Record scores and risk bands for each firm
- [ ] Assess whether results feel credible — are scores too harsh, too generous, or well-calibrated?
- [ ] Identify any scoring anomalies or unexpected outcomes
- [ ] Establish preliminary benchmark ranges by sector and firm size
- [ ] Document all findings in `CALIBRATION.md`

**Success criteria:** A representative sample has been analysed and the Security Rating model is considered commercially credible. Findings documented in CALIBRATION.md.

**Why this comes first:** Feature development on top of an uncalibrated model risks building the wrong thing. Market credibility must be established before investing in monitoring, benchmarking, or trust-mark tiers.

---

**Pending prerequisite (manual action required):**
- Run Supabase migrations to activate scan history:
  1. Open Supabase SQL Editor
  2. Run `backend/db/migrations/001_create_scans_table.sql`
  3. Run `backend/db/migrations/002_add_scan_id_to_submissions.sql`

---

## Next

Features approved for the next development cycle, ordered by dependency.

### Monitoring Subscription
Allow a firm to opt in to monthly automated rescans. Stores `{domain, email, frequency}` in a new `monitoring_subscriptions` table. A cron job (Railway scheduled task) runs the scan and emails a comparison: new score vs. previous score, what changed, and recommended next actions. This is the direct commercial follow-on to the history features now live.

### Admin Dashboard
Web-based view of submissions: domain, score, risk band, date, firm name, concern — replacing the current CSV download. Filter and sort by risk band. Useful for identifying the highest-risk firms to contact proactively.

---

## Later

Features to consider after the Next cycle is complete.

### Industry Benchmarking
Compare a firm's score against the sector average. Requires sufficient scan volume to compute meaningful averages per sector (solicitors / accountants / financial advisers). Stored in a `benchmarks` table updated periodically. Display: "Your score is in the top 30% of accountancy firms."

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
