# Benchmark Insights 001 — Commercial and Strategic Analysis
## North Wales Solicitors — Cohort 001

**Source data:** BENCHMARK_REPORT_001.md · BENCHMARK_FINDINGS_001.md
**Cohort:** 35 solicitor firms within 25 miles of LL30 2UB
**Analysis date:** 2026-06-14
**Scoring version:** Security Rating v1.0 (MAX_POINTS = 206)

This document analyses Benchmark Cohort 001 from a commercial and strategic perspective.
The objective is to identify the findings that create the greatest opportunity for Soterius —
as a service business, as a benchmark provider, and as a future trust mark authority.

---

## 1. Most Common Failed Checks

Ranked by the percentage of firms affected (FAIL + WARNING combined).

| Rank | Check | Affected | Category | Points at stake |
|---|---|---|---|---|
| 1 | Referrer-Policy set | 31 / 35 (89%) | Browser Security | 4 pts per firm |
| 2 | Framework versions not disclosed | 31 / 35 (89%) | Software Security | 4 pts per firm |
| 3 | Content Security Policy | 30 / 35 (86%) | Browser Security | 13 pts per firm |
| 4 | DMARC policy enforced | 28 / 35 (80%) | Email Authentication | up to 40 pts per firm |
| 5 | Data subject rights documented | 28 / 35 (80%) | Compliance | 2 pts per firm |
| 6 | HSTS present | 27 / 35 (77%) | Browser Security | 15 pts per firm |
| 7 | X-Frame-Options set | 27 / 35 (77%) | Browser Security | 10 pts per firm |
| 8 | X-Content-Type-Options set | 24 / 35 (69%) | Browser Security | 8 pts per firm |
| 9 | DKIM configured | 16 / 35 (46%) | Email Authentication | 8 pts per firm |

**Commercial read:** Security headers dominate by volume. DMARC dominates by risk and points.
These are not correlated — they demand different remediation approaches and different service offerings.

---

## 2. Checks That Contribute the Greatest Score Loss

Points lost per check totalled across all 35 firms. Security headers carry lower individual weights
but their near-universal failure creates the largest aggregate loss.

| Rank | Check | Points per FAIL | Firms failing | Total pts lost | % of MAX cohort pts |
|---|---|---|---|---|---|
| 1 | DMARC policy enforced | up to 40 | 15 FAIL + 13 WARN | ~450 pts | highest |
| 2 | HSTS present | 15 | 27 | 405 pts | — |
| 3 | Content Security Policy | 13 | 29 | 377 pts | — |
| 4 | X-Frame-Options set | 10 | 27 | 270 pts | — |
| 5 | X-Content-Type-Options set | 8 | 24 | 192 pts | — |
| 6 | DKIM configured | 8 | 16 | 128 pts | — |
| 7 | Referrer-Policy set | 4 | 31 | 124 pts | — |

> DMARC is ranked first because the 15 firms with no DMARC record score 0/40 on the most
> heavily-weighted single check in the model. The 13 firms with `p=none` score 20/40 — still
> leaving 20 pts per firm on the table. Combined cohort DMARC loss exceeds any other check.

---

## 3. Easiest Checks to Remediate

Ranked by remediation effort — not by failure rate.

| Rank | Check | Effort | How |
|---|---|---|---|
| 1 | Referrer-Policy | < 5 min | One header in web server config or hosting panel |
| 2 | X-Frame-Options | < 5 min | One header in web server config or hosting panel |
| 3 | X-Content-Type-Options | < 5 min | One header in web server config or hosting panel |
| 4 | HSTS | < 10 min | One header — requires HTTPS already present (SSL avg is 92%, so yes) |
| 5 | SPF record | < 15 min | One DNS TXT record — 89% already have it; gap is narrow |
| 6 | DMARC (p=none entry) | < 15 min | One DNS TXT record — starts monitoring without enforcement risk |
| 7 | Content Security Policy (basic) | 20–30 min | One header — basic policy (`default-src 'self'`) is quick; strict policy takes longer |
| 8 | DMARC enforcement (p=reject) | 4–8 weeks | Phased: monitor → quarantine → reject; cannot be rushed safely |
| 9 | DKIM | Hours–days | Requires mail server access, key generation, and DNS record publication |

**Commercial read:** Items 1–5 are single-configuration changes any IT provider can make in minutes.
Items 6–9 require DNS access and, for DMARC enforcement, sustained monitoring. That phased process
is where a managed service creates recurring value.

---

## 4. Score Band Transition Analysis

### What it takes to move bands

The scoring model uses MAX_POINTS = 206. Band thresholds in raw points:

| Band | Min % | Min points |
|---|---|---|
| Excellent | 90% | 186 pts |
| Good | 75% | 155 pts |
| Moderate Risk | 60% | 124 pts |
| High Risk | 40% | 83 pts |
| Critical Risk | < 40% | < 83 pts |

### Critical Risk → High Risk (4 firms)

Critical Risk firms score below 83 pts. Three of the four are within reach of the High Risk
threshold through header fixes alone.

| Firm | Est. score | Pts needed | Route |
|---|---|---|---|
| nelsonmyatt.co.uk | ~76 pts (37%) | 7 pts | HSTS alone (15 pts) clears the threshold |
| garnettwilliamspowell.co.uk | ~68 pts (33%) | 15 pts | HSTS (15 pts) clears the threshold |
| famlegal.co.uk | ~54 pts (26%) | 29 pts | HSTS (15) + CSP (13) + Referrer (4) = 32 pts |
| davidjoneslaw.co.uk | ~23 pts (11%) | 60 pts | Headers alone insufficient — needs email remediation too |

**3 of 4 Critical Risk firms** can be moved to High Risk by fixing 1–3 security headers.
That is a fast, demonstrable, low-cost result with a visible before/after rating improvement.

### High Risk → Moderate Risk (17 firms)

High Risk firms score 83–123 pts. The gap to Moderate Risk (124 pts) is 1–41 pts depending
on where each firm sits within the band.

**Single most impactful action:** Fixing all 5 security headers from FAIL to PASS = **+50 pts**.

| Starting score | Effect of fixing all headers | Resulting score | Band outcome |
|---|---|---|---|
| 59% (122 pts) | +50 pts | 172 pts (83%) | Good |
| 55% (113 pts) | +50 pts | 163 pts (79%) | Good |
| 50% (103 pts) | +50 pts | 153 pts (74%) | Moderate Risk |
| 45% (93 pts) | +50 pts | 143 pts (69%) | Moderate Risk |
| 40% (83 pts) | +50 pts | 133 pts (65%) | Moderate Risk |

For **High Risk firms in the upper half of the band (50–59%)**, fixing all missing security
headers is enough to push them into Good — skipping Moderate Risk entirely.

For **all High Risk firms**, fixing security headers moves them out of High Risk with minimal effort.
This is the single highest-leverage remediation available to this cohort.

### Moderate Risk → Good (9 firms)

Moderate Risk firms score 124–153 pts. The gap to Good (154 pts) is 1–30 pts.

The most effective single intervention at this level is **DMARC policy upgrade**:

| DMARC transition | Points gained |
|---|---|
| No record → p=reject | +40 pts |
| No record → p=quarantine | +30 pts |
| p=none → p=reject | +20 pts |
| p=none → p=quarantine | +10 pts |

A Moderate Risk firm at 60% (124 pts) with `p=none` gains 20 pts from upgrading to `p=reject`,
reaching 144 pts — still Moderate, but close. Adding HSTS (if missing, 15 pts) would then
reach 159 pts = 77% = **Good**.

**Combined route for most Moderate Risk firms:** DMARC enforcement upgrade + one missing header
is sufficient to reach Good.

---

## 5. Top 5 Quick Wins for Firms

Actions achievable in under 30 minutes that produce an immediate, measurable score improvement.

### 1. Add HSTS

- Points gained: **+15 pts** (7.3% score increase, +73 rating points)
- Time: Under 10 minutes
- Method: One line in web server config or hosting panel
- Affected: 27 of 35 firms (77%)
- Band impact: Sufficient to move 3 of 4 Critical Risk firms into High Risk; moves most High
  Risk firms 2–7% closer to the Moderate threshold

### 2. Add Content Security Policy (basic)

- Points gained: **+13 pts** (6.3% score increase, +63 rating points)
- Time: 20–30 minutes
- Method: One header (`Content-Security-Policy: default-src 'self'; ...`)
- Affected: 29 FAIL + 1 WARNING = 30 firms (86%)
- Note: A strict CSP requires more time. A basic CSP achieves PASS and full points.

### 3. Add X-Frame-Options

- Points gained: **+10 pts** (4.9% score increase, +49 rating points)
- Time: Under 5 minutes
- Method: `X-Frame-Options: SAMEORIGIN` in web server config
- Affected: 27 of 35 firms (77%)

### 4. Add X-Content-Type-Options

- Points gained: **+8 pts** (3.9% score increase, +39 rating points)
- Time: Under 5 minutes
- Method: `X-Content-Type-Options: nosniff` in web server config
- Affected: 24 of 35 firms (69%)

### 5. Add Referrer-Policy

- Points gained: **+4 pts** (1.9% score increase, +19 rating points)
- Time: Under 5 minutes
- Method: `Referrer-Policy: strict-origin-when-cross-origin` in web server config
- Affected: 31 of 35 firms (89%)

**Combined quick win:** A firm that fixes all 5 headers in a single session gains **+50 pts**
(+24% score, +240 rating points). A firm at High Risk 50% becomes Moderate Risk 74% in one afternoon.

---

## 6. Top 5 High-Impact Remediations

Actions ranked by points gained per firm, accounting for current cohort failure rates.

### 1. DMARC: No record → p=reject

- Points gained: **+40 pts** (19.4% score increase, +194 rating points)
- Firms with no DMARC: 15 (going directly to p=reject in one step — only safe once SPF is confirmed)
- More realistic path: no record → p=none (immediate) → p=quarantine → p=reject (4–8 weeks total)
- Recurring value: Monitoring required throughout. This is not a one-time fix.

### 2. Full security header set (all 5)

- Points gained: **+50 pts combined** if all missing
- Actual average gain (accounting for partial failures): ~35–45 pts across most firms
- One-session implementation
- Affects more firms than any other remediation

### 3. DMARC: p=none → p=reject

- Points gained: **+20 pts** (9.7% score increase, +97 rating points)
- Firms affected: 13 with `p=none` — these have done the hardest part (publishing the record);
  upgrading enforcement is the remaining step
- Time: 4–8 weeks of monitoring, then a DNS record change

### 4. DKIM implementation

- Points gained: **+8 pts** (3.9% score increase, +39 rating points)
- Firms with no DKIM: 16 (46%)
- Requires mail server cooperation — more complex than header changes
- Unlocks full email authentication chain: SPF + DKIM + DMARC = complete protection

### 5. HSTS alone

- Points gained: **+15 pts** (7.3%)
- Fastest single-check improvement available
- Sufficient to lift 3 of 4 Critical Risk firms into High Risk

---

## 7. Top 5 Marketing Statistics

Statistics that translate directly into outreach copy, sector reports, and media positioning.

### 1. "6 in 10 North Wales solicitor firms are High Risk or Critical Risk"
- Source: 21 of 35 firms (60%)
- Use: Headline statistic for press, sector reports, and cold outreach
- Authority: First complete regional cohort in this sector by Soterius

### 2. "Only 1 in 7 firms achieved a Good or Excellent security rating"
- Source: 5 of 35 firms (14%)
- Use: Demonstrates how few firms are genuinely well-protected — stronger framing than the
  positive "86% fail" version
- Audience: Law firm partners, practice managers, compliance officers

### 3. "80% of solicitor firms cannot prevent email spoofing — their domain can be used to
   send fraudulent emails to clients"
- Source: 28 of 35 firms without DMARC enforcement (80%)
- Use: Email fraud is a live threat to solicitors (conveyancing fraud, client money fraud);
  this statistic is specific, legally relevant, and alarming
- Audience: Senior partners, managing partners, risk and compliance

### 4. "The average North Wales solicitor scores 579 out of 999 — a High Risk rating"
- Source: Average rating 579/999
- Use: Anchors the conversation with a tangible benchmark; allows any individual firm to
  compare themselves to the sector average
- Audience: Any solicitor firm — especially those who think they are "probably fine"

### 5. "89% of firms are missing at least one critical browser security control that could
   take under 30 minutes to fix"
- Source: 31 of 35 firms missing Referrer-Policy (89%); all header checks remediable
  via web server config
- Use: Shifts the conversation from "expensive security project" to "quick, actionable fix"
- Audience: IT managers, practice managers, anyone who is risk-aware but resource-constrained

---

## 8. Top 5 Sales Talking Points

Statements to use in prospect conversations that connect the benchmark data to commercial action.

### 1. "We can show you exactly where you rank against every other solicitor firm in your area"
The benchmark cohort is a genuine differentiator. No competitor has this data for this sector
in this region. A prospect can see their precise position — not just "you scored X" but
"you are in the bottom third of the sector."

### 2. "Most firms can improve by 10–20 percentage points in a single afternoon"
The header remediation story is commercially powerful because it converts security from a
long, expensive project into a concrete, same-day result. A firm that moves from High Risk to
Moderate Risk or Good in one session is a visible, shareable success story.

### 3. "Email fraud is the specific threat your firm faces — and 80% of firms in this area
   have nothing in place to prevent it"
Conveyancing fraud, misdirected client funds, and impersonation of fee earners are live,
sector-specific risks. DMARC enforcement is the technical control that prevents email spoofing.
Connecting the technical finding to a concrete financial crime risk is the most compelling
possible framing for a solicitor audience.

### 4. "Your score will change over time — and we can show you whether it is improving or
   declining month on month"
Score trend monitoring is a natural upsell from a one-time scan. Firms that have fixed their
headers need to know if they drift back. Firms monitoring DMARC enforcement need to track
policy changes. The subscription value proposition is inherent in the data model.

### 5. "A Good or Excellent rating puts you in the top 14% of your sector — that is a
   genuinely differentiated position"
Only 5 of 35 firms achieved Good or Excellent. Any firm that achieves this status is an
outlier by objective measurement. That is a legitimate marketing claim, a trust signal for
clients, and a foundation for a future Soterius Trust Mark.

---

## What the Data Says

### What is the biggest security weakness in this sector?

**Security headers — collectively and individually.** The Security Headers category averages
just 20% across the cohort (compared to SSL/TLS at 92%). Five distinct header checks appear
in the top 10 most-failed checks. The category represents 50 of 206 maximum points (24% of
the total score). Nearly every firm in the cohort is operating with a browser security layer
that is essentially empty.

The contrast with SSL/TLS (92% average) is striking: firms have HTTPS, but none of the
hardening that sits on top of it. They have the foundation and nothing above it.

### What is the most neglected control?

**Referrer-Policy**, with an 89% failure rate — the highest of any individually verifiable check.
This is also the cheapest possible fix: a single line in a web server configuration. The gap
is not caused by cost, complexity, or awareness of risk. It is caused by the absence of anyone
who knows to add it.

### What is the easiest improvement for most firms?

**Fixing all five security headers in a single session.** An IT provider or developer who
understands web server configuration can implement all five in under an hour. Combined, they
are worth 50 points — 24% of the total possible score. For a firm currently in the lower
half of High Risk, this single session can push them to Moderate Risk or Good.

No other remediation offers this combination of impact, speed, and accessibility.

### What finding surprised us?

**The SSL/TLS versus headers divergence.** SSL/TLS averages 92% while Security Headers
average 20%. These two categories are logically adjacent — HTTPS is the transport layer,
HSTS is the browser-enforcement layer on top of it. A firm that has implemented HTTPS
correctly is typically 10 minutes away from also implementing HSTS. Yet almost no firm
has made that connection.

This strongly implies that SSL/TLS was imposed on firms by their hosting providers
(Let's Encrypt, cPanel auto-HTTPS, WordPress plugins) rather than adopted deliberately.
The security benefit was received passively. Everything above that baseline requires
deliberate action — and almost no firm has taken it.

This is a commercial opportunity, not a failure. The gap between what firms have done
passively and what they could do actively is large, accessible, and clearly defined.

### What would make the biggest difference to the benchmark over the next 12 months?

**DMARC enforcement reaching 70%+ of the cohort** (from 40% today). DMARC is the
single highest-weighted email check (40 pts out of 56 possible email points). Currently
15 firms have no DMARC record and 13 have `p=none` — neither provides meaningful
protection. Moving all 28 affected firms to `p=quarantine` or `p=reject` would:

- Increase the cohort average rating by approximately 50–80 points
- Move the sector from 80% unprotected to 80% protected on the most fraud-relevant control
- Make the Soterius benchmark a credible measure of sector-level improvement over time

DMARC also has a natural monitoring requirement — firms cannot publish p=reject safely
without watching what happens. That sustained engagement is exactly the foundation a
recurring monitoring product is built on.

---

## Commercial Implications

### What services should Soterius prioritise?

**Priority 1 — Security header configuration service**
High volume (89% of firms need it), low delivery effort (web server config), immediate
visible result. Ideal as a first paid engagement — low barrier to entry, high satisfaction.
Can be delivered remotely, documented, and repeated across hundreds of firms.

**Priority 2 — DMARC implementation and monitoring service**
Highest-impact single remediation for email risk. Requires phased delivery over 4–8 weeks
(monitor → quarantine → reject). Natural fit for a recurring service: monitoring must
continue after enforcement is in place. This is the most direct route to predictable
monthly revenue.

**Priority 3 — Benchmark comparison report**
A paid report showing a firm its precise position in the sector cohort — their score,
their band, their position relative to named peers (or anonymised peer ranges). Differentiated
by the fact that no competitor has this data. A natural entry point for firms who have
just received a free scan and want to understand the competitive context.

### What should be included in a future Trust Mark?

Based on Cohort 001 data, a Soterius Trust Mark should require a minimum of:

| Requirement | Rationale |
|---|---|
| HSTS present (PASS) | 77% fail; high value, easy to achieve |
| Content Security Policy (PASS or WARNING) | 86% fail; foundational browser protection |
| SPF valid (PASS) | 89% already have it; floor-level requirement |
| DMARC ≥ p=quarantine | 60% do not enforce; the fraud-prevention requirement |
| No known CVEs in detected software | Directly linked to breach risk |
| Overall rating ≥ Good (75% / 749+) | Only 14% of cohort currently qualify — aspirational but achievable |

The Trust Mark eligibility rate in Cohort 001 is approximately 14% (5 firms). That scarcity
gives it commercial value. As more firms remediate, eligibility rises — which is the desired
outcome for both Soterius and the sector.

### What should be monitored monthly?

| Monitor | Reason |
|---|---|
| DMARC policy | Firms sometimes revert from `p=reject` to `p=none` after mail delivery issues |
| SSL certificate expiry | 30-day warning = WARNING status; 0 days = FAIL. Alert before it hits |
| Security headers | Headers can be removed by hosting changes, CMS upgrades, or plugin updates |
| CVE status in detected stack | New vulnerabilities are disclosed continuously |
| Overall score delta | Month-on-month change — key metric for any monitoring subscription |

### Which findings support a recurring subscription model?

**DMARC** — Requires sustained monitoring (minimum 2–4 weeks per policy level; ongoing watch
for email delivery issues that force downgrade). Not a one-time fix.

**CVE tracking** — New vulnerabilities are disclosed monthly. A firm that is clean today may
not be clean in 60 days. Continuous scanning is the only way to stay current.

**Score trend** — A score that improves month-on-month is a product. A score dashboard that
shows trajectory justifies a subscription more naturally than any one-time report.

**Header drift** — Security headers can silently disappear after web server updates, CMS
upgrades, or hosting migrations. A monthly scan catches regression before it becomes exposure.

---

## Board Recommendations

Ranked by expected commercial impact over the next 12 months.

| Priority | Action | Rationale |
|---|---|---|
| 1 | **Launch DMARC implementation service** | Highest-value check (40 pts), recurring engagement model, sector-specific fraud risk story. Most direct route to monthly revenue. |
| 2 | **Launch security header configuration service** | 89% failure rate, low delivery cost, immediate visible result. High volume, fast to sell, easy to deliver. Natural first paid engagement. |
| 3 | **Define and publish Trust Mark eligibility criteria** | 14% of firms currently qualify. Scarcity gives it value. Eligibility is a purchase incentive for the other 86%. |
| 4 | **Build score improvement case studies** | Before/after comparisons from Cohort 001 remediations. Proof that Soterius interventions work. Required for sales credibility at scale. |
| 5 | **Publish sector findings as a lead generation report** | "North Wales Solicitor Security Report 2026" — media-ready, SEO-relevant, positions Soterius as the authority. Drives inbound from the 35 firms and their networks. |
| 6 | **Expand benchmark to 250 firms across 3 sectors** | Solicitors + accountants + IFAs. Cross-sector comparisons add analytical depth and expand the addressable market. |
| 7 | **Launch monthly monitoring subscription** | DMARC policy, CVE alerts, score trend, header drift detection. Low per-firm cost, predictable ARR, natural upsell from any paid engagement. |
| 8 | **Build sector benchmark comparison report product** | Paid report: "Here is your score. Here is where you sit in the sector. Here are the three things to fix first." Monetises the cohort data directly. |
| 9 | **Develop IT provider partner channel** | The security header and DMARC fixes are delivered by the firm's existing IT provider. Partnering with those providers scales delivery without hiring. |
| 10 | **Commission sector survey to validate findings** | A short self-reported survey across the cohort validates whether scanner findings align with perceived security posture. Adds credibility to the benchmark and identifies firms that have already invested in security without it showing in their score. |

---

*Soterius Security Rating v1.0*
*Benchmark Insights 001 — North Wales Solicitors*
*Commercial and strategic analysis — 2026-06-14*
