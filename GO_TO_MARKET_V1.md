# Soterius — Go to Market v1
## First Commercial Offering

**Version:** 1.0
**Date:** 2026-06-14
**Informed by:** BENCHMARK_REPORT_001.md · BENCHMARK_INSIGHTS_001.md
**Market:** UK regulated professional services — initial focus: solicitors

---

## The Commercial Starting Point

Soterius has something no competitor has: proprietary, verified benchmark data for a
defined market. 35 solicitor firms have been scanned, validated, and ranked. Their scores
are known. Their weaknesses are documented. The average is 579 out of 999 — High Risk.
60% of firms are rated High Risk or Critical Risk. 80% cannot prevent email spoofing.

This data is the product. The security scans are what generates it.

The go-to-market is not "sell a security scan." It is "tell a firm something true and
specific about their security posture that no one else can tell them — and then offer
to fix it."

---

## The Answers

### What is the easiest service to sell?

**A security header configuration service** — because 89% of firms fail these checks,
the problem is visible in 60 seconds, the fix takes under two hours, and the before/after
improvement is measurable the same day. Every conversation starts with a number the firm
can see. Every sale ends with a number that has gone up. There is no ambiguity and no
lengthy procurement process.

### What is the fastest service to deliver?

**Security header configuration** — web server config changes, no mail server access
required, no DNS propagation wait, no phased rollout. Remote session, 1–2 hours,
rescan on completion, PDF report delivered same day.

### What creates recurring monthly revenue?

**DMARC monitoring** — DMARC enforcement cannot be implemented safely in a single session.
The standard process is: publish `p=none` (monitoring) → review aggregate reports for
2–4 weeks → move to `p=quarantine` → confirm delivery for 2–4 weeks → move to `p=reject`.
Once at `p=reject`, firms require ongoing monitoring because:
- Email delivery issues cause firms to revert policies
- New sending services get added without SPF alignment
- DKIM keys expire or rotate

Monthly monitoring is not a nice-to-have. It is required for DMARC to stay in place.

### What should be offered free?

**The public security scan** — already live. A firm enters their website, receives their
Soterius Security Rating, and sees their risk band and category breakdown. This is the
lead generation engine. It is also the proof of concept: the scan shows the problem;
the paid services fix it.

Additionally: **cohort comparison by personalised outreach**. The 35 firms in Cohort 001
should receive a direct, personalised message showing their score and their rank within
the cohort. "Your firm scored 529 out of 999. The average for solicitor firms in your
area is 579. Here are the three most common issues we found." This costs nothing to send.
It opens conversations that no cold pitch can.

### What should be offered as a one-off payment?

- **Security header configuration** (Offer 1 — see below)
- **Email security implementation** — SPF audit + DMARC implementation through to
  enforcement (Offer 2, with the option to continue as a subscription)
- **Benchmark comparison report** — a written report showing a firm's position within
  the sector cohort, their top findings, and a scored remediation roadmap

### What should be offered as a subscription?

- **Monthly security monitoring** (Offer 3 — see below)
- **Trust Mark licence** (future) — firms that achieve Good or Excellent may display
  the Soterius Trust Mark; licence renewed annually subject to passing the most recent scan

---

## Offer 1 — Entry Product: Security Header Optimisation

### What it is

A one-session remote service that identifies and fixes all missing or misconfigured
security headers on a firm's public website, followed by a verified rescan and a
before/after PDF report.

### Why it exists

89% of cohort firms are missing Referrer-Policy. 86% are missing or have a weak
Content Security Policy. 77% are missing HSTS and X-Frame-Options. These five checks
are worth 50 points — 24% of the total possible score. A firm with no headers and a
current score of 50% (High Risk) can move to 74% (Moderate Risk) or higher in a
single session.

This is the entry point into the Soterius relationship. It is priced to remove friction,
deliver visible proof, and create trust for the next conversation.

### Target customer

Any solicitor firm currently rated High Risk or Critical Risk. Priority targets: firms
scoring 40–59% (High Risk), where headers are the most likely cause of the low score
and where improvement will cross a visible band threshold.

17 of 35 Cohort 001 firms are in High Risk. This offer is relevant to all 17.

### Deliverables

1. Pre-fix scan with full category breakdown
2. Identification of all missing or misconfigured security headers
3. Remote configuration session (or written instructions if firm has in-house IT)
4. Post-fix scan confirming improvement
5. Before/after PDF report with score change and updated risk band

### Estimated effort

| Activity | Time |
|---|---|
| Pre-scan and findings review | 30 min |
| Remote configuration session | 60–90 min |
| Post-scan and report generation | 30 min |
| **Total** | **2–2.5 hours** |

### Estimated value to customer

A firm moving from High Risk (e.g., 529 / 999) to Moderate Risk (e.g., 729 / 999)
in one session has:
- Eliminated its lowest-performing category (headers: 20% → 80%+)
- Reduced browser-level attack surface (clickjacking, MIME sniffing, referrer leakage)
- Produced a measurable compliance improvement documented in a PDF
- Moved up the benchmark ranking relative to their sector peers

The firm receives a tangible, permanent security improvement with an independent
verification report — for a cost equivalent to a few hours of a solicitor's time.

### Recommended pricing

| Tier | Price | Notes |
|---|---|---|
| Standard | **£395** | Single site, all 5 headers, PDF report, rescan |
| Priority (same-day) | **£495** | As above + same-day delivery commitment |

**What not to charge extra for:** the PDF report, the rescan, the before/after comparison.
These are the proof that the service worked. They are marketing assets, not line items.

---

## Offer 2 — Core Service: Email Security Implementation

### What it is

A managed, phased implementation of full email authentication: SPF audit, DKIM
configuration guidance, and DMARC implementation from initial monitoring through
to enforcement (`p=reject`). Delivered over 4–8 weeks. Concludes with a verified
final scan showing the email security score.

### Why it exists

80% of cohort firms have no DMARC enforcement. 46% have no DKIM record. The DMARC
check alone is worth 40 points — 19% of the total possible score. A firm that goes
from no DMARC record to `p=reject` gains 40 points. Combined with a DKIM fix (+8 pts),
that is 48 points — a 23% score increase — from one service engagement.

More importantly: for a solicitor firm handling client money, conveyancing instructions,
and confidential correspondence, email spoofing is not a hypothetical risk. It is the
specific mechanism behind conveyancing fraud, CEO impersonation, and misdirected payment
instructions. DMARC enforcement is the control that closes that attack vector.

This is the service with the most compelling risk narrative. It is also the service
that creates the most natural path to a recurring relationship.

### Target customer

Any firm with no DMARC record or `p=none`. The risk narrative is strongest for:
- Firms handling conveyancing (client money transfer instructions)
- Firms with no or low DKIM adoption (46% of cohort)
- Firms already aware of the SRA's guidance on email fraud and cybercrime

15 of 35 Cohort 001 firms have no DMARC record. 13 have `p=none`. 28 firms are
potential targets for this service.

### Deliverables

**Week 1:**
- SPF record audit (verify coverage of all sending services)
- DKIM setup guidance (confirm with mail provider; publish record)
- DMARC `p=none` record published (monitoring begins)
- Baseline scan

**Weeks 2–4:**
- DMARC aggregate report review (identify all legitimate sending sources)
- SPF alignment check
- DKIM alignment confirmation
- Written summary of monitoring findings

**Week 4–6:**
- DMARC policy upgraded to `p=quarantine`
- Monitoring continues (confirm no legitimate mail affected)

**Week 6–8:**
- DMARC policy upgraded to `p=reject`
- Final scan with verified email security score
- Completion report: before/after email security score, policy history, ongoing
  monitoring recommendations

### Estimated effort

| Activity | Time |
|---|---|
| Initial audit and setup (Week 1) | 2–3 hours |
| Report reviews (Weeks 2–6, 3× sessions) | 3 hours total |
| Policy upgrade and confirmation (×2) | 1 hour total |
| Final scan and completion report | 1 hour |
| **Total** | **7–8 hours over 6–8 weeks** |

### Estimated value to customer

A firm moving from no DMARC to `p=reject` with DKIM configured:
- Gains 48 points (23% score increase)
- Closes the primary email fraud attack vector specific to their sector
- Produces documented evidence of security improvement for professional indemnity
  or SRA compliance purposes
- Can legitimately state to clients and insurers that email authentication is in place

The risk prevented — a single conveyancing fraud incident — can cost a solicitor firm
tens of thousands of pounds in client losses, compensation, and reputational damage.
This service costs a fraction of one incident.

### Recommended pricing

| Tier | Price | Notes |
|---|---|---|
| Standard (8-week) | **£850** | SPF audit, DKIM guidance, DMARC p=none → p=reject, completion report |
| Accelerated (6-week) | **£1,100** | As above + dedicated weekly check-ins, priority response |
| Email + Headers Bundle | **£1,095** | Offer 1 + Offer 2 combined — natural upsell; same client, same engagement |

**Upsell note:** A firm that has purchased Offer 1 has already established trust and
seen a visible result. Converting that to Offer 2 in the same conversation, or within
30 days, is the most efficient use of commercial effort. The bundle price preserves
value while reducing friction.

---

## Offer 3 — Monitoring Subscription: Monthly Security Score

### What it is

A monthly automated rescan of the firm's website and email infrastructure, with a
summary report showing score, any changes since the previous month, and alerts for
newly detected issues. Delivered as a one-page PDF or email digest.

### Why it exists

A security posture that improves once and then drifts is not a security posture — it
is a snapshot. Security headers can be silently removed by CMS upgrades or hosting
migrations. DMARC policies can be downgraded by an IT provider responding to mail
delivery issues. New CVEs are disclosed monthly against commonly-used CMS platforms.
SSL certificates expire.

No firm that has invested in Offers 1 and 2 wants that investment to decay unnoticed.
Monthly monitoring is the insurance policy on the work already done.

It is also the natural follow-on from any completed service engagement. The conversation
at the end of Offer 2 is: "We have brought you to `p=reject`. To keep you there, here
is what we need to monitor every month."

### Target customer

Any firm that has completed Offer 1 or Offer 2. Also any firm that has a known DMARC
policy in place and wants confirmation it has not drifted. Progressively, any firm
concerned about ongoing compliance or preparing for a Trust Mark application.

Realistically: every firm that has purchased Offer 1 or Offer 2 is a natural subscriber.
Conversion should be positioned as the final step of every service engagement, not a
separate sale.

### Deliverables

Each month:

1. Full automated rescan
2. Score vs. prior month (delta highlighted)
3. Any new failures or regressions flagged (header removed, DMARC downgraded, CVE detected)
4. SSL certificate expiry warning (if < 60 days)
5. One-page PDF or email summary

Quarterly:
6. Trend summary (3-month score movement, category breakdown comparison)
7. Updated cohort ranking (where available)

### Estimated effort

| Activity | Time |
|---|---|
| Automated rescan | < 5 min (automated) |
| Review and report generation | 30–45 min/month |
| Escalation response (if issue found) | 30 min (occasional) |
| **Effective delivery cost** | **~45 min/month per client** |

At scale, report generation becomes semi-automated from scan output. Marginal cost
per additional subscriber approaches zero.

### Estimated value to customer

- Continuous assurance that remediation work has not regressed
- Early warning on SSL expiry, DMARC downgrade, CVE disclosure
- An auditable monthly record of security posture for compliance, PI insurance, or
  SRA purposes
- A visible, tracked score that demonstrates improvement over time

### Recommended pricing

| Tier | Price | Notes |
|---|---|---|
| Essential | **£95/month** | Monthly rescan + one-page summary report |
| Standard | **£145/month** | Monthly rescan + full findings report + quarterly trend summary |
| Annual (Standard, pre-paid) | **£1,450/year** | 2 months free vs. monthly; improves cashflow and reduces churn |

**Positioning note:** £145/month is the cost of approximately one hour of a solicitor's
billable time. It is priced to feel proportionate rather than significant — a utility
bill, not a project budget.

---

## Recommended First-Year Revenue Model

### Assumptions

- Primary market: 35 firms in Cohort 001 (already scanned, scores known)
- Expansion: Remaining 36 firms from the original 71-firm target cohort
- Second cohort: 35 additional firms (second region or second sector)
- Outreach method: Direct, personalised — score-led, not pitch-led
- No paid advertising in Year 1

### Realistic conversion rates

| Cohort | Firms | Offer 1 rate | Offer 2 rate | Offer 3 rate |
|---|---|---|---|---|
| Cohort 001 (known) | 35 | 35% (12 firms) | 20% (7 firms) | 60% of buyers (11 firms) |
| Cohort 001 expansion (71 target) | 36 | 25% (9 firms) | 15% (5 firms) | 60% of buyers (8 firms) |
| Cohort 002 (new) | 35 | 20% (7 firms) | 10% (4 firms) | 60% of buyers (7 firms) |

### Revenue projection — Year 1

**One-off revenue:**

| Service | Engagements | Avg price | Revenue |
|---|---|---|---|
| Offer 1 — Header Fix | 28 firms | £420 | £11,760 |
| Offer 2 — Email Security | 16 firms | £925 | £14,800 |
| Email + Headers Bundle | 8 firms | £1,095 | £8,760 |
| **One-off total** | | | **£35,320** |

**Recurring revenue (subscription):**

| Month | New subscribers | Cumulative | MRR (£145 avg) |
|---|---|---|---|
| Month 1–3 | 5 | 5 | £725 |
| Month 4–6 | 8 | 13 | £1,885 |
| Month 7–9 | 8 | 21 | £3,045 |
| Month 10–12 | 5 | 26 | £3,770 |

**Year 1 subscription revenue:** ~£22,000 (blended across ramp period)
**MRR at end of Year 1:** ~£3,770 → **ARR run rate: ~£45,240**

### Year 1 total

| Stream | Revenue |
|---|---|
| One-off services | £35,320 |
| Subscriptions | £22,000 |
| **Year 1 total** | **£57,320** |
| **ARR run rate at year end** | **£45,240** |

These projections are based on conservative conversion rates and a limited initial
addressable market. They do not include referrals, professional indemnity insurer
partnerships, or SRA-adjacent distribution that may become available as the benchmark
dataset grows.

### The number that matters most

**MRR at end of Year 1.** One-off revenue funds operations. Recurring revenue funds
growth. The goal of Year 1 is to reach £4,000+ MRR — at which point the subscription
base alone covers baseline operating costs and the business is no longer dependent on
new one-off sales to remain viable.

---

## Go-to-Market Principles

### 1. Lead with the data, not the pitch

Every outreach starts with a firm's score and their position in the cohort. "You are
ranked 26th out of 35 solicitor firms in your area. Your email security score is 21%."
This is not a pitch. It is a fact that the recipient cannot get anywhere else.

### 2. Sell the before/after, not the service

The deliverable is not "a header configuration session." It is "your score goes from
529 to 729 in one afternoon, and you have a PDF that proves it." Firms do not buy
security. They buy peace of mind, compliance evidence, and competitive differentiation.

### 3. Start with Cohort 001

All 35 firms already have a score. Outreach to these firms is not cold — they are
entering a conversation where Soterius already knows something specific about them.
This is the highest-conversion addressable market available. Work it completely
before expanding.

### 4. Price for conversion, not for margin

Offer 1 at £395 is priced to eliminate the question "is this worth it?" The answer is
demonstrably yes — two hours of IT time, a visible score improvement, and a PDF report.
Margin comes from volume and from the subscription that follows.

### 5. Every engagement ends with a subscription conversation

Offer 1 completion = natural entry point for Offer 2.
Offer 2 completion = natural entry point for Offer 3.
No engagement should end without a clear next step offered.

### 6. The benchmark is a moat

As the cohort grows — from 35 to 71 to 250 firms — the benchmark becomes harder to
replicate and more valuable to every firm in it. A firm that subscribed in Year 1 has
access to trend data. A firm that joins in Year 3 has to pay to catch up. The dataset
is the asset. Every scan adds to it.

---

*Soterius Go to Market v1.0*
*2026-06-14*
