# Soterius Board Decisions

Board-level record of major decisions and approvals. Operational decisions are in DECISIONS.md.

---

| Date | Decision | Owner | Status |
|---|---|---|---|
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
