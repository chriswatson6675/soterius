# Soterius Decisions Log

Decisions are recorded when they are non-obvious, have significant trade-offs, or shape future work.

---

## 2026-06-13

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
