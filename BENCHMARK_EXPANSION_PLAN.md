# Benchmark Expansion Plan
## From Cohort 001 to the First 250-Firm Digital Trust Dataset

**Version:** 1.0
**Date:** 2026-06-14
**Current state:** 35 validated solicitor firms (Cohort 001, North Wales)
**Target:** 250 firms across four professional services sectors
**Strategic context:** D028 (Digital Trust Platform), D029 (Make digital trust visible)

---

## Purpose

Cohort 001 proved that the scanning infrastructure works, the scoring model is credible,
and the data can be validated to a publishable standard. The 35-firm dataset is a proof
of concept. A 250-firm dataset across four sectors is a strategic asset.

The distinction matters. A proof of concept demonstrates capability. A strategic asset
is defensible, compounds over time, and becomes harder to replicate the longer it grows.
This plan is about building the latter.

---

## 1. Target Sectors

Four sectors have been identified as the primary expansion targets. All four share the
same characteristics: regulated by a professional body, handling client money or sensitive
personal data, dominated by SME firms without dedicated security resource, and publicly
listed on searchable registers.

| Sector | Regulator | Email fraud risk | Why this sector |
|---|---|---|---|
| Solicitors | SRA | Very high — conveyancing fraud, client money | Established baseline from Cohort 001; highest email fraud exposure |
| Accountants | ICAEW / ACCA | High — invoice fraud, financial data | Large volume, accessible registers, comparable profile to solicitors |
| Independent Financial Advisers | FCA | High — identity theft, investment fraud | Handle financial assets; strong regulatory context for trust signals |
| Surveyors | RICS | Medium — property transaction fraud | Completes professional services picture; overlaps with solicitor client base |

All four sectors are relevant to the SRA, FCA, ICAEW, ACCA, and RICS — professional
bodies that may eventually reference or endorse sector trust standards. Choosing regulated
sectors from the outset positions Soterius data as credible to those audiences.

---

## 2. Recommended Sample Sizes

**Total target: 250 firms**

| Sector | Target firms | Rationale |
|---|---|---|
| Solicitors | 100 | Largest addressable market in regional cohorts; highest email fraud risk; 35 already collected |
| Accountants | 75 | Second-largest sector by regional density; ICAEW/ACCA registers are comprehensive |
| IFAs | 50 | Smaller regional presence; FCA register is well-structured but density varies by area |
| Surveyors | 25 | Smallest regional population; included for cross-sector completeness |
| **Total** | **250** | — |

**Why 250:**
Below 50 firms per sector, averages are too sensitive to outliers to be meaningful.
At 100 solicitors, the dataset is statistically robust for sector-level claims.
At 250 total, cross-sector comparisons become credible and publishable.
At 250, the dataset is large enough to set defensible Trust Mark eligibility thresholds.

**Minimum viable per sector for publication:** 25 firms. Do not publish sector statistics
until this threshold is met. Premature publication with small samples undermines credibility.

---

## 3. Data Sources for Firm Lists

### Solicitors — SRA Regulated Firms Register
- **URL:** sra.org.uk/consumers/find-a-solicitor
- **Search by:** Town, postcode radius, or practice area
- **Data available:** Firm name, address, regulated status, authorisation number
- **Quality:** High — maintained by regulator; only authorised firms listed
- **Domain:** Not directly provided; identify from firm website or Google search

### Accountants — ICAEW / ACCA Member Firm Finders
- **ICAEW:** icaew.com/about-icaew/find-a-chartered-accountant
- **ACCA:** accaglobal.com/gb/en/member/find-an-accountant.html
- **Search by:** Location, service type
- **Quality:** High — regulated member directories
- **Note:** Some firms hold both ICAEW and ACCA membership; deduplicate before adding

### IFAs — FCA Financial Services Register
- **URL:** register.fca.org.uk
- **Search by:** Firm type (Independent Financial Adviser), postcode
- **Data available:** Firm name, address, regulatory permissions, authorisation number
- **Quality:** Very high — statutory register; legally required to be current
- **Note:** Filter for firms authorised for "advising on investments" — removes non-IFA firms

### Surveyors — RICS Find a Surveyor
- **URL:** ricsrecruitment.com/find-a-surveyor (or rics.org member search)
- **Search by:** Location, service type
- **Quality:** Medium — self-reported listings; not all RICS members are listed
- **Supplement with:** Google Maps local search for chartered surveyors in target area

### Secondary sources (all sectors)
- **Companies House:** companieshouse.gov.uk — confirms registered office address; useful for
  identifying trading name vs. legal entity name
- **Google Maps:** Identifies firms operating locally that may not appear on all registers
- **LinkedIn:** Useful for firm size estimation and identifying the correct trading domain

### Domain identification workflow
Many firms on professional registers do not include their website URL. The process for
identifying the correct domain is:

1. Search firm name + location in Google
2. Identify the primary trading website (not directory listings)
3. Verify it is the firm's own domain (not a referral site or aggregator)
4. Normalise: strip `https://`, `www.`, trailing paths — record the apex domain only
5. Spot-check: confirm the site is active and refers to the correct firm

---

## 4. Benchmark Collection Workflow

### Step 1 — Sector and region selection
Define the target cohort before beginning collection:
- Sector (solicitors / accountants / IFAs / surveyors)
- Region (town, postcode, radius)
- Source register (SRA / ICAEW-ACCA / FCA / RICS)
- Target firm count

Record the cohort definition in a new COHORT file (e.g., `COHORT_002.md`) before scanning
begins. The definition is fixed at collection start and not changed retrospectively.

### Step 2 — Firm list construction
- Export or manually compile the firm list from the relevant register
- Record: firm name, address, sector, source, register reference number
- Identify trading domain for each firm (see domain identification workflow above)
- Deduplicate: same firm under different names or domains counts as one entry

### Step 3 — Prospect creation
- Add each firm via Research Mode with all metadata fields populated:
  - `firm_name` — trading name as it appears on the register
  - `website` — apex domain (normalised)
  - `sector` — one of: solicitors, accountants, ifas, surveyors
  - `location` — town or postcode area
  - `source` — register name (sra-register, icaew-register, fca-register, rics-register)

Sector field is mandatory for all benchmark prospects. Do not add a firm without it.

### Step 4 — Scanning
- Scan each firm via Research Mode
- Review results immediately: flag any score ≤ 10% for domain verification
- Confirm low-scoring firms are genuinely active websites before including in the dataset
- If a domain is inactive or incorrect, identify the correct domain and rescan, or exclude
  with a documented reason

### Step 5 — Batch quality review
After each batch of 25 firms:
- Check for duplicates (same firm, different domain)
- Confirm sector field is populated for all
- Review low scores (≤ 10%) — verify or remove
- Update cohort statistics

### Step 6 — Milestone reporting
At each milestone checkpoint (50 / 100 / 250 firms), run the benchmark regeneration script
and produce an updated internal report. See milestone definitions below.

---

## 5. Data Quality Standards

Every firm in the dataset must meet all of the following before being counted in benchmark
statistics.

### Mandatory fields
| Field | Requirement |
|---|---|
| `firm_name` | Non-empty, matches register entry |
| `website` | Normalised apex domain (no www., no scheme, no trailing path) |
| `sector` | One of: solicitors, accountants, ifas, surveyors |
| `location` | Town or postcode area of the cohort |
| `source` | Register or source used to identify the firm |

### Domain standards
- Domain must respond to an HTTP or HTTPS request (site is active)
- Domain must belong to the firm in question (not a directory, aggregator, or redirect)
- Domain must not be a parked or holding page
- Firms with no public website are excluded from the dataset (they cannot be scanned)

### Deduplication rules
- One firm = one record, regardless of how many domains they operate
- If a firm has multiple active websites (e.g., main site + microsites), use the primary
  trading domain
- If two records refer to the same firm under different names, merge to one and delete
  the duplicate before finalising the cohort

### Low-score protocol
- Any firm scoring ≤ 10% must be manually verified before inclusion
- Verification: confirm the domain is the firm's active trading website
- If verified as correct and active: include, note in Data Quality section of report
- If inactive, parked, or incorrect: remove and replace with correct domain if available

### Scoring version consistency
- All scans in the dataset must use the same `scoringVersion`
- If the scoring methodology is updated (v1.0 → v1.1), a full rescan of the affected
  cohort is required before cross-cohort comparisons are made
- Mixed-version cohorts must not be compared directly

---

## 6. Benchmark Reporting Outputs

### Internal reports (produced at each milestone)
- Total firms, sector breakdown, scan success rate
- Average and median rating overall and per sector
- Rating range (min / max)
- Risk band distribution (overall and per sector)
- SPF / DKIM / DMARC / DMARC enforcement adoption rates (overall and per sector)
- Average category scores (SSL/TLS, Email, Headers, Vulnerable Components, GDPR)
- Top 10 failed checks (overall and per sector)
- Data quality notes (any exclusions, low-score flags, unresolved anomalies)

### Sector comparison reports (at 100+ firms)
- Side-by-side sector averages across all five scoring categories
- Risk band distribution comparison across sectors
- Email authentication adoption by sector
- Security header adoption by sector
- "Weakest sector" and "strongest sector" by average rating

### Public summary reports
Anonymised, aggregated data only. No firm-level scores or names.
Contents:
- Headline statistics suitable for press or marketing use
- Risk band distribution (% of firms per band, per sector)
- Top 5 most common failed checks by sector
- Adoption rates for key controls (DMARC, HSTS, CSP)
- Comparison to prior report (if available)

### Benchmark comparison report (paid product)
Delivered to individual firms:
- Their score vs. sector average
- Their risk band vs. sector distribution
- Their rank within the cohort (percentile)
- Their top 3 recommended actions with expected score impact
- Before/after comparison if a prior scan exists

---

## 7. Milestone Checkpoints

### Milestone 1 — 50 firms

**Target date:** End of benchmark expansion Phase 1
**Composition:** Cohort 001 (35 solicitors) + 15 additional firms from a second sector

**Objectives at this milestone:**
- First cross-sector data available (even if limited)
- Scoring model validated against a second sector
- Any sector-specific scoring anomalies identified (checks that don't apply, or apply
  differently, in a non-solicitor context)
- Internal report produced
- Outreach list for commercial services expanded to 50 firms

**Success criteria:**
- 50 firms scanned and validated to data quality standards
- At least 2 sectors represented
- Internal benchmark report produced
- No unresolved data quality issues

**Strategic checkpoint question:** Does the scoring model produce credible results across
multiple sectors, or does it need sector-specific adjustment?

---

### Milestone 2 — 100 firms

**Target date:** End of benchmark expansion Phase 2
**Composition:** 100 firms across solicitors, accountants, and IFAs (minimum 25 per sector)

**Objectives at this milestone:**
- Per-sector averages are statistically meaningful
- Cross-sector comparison report producible
- First public sector summary report publishable
- Marketing statistics are defensible (sample size ≥ 25 per sector)
- Trust Mark eligibility threshold draft proposed (based on distribution data)
- Commercial pipeline of firms from scan outreach

**Success criteria:**
- 100 firms scanned and validated
- At least 3 sectors represented with ≥ 25 firms each
- Cross-sector comparison report produced
- Public summary statistics approved for external use
- Draft Trust Mark eligibility thresholds proposed

**Strategic checkpoint question:** Is the dataset large enough to make a credible public
claim about the security posture of UK professional services firms? At 100 firms, the
answer should be yes.

---

### Milestone 3 — 250 firms

**Target date:** End of benchmark expansion Phase 3
**Composition:** 250 firms across all four sectors (100 solicitors / 75 accountants /
50 IFAs / 25 surveyors)

**Objectives at this milestone:**
- Digital Trust Dataset V1 complete and declared
- All four sectors represented with publishable data
- Full sector comparison report produced
- Trust Mark eligibility thresholds finalised
- Year-1 rescan of Cohort 001 undertaken (trend data available)
- Public sector report published as a lead generation and PR asset
- Monitoring subscription commercial model validated

**Success criteria:**
- 250 firms scanned and validated to data quality standards
- All four sectors represented at target sizes
- Data quality standards met across the full dataset
- Benchmark statistics complete for all sectors
- Trust Mark eligibility thresholds defined and documented
- At least one public-facing sector report published
- Digital Trust Dataset V1 formally declared complete in BOARD.md

**Strategic checkpoint question:** Is this dataset genuinely defensible? Would a competitor
entering the market today need 12–18 months of sustained effort to replicate it? If yes,
the dataset has become a moat. If no, identify what is missing.

---

## 8. Which Statistics Become Strategic Assets

Not all statistics are equally valuable. The following become strategic assets because they
cannot be generated quickly, cannot be purchased, and become more valuable as the dataset grows.

### Tier 1 — Highest strategic value (irreplaceable over time)

| Statistic | Why it is an asset |
|---|---|
| Sector average Security Rating (per sector, over time) | Establishes the baseline; year-over-year change shows whether the sector is improving |
| Risk band distribution per sector | The percentage of firms at High or Critical Risk; drives marketing claims and urgency |
| DMARC enforcement rate per sector | The most fraud-relevant single metric; cited by insurers and professional bodies |
| Longitudinal score data | How individual firms' scores change after remediation; proves the product works |
| Regional variation data | Whether North Wales firms differ from London firms; drives regional campaign targeting |

### Tier 2 — High value (require volume to be meaningful)

| Statistic | Why it is an asset |
|---|---|
| Top 10 failed checks per sector | Reveals sector-specific security patterns that generic scanners cannot see |
| Sector-level CVE exposure rates | Identifies whether a sector has a common technology stack with known vulnerabilities |
| Security header adoption rates by sector | Proves the easy wins are still being missed — repeatedly useful as a marketing stat |
| Cohort improvement rates | % of firms that improved after commercial engagement — validates the service model |

### Tier 3 — Useful but replicable

| Statistic | Why it is useful | Why it is less defensible |
|---|---|---|
| Overall sector average at a point in time | Headline marketing stat | Any competitor with the same sample can produce a similar number |
| SSL/TLS adoption rates | Shows baseline but expected to be near 100% sector-wide | Confirms the norm rather than the gap |

The Tier 1 statistics require sustained, multi-year data collection. Any competitor who
decides today to build a comparable dataset is 12–24 months behind. That gap is the moat.

---

## 9. Which Benchmark Findings Should Be Publicly Publishable

### Publish freely (aggregated, anonymised)

- Sector average Security Ratings
- Risk band distributions (% of firms per band, per sector)
- Top failed checks by sector (check name and % affected — no firm names)
- DMARC, SPF, DKIM adoption rates by sector
- Security header adoption rates by sector
- Year-over-year trend data (if available)
- Regional comparisons (North Wales vs. national average, once national data exists)

**Purpose:** Lead generation, PR, media coverage, professional body engagement.
These statistics are compelling enough to generate inbound interest and drive demand
for the paid benchmark comparison report.

### Publish with firm consent only

- Named firm scores
- Named firm rankings
- Named firm improvement case studies (before/after)
- Testimonials linked to specific scan results

**Process for consent:** Firms that have engaged commercially and achieved a Good or
Excellent rating may be offered a public-facing trust profile (future product). This is
opt-in only.

### Do not publish

- Individual firm scores without consent
- Individual firm rankings or positions in the cohort without consent
- Data that could allow individual firm identification from anonymised statistics
  (e.g., "the only firm in North Wales rated Excellent" if only one firm qualifies)
- Raw scan data or scanner methodology detail sufficient to reverse-engineer the scoring
  model

**Commercial rationale:** Individual firm position within the cohort is a paid product
(the Benchmark Comparison Report). Publishing it for free eliminates the most natural
paid product from the data asset.

---

## 10. Success Criteria for the First Proprietary Digital Trust Dataset

The Digital Trust Dataset V1 is considered complete when all of the following are true:

### Data completeness
- [ ] 250 firms scanned using Security Rating v1.0
- [ ] All four target sectors represented at target sizes
- [ ] All prospects have sector field populated
- [ ] Zero unresolved data quality issues (no parked domains, no duplicates, no low-score
       anomalies pending review)

### Statistical robustness
- [ ] Sector averages are based on ≥ 25 firms per sector
- [ ] Risk band distributions are stable (adding 5 more firms does not materially change
       the percentages — stability check at 250)
- [ ] Top failed checks are consistent with prior milestone reports

### Reporting
- [ ] Internal Digital Trust Dataset V1 report produced covering all four sectors
- [ ] Cross-sector comparison report produced
- [ ] At least one public-facing sector summary published
- [ ] Benchmark statistics approved as marketing-ready

### Commercial readiness
- [ ] Trust Mark eligibility thresholds defined and documented (based on distribution data)
- [ ] Benchmark comparison report product defined and ready to sell
- [ ] Monitoring subscription product validated with at least one paying client

### Strategic declaration
- [ ] Digital Trust Dataset V1 formally declared complete in BOARD.md
- [ ] Rescanning plan for Year 2 defined (longitudinal data collection begins)
- [ ] Dataset declared as a strategic asset in DECISIONS.md

---

## Appendix — Cohort Naming Convention

| Cohort | Sector | Region | Target size | Status |
|---|---|---|---|---|
| Cohort 001 | Solicitors | North Wales (25mi of LL30 2UB) | 71 | ✅ Complete — 35 validated |
| Cohort 002 | Accountants | TBD | 75 | Planned |
| Cohort 003 | IFAs | TBD | 50 | Planned |
| Cohort 004 | Surveyors | TBD | 25 | Planned |
| Cohort 005 | Solicitors (expansion) | TBD | 65 | Planned |

Each cohort is defined before collection begins. The definition is immutable once scanning
starts. New cohorts are added to this table and tracked in BOARD.md.

---

*Soterius Benchmark Expansion Plan v1.0*
*2026-06-14*
