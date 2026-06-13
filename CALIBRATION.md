# Soterius Market Calibration

**Objective:** Validate whether Security Rating v1.0 produces commercially credible results across a representative sample of UK professional services firms.

**Status:** In progress  
**Target:** 250 firms (board approved)  
**Scanned to date:** 0  
**Last updated:** 2026-06-13

---

## Purpose

Security Rating v1.0 was built against a theoretical model. Before investing in monitoring, benchmarking displays, or trust-mark tiers, the model must be tested against real firms.

Calibration answers three questions:

1. Are scores well-distributed, or are most firms clustered at the same band?
2. Do scores feel credible — would a knowledgeable person agree that a 74 is better than a 42?
3. Are there any systematic anomalies — checks that always fail, or always pass, regardless of firm quality?

---

## Calibration Workflow

### Step 1 — Add a prospect

```http
POST /api/prospects
X-Admin-Token: <your-admin-token>
Content-Type: application/json

{
  "firm_name": "Smith & Partners LLP",
  "website": "smithpartners.co.uk",
  "sector": "solicitors",
  "location": "London",
  "source": "sra-register",
  "notes": ""
}
```

Valid `sector` values: `solicitors` · `accountants` · `financial-advisers` · `surveyors` · `other`  
Valid `source` values: `manual` · `sra-register` · `icaew-register` · `fca-register`

The `website` field accepts full URLs or bare domains — the API normalises it automatically.

---

### Step 2 — Run a scan

```http
POST /api/prospects/:id/scan
X-Admin-Token: <your-admin-token>
```

Returns the full scan result: score (0–999 display, 0–100 internal), risk band, category breakdown, and all check findings.

---

### Step 3 — Record analyst notes

After reviewing the scan result, record any observations:

```http
PATCH /api/prospects/:id
X-Admin-Token: <your-admin-token>
Content-Type: application/json

{
  "notes": "Score 61 (Moderate Risk). DMARC missing, no CSP. Firm has 12 partners — seems plausible. Score feels right."
}
```

Suggested note format:
> `Score [X] ([band]). Key failures: [list]. Credibility: [plausible / seems too high / seems too low]. Notes: [anything unusual].`

---

### Step 4 — Retrieve a prospect with scan history

```http
GET /api/prospects/:id
X-Admin-Token: <your-admin-token>
```

Returns the prospect record and its full scan history.

---

### Step 5 — Pull benchmark data

```http
GET /api/prospects/benchmarks
X-Admin-Token: <your-admin-token>
```

Returns live aggregated stats across all prospect-linked scans.

---

## Data Fields

| Field | Stored in | Notes |
|---|---|---|
| Firm Name | `prospects.firm_name` | Legal trading name |
| Website | `prospects.website` | Bare domain, normalised on insert |
| Sector | `prospects.sector` | solicitors / accountants / financial-advisers / surveyors / other |
| Location | `prospects.location` | City or region — free text |
| Source | `prospects.source` | Where the firm was found |
| Security Score | `scans.overall_score` | 0–100 percentage (display: multiply by 9.99 for 0–999) |
| Risk Band | `scans.risk_band` | Excellent / Good / Moderate Risk / High Risk / Critical Risk |
| Top Findings | `scans.scanner_results` | Full check-level findings in JSONB; query with SQL below |
| Analyst Notes | `prospects.notes` | Free text — record credibility assessment and anomalies |
| Scan Date | `scans.scanned_at` | Timestamp of when scan ran |

---

## Benchmark Queries

Run these in **Supabase → SQL Editor**. All queries filter to `scoring_version = 'v1.0'` and `prospect_id IS NOT NULL` to ensure only calibration scans are included.

---

### Average score by sector

```sql
SELECT
  p.sector,
  COUNT(DISTINCT p.id)              AS firm_count,
  ROUND(AVG(s.overall_score), 1)   AS avg_score,
  ROUND(MIN(s.overall_score), 1)   AS min_score,
  ROUND(MAX(s.overall_score), 1)   AS max_score
FROM scans s
JOIN prospects p ON s.prospect_id = p.id
WHERE s.scoring_version = 'v1.0'
GROUP BY p.sector
ORDER BY firm_count DESC;
```

---

### Average score by region

```sql
SELECT
  p.location,
  COUNT(DISTINCT p.id)              AS firm_count,
  ROUND(AVG(s.overall_score), 1)   AS avg_score,
  ROUND(MIN(s.overall_score), 1)   AS min_score,
  ROUND(MAX(s.overall_score), 1)   AS max_score
FROM scans s
JOIN prospects p ON s.prospect_id = p.id
WHERE s.scoring_version = 'v1.0'
GROUP BY p.location
ORDER BY firm_count DESC;
```

---

### Risk band distribution

```sql
SELECT
  risk_band,
  COUNT(*)                                                        AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1)            AS percentage
FROM scans
WHERE prospect_id IS NOT NULL
  AND scoring_version = 'v1.0'
GROUP BY risk_band
ORDER BY
  CASE risk_band
    WHEN 'Excellent'     THEN 1
    WHEN 'Good'          THEN 2
    WHEN 'Moderate Risk' THEN 3
    WHEN 'High Risk'     THEN 4
    WHEN 'Critical Risk' THEN 5
  END;
```

---

### Most common failed checks

```sql
WITH scan_checks AS (
  SELECT
    chk->>'name'   AS check_name,
    chk->>'status' AS check_status
  FROM scans s,
    LATERAL jsonb_array_elements(s.scanner_results) AS scanner,
    LATERAL jsonb_array_elements(scanner->'checks') AS chk
  WHERE s.prospect_id IS NOT NULL
    AND s.scoring_version = 'v1.0'
)
SELECT
  check_name,
  COUNT(*)                                                                      AS fail_count,
  ROUND(COUNT(*) * 100.0 / (
    SELECT COUNT(*) FROM scans
    WHERE prospect_id IS NOT NULL AND scoring_version = 'v1.0'
  ), 1)                                                                         AS pct_of_firms
FROM scan_checks
WHERE check_status = 'FAIL'
GROUP BY check_name
ORDER BY fail_count DESC
LIMIT 20;
```

---

### DMARC adoption rate

Breaks down DMARC into its four states: No record / Monitoring only (p=none) / Partial protection (p=quarantine) / Full protection (p=reject).

```sql
WITH dmarc AS (
  SELECT
    chk->>'status'    AS status,
    (chk->>'points')::int AS points
  FROM scans s,
    LATERAL jsonb_array_elements(s.scanner_results) AS scanner,
    LATERAL jsonb_array_elements(scanner->'checks') AS chk
  WHERE s.prospect_id IS NOT NULL
    AND s.scoring_version = 'v1.0'
    AND chk->>'name' = 'DMARC policy enforced'
)
SELECT
  CASE
    WHEN status = 'PASS'                       THEN 'p=reject — Full Protection'
    WHEN status = 'WARNING' AND points = 30    THEN 'p=quarantine — Partial Protection'
    WHEN status = 'WARNING' AND points = 20    THEN 'p=none — Monitoring Only'
    WHEN status = 'FAIL'                       THEN 'No DMARC record'
  END                                          AS dmarc_level,
  COUNT(*)                                     AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM dmarc
GROUP BY status, points
ORDER BY
  CASE
    WHEN status = 'PASS'                    THEN 1
    WHEN status = 'WARNING' AND points = 30 THEN 2
    WHEN status = 'WARNING' AND points = 20 THEN 3
    WHEN status = 'FAIL'                    THEN 4
  END;
```

---

### Security header adoption rate

Shows pass/warning/fail counts for each of the five security headers.

```sql
WITH header_checks AS (
  SELECT
    chk->>'name'   AS check_name,
    chk->>'status' AS status
  FROM scans s,
    LATERAL jsonb_array_elements(s.scanner_results) AS scanner,
    LATERAL jsonb_array_elements(scanner->'checks') AS chk
  WHERE s.prospect_id IS NOT NULL
    AND s.scoring_version = 'v1.0'
    AND chk->>'name' IN (
      'HSTS present',
      'Content Security Policy set',
      'X-Frame-Options set',
      'X-Content-Type-Options set',
      'Referrer-Policy set'
    )
)
SELECT
  check_name,
  COUNT(*) FILTER (WHERE status = 'PASS')    AS pass_count,
  COUNT(*) FILTER (WHERE status = 'WARNING') AS warning_count,
  COUNT(*) FILTER (WHERE status = 'FAIL')    AS fail_count,
  COUNT(*)                                   AS total,
  ROUND(COUNT(*) FILTER (WHERE status = 'PASS') * 100.0 / COUNT(*), 1) AS pass_pct
FROM header_checks
GROUP BY check_name
ORDER BY pass_pct ASC;
```

---

## First 50 Firms — Recommended Process

### Sector distribution

| Sector | Target count | Rationale |
|---|---|---|
| Solicitors | 100 | Largest regulated sector; SRA register is publicly searchable |
| Accountants | 75 | ICAEW/ACCA register publicly available; high data sensitivity |
| Financial advisers | 50 | FCA register; directly regulated; high reputational risk |
| Surveyors / other | 25 | Adds breadth; RICS register available |

---

### Where to find firms

- **Solicitors:** [SRA regulated firms](https://www.sra.org.uk/consumers/register/) — search by town
- **Accountants:** [ICAEW member firms](https://www.icaew.com/about-icaew/find-a-chartered-accountant)
- **Financial advisers:** [FCA register](https://register.fca.org.uk/) — filter by firm type
- **Surveyors:** [RICS find a firm](https://www.ricsfirms.com/)

Record source as `sra-register`, `icaew-register`, `fca-register`, or `manual`.

---

### Location distribution

Aim for a mix. Suggested split:
- London: 75 firms
- Other major cities (Manchester, Birmingham, Leeds, Bristol, Edinburgh): 100 firms
- Smaller towns / regional: 75 firms

Scoring may differ systematically between London firms (higher IT investment) and regional firms (smaller, less mature). This is important to detect.

---

### Scanning process

1. Add the prospect via `POST /api/prospects`
2. Scan immediately via `POST /api/prospects/:id/scan`
3. Review the JSON response — look at `score`, `riskLevel`, and the `scanners` array
4. Record analyst notes via `PATCH /api/prospects/:id` within the same session — impressions are more reliable immediately
5. Flag anything that feels anomalous (see below)

---

### What to note per firm

For each firm, record in `notes`:

- **Score and band** — e.g. `Score 58 (High Risk)`
- **Top failures** — the 2–3 most significant FAIL findings
- **Credibility verdict** — `plausible` / `seems too high` / `seems too low`
- **Anomaly flag** — anything unexpected (e.g. a large well-known firm scoring Critical Risk)

---

### Anomaly flags — what to watch for

| Observation | Possible cause | Action |
|---|---|---|
| Very large firm scores Critical Risk | No DMARC or weak headers despite resources | Confirm — may be genuine; note it |
| Very small firm scores Excellent | May have recently hired IT; or website is minimal with few attack surfaces | Note it — not necessarily wrong |
| All firms in a sector cluster at same band | Check not discriminating | Review that check's weight |
| Score feels disconnected from firm's reputation | Score reflects technical posture only — not the firm's overall security maturity | Expected; note in CALIBRATION.md findings |
| DKIM always fails | DKIM selector detection covers 10 common selectors — some firms use non-standard selectors | Note as a known limitation |

---

### Milestone checkpoints

| Milestone | Action |
|---|---|
| 25 firms scanned | Pause. Run benchmark queries. Does band distribution look reasonable? |
| 50 firms scanned | Run all queries. Note any emerging sector patterns. Flag anomalies. |
| 100 firms scanned | Mid-point analysis. Are scores well-distributed? Any systematic issues? |
| 250 firms scanned | Full analysis. Complete Findings section. Record credibility verdict. |

---

## Findings

*Complete this section after 50 firms are scanned.*

### Score distribution summary

*(Populate after data collection)*

### Sector observations

*(Populate after data collection)*

### Anomalies identified

*(Populate after data collection)*

### Credibility verdict

*(Populate after data collection)*

**Options:**
- **Credible as-is** — Security Rating v1.0 produces commercially plausible results. Proceed to Phase 2.
- **Minor adjustment needed** — one or two checks are over/under-weighted. Document specific changes required before Phase 2.
- **Significant recalibration needed** — systematic issues found. Convene scoring review before proceeding.

---

## Success Criteria

Calibration is complete when:

- [ ] 250 firms scanned across at least 3 sectors
- [ ] Sector benchmarks established (average score per sector)
- [ ] Risk band distribution established across the full sample
- [ ] DMARC adoption rate established
- [ ] Security header adoption rate established
- [ ] Average scores by sector calculated
- [ ] Band distribution is non-trivial (firms spread across at least 3 bands)
- [ ] Analyst has reviewed each firm and recorded a credibility verdict
- [ ] Findings section above is complete
- [ ] A credibility verdict has been made
