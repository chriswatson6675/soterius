# Benchmark Report 001 — North Wales Solicitors
## Soterius Security Rating — First Regional Benchmark

**Cohort:** Benchmark Cohort 001 — North Wales Solicitor Benchmark
**Region:** Within 25 miles of LL30 2UB
**Sector:** Solicitors
**Source:** SRA regulated firms register
**Scan Date:** 2026-06-14
**Scoring Version:** Security Rating v1.0
**Status:** Final — generated from corrected scan data (post-DNS bug fix)

---

## Executive Summary

This report presents the findings from the first Soterius benchmark dataset — a complete scan of solicitor firms within 25 miles of Llandudno Junction (LL30 2UB), sourced from the SRA regulated firms register.

**42 solicitor firms** were analysed.

| Metric | Value |
|---|---|
| Firms analysed | **42** |
| Average Security Rating | **500 / 999** |
| Median Security Rating | **539 / 999** |
| Rating range | 30 – 909 |
| High Risk or Critical Risk | **64%** (27 firms) |
| SPF adoption | 79% |
| DMARC adoption (any record) | 48% |
| DMARC enforcement (quarantine/reject) | 33% |

**64%** of firms fall into the High Risk or Critical Risk categories. The primary failures are in email authentication and security headers — both categories where remediation is achievable quickly and at low cost.

This report was produced following the identification and resolution of a DNS lookup bug that caused email security checks to return 0/56 for domains stored with a `www.` prefix. All scan records were regenerated on 2026-06-14 using the corrected scanner.

---

## Methodology

### Scoring Model

Soterius Security Rating v1.0 evaluates five security categories:

| Category | Max Points | Weight |
|---|---|---|
| SSL/TLS Encryption | 40 | 19% |
| Email Security | 56 | 27% |
| Security Headers | 50 | 24% |
| Vulnerable Components | 48 | 23% |
| GDPR / Cookie Compliance | 12 | 6% |
| **Total** | **206** | 100% |

Points earned as a percentage of 206 are mapped to a 0–999 display rating. Risk bands:

| Band | Threshold | Rating range |
|---|---|---|
| Excellent | ≥ 90% | 899–999 |
| Good | 75–89% | 749–889 |
| Moderate Risk | 60–74% | 599–739 |
| High Risk | 40–59% | 400–589 |
| Critical Risk | < 40% | 0–390 |

### Email Security Scoring (DMARC — graduated)

| Policy | Points | Level |
|---|---|---|
| p=reject | 40 | Full Protection |
| p=quarantine | 30 | Partial Protection |
| p=none | 20 | Monitoring Only |
| No record | 0 | No Protection |

### Data Collection

- Firms sourced from the SRA regulated firms register, scoped to within 25 miles of LL30 2UB
- Scanned via Soterius Research Mode (admin-authenticated endpoint)
- One new scan record created per firm during regeneration; previous scans retained (immutable records per D008)
- Benchmark statistics derived from the regeneration scan records
- DNS lookups use the Node.js system resolver; HTTP checks fetch live headers with a 10-second timeout

---

## Sample Size

| Metric | Count |
|---|---|
| Total prospects in cohort | 42 |
| Firms included in this report | **42** |
| Excluded (invalid/duplicate) | 0 |
| Scan failures | 0 |

### By Sector

| Sector                   | Count | Avg Rating |
|--------------------------|-------|------------|
| Unknown                  |    42 |     500 |

---

## Risk Distribution

| Band             | Count | Share |                    |
|------------------|-------|-------|--------------------|
| Excellent        |     2 |   5% | █ |
| Good             |     3 |   7% | █ |
| Moderate Risk    |    10 |  24% | █████ |
| High Risk        |    17 |  40% | ████████ |
| Critical Risk    |    10 |  24% | █████ |

**64%** of firms are rated High Risk or Critical Risk.

### Average Score by Category

| Category                   | Avg % |
|----------------------------|-------|
| SSL/TLS Encryption         |   76% |
| Email Security             |   43% |
| Security Headers           |   18% |
| Vulnerable Components      |   64% |
| GDPR / Cookie Compliance   |   67% |

---

## Email Security Findings

Email Security is the lowest-performing category in this cohort, with an average of **43%**.

### SPF (Sender Policy Framework)

SPF records specify which mail servers are authorised to send email on behalf of a domain. Without SPF, anyone can send email appearing to come from a firm's address.

- **79%** of firms have an SPF record (33 of 42)
- **21%** of firms (9) have no SPF record

### DKIM (DomainKeys Identified Mail)

DKIM adds a cryptographic signature to outbound emails, allowing recipients to verify that an email genuinely came from the sending domain. Detection checks 10 common selector names; the true adoption rate may be higher.

- **43%** of firms have a detectable DKIM record (18 of 42)

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

DMARC policy instructs receiving mail servers on what to do with messages that fail SPF or DKIM checks.

| Policy Level                         | Firms | Share |
|--------------------------------------|-------|-------|
| No record                            |    22 |  52% |
| Monitoring only (p=none)             |     6 |  14% |
| Partial protection (p=quarantine)    |     7 |  17% |
| Full protection (p=reject)           |     7 |  17% |

- **DMARC adoption:** 48% of firms have any DMARC record (20 of 42)
- **DMARC enforcement:** 33% of firms have active enforcement — p=quarantine or p=reject (14 of 42)
- **52%** of firms have no DMARC record at all — email from their domain can be trivially spoofed

---

## Website Security Findings

### Security Headers

Security headers are HTTP response headers that instruct browsers on how to handle page content. They are set in the web server or hosting control panel and typically take minutes to configure.

| Header                      | Pass | Warning | Fail | Adoption |
|-----------------------------|------|---------|------|----------|
| HSTS                         |    8 |       0 |   34 |  19% |
| Content Security Policy      |    5 |       1 |   36 |  14% |
| X-Frame-Options              |    8 |       0 |   34 |  19% |
| X-Content-Type-Options       |   11 |       0 |   31 |  26% |
| Referrer-Policy              |    4 |       0 |   38 |  10% |

### Most Common Failed Checks (all categories)

| Check                                        | Firms | Share |
|----------------------------------------------|-------|-------|
| Referrer-Policy set                          |    38 |  90% |
| Content Security Policy set                  |    36 |  86% |
| HSTS present                                 |    34 |  81% |
| X-Frame-Options set                          |    34 |  81% |
| X-Content-Type-Options set                   |    31 |  74% |
| DKIM configured                              |    24 |  57% |
| DMARC policy enforced                        |    22 |  52% |
| Framework and CMS versions not publicly disclosed |    18 |  43% |
| No known CVEs in detected software           |    11 |  26% |
| No outdated third-party libraries detected   |    11 |  26% |

---

## Key Observations

1. **Email spoofing risk is the dominant finding.** 52% of firms have no DMARC record, and only 33% have enforcement-level policies. Solicitors handling client money, legal documents, and confidential instructions are high-value phishing targets. The absence of email authentication controls represents the most significant and remediable security gap in this cohort.

2. **Security headers are broadly absent.** The most commonly failed checks are security headers, all achievable in under 30 minutes. The failure rate reflects a lack of proactive security configuration rather than technical complexity — these firms are not hardened, but hardening is straightforward.

3. **SPF is more widely adopted than DMARC.** 79% of firms have SPF vs 48% with any DMARC. Many firms have partially implemented email authentication without completing the full chain. SPF alone provides limited protection without DMARC enforcement.

4. **Monitoring-only DMARC is a common partial deployment.** 14% of firms have DMARC `p=none` — this collects reports but provides no protection against spoofing. These firms have demonstrated awareness of DMARC but have not taken the final step to enforcement.

5. **Score distribution is credible.** The 64% High/Critical Risk concentration is consistent with the profile of small-to-medium professional services firms without dedicated IT security resource. Band distribution is non-trivial — firms are spread across the full range, and the scoring model produces meaningful differentiation.

6. **SSL/TLS is the strongest category** (average: 76%), reflecting widespread adoption of basic HTTPS across the sector.

---

## Recommendations

### Highest-priority actions for High Risk / Critical Risk firms

| Priority | Action | Est. Time | Impact |
|---|---|---|---|
| 1 | Publish DMARC record — start with `p=none`, move to `p=quarantine` | 15 min | Prevents email spoofing |
| 2 | Verify SPF record is present and covers all sending services | 15 min | Blocks unauthorised senders |
| 3 | Enable HSTS header on web server | 5 min | Prevents HTTP downgrade attacks |
| 4 | Set X-Frame-Options header | 5 min | Prevents clickjacking |
| 5 | Set X-Content-Type-Options: nosniff | 5 min | Prevents MIME sniffing |
| 6 | Configure Content Security Policy | 30 min | Prevents XSS attacks |

### For firms with DMARC p=none

Upgrade the policy incrementally:
1. Ensure SPF and DKIM are correctly configured and aligned
2. Monitor DMARC aggregate reports for 2–4 weeks
3. Move to `p=quarantine` once legitimate mail is flowing cleanly
4. Move to `p=reject` once quarantine is stable

### Sector-wide observation

A DMARC enforcement rate of 33% in a sector where firms routinely communicate client money instructions and sensitive legal documents by email represents significant exposure. Raising DMARC enforcement to even 50% of firms would materially reduce the attack surface for email-based fraud targeting this sector.

---

## Data Quality Notes

All 42 prospects scanned successfully with zero scan failures. However, manual review of the scan output identified the following issues that require cohort cleanup before the next regeneration:

### Anomalies requiring action

| Domain | Score | Issue | Recommended action |
|---|---|---|---|
| `darwingray.co.uk` | 30 | Same firm as `darwingray.com`; `.co.uk` appears inactive/parked | Remove from cohort |
| `tudotowne.co.uk` | 30 | Typo — intended domain is `tudurowen.co.uk` | Remove from cohort |
| `tudorowen.co.uk` | 30 | Likely old inactive domain; active site is `tudurowen.co.uk` | Remove from cohort |
| `averprimelaw.co.uk` | 30 | Likely typo or old domain; `acerprimelaw.co.uk` scores 53 | Remove or verify |
| `edwardhughes.co.uk` | 30 | Same firm as `edwardhugheslaw.co.uk`; appears inactive/parked | Remove from cohort |

**Impact on statistics:** If the 5 anomalous domains above are excluded, the effective sample size drops from 42 to 37 unique active firms, and the Critical Risk count falls from 10 to 6 (from 24% to ~16%). The benchmark statistics in this report include these domains. A cleaned regeneration should follow cohort cleanup.

### Sector metadata missing

All 42 firms show sector as "Unknown" — the sector field was not populated during Research Mode data entry for this cohort. Sector benchmarking (solicitors vs other sectors) is not possible from this dataset. Sector should be set to `solicitors` for all Cohort 001 firms before the next report is generated.

### Known Limitations

- **DKIM detection** covers 10 common selector names only (`google`, `selector1`, `selector2`, `default`, `mail`, `k1`, `k2`, `dkim`, `smtp`, `mimecast`). Firms using custom selectors will appear as DKIM FAIL even when DKIM is correctly configured. The true DKIM adoption rate is likely higher than reported.
- **CVE detection** is based on technology fingerprinting. Firms using CDNs, proxies, or generic hosting may have their stack obscured, potentially understating the Vulnerable Components score.
- **Point-in-time snapshot.** Scores reflect each firm's security posture on 2026-06-14 only. Scores will change as firms update their configurations.
- **www. prefix bug — resolved.** A DNS lookup bug was identified during scanner accuracy validation: email security checks (SPF, DMARC, DKIM) were being queried against `www.domain.com` rather than the apex domain `domain.com`, where DNS authentication records are always published. This caused email category scores of 0/56 for affected firms. The bug was fixed and all scan records regenerated on 2026-06-14. Darwin Gray was the validation firm: score corrected from 360 to 529, email category from 0% to 64%.

---

*Soterius Security Rating v1.0*
*Benchmark Report 001 — North Wales Solicitors*
*Generated 2026-06-14*
