# Research Pipeline V1 — Design Proposal
## Automated Benchmark Dataset Collection and Maintenance

**Version:** 1.0
**Date:** 2026-06-14
**Status:** Design proposal — not yet implemented
**Strategic context:** D028 (Digital Trust Platform), BENCHMARK_EXPANSION_PLAN.md

---

## Problem Statement

The current collection workflow is manual: each firm is entered individually via Research
Mode, scanned one at a time, and reviewed by hand. This is appropriate for the first 35
firms. It does not scale to 250 firms, and it does not support the ongoing maintenance a
live benchmark dataset requires — periodic rescanning, quality monitoring, anomaly
detection, and cohort-level statistics.

The Research Pipeline is the automated layer that sits between raw firm lists and clean,
validated, scan-ready benchmark data. Its job is to reduce human effort to the minimum
necessary: only uncertain records should ever require manual review.

---

## Design Principles

1. **Automate the predictable, surface the uncertain.** Routine work — importing, deduplicating,
   validating domains, scanning — runs without human input. Only records that cannot be
   resolved programmatically reach the review queue.

2. **Status drives everything.** Every prospect has a pipeline status at all times. The
   pipeline never guesses what to do next; it acts on status. A prospect at `pending_validation`
   is validated next. A prospect at `scan_due` is scanned next.

3. **Immutable scan records.** Consistent with D008. Scanning always creates a new record;
   existing records are never modified. Benchmark statistics are always derived from the
   most recent scan per prospect.

4. **Quality gates before scanning.** Scanning a parked domain wastes a scan record and
   pollutes the dataset. Domain validation runs before scanning, not after.

5. **Human review is exception handling, not routine.** A pipeline that requires constant
   human attention defeats its own purpose. The review queue should be empty most of the
   time.

---

## Current State

What already exists that the pipeline will build on:

| Component | Location | Status |
|---|---|---|
| Prospect create/read/update/delete | `backend/services/database.js` | Live |
| Domain normalisation | `backend/routes/scan.js`, pipeline scripts | Implemented |
| Bulk scan script | `backend/scripts/regenerate-benchmark.js` | Live |
| Low-score flag + interactive delete | `backend/scripts/regenerate-benchmark.js` | Live |
| Findings analysis script | `backend/scripts/analyse-findings-001.js` | Live |
| Research Mode (manual scan UI) | `frontend/src/pages/Research.jsx` | Live |

The pipeline replaces the manual research mode workflow for bulk collection. Research
Mode remains the tool for individual one-off scans and ad-hoc additions.

---

## Data Model Changes Required

The current `prospects` table stores: `id`, `firm_name`, `website`, `sector`, `location`,
`source`, `notes`, `last_scanned`, `created_at`, `updated_at`.

The pipeline requires additional status tracking. Two approaches:

### Option A — New columns on `prospects` (recommended for V1)

Add the following columns:

| Column | Type | Purpose |
|---|---|---|
| `pipeline_status` | TEXT | Current pipeline state (see status definitions below) |
| `validation_status` | TEXT | Result of domain validation check |
| `validation_checked_at` | TIMESTAMPTZ | When domain validation last ran |
| `rescan_due_at` | TIMESTAMPTZ | When the next rescan should be triggered |
| `pipeline_flags` | JSONB | Array of flag objects `{code, reason, raised_at}` |
| `pipeline_notes` | TEXT | Human-entered notes from review queue |

**Why Option A:** All pipeline state is on the prospect record. No new tables, no joins.
Scripts can filter by status in a single query.

### Option B — Separate `pipeline_state` table (recommended for V2)

A separate table keyed by `prospect_id` that tracks pipeline history, flag history, and
review decisions with full audit trail. More complex to implement but allows historical
pipeline state to be queried.

**For V1, use Option A.** Migrate to Option B when audit trail becomes necessary.

### Pipeline status definitions

```
new              — Just imported; no validation or scan has run
pending_validate — Queued for domain validation
validating       — Validation in progress
valid            — Domain confirmed active and reachable; ready to scan
invalid          — Domain failed validation (unreachable, parked, DNS fail)
flagged          — Requires human review before proceeding
pending_scan     — Validation passed; queued for scanning
scanning         — Scan in progress
scan_complete    — Most recent scan stored; active in dataset
scan_failed      — Scan attempted but failed (timeout, error)
scan_due         — Last scan is older than rescan interval; queued for rescan
excluded         — Manually excluded from dataset (duplicate, wrong domain, closed firm)
```

State transitions:

```
new
 └─ pending_validate
     └─ validating
         ├─ valid ──────────────► pending_scan
         │                            └─ scanning
         │                                ├─ scan_complete ──► scan_due (after interval)
         │                                └─ scan_failed
         ├─ invalid ─────────────► flagged ──► excluded (after review)
         └─ flagged ─────────────► valid (if resolved) or excluded (if confirmed)
```

---

## Pipeline Architecture

The pipeline is implemented as a suite of small, composable Node.js scripts under
`backend/scripts/pipeline/`. Each script does one thing and operates on a well-defined
status subset. Scripts can be run individually or chained.

```
backend/scripts/pipeline/
  import.js        — Stage 1: ingest firms from CSV
  validate.js      — Stage 2: domain validation
  clean.js         — Stage 3: duplicate and anomaly detection
  scan.js          — Stage 4: bulk scanning
  maintain.js      — Stage 5: rescan scheduling and statistics
  review.js        — Stage 6: interactive human review queue
  status.js        — Utility: show current pipeline state summary
```

A single entry point runs all stages in sequence:

```
backend/scripts/pipeline/run.js  — runs import → validate → clean → scan → maintain
```

---

## Stage 1 — Prospect Acquisition (import.js)

### Inputs
- CSV file path passed as CLI argument: `node import.js --file firms.csv --cohort 002`
- CSV columns: `firm_name, website, sector, location, source, notes` (all except
  `firm_name` and `sector` are optional but encouraged)

### Processing

1. Parse CSV row by row
2. Normalise domain: strip scheme, `www.`, trailing paths, lowercase
3. Check for exact domain match in existing prospects → skip with `[DUPLICATE]` log
4. Fuzzy firm name check against same-sector prospects (Levenshtein distance ≤ 2 on
   normalised name) → import but set `pipeline_flags: [{code: 'name_similar', ...}]`
5. Insert with `pipeline_status: 'pending_validate'`
6. Log: imported / skipped / flagged counts

### CSV format

```
firm_name,website,sector,location,source,notes
Smith & Partners LLP,smithpartners.co.uk,solicitors,Bangor,sra-register,
Jones Accountants,jonesaccountants.co.uk,accountants,Llandudno,icaew-register,
```

`website` may be empty if the domain is unknown. Empty-website records are imported with
`pipeline_status: 'flagged'` and `pipeline_flags: [{code: 'no_domain'}]` — they go
directly to the review queue.

### Register-specific CSV guidance

| Register | Export method | Notes |
|---|---|---|
| SRA | Manual search → copy results | No bulk export; search by town/postcode and record manually |
| ICAEW | Find a Chartered Accountant → export or manual | Postcode search; copy firm details |
| FCA | Financial Services Register → CSV download available | Filter by firm type; export includes firm name and postcode |
| RICS | Manual search | No bulk export; compile manually |

A register-specific CSV template is provided per source so that column names are consistent
regardless of the source format.

---

## Stage 2 — Domain Validation (validate.js)

Runs against all prospects with `pipeline_status: 'pending_validate'`.

### Checks (in order)

**Check 1 — DNS resolution**
- Resolve domain to IP via `dns.lookup()`
- Failure → `validation_status: 'dns_fail'`; set `pipeline_status: 'invalid'`

**Check 2 — HTTPS reachability**
- `HEAD https://<domain>` with 10s timeout
- 200–399 → HTTPS confirmed; `validation_status: 'valid'`
- 4xx/5xx → flag but do not exclude; 404 on apex may still indicate a valid domain with
  different path structure; set `pipeline_flags: [{code: 'http_error', detail: status}]`
- Timeout → `validation_status: 'timeout'`; set `pipeline_status: 'flagged'`

**Check 3 — Parked domain detection**
Fetch homepage HTML (max 50KB). Check for parked page patterns:
- Body text contains: "this domain is for sale", "parked by", "buy this domain",
  "coming soon", "under construction"
- Body word count < 100 AND no navigation links detected
- Response is a redirect to a domain registrar

If any parked indicator matches → `validation_status: 'parked'`; set
`pipeline_status: 'invalid'`; add `pipeline_flags: [{code: 'parked_detected'}]`

**Check 4 — Content plausibility**
For domains that pass checks 1–3:
- Confirm page title and body contain text (not empty)
- Confirm page is not a generic hosting placeholder ("Welcome to Nginx", "Apache default")
- If placeholder detected → `pipeline_flags: [{code: 'placeholder_page'}]`;
  set `pipeline_status: 'flagged'` for human review

### Output states after validation

| Result | `validation_status` | `pipeline_status` | Action |
|---|---|---|---|
| DNS fail | `dns_fail` | `invalid` | Goes to review queue |
| HTTPS OK, no flags | `valid` | `pending_scan` | Proceeds to scanning |
| HTTP only (no HTTPS) | `http_only` | `pending_scan` | Proceeds; scanner handles SSL |
| Parked detected | `parked` | `invalid` | Goes to review queue |
| Timeout | `timeout` | `flagged` | Goes to review queue |
| Placeholder page | `placeholder` | `flagged` | Goes to review queue |

---

## Stage 3 — Data Cleaning (clean.js)

Runs after import and validation. Identifies problems that require cross-record analysis
(single-record validation cannot detect these).

### Duplicate domain detection
- Normalise all domains in the dataset
- Find exact matches → keep oldest record; flag newer as `pipeline_status: 'excluded'`
  with `pipeline_flags: [{code: 'duplicate_domain', duplicate_of: <id>}]`

### Duplicate firm detection (fuzzy)
- For each pair of prospects in the same sector and location:
  - Normalise firm name: lowercase, strip "ltd", "llp", "limited", "& co", punctuation
  - Compute Levenshtein distance on normalised names
  - Distance ≤ 2 → flag both as `pipeline_flags: [{code: 'name_similar', similar_to: <id>}]`
  - Set `pipeline_status: 'flagged'` on the newer record
- Human review queue presents both records side by side for a keep/exclude decision

### Typo domain detection
- For each prospect, check whether any other prospect in the same cohort has a domain
  with Levenshtein distance ≤ 2 (e.g., `tudorowen.co.uk` vs `tudurowen.co.uk`)
- Flag both records: `pipeline_flags: [{code: 'domain_similar', similar_to: <id>}]`

### TLD variant detection
- Check whether both `domain.co.uk` and `domain.com` exist as separate prospects
- Flag for review: one may be inactive or refer to a different firm

### Cross-sector duplicate check
- A firm name that appears in two different sectors is unusual (a firm of solicitors
  cannot also be a firm of IFAs)
- Flag cross-sector name matches: `pipeline_flags: [{code: 'cross_sector_duplicate'}]`

---

## Stage 4 — Bulk Scanning (scan.js)

Replaces and extends `regenerate-benchmark.js`. Runs against all prospects with
`pipeline_status: 'pending_scan'` or `pipeline_status: 'scan_due'`.

### Queue management
- Load all eligible prospects ordered by: new prospects first, then by `last_scanned`
  ascending (oldest first)
- Skip any prospect with `pipeline_status` not in `['pending_scan', 'scan_due']`
- Skip any prospect whose `last_scanned` is within the rescan protection window
  (default: 28 days) — prevents accidental double-scanning

### Scan execution
- Batches of 5 concurrent scans (consistent with existing implementation)
- 1.5s pause between batches
- On completion: update `pipeline_status: 'scan_complete'`; update `last_scanned`
- On failure: update `pipeline_status: 'scan_failed'`; add flag `{code: 'scan_error',
  detail: error.message}`; retry up to 2 times before marking failed

### Post-scan flags
After each scan result:
- Score ≤ 10% → add flag `{code: 'low_score'}`; set `pipeline_status: 'flagged'`
- Score dropped > 30 percentage points from previous scan → add flag `{code:
  'score_regression', delta: N}`; keep `pipeline_status: 'scan_complete'` but flag
  for monitoring
- New CVE detected (where previous scan had none) → add flag `{code: 'new_cve'}`

### Rescan scheduling
After a successful scan, calculate `rescan_due_at`:
- Default rescan interval: 30 days
- Override: prospects in active commercial monitoring relationships → 28 days
- Set `pipeline_status: 'scan_due'` when `rescan_due_at` is reached (handled by
  `maintain.js`)

---

## Stage 5 — Benchmark Maintenance (maintain.js)

Handles ongoing dataset health. Intended to run on a schedule (daily or weekly via
Railway cron).

### Rescan scheduling
- Find all prospects where `rescan_due_at <= NOW()` and `pipeline_status: 'scan_complete'`
- Set `pipeline_status: 'scan_due'`
- These will be picked up on the next `scan.js` run

### Statistics refresh
After any scan batch, recompute and log cohort statistics to console and/or a
`benchmark_snapshots` table (V2):
- Total prospects by status
- Prospects by sector
- Average and median scores overall and per sector
- Risk band distribution
- Validation failure rate
- Flag rate (% of prospects currently flagged)

### Cohort quality metrics
Track and alert on degradation:
- Validation failure rate > 15% → warn (expected ~5% for a well-sourced cohort)
- Scan failure rate > 10% → warn
- Flag queue depth > 20 unresolved records → warn (pipeline needs human attention)
- Sector with 0 scans in 60 days → warn

---

## Stage 6 — Human Review Layer (review.js)

Presents all prospects with `pipeline_status: 'flagged'` for interactive resolution.
Designed to minimise effort: each record is shown with its flag reason, the relevant
context, and a small set of one-keystroke actions.

### Review queue presentation

For each flagged prospect, display:
```
────────────────────────────────────────────────────────────────
Firm:     Smith & Partners LLP
Domain:   smith-partners.co.uk
Sector:   solicitors
Location: Bangor
Score:    7% (70 / 999) — Critical Risk

Flags:
  ⚠  low_score      Score ≤ 10% — domain may be inactive or incorrect
  ⚠  name_similar   Similar to: smithandpartners.co.uk (existing record)

Action:
  [k] Keep — include in dataset as-is
  [d] Delete — remove prospect and all linked scans
  [e] Edit domain — replace domain and re-validate
  [s] Skip — defer to next review session
  [x] Exclude — mark as excluded with reason
────────────────────────────────────────────────────────────────
```

### Actions available

| Key | Action | Effect |
|---|---|---|
| k | Keep | Set `pipeline_status: 'scan_complete'`; clear flags |
| d | Delete | Delete prospect + all linked scans from database |
| e | Edit domain | Prompt for new domain; re-run validation; re-scan if valid |
| s | Skip | Leave status as `flagged`; defer |
| x | Exclude | Set `pipeline_status: 'excluded'`; prompt for reason |

### Non-interactive mode
When not running in a TTY (e.g., CI or scheduled task):
- Print all flagged records with their flag reasons
- Do not prompt for action
- Exit with a non-zero code if the flag queue exceeds a configured threshold
- This allows the pipeline to be run in automated mode while still surfacing problems

---

## Data Flow

```
CSV / Register Export
        │
        ▼
   [import.js] ─────────────────────────────────────────────────────────────►
        │ new prospects (pipeline_status: pending_validate)
        ▼
[validate.js]
        │
        ├──── DNS fail / parked / timeout ──────────────────────────────────►
        │                                                             pipeline_status:
        │                                                             invalid / flagged
        │
        ├──── valid / http_only ────────────────────────────────────────────►
        │                                                             pipeline_status:
        │                                                             pending_scan
        ▼
  [clean.js]
        │
        ├──── duplicate domain / typo domain / name similar ───────────────►
        │                                                             pipeline_status:
        │                                                             flagged / excluded
        │
        └──── no issues ───────────────────────────────────────────────────►
                                                                      pipeline_status:
                                                                      pending_scan (unchanged)
        ▼
   [scan.js]
        │
        ├──── score ≤ 10% / score regression / new CVE ────────────────────►
        │                                                             pipeline_status:
        │                                                             flagged
        │
        └──── clean scan ──────────────────────────────────────────────────►
                                                                      pipeline_status:
                                                                      scan_complete
        ▼
 [maintain.js]
        │
        ├──── rescan_due_at reached ─────────────────────────────────────►
        │                                                            pipeline_status:
        │                                                            scan_due → scan.js
        │
        └──── statistics refresh ─────────────────────────────────────────►
                                                                     cohort stats logged
        ▼
  [review.js]
        │
        ├──── flagged records resolved ──────────────────────────────────►
        │                                                            scan_complete /
        │                                                            excluded / re-validated
        │
        └──── clean queue ────────────────────────────────────────────────►
                                                                     no action required
```

---

## Recommended Architecture — V1

The first version is a **script suite with no new UI**. It runs from the command line,
shares the existing Supabase client, and adds pipeline status columns to the `prospects`
table. The only UI change is a pipeline status indicator in Research Mode (optional, V1.1).

### What V1 includes

| Component | Implementation | Notes |
|---|---|---|
| CSV import | `pipeline/import.js` | New script |
| Domain validation | `pipeline/validate.js` | New script |
| Duplicate / typo detection | `pipeline/clean.js` | New script |
| Enhanced bulk scan | `pipeline/scan.js` | Replaces `regenerate-benchmark.js` |
| Rescan scheduling + stats | `pipeline/maintain.js` | New script |
| Interactive review | `pipeline/review.js` | Extends existing `readline` pattern |
| Pipeline status summary | `pipeline/status.js` | New script |
| Schema migration | Supabase migration | New columns on `prospects` |

### What V1 does NOT include

- Admin dashboard UI for the review queue (V2)
- Automated scheduled execution via Railway cron (V2)
- Register scraping or API integration (manual CSV workflow is sufficient for 250 firms)
- Email / webhook alerts on anomalies (V2)
- Historical pipeline state audit trail (V2)

### V1 usage flow

```bash
# Import a batch of firms from CSV
node scripts/pipeline/import.js --file cohort-002-accountants.csv --cohort 002

# Validate all pending domains
node scripts/pipeline/validate.js

# Run duplicate and typo detection
node scripts/pipeline/clean.js

# Scan all valid, pending prospects
node scripts/pipeline/scan.js

# Schedule rescans and refresh stats
node scripts/pipeline/maintain.js

# Review flagged records interactively
node scripts/pipeline/review.js

# Show current pipeline state
node scripts/pipeline/status.js
```

Or run all stages in sequence:

```bash
node scripts/pipeline/run.js --file cohort-002-accountants.csv --cohort 002
```

---

## Recommended Architecture — V2 (future)

V2 adds automation and a UI layer once V1 is validated in production.

| Addition | Description |
|---|---|
| Railway scheduled task | `maintain.js` runs daily; `scan.js` runs on scan_due prospects automatically |
| Admin review queue UI | Web-based review queue in admin dashboard; replaces CLI review |
| Email / Slack alerts | Notify on: flag queue > N, validation failure spike, score regression on known client |
| Pipeline audit table | `pipeline_events` table records every status transition with timestamp and actor |
| Register integration | FCA register has a structured CSV download; automate ingestion for IFAs |
| Benchmark snapshot table | `benchmark_snapshots` table stores statistics at each milestone for historical comparison |

V2 should not be built until V1 has processed at least one full cohort (Cohort 002 —
accountants, 75 firms) and the script suite has proven reliable in production.

---

## Estimated Implementation Effort

### V1 — Script suite

| Component | Estimated effort |
|---|---|
| Schema migration (new columns on `prospects`) | 2 hours |
| `import.js` — CSV parsing, normalisation, deduplication | 6 hours |
| `validate.js` — DNS + HTTPS + parked detection | 6 hours |
| `clean.js` — duplicate and typo detection | 6 hours |
| `scan.js` — enhanced bulk scanner with status tracking | 4 hours |
| `maintain.js` — rescan scheduling + statistics | 4 hours |
| `review.js` — interactive review queue | 4 hours |
| `status.js` — pipeline state summary | 2 hours |
| `run.js` — orchestration entry point | 2 hours |
| Testing against live Supabase (dry-run mode) | 4 hours |
| **Total** | **~40 hours / 1 week** |

### V2 additions (future)

| Component | Estimated effort |
|---|---|
| Railway scheduled task for maintain + scan | 4 hours |
| Admin review queue UI | 2–3 days |
| Alert system (email or webhook) | 4–6 hours |
| Pipeline audit table + events tracking | 4 hours |
| FCA register CSV automation | 4 hours |
| Benchmark snapshot table | 4 hours |
| **Total** | **~5–6 days** |

---

## Schema Migration Required

One migration to add pipeline tracking columns to the `prospects` table:

```sql
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS pipeline_status     TEXT    DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS validation_status   TEXT,
  ADD COLUMN IF NOT EXISTS validation_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rescan_due_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipeline_flags      JSONB   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pipeline_notes      TEXT;

-- Index for pipeline queue queries
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline_status
  ON prospects (pipeline_status);

CREATE INDEX IF NOT EXISTS idx_prospects_rescan_due
  ON prospects (rescan_due_at)
  WHERE pipeline_status = 'scan_complete';

-- Existing prospects default to scan_complete if they have a scan
UPDATE prospects
  SET pipeline_status = 'scan_complete'
  WHERE last_scanned IS NOT NULL
    AND pipeline_status = 'new';
```

This migration is non-destructive. All existing prospect records and scan history are
unaffected.

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Parked domain detection produces false positives | Medium | Low-confidence flags go to review queue, not auto-exclusion |
| Fuzzy name matching flags legitimate different firms | Medium | Threshold set conservatively (distance ≤ 2); always human-confirmed |
| Register export format changes break import | Low | CSV template is configurable per source; import validates column presence before processing |
| Pipeline runs against production DB and corrupts data | Low | Dry-run mode (`--dry-run`) prints all actions without executing; required for first run |
| Railway cron (V2) runs scan during an outage | Low | `scan.js` checks for existing in-progress scans before starting; idempotent on status |

---

## Decision Reference

This design is consistent with:
- **D008** — Immutable scan records. `scan.js` creates new records; never updates existing ones.
- **D026** — Sector field is mandatory for benchmark prospects; the import script enforces this.
- **D028** — Pipeline builds the Benchmark Intelligence layer of the Digital Trust Platform.
- **BENCHMARK_EXPANSION_PLAN.md** — Pipeline implements the collection workflow defined there.

---

*Soterius Research Pipeline V1 — Design Proposal*
*2026-06-14*
