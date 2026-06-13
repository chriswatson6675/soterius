# Soterius Security Rating Methodology

**Current version:** v1.0  
**Approved:** 2026-06-13  
**Authoritative source:** This file. Do not derive scoring rules from code comments or conversation history.

---

## Overview

The Security Rating is a proprietary 0–999 scale that maps from an internal 0–100% percentage score. It is designed for UK regulated professional services firms (solicitors, accountants, financial advisers) and is intentionally business-friendly rather than technical.

```
Security Rating = Math.round(percentage / 100 × 999)
```

A score of 100% yields a rating of 999. A score of 0% yields a rating of 0. Intermediate values are linearly interpolated.

---

## Score Calculation

```
achievedPoints = sum of points earned across all checks
percentage     = Math.round(achievedPoints / MAX_POINTS × 100)
rating         = Math.round(percentage / 100 × 999)
```

**MAX_POINTS = 206**

| Category | Max Points |
|---|---|
| SSL/TLS Encryption | 40 |
| Email Security | 56 |
| Security Headers | 50 |
| Vulnerable Components | 48 |
| GDPR / Cookie Compliance | 12 |
| **Total** | **206** |

---

## Default Check Scoring

Unless a check carries an explicit `points` field, points are awarded by category default:

| Status | Points |
|---|---|
| PASS | Category PASS rate × 1 |
| WARNING | Category PASS rate × 0.5 (50%) |
| FAIL | 0 |

The WARNING rate is always exactly 50% of PASS for default checks. The two exceptions are DMARC and CVE, which use explicit four-state and three-state tables respectively.

---

## Category Definitions

### SSL/TLS Encryption — 40 pts max

**Default points:** PASS = 10, WARNING = 5, FAIL = 0

| Check | PASS | WARN | FAIL | Notes |
|---|---|---|---|---|
| Certificate valid and trusted | 10 | 5 | 0 | CA-signed, no browser warning |
| Certificate not expired | 10 | 5 | 0 | daysUntilExpiry > 0 |
| TLS version 1.2 or higher | 10 | 5 | 0 | TLSv1.2 or TLSv1.3 required |
| Certificate valid for 60+ days | 10 | 5 | 0 | WARN if 31–60 days, FAIL if ≤30 days |

**WARNING conditions:**
- Certificate valid for 60+: WARNING when 31–60 days remain; FAIL when ≤30 days remain

---

### Email Security — 56 pts max

**Default points:** PASS = 8, WARNING = 4, FAIL = 0  
**Exception:** DMARC uses an explicit `points` field (see below).

| Check | PASS | WARN | FAIL | Notes |
|---|---|---|---|---|
| SPF record present and valid | 8 | 4 | 0 | WARNING if `+all` or `?all` (permissive) |
| DKIM configured | 8 | 4 | 0 | Checks 10 common selectors |
| DMARC policy enforced | **40** | **20 / 30** | **0** | Four-state — see table below |

#### DMARC Four-State Scoring (explicit `points` field)

| DMARC State | Status | Points | Business Label |
|---|---|---|---|
| No DMARC record | FAIL | 0 | No Protection |
| `p=none` | WARNING | 20 | Monitoring Only |
| `p=quarantine` | WARNING | 30 | Partial Protection |
| `p=reject` | PASS | 40 | Full Protection |

DMARC is the dominant Email Security check (40 of 56 pts). A domain with no DMARC record scores 0/40 for DMARC regardless of SPF and DKIM status.

---

### Security Headers — 50 pts max

**All checks use explicit `points` field.** WARNING = `Math.round(passMax × 0.5)`. No category default applies.

| Check | PASS | WARN | FAIL | WARNING condition |
|---|---|---|---|---|
| HSTS present | 15 | 8 | 0 | max-age < 15,768,000s (6 months) |
| Content Security Policy set | 13 | 7 | 0 | Present but contains `'unsafe-inline'`, `'unsafe-eval'`, or `data:` |
| X-Frame-Options set | 10 | 5 | 0 | Header absent = FAIL only |
| X-Content-Type-Options set | 8 | 4 | 0 | Present but not `nosniff` |
| Referrer-Policy set | 4 | 2 | 0 | Present but not `no-referrer` or `strict-origin*` |

**HSTS minimum:** `max-age` must be ≥ 15,768,000 seconds (roughly 6 months) for PASS.  
**CSP WARNING trigger:** regex `/'unsafe-inline'|'unsafe-eval'|\bdata:\b/i`  
**X-Frame-Options:** Binary — present = PASS, absent = FAIL. No WARNING state.  
**X-Content-Type-Options:** Must equal `nosniff` (case-insensitive) for PASS. Any other value = WARNING.  
**Referrer-Policy:** Must contain `no-referrer` or `strict-origin` for PASS.

---

### Vulnerable Components — 48 pts max

**Default points:** PASS = 4, WARNING = 2, FAIL = 0  
**Exception:** CVE check uses an explicit `points` field (see below).

| Check | PASS | WARN | FAIL | Notes |
|---|---|---|---|---|
| No known CVEs in detected software | **40** | **20** | **0** | Three-state — see table below |
| Framework and CMS versions not publicly disclosed | 4 | 2 | 0 | Version numbers in Server or X-Powered-By headers |
| No outdated third-party libraries detected | 4 | 2 | 0 | Detects pre-3.x jQuery via page source |

#### CVE Three-State Scoring (explicit `points` field)

| CVE State | Status | Points | Condition |
|---|---|---|---|
| No CVEs detected | PASS | 40 | No recognised CMS with known vulnerabilities |
| Low-severity CVEs only | WARNING | 20 | CMS version detected, confirmed current (CVSS < 7.0 proxy) |
| High-severity CVEs detected | FAIL | 0 | CMS version detected with known unpatched vulnerabilities |

**Current detection:** WordPress version via `<meta name="generator">` tag. WordPress < 6.4 = FAIL. WordPress 6.4+ with version exposed = WARNING. No WordPress detected = PASS.

**Version disclosure:** FAIL if version numbers appear in `Server` or `X-Powered-By` HTTP headers. WARNING if tech stack is visible without version numbers.

---

### GDPR / Cookie Compliance — 12 pts max

**Default points:** PASS = 2, WARNING = 1, FAIL = 0  
All 6 checks use category default. WARNING is used where automated detection cannot confirm compliance (manual verification required on paid tier).

| Check | PASS | WARN | FAIL |
|---|---|---|---|
| Cookies and trackers identified | 2 | 1 | 0 |
| Privacy policy link accessible | 2 | 1 | 0 |
| Privacy policy content readable | 2 | 1 | 0 |
| Data subject rights documented | 2 | 1 | 0 |
| DPO contact information provided | 2 | 1 | 0 |
| Cookie consent banner visible | 2 | 1 | 0 |

**WARNING is the default outcome** for GDPR checks when the page cannot be fetched or automated analysis is inconclusive. GDPR checks do not return FAIL in the normal flow — they return WARNING with the note "Manual verification required on paid tier."

---

## Risk Bands

### Percentage thresholds

| Band | Percentage Range | Description |
|---|---|---|
| Excellent | 90–100% | Strong security posture across all categories |
| Good | 75–89% | Good posture with minor gaps |
| Moderate Risk | 60–74% | Some significant gaps requiring attention |
| High Risk | 40–59% | Material weaknesses that increase exposure |
| Critical Risk | 0–39% | Fundamental controls missing or broken |

Applies to both the overall score and each category breakdown score.

### 0–999 Rating scale thresholds

```
Excellent:     ≥ 899   (maps from ≥ 90%)
Good:          ≥ 749   (maps from ≥ 75%)
Moderate Risk: ≥ 599   (maps from ≥ 60%)
High Risk:     ≥ 400   (maps from ≥ 40%)
Critical Risk: < 400   (maps from < 40%)
```

**Threshold derivation:** `Math.round(threshold_pct / 100 × 999)`
- 90% → 899, 75% → 749, 60% → 599, 40% → 400

---

## Score Object Structure

Every scan produces a `scoreObject` attached to API responses, Supabase records, and PDF reports:

```json
{
  "achievedPoints": 152,
  "totalMaximum": 206,
  "percentage": 74,
  "riskBand": "Moderate Risk",
  "categoryBreakdown": {
    "ssl":      { "achieved": 40, "maximum": 40, "percentage": 100, "rating": "Excellent" },
    "email":    { "achieved": 22, "maximum": 56, "percentage": 39,  "rating": "Critical Risk" },
    "headers":  { "achieved": 37, "maximum": 50, "percentage": 74,  "rating": "Moderate Risk" },
    "vulnComp": { "achieved": 40, "maximum": 48, "percentage": 83,  "rating": "Good" },
    "gdpr":     { "achieved": 8,  "maximum": 12, "percentage": 67,  "rating": "Moderate Risk" }
  },
  "timestamp": "2026-06-13T14:22:00.000Z",
  "scoringVersion": "v1.0"
}
```

`scoringVersion` must be present on every score object to allow future like-for-like benchmarking.

---

## Per-Check Points Field

Checks may carry an explicit `points` field. The scoring engine in `backend/routes/scan.js` applies the following logic:

```js
if (typeof c.points === 'number') return sum + c.points;
// else fall back to def.pts[status]
```

Checks that carry explicit `points`: DMARC, CVE (all four/three-state values), all five Security Header checks.

Checks that use category default: SSL (4 checks), Email SPF, Email DKIM, VulnComp Disclosure, VulnComp Libraries, GDPR (6 checks).

---

## Scoring Version History

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-06-13 | Initial approved methodology. Five-band risk system, DMARC four-state, CVE three-state, per-check header weights, MAX_POINTS=206. |

**To change the scoring methodology:** increment the version string in `scan.js` (`scoringVersion: "v1.1"`), update this file, and record the change in DECISIONS.md and CHANGELOG.md. Do not modify v1.0 records retroactively.
