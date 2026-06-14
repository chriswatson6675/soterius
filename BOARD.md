# Soterius Board Decisions

Board-level record of major decisions and approvals. Operational decisions are in DECISIONS.md.

---

| Date | Decision | Owner | Status |
|---|---|---|---|
| 2026-06-14 | Benchmark Insights 001 — commercial and strategic analysis complete | CEO | Recorded |
| 2026-06-14 | Benchmark Cohort 001 Closed — 35 firms, validated baseline established | CEO | Completed |
| 2026-06-13 | Benchmark Cohort 001 — Initial Analysis Complete | CEO | Active |
| 2026-06-13 | Benchmark Cohort 001 approved — North Wales Solicitor Benchmark, 71 firms | CEO | Active |
| 2026-06-13 | Phase transition — Foundation Phase complete, Benchmark Phase active | CEO | Active |
| 2026-06-13 | Build first Soterius benchmark dataset — 250 professional services firms | CEO | Active |
| 2026-06-13 | Repository designated as single source of truth for all product, technical and business decisions | CEO | Implemented |
| 2026-06-13 | Three-phase product evolution approved: Phase 1 Security Rating, Phase 2 Monitoring, Phase 3 Digital Risk Management | CEO | Phase 1 complete, Phase 2 in progress |
| 2026-06-13 | Score History, Trend Analysis, and Change Detection approved for implementation | CEO | Implemented |
| 2026-06-13 | Security Rating v1.0 methodology approved for launch | CEO | Implemented |
| 2026-06-13 | Permanent scan history storage approved — every scan retained indefinitely | CEO | Implemented |
| 2026-06-12 | Executive PDF report approved for launch | CEO | Implemented |
| 2026-06 | Soterius platform approved for launch targeting UK regulated professional services firms | CEO | Implemented |

---

## Decision Detail

### 2026-06-14 — Benchmark Insights 001: Three Most Important Commercial Findings

**Status:** Recorded

**Source:** BENCHMARK_INSIGHTS_001.md — full commercial and strategic analysis of Cohort 001.

---

**Insight 1: The SSL/TLS vs. Security Headers divergence is the defining commercial opportunity.**

SSL/TLS averages 92% across the cohort. Security Headers average 20%. These categories are logically adjacent — HTTPS is the transport layer, headers are the browser-enforcement layer above it. The gap exists because SSL/TLS was imposed on firms passively (by hosting providers, browsers, Let's Encrypt). Everything above that baseline requires deliberate action. Almost no firm has taken it.

The commercial implication: fixing all five security headers is worth 50 points — 24% of the total possible score — and can be done in under an hour. A High Risk firm in the 50–59% range that fixes all headers in a single session can move to Good, skipping Moderate entirely. This is the fastest, highest-leverage remediation available to this cohort and the most natural first paid engagement for Soterius.

---

**Insight 2: DMARC enforcement is the most dangerous gap — and the best recurring revenue opportunity.**

80% of firms have no DMARC enforcement (46% have no record; 34% have `p=none`). DMARC is the only technical control that prevents email spoofing. For solicitors — who handle client money, conveyancing instructions, and confidential correspondence — email fraud is not a theoretical risk. It is a live, documented threat. The 40-point DMARC check is the single most heavily weighted check in the scoring model.

The commercial implication: DMARC remediation cannot be done in an afternoon. It requires 4–8 weeks of phased monitoring (p=none → p=quarantine → p=reject). That sustained engagement is the foundation of a recurring service. Unlike headers, DMARC must be maintained — firms that reach p=reject can revert under pressure from email delivery issues. Monitoring is required indefinitely.

---

**Insight 3: Only 14% of firms achieve Good or Excellent — Trust Mark scarcity is an asset, not a problem.**

5 of 35 firms (14%) currently meet the standard for a Good or Excellent rating. This is the right level of scarcity for a Trust Mark to have commercial value. If 80% of firms could achieve it immediately, it means nothing. If 14% hold it and the rest can see a clear path to qualifying, it becomes an aspirational purchase incentive for the other 86%.

The commercial implication: define Trust Mark eligibility criteria now, based on Cohort 001 data, before the market is saturated. Anchor it at Good (75%+) with minimum requirements on HSTS, CSP, SPF, and DMARC enforcement. Publish eligibility. Then sell the remediation pathway.

---

### 2026-06-14 — Benchmark Cohort 001 Closed

**Status:** Completed

**Date:** 2026-06-14

**Summary:** Benchmark Cohort 001 has been completed, validated, and accepted as the baseline benchmark dataset for Soterius.

The cohort underwent the following validation steps:

- Scanner validation
- Scoring validation
- DNS email detection bug fix
- Data quality review
- Duplicate removal
- Invalid domain removal
- Benchmark regeneration

**Final Cohort Statistics:**

| Metric | Value |
|---|---|
| Firms Analysed | 35 |
| Average Rating | 579 / 999 |
| Median Rating | 559 / 999 |
| Rating Range | 110 – 949 |

**Risk Distribution:**

| Band | Firms |
|---|---|
| Excellent | 2 |
| Good | 3 |
| Moderate Risk | 9 |
| High Risk | 17 |
| Critical Risk | 4 |

**Security Findings:**

| Metric | Rate |
|---|---|
| SPF Adoption | 89% |
| DKIM Adoption | 54% |
| DMARC Adoption | 57% |
| DMARC Enforcement | 40% |
| SSL/TLS Average | 92% |

**Key Observations:**

- 60% of firms were classified as High Risk or Critical Risk.
- Only 14% of firms achieved a Good or Excellent rating.
- Email security adoption was stronger than initially expected.
- DMARC enforcement remains low across the cohort.
- Security controls beyond SSL/TLS appear to be the primary source of risk.

**Strategic Outcome:** Benchmark Cohort 001 is now considered the trusted baseline dataset for future benchmarking, trend analysis, and market intelligence activities.

**Next Phase:** Transition from Build & Validation to Growth & Commercialisation. Future benchmark cohorts will be compared against Benchmark Cohort 001 as the reference baseline.

**Top 3 findings across the cohort (from BENCHMARK_FINDINGS_001.md):**

| Rank | Finding | Firms Affected |
|---|---|---|
| 1 | Referrer-Policy missing | 31 of 35 (89%) |
| 2 | Content Security Policy missing or misconfigured | 30 of 35 (86%) |
| 3 | DMARC not enforced (no record or p=none) | 28 of 35 (80%) |

Security headers are the dominant finding class. All five header checks appear in the top 10; all are remediable through web server configuration without application code changes. DMARC enforcement is the primary email security gap — 46% of firms have no DMARC record at all.

---

### 2026-06-13 — Benchmark Cohort 001: Initial Analysis Complete

**Status:** Active — data collection ongoing

**Milestone:** Initial analysis complete on Benchmark Cohort 001 (North Wales Solicitor Benchmark).

**Approximate risk distribution (initial analysis):**

| Risk Band | % of Firms |
|---|---|
| Critical Risk | 28% |
| High Risk | 50% |
| Moderate Risk | 13% |
| Good | 4% |
| Excellent | 2% |

**Key observation:** Approximately 78% of firms fell into High Risk or Critical Risk categories. The scoring model demonstrated meaningful separation between firms.

**Conclusion:** Security Rating v1.0 methodology retained. Initial results indicate the model produces realistic score differentiation and commercially credible outcomes. Full assessment to follow after 250 firms have been analysed.

---

### 2026-06-13 — Benchmark Cohort 001: North Wales Solicitor Benchmark

**Decision:** Benchmark Cohort 001 is approved as a complete regional cohort — all solicitor firms within 25 miles of LL30 2UB (71 firms).

**Owner:** CEO

**Status:** Active

**Scope:** All solicitor firms within 25 miles of LL30 2UB.

**Target size:** 71 firms.

**Objectives:**
- Establish first regional benchmark dataset
- Validate Security Rating v1.0
- Measure adoption of key controls (DMARC, security headers, SSL/TLS)
- Identify common security weaknesses across the sector
- Produce first Soterius benchmark report

**Success criteria:**
- All 71 firms scanned
- Scores recorded
- Risk bands recorded
- Benchmark statistics generated
- Findings documented

**Rationale:** A full regional cohort provides stronger statistical value, more credible reporting, and richer calibration data than a sample-based pilot. Scanning every firm in a defined geographic area produces a complete picture rather than a partial one.

**Expected outcome:** First Soterius benchmark report covering all solicitor firms within 25 miles of LL30 2UB.

---

### 2026-06-13 — Phase Transition: Foundation Phase Complete, Benchmark Phase Active

**Decision:** Foundation Phase is declared complete. Benchmark Phase is now the active company objective.

**Owner:** CEO

**Status:** Active

**Phase summary:**

| Phase | Status | Description |
|---|---|---|
| Foundation Phase | ✅ Complete | Platform built, scoring defined, reporting live, scan history stored, calibration framework in place |
| Benchmark Phase | 🔄 Active | Build first proprietary benchmark dataset — 250 professional services firms |
| Growth Phase | Planned | Monitoring subscriptions, admin dashboard, marketing using benchmark data |

**Benchmark Phase objective:** Build the first Soterius benchmark dataset and establish industry baseline security metrics for professional services firms.

**Benchmark Phase milestones:**

| Milestone | Firms | Significance |
|---|---|---|
| Initial validation | 25 | First real-world signal — are scores plausible? |
| Early benchmark | 50 | Sector patterns begin to appear |
| Sector patterns emerge | 100 | Statistically meaningful per-sector distributions |
| Benchmark dataset established | 250 | Full dataset — all success criteria met |

**Rationale:** Core platform, scoring, reporting, historical storage, and calibration framework are now complete. The platform can scan, score, store, and compare. The immediate focus shifts from building infrastructure to collecting market intelligence and validating commercial assumptions.

---

### 2026-06-13 — Build First Soterius Benchmark Dataset

**Decision:** Soterius will build the first proprietary benchmark dataset by scanning 250 UK professional services firms before expanding product functionality.

**Owner:** CEO

**Status:** Active

**Target:** 250 firms scanned across solicitors, accountants, financial advisers, and surveyors.

**Success Criteria:**
- 250 firms scanned using Security Rating v1.0
- Sector benchmarks established (average score per sector)
- Risk band distribution established across the full sample
- DMARC adoption rate established
- Security header adoption rate established
- Average scores by sector calculated

**Rationale:** Before expanding product functionality, Soterius must understand the real-world security posture of professional services firms. Benchmark data underpins the marketing proposition, validates the scoring model, establishes the foundations for a future trust mark, and demonstrates the value proposition for monitoring subscriptions.

**Expected outcomes:**
- Benchmark statistics for use in sales and marketing
- Marketing insights into sector-level risk posture
- Validation (or recalibration) of Security Rating v1.0
- Data foundation for future Digital Trust Mark eligibility thresholds
- Evidence base for the monitoring value proposition ("your score declined — here's what changed")

**Process:** See [CALIBRATION.md](CALIBRATION.md) for the full workflow.

---

### 2026-06-13 — Repository as Single Source of Truth

**Decision:** The Soterius repository becomes the single source of truth for all product, technical and business decisions. BOARD.md, DECISIONS.md, SCORING.md, ARCHITECTURE.md, ROADMAP.md, VISION.md, and CHANGELOG.md are the authoritative reference documents.

**Owner:** CEO

**Status:** Implemented

**Rationale:** As the platform scales, decisions must be traceable, auditable, and accessible to all contributors without relying on conversation history or tribal knowledge.

---

### 2026-06-13 — Security Rating v1.0 Approved

**Decision:** Security Rating v1.0 methodology approved as the launch scoring model. Five-band risk system (Critical/High/Moderate/Good/Excellent) on a 0–999 scale. Full specification in SCORING.md.

**Owner:** CEO

**Status:** Implemented

---

### 2026-06-13 — Three-Phase Product Evolution Approved

**Decision:** Soterius evolves as: Phase 1 (Security Rating) → Phase 2 (Security Rating + Monitoring) → Phase 3 (Digital Risk Management). Full specification in VISION.md.

**Owner:** CEO

**Status:** Phase 1 complete. Phase 2 in active development.

---

# Strategic Questions Under Review

Questions raised at board level that do not yet have a decision. Recorded here for visibility and future review. These are not decisions — they are open questions.

---

## SQ001 — What business is Soterius ultimately becoming?

**Status:** Closed — answered by D028

**Raised:** 2026-06-14  
**Closed:** 2026-06-14

**Background:**

During Benchmark Cohort 001 and subsequent commercial strategy reviews, it became clear that Soterius may contain multiple potential business models. The current platform can be viewed through four different lenses.

---

### Business A — Security Rating Platform

Scan → Score → Report

| Characteristic | Assessment |
|---|---|
| Route to market | Fastest |
| Implementation complexity | Lowest |
| Defensibility | Lowest |
| Competitive market | Most competitive |

A clearly defined product with an immediate commercial use case. The risk is that the scan-and-score model is replicable. Differentiation depends on execution quality, brand, and sector focus rather than structural moat.

---

### Business B — Benchmark Intelligence Platform

Scan → Compare → Rank → Benchmark

| Characteristic | Assessment |
|---|---|
| Data compounds over time | Yes — each scan adds to the asset |
| Defensibility | Stronger — first-mover advantage in a defined sector |
| Proprietary market intelligence | Yes — no competitor has this data |
| Benchmark products | Sector reports, cohort comparisons, trend analysis |

The benchmark dataset is a structural asset. A competitor entering the market cannot buy two years of scanned, validated, sector-specific data. The longer the dataset grows, the harder it is to replicate.

---

### Business C — Monitoring Platform

Monitor → Alert → Track → Improve

| Characteristic | Assessment |
|---|---|
| Revenue model | Recurring — monthly subscription |
| Customer retention | High — ongoing relationship |
| Client value | Continuous assurance, not a one-time report |
| Trust mark maintenance | Natural fit — score must be maintained to hold certification |

Monitoring converts a one-time transaction into an ongoing relationship. The commercial model is more predictable and the customer lifetime value is substantially higher than one-off services.

---

### Business D — Trust Certification Platform

Assess → Verify → Monitor → Certify

| Characteristic | Assessment |
|---|---|
| Strategic moat | Highest |
| Long-term defensibility | Strongest |
| Execution difficulty | Highest |
| Requirements | Governance, evidence standards, market credibility, accreditation |

If Soterius becomes the recognised certification authority for digital security in UK professional services, the moat is substantial. Certification businesses are rare, high-margin, and difficult to displace once established. The challenge is the credibility required to get there — which takes time, volume, and third-party validation.

---

### Observation

These four businesses are not mutually exclusive. They may represent a natural progression:

```
Security Rating  →  Benchmark Intelligence  →  Monitoring  →  Trust Certification
     (now)                (building)             (next)           (future)
```

The Security Rating may be the entry point rather than the destination.
The benchmark dataset may become the most defensible strategic asset.
The Trust Mark may ultimately be the highest-value product Soterius can offer.

---

### Board Question

Which of these businesses should Soterius optimise for over the next 3–5 years?

Optimising for Business A (Security Rating) means prioritising volume, simplicity, and speed. Optimising for Business D (Trust Certification) means prioritising credibility, standards, and governance — at the cost of near-term speed.

The answer may determine hiring priorities, product sequencing, pricing strategy, and partnership decisions.

**This question remains open.** It should be revisited after:

- Benchmark expansion (250+ firms scanned)
- Market validation (first commercial revenue from Offers 1, 2, and 3)
- Digital Trust Framework design (D027)
- Initial commercial traction (conversion rates, subscription retention, customer feedback)
