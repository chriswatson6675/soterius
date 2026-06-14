# Benchmark Findings 001 — North Wales Solicitors
## Soterius Check-Level Analysis

**Cohort:** Benchmark Cohort 001 — North Wales Solicitor Benchmark
**Firms Analysed:** 35
**Scan Date:** 2026-06-14
**Scoring Version:** Security Rating v1.0

This report analyses the individual check results stored for all 35 firms in Benchmark Cohort 001.
Every check recorded across all five scanner categories is included. Rankings are by frequency of FAIL
or WARNING outcome across the cohort.

---

## Top 10 Failed and Warning Checks

### 1. Referrer-Policy set

| Metric | Value |
|---|---|
| Firms affected | **31 of 35** (89%) |
| FAIL | 31 firms |
| WARNING | 0 firms |
| Risk category | Browser Security |
| Severity | Medium |
| Scanner | Security Headers |
| Example finding | `Referrer-Policy missing — full URL may be leaked to third-party services` |

### 2. Content Security Policy set

| Metric | Value |
|---|---|
| Firms affected | **30 of 35** (86%) |
| FAIL | 29 firms |
| WARNING | 1 firms |
| Risk category | Browser Security |
| Severity | High |
| Scanner | Security Headers |
| Example finding | `[WARNING] CSP present but contains unsafe directives — consider removing 'unsafe-inline' and 'unsafe-eval'` |

### 3. HSTS present

| Metric | Value |
|---|---|
| Firms affected | **27 of 35** (77%) |
| FAIL | 27 firms |
| WARNING | 0 firms |
| Risk category | Browser Security |
| Severity | High |
| Scanner | Security Headers |
| Example finding | `Could not fetch headers: timeout of 10000ms exceeded` |

### 4. X-Frame-Options set

| Metric | Value |
|---|---|
| Firms affected | **27 of 35** (77%) |
| FAIL | 27 firms |
| WARNING | 0 firms |
| Risk category | Browser Security |
| Severity | Medium |
| Scanner | Security Headers |
| Example finding | `X-Frame-Options missing — site may be vulnerable to clickjacking attacks` |

### 5. X-Content-Type-Options set

| Metric | Value |
|---|---|
| Firms affected | **24 of 35** (69%) |
| FAIL | 24 firms |
| WARNING | 0 firms |
| Risk category | Browser Security |
| Severity | Medium |
| Scanner | Security Headers |
| Example finding | `Could not fetch headers: timeout of 10000ms exceeded` |

### 6. DMARC policy enforced

| Metric | Value |
|---|---|
| Firms affected | **28 of 35** (80%) |
| FAIL | 15 firms |
| WARNING | 13 firms |
| Risk category | Email Authentication |
| Severity | High |
| Scanner | Email Security |
| Example finding | `[WARNING] Partial Protection — DMARC p=quarantine; spoofed emails are sent to spam but not fully blocked` |

### 7. Framework and CMS versions not publicly disclosed

| Metric | Value |
|---|---|
| Firms affected | **31 of 35** (89%) |
| FAIL | 12 firms |
| WARNING | 19 firms |
| Risk category | Software Security |
| Severity | Medium |
| Scanner | Vulnerable Components |
| Example finding | `[WARNING] Tech stack visible but no version numbers: Server: Caddy — consider removing` |

### 8. DPO contact information provided

| Metric | Value |
|---|---|
| Firms affected | **35 of 35** (100%) |
| FAIL | 0 firms |
| WARNING | 35 firms |
| Risk category | Compliance |
| Severity | Medium |
| Scanner | GDPR / Cookie Compliance |
| Example finding | `[WARNING] Manual verification required on paid tier` |

> **Scanner note:** This check cannot be verified automatically. The WARNING reflects that the scanner was unable to confirm DPO contact details are published — not that they are definitively absent. Manual review required for each firm.

### 9. DKIM configured

| Metric | Value |
|---|---|
| Firms affected | **16 of 35** (46%) |
| FAIL | 16 firms |
| WARNING | 0 firms |
| Risk category | Email Authentication |
| Severity | Medium |
| Scanner | Email Security |
| Example finding | `No DKIM record found (checked 10 common selectors) — emails cannot be verified by recipients` |

### 10. Data subject rights documented

| Metric | Value |
|---|---|
| Firms affected | **28 of 35** (80%) |
| FAIL | 0 firms |
| WARNING | 28 firms |
| Risk category | Compliance |
| Severity | Medium |
| Scanner | GDPR / Cookie Compliance |
| Example finding | `[WARNING] Privacy policy found but no data subject rights information detected (right to access, erasure, portability, e` |

---

## Top 5 Quick Wins

Checks with the highest failure rate that a typical solicitor firm can remediate without specialist knowledge. All five can be resolved through web server or DNS configuration — no application code changes required.

### 1. Referrer-Policy set

**Affected:** 31 of 35 firms (89%) · **Category:** Browser Security · **Severity:** Medium

**Remediation:** Add `Referrer-Policy: strict-origin-when-cross-origin` to web server config or hosting panel.

**Why it's a quick win:** Browser security headers and basic DNS records require no application changes — only a configuration update to the web server or DNS provider. Most hosting panels expose these settings directly.

### 2. Content Security Policy set

**Affected:** 30 of 35 firms (86%) · **Category:** Browser Security · **Severity:** High

**Remediation:** Add a basic CSP header: `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'`.

**Why it's a quick win:** Browser security headers and basic DNS records require no application changes — only a configuration update to the web server or DNS provider. Most hosting panels expose these settings directly.

### 3. HSTS present

**Affected:** 27 of 35 firms (77%) · **Category:** Browser Security · **Severity:** High

**Remediation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` to web server config.

**Why it's a quick win:** HSTS is a single header that prevents browsers from connecting over plain HTTP. It is configured at the web server level and takes effect immediately on deployment.

### 4. X-Frame-Options set

**Affected:** 27 of 35 firms (77%) · **Category:** Browser Security · **Severity:** Medium

**Remediation:** Add `X-Frame-Options: SAMEORIGIN` to web server config or hosting panel.

**Why it's a quick win:** Browser security headers and basic DNS records require no application changes — only a configuration update to the web server or DNS provider. Most hosting panels expose these settings directly.

### 5. X-Content-Type-Options set

**Affected:** 24 of 35 firms (69%) · **Category:** Browser Security · **Severity:** Medium

**Remediation:** Add `X-Content-Type-Options: nosniff` to web server config.

**Why it's a quick win:** A single header line. No application changes required — applies at the web server or hosting panel level.

---

## Top 5 High-Impact Findings

Checks that contribute the greatest total loss of points across the cohort. These findings drive the largest downward pressure on cohort-wide scores and represent the highest-priority areas for improvement.

### 1. Referrer-Policy set

| Metric | Value |
|---|---|
| Total points lost across cohort | **310 pts** |
| Firms affected | 31 (89%) |
| Avg points lost per affected firm | ~10 pts |
| Category | Browser Security |
| Severity | Medium |

### 2. Content Security Policy set

| Metric | Value |
|---|---|
| Total points lost across cohort | **293 pts** |
| Firms affected | 30 (86%) |
| Avg points lost per affected firm | ~10 pts |
| Category | Browser Security |
| Severity | High |

### 3. HSTS present

| Metric | Value |
|---|---|
| Total points lost across cohort | **270 pts** |
| Firms affected | 27 (77%) |
| Avg points lost per affected firm | ~10 pts |
| Category | Browser Security |
| Severity | High |

### 4. X-Frame-Options set

| Metric | Value |
|---|---|
| Total points lost across cohort | **270 pts** |
| Firms affected | 27 (77%) |
| Avg points lost per affected firm | ~10 pts |
| Category | Browser Security |
| Severity | Medium |

### 5. X-Content-Type-Options set

| Metric | Value |
|---|---|
| Total points lost across cohort | **240 pts** |
| Firms affected | 24 (69%) |
| Avg points lost per affected firm | ~10 pts |
| Category | Browser Security |
| Severity | Medium |

---

## Methodology Notes

- Analysis uses the most recent scan record per prospect (regeneration run 2026-06-14).
- Check names and statuses are taken directly from stored `scanner_results` JSON.
- "Affected" = FAIL + WARNING combined unless stated otherwise.
- Points lost are estimated from the scoring model (Security Rating v1.0, see SCORING.md).
- DMARC graduated scoring: p=reject 40 pts · p=quarantine 30 pts · p=none 20 pts · no record 0 pts.
- DKIM detection covers 10 common selectors only; true adoption may be higher than reported.
- GDPR checks that require manual verification (DPO contact, data subject rights) are recorded as WARNING for all firms. These reflect scanner limitations, not confirmed non-compliance, and should be validated manually.

---

*Soterius Security Rating v1.0*
*Benchmark Findings 001 — North Wales Solicitors*
*Generated 2026-06-14*
