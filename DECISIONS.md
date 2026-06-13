# Soterius Decisions Log

Decisions are recorded when they are non-obvious, have significant trade-offs, or shape future work.

---

## 2026-06-13

### D020 — Research Mode implemented as a single quick-scan endpoint + frontend page

**Decision:** Research Mode is implemented as `POST /api/prospects/quick-scan` (find-or-create prospect + scan in one call) plus a `/research` frontend page. The existing public scan workflow and gate form are not modified.

**Reason:** The existing `POST /api/prospects` + `POST /api/prospects/:id/scan` two-call flow was sufficient for occasional manual use but created unnecessary friction for scanning 250 firms. A single endpoint that handles upsert-and-scan removes that friction without changing any public-facing behaviour. The frontend page is optimised for batch use: sticky sector/location fields, auto-clear and auto-focus after each scan, session log.

**Impact:** The `/research` route is not linked from the public app. Access requires the `ADMIN_TOKEN` to be entered on first visit (stored in localStorage). No schema changes — uses existing `prospects` and `scans` tables.

---

### D019 — Transition from Foundation Phase to Benchmark Phase

**Decision:** Foundation Phase is declared complete. The company transitions to Benchmark Phase with immediate effect. All effort is directed toward building the first proprietary benchmark dataset.

**Reason:** Core platform, scoring, reporting, historical storage, and calibration framework are now complete. The platform can scan domains, produce Security Ratings, store permanent scan records, compare historical results, and link scans to prospect firms. There is no further infrastructure required to begin market data collection. The focus now shifts from building to validating — collecting market intelligence, stress-testing the scoring model against real firms, and establishing the commercial evidence base.

**Foundation Phase deliverables (complete):**
- Security Rating v1.0 — five-band, 0–999 scale, DMARC/CVE graduated scoring
- PDF report generation
- Permanent scan history storage
- Score history, trend analysis, and change detection UI
- Prospects table and benchmarking data model
- Calibration workflow and benchmark SQL queries
- All documentation (BOARD.md, SCORING.md, ARCHITECTURE.md, VISION.md, ROADMAP.md, DECISIONS.md, CALIBRATION.md)

**Benchmark Phase objective:** 250 professional services firms scanned, sector benchmarks established, credibility verdict recorded.

**Impact:** No new infrastructure features until Benchmark Phase success criteria are met. Board decision recorded in BOARD.md.

---

### D018 — Benchmark-first validation strategy

**Decision:** Before expanding product functionality, Soterius will build a proprietary benchmark dataset by scanning 250 UK professional services firms. No new product features will be prioritised until benchmark data is established and a credibility verdict is recorded.

**Reason:** Security Rating v1.0 was built against a theoretical model. Without real-world data, all commercial claims about the rating — sector benchmarks, risk distributions, typical scores — are unverifiable. Benchmark data is required to validate the model, inform the marketing proposition, and provide the evidence base for monitoring and trust-mark features.

**Expected outcomes:**
- Benchmark statistics (avg score by sector, risk band distribution, DMARC adoption, header adoption)
- Marketing insights into the real security posture of professional services firms
- Product validation — or identification of areas requiring recalibration
- Data foundation for future Digital Trust Mark eligibility thresholds
- Evidence base for the monitoring value proposition

**Impact:** All feature development deferred until 250 firms are scanned and findings are documented in CALIBRATION.md. This decision supersedes D015 (50-firm target) — target is now 250 firms. Board approval recorded in BOARD.md.

---

### D017 — Calibration process defined before any benchmark features are built

**Decision:** A formal calibration process is defined in `CALIBRATION.md` before any benchmarking UI, monitoring features, or trust-mark tiers are built. The process requires 50 firms scanned across at least 3 sectors, with analyst notes and a credibility verdict before Phase 2 begins.

**Reason:** Without real-world validation, any threshold or benchmark figure is arbitrary. If the scoring model systematically over-scores or under-scores a sector, every downstream feature (monitoring alerts, benchmarking displays, badge eligibility thresholds) will inherit the problem. 50 firms is the minimum for meaningful sector-level distributions.

**Impact:** Feature development on Phase 2 (monitoring subscriptions, Admin Dashboard) is deferred until calibration is complete and a credibility verdict is recorded in `CALIBRATION.md`. Any scoring adjustment identified during calibration requires a new `scoringVersion`, a SCORING.md update, and a new DECISIONS.md entry.

---

### D016 — Benchmarking data stored in a `prospects` table linked to `scans` via FK

**Decision:** Market calibration data is stored in a dedicated `prospects` table. Each prospect has a stable `id`. The `scans` table gains a nullable `prospect_id` FK so every automated scan is linked to its source firm. Prospect management and benchmark aggregation are exposed via admin-only `/api/prospects` endpoints.

**Reason:** Flat scan records do not carry sector or firm metadata — they are domain-centric, not firm-centric. Without a `prospects` table, benchmarking queries (average score by sector, most common failed checks, regional breakdown) would require parsing domain names back to firms, which is error-prone and impossible to enrich. A separate table with a FK lets the system join firm context onto scan history cleanly, and allows one firm to accumulate many scan records over time.

**Impact:** `saveScan` gains an optional `prospectId` parameter; all existing callers (public scan route) pass `null` by default — no breaking change. The `prospect_id` column is nullable on `scans`, so all historical records remain valid. Scan logic extracted into `scanService.js` so it is shared between the public scan route and the admin prospects route without circular imports.

---

### D015 — Market calibration takes priority over new feature development
**Decision:** All new feature development is paused. The immediate priority is Market Calibration & Score Validation — scanning 50 real professional services firms, assessing score credibility, and documenting findings in CALIBRATION.md.

**Reason:** Security Rating v1.0 has been built against a theoretical model. Before investing further in monitoring, benchmarking, or trust-mark tiers, the model must be validated against real-world data. Building on top of an uncalibrated rating risks investing in the wrong direction — if scores are systematically too harsh or too generous, every downstream feature (monitoring thresholds, benchmarking, badge eligibility) will inherit the problem.

**Impact:** Monitoring Subscription and Admin Dashboard (both in Next) are deferred until calibration is complete. Findings may inform minor scoring adjustments — any such changes require a new `scoringVersion` string, an update to SCORING.md, and a DECISIONS.md entry. The calibration output lives in CALIBRATION.md.

---

### D014 — Strategic intent to explore a Digital Trust Mark programme
**Decision:** Soterius will explore a Digital Trust Mark verification programme as a future capability, to be considered once Security Rating (Phase 1), Monitoring (Phase 2), and Benchmarking (Phase 3) are established and validated in market.

**Reason:** Professional services firms operate in trust-sensitive environments. A verifiable trust badge backed by continuous monitoring creates a commercial incentive for monitoring subscriptions, differentiates Soterius from point-in-time scanners, and gives firms a tangible external signal to show clients and regulators. The concept only has credibility if the underlying Rating and Monitoring products are mature — premature launch risks reputational damage if badge holders are later found to have poor posture.

**Impact:** No implementation until Phase 2 is validated. Recorded in ROADMAP.md under Later. Potential tiers (Verified / Trusted / Secure+) are indicative only — thresholds and requirements to be determined with market data. Future design must address badge expiry, renewal, and revocation mechanics.

---

### D013 — Repository as single source of truth for all decisions
**Decision:** The Soterius repository is the authoritative source for all product, scoring, architecture, and business decisions. Six structured documentation files are maintained: BOARD.md (board approvals), SCORING.md (scoring methodology), ARCHITECTURE.md (technical architecture), ROADMAP.md (roadmap), DECISIONS.md (operational decisions), VISION.md (strategic direction), CHANGELOG.md (change history).

**Reason:** As the platform grows, decisions made in conversations, emails, or meetings become inaccessible to future contributors. A repository-based record ensures every decision is traceable, version-controlled, and auditable.

**Impact:** After every feature implementation or significant decision, the relevant files must be updated as part of the same commit. This file (DECISIONS.md) captures the "why" that is not derivable from reading the code.

---

### D012 — Three-phase product evolution: Rating → Monitoring → Risk Management
**Decision:** Soterius evolves in three defined phases: Phase 1 (Security Rating), Phase 2 (Security Rating + Monitoring), Phase 3 (Digital Risk Management). Documented in VISION.md as the authoritative strategic reference.

**Reason:** Without a defined arc, feature decisions lack direction and individual features feel disconnected. The three phases create a coherent narrative — each phase produces standalone value while laying the foundation for the next. Phase 1 is complete. Phase 2 (monitoring subscriptions, trend data) is the immediate priority.

**Impact:** Every feature should be evaluated against the current phase objective. Features that belong to Phase 3 (benchmarking, regulatory evidence packs, peer comparison) should not be built until Phase 2 is validated. ROADMAP.md now references VISION.md for phase definitions.

---

### D011 — History sections visible before the gate
**Decision:** Business Headline, Score History, Category Trends, and Change Detection are all rendered without requiring gate submission.

**Reason:** The history sections ARE the value demonstration — hiding them behind the gate defeats the purpose. Showing a user that their score improved from 61 to 74, their Email Security moved from High Risk to Moderate Risk, and that 2 risks were resolved makes the gate more compelling, not less. The gate unlocks the per-check detail and the PDF report; history is the hook.

**Impact:** History sections appear between the ScoreCard and the scanner grid. The scanner grid remains blurred. This split creates a clear value ladder: "you can see you improved — find out exactly what to fix next."

---

### D010 — Change detection at check level, not category level
**Decision:** `detectChanges()` compares individual check names (`c.name`) between current and previous `scanner_results`. Categories are shown as context labels only.

**Reason:** Category-level comparison (e.g. "Email Security went from 39% to 61%") is covered by the Trend panel. Change detection is most useful when it tells you specifically which finding was fixed or broke — e.g. "DMARC Missing → resolved" is actionable; "Email Security improved" is not.

**Impact:** Requires `scanner_results` to be returned in the history endpoint (added to the SELECT). Check names must remain stable across scans for the diff to be meaningful — do not rename checks without considering history continuity.

---

### D009 — Per-check `points` field for non-standard scoring
**Decision:** Checks carry an optional `points` field. The scoring engine uses `check.points` if present (`typeof c.points === 'number'`) and falls back to the category-level `def.pts[status]` otherwise.

**Reason:** DMARC and CVE need per-check graduated values that can't be expressed as a uniform PASS/WARN/FAIL formula. Header checks each have different weights. Adding a `points` field per-check required no breaking changes to existing scanners and no new engine complexity.

**Impact:** All scanners remain independent; DMARC, CVE, and headers carry explicit points; future checks can opt in to custom scoring without touching the engine.

---

### D008 — Immutable scan records; every scan persisted permanently
**Decision:** Every `POST /api/scan` writes one new row to the `scans` table and never overwrites prior rows. Scans are not gated on user completing the email form.

**Reason:** Score history and trend analysis require a permanent, timestamped record of every scan. Gating persistence on form completion would leave gaps when users don't convert, making historical data unreliable for benchmarking.

**Impact:** `scans` table grows continuously. Retention policy may be needed at scale, but for current volume this is negligible. Enables `/history/:domain`, future trend charts, and monitoring change detection.

---

### D007 — `scoringVersion: "v1.0"` stamped on all score objects
**Decision:** Every `scoreObject` emitted by the scoring engine includes `scoringVersion: "v1.0"`.

**Reason:** The scoring model will evolve. Without a version stamp on historical records it would be impossible to distinguish scores calculated under different methodologies when doing benchmarking or trend analysis. A version stamp allows like-for-like comparisons.

**Impact:** Future scoring changes require a new version string (v1.1, v2.0, etc.). Benchmarking queries should filter by `scoring_version`.

---

## 2026-06-13

### D006 — Five-band risk model (Excellent / Good / Moderate / High / Critical)
**Decision:** Replace the three-band model (Low/Medium/High/Critical) with five bands: Critical Risk (0–39%) / High Risk (40–59%) / Moderate Risk (60–74%) / Good (75–89%) / Excellent (90–100%).

**Reason:** The three-band model compressed most firms into "Medium" and failed to differentiate between firms making active security improvements. Five bands give meaningful movement at every point in the scale, making it useful as a benchmark metric over time.

**Impact:** All risk labels, CSS classes, PDF templates, and report routes updated. The 0–999 rating scale thresholds align with these bands: ≥899 Excellent / ≥749 Good / ≥599 Moderate / ≥400 High / <400 Critical.

---

### D005 — DMARC graduated scoring (0 / 20 / 30 / 40 pts)
**Decision:** DMARC is not binary. p=reject = 40pts (Full Protection), p=quarantine = 30pts (Partial Protection), p=none = 20pts (Monitoring Only), no record = 0pts (No Protection).

**Reason:** A binary pass/fail on DMARC would penalise firms that have partially implemented email protection the same as firms with no protection at all. Graduated scoring rewards incremental improvement and gives firms a clear upgrade path.

**Impact:** DMARC check requires `points` field on its check object. Category max for Email is 56pts (SPF 8 + DKIM 8 + DMARC 40).

---

### D004 — CVE CVSS-severity scoring (40 / 20 / 0 pts)
**Decision:** CVE scoring is CVSS-based: PASS (no CVEs) = 40pts, WARNING (CVSS < 7.0 only) = 20pts, FAIL (any CVSS ≥ 7.0) = 0pts.

**Reason:** Binary CVE pass/fail would treat "has one old low-severity CVE" identically to "has an actively exploited critical CVE". CVSS threshold at 7.0 aligns with industry standard for "high severity" and gives firms with only minor vulnerabilities partial credit.

**Impact:** CVE check requires `points` field. Category max for Vulnerable Components is 48pts (CVE 40 + Disclosure 4 + Libraries 4).

---

## 2026-06-12

### D003 — 0–999 Security Rating scale
**Decision:** Map the internal 0–100% percentage to a 0–999 display rating using `Math.round(pct / 100 * 999)`.

**Reason:** A 0–100% score looks like a school report. A 0–999 scale signals a proprietary methodology, is harder to game mentally, and aligns with credit scoring conventions (0–999) that UK professional services firms recognise. It is not a direct percentage, discouraging simplistic comparisons.

**Impact:** All PDF templates, frontend gauge labels, and band thresholds use the 0–999 scale for display. Internal calculations remain percentage-based for simplicity.

---

### D002 — Business language throughout; technical detail secondary
**Decision:** All report output (PDF, scan results page, email) leads with business impact and plain-English severity, not technical identifiers or CVE numbers.

**Reason:** Target audience is senior partners at solicitors, accountants, and financial advisory firms — not IT staff. A finding described as "TLS 1.0 deprecated cipher suite detected" means nothing to a managing partner. "Clients connecting to your website may be vulnerable to data interception" does.

**Impact:** DMARC status language: "No Protection / Monitoring Only / Partial Protection / Full Protection". PDF Priority Actions use "Business Impact" before "Technical Detail". Scanner card labels use commercial terminology.

---

## 2026-06 (pre-session)

### D001 — Target market: UK regulated professional services (solicitors, accountants, financial advisers)
**Decision:** Soterius is positioned as a Security Rating platform for UK regulated professional services, not a generic security scanner.

**Reason:** These firms handle sensitive client data (financial records, legal documents, personal data), are subject to SRA, FCA, and ICO regulatory obligations, and are underserved by existing enterprise-grade security rating tools which are too expensive and complex for their needs.

**Impact:** Scoring methodology weighted toward the threat vectors most relevant to this sector: email authentication (phishing), HTTPS/TLS (client-facing), GDPR/cookie compliance (ICO), and web application headers. Not weighted toward infrastructure or cloud-native attack surfaces.

---

### D000 — Railway + Vercel + Supabase stack
**Decision:** Backend on Railway (Docker), frontend on Vercel, database on Supabase (PostgreSQL).

**Reason:** Railway supports Docker natively, which is required for Puppeteer/Chromium PDF generation. Vercel provides zero-config React deployment. Supabase gives a managed PostgreSQL instance with a REST API client, removing the need to manage a database server. All three have free tiers suitable for early-stage validation.

**Impact:** Puppeteer requires `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`, `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`, and `apt-get install chromium` in the Dockerfile. PDF Buffer conversion required because Puppeteer 22+ returns `Uint8Array` rather than `Buffer`.
