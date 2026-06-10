# Soterius — Project Summary
*Last updated: 2026-06-04*

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  https://soterius-frontend.vercel.app                          │
│  React + Vite (react-router-dom)                               │
│                                                                 │
│  /              → Landing.jsx  (domain entry)                  │
│  /results       → Results.jsx  (self-fetching, URL-driven)     │
│  /*             → ScanApp      (legacy scan shell)             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / CORS
                           │ POST /api/scan
                           │ POST /api/scan/submit-gate
                           │ POST /api/report
                           │ GET  /api/gate/submissions.csv
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              https://soterius-backend-production                │
│                      .up.railway.app                            │
│                                                                 │
│  Node.js + Express (Dockerfile on Railway)                     │
│                                                                 │
│  6 scanners run in parallel (Promise.allSettled)               │
│  ┌──────────┐ ┌─────────┐ ┌─────┐ ┌──────────┐ ┌──────┐ ┌──────┐│
│  │  SSL/TLS │ │ Headers │ │ DNS │ │Subdomains│ │ Tech │ │ GDPR ││
│  └──────────┘ └─────────┘ └─────┘ └──────────┘ └──────┘ └──────┘│
│                                                                 │
│  Gate submissions → Resend API (email) + submissions.csv       │
│  PDF reports → Puppeteer/Chromium                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
soterius/
├── PROJECT-SUMMARY.md          ← this file
│
├── backend/
│   ├── server.js               ← Express app, CORS, error handler
│   ├── Dockerfile              ← Railway deployment (node:18-slim + chromium)
│   ├── .env                    ← local secrets (gitignored)
│   ├── .env.example            ← documents all required variables
│   ├── .gitignore
│   ├── package.json
│   │
│   ├── routes/
│   │   ├── scan.js             ← POST /api/scan + POST /api/scan/submit-gate
│   │   ├── gate.js             ← GET /api/gate/submissions.csv (admin)
│   │   └── report.js           ← POST /api/report (PDF generation)
│   │
│   ├── scanners/
│   │   ├── ssl-check.js        ← TLS socket check
│   │   ├── headers-check.js    ← HTTP security headers
│   │   ├── dns-check.js        ← SPF / DKIM / DMARC
│   │   ├── subdomains.js       ← crt.sh certificate transparency
│   │   ├── tech-detect.js      ← CMS / framework detection
│   │   ├── gdpr-check.js       ← privacy policy / cookie consent
│   │   └── port-scan.js        ← DISABLED (paid tier only)
│   │
│   ├── utils/
│   │   ├── emailService.js     ← Resend API email sending
│   │   ├── csvExporter.js      ← submissions.csv append
│   │   ├── validators.js       ← domain validation + BLOCKED_HOSTS
│   │   ├── errors.js           ← AppError / ValidationError / ScanError
│   │   └── logger.js           ← structured logger
│   │
│   ├── pdf-generator/
│   │   ├── generator.js        ← Puppeteer PDF builder (large file)
│   │   └── template.html       ← HTML template with {{placeholders}}
│   │
│   └── test-*.js               ← local diagnostic scripts (not deployed)
│
└── frontend/
    ├── src/
    │   ├── main.jsx            ← React root + BrowserRouter
    │   ├── App.jsx             ← Route definitions
    │   ├── App.css             ← Global CSS variables + utility classes
    │   ├── index.css           ← Bare reset only
    │   │
    │   ├── pages/
    │   │   ├── Landing.jsx     ← Marketing page: hero + domain input
    │   │   ├── Results.jsx     ← Self-fetching results + gate modal + toast
    │   │   ├── Home.jsx        ← Legacy scan page (ScanApp shell)
    │   │   ├── Home.css
    │   │   └── Results.css
    │   │
    │   ├── components/
    │   │   ├── ScannerCard.jsx ← Expandable scanner result card
    │   │   ├── ScanForm.jsx    ← Domain input for legacy Home page
    │   │   ├── ScoreGauge.jsx  ← Score display widget
    │   │   ├── ProgressBar.jsx ← Scanning progress animation
    │   │   └── *.css           ← Per-component styles
    │   │
    │   └── services/
    │       └── api.js          ← axios instance + scanDomain / submitGate / downloadReport
    │
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Backend: File Details

### `server.js`
Express app setup. Key behaviours:
- CORS: reads `ALLOWED_ORIGINS` env var (comma-separated, supports `*` glob for Vercel previews). Defaults to Vercel + localhost if unset.
- Routes: `/api/scan`, `/api/gate`, `/api` (report)
- Global error handler: `AppError` → correct status code; anything else → 500

### `routes/scan.js`
Two endpoints:

**`POST /api/scan`**
Runs 6 scanners in parallel via `Promise.allSettled`. Returns:
```json
{
  "success": true,
  "domain": "example.co.uk",
  "scannedAt": "ISO timestamp",
  "results": {
    "ssl":        { "module": "ssl",        "status": "pass|warn|fail|error", "details": {}, "issues": [] },
    "headers":    { ... },
    "dns":        { ... },
    "subdomains": { ... },
    "tech":       { ... },
    "gdpr":       { ... }
  }
}
```

**`POST /api/scan/submit-gate`**
Accepts gate form payload. Validates email + domain, stores in memory Map, fires email + CSV (both fire-and-forget). Returns `{ success, message, submissionId }`.

Body fields: `domain`, `name`, `email`, `firmName`, `mainConcern`, `dataIncidents` (bool), `itManagement`, `confidence` (1–5), `scanScore` (optional), `scanResults` (optional — scanner result object for CSV).

### `routes/gate.js`
**`GET /api/gate/submissions.csv`**
Admin-protected by `X-Admin-Token` header vs `ADMIN_TOKEN` env var. Streams `submissions.csv` as download. Returns 404 if no submissions yet.

### `routes/report.js`
**`POST /api/report`**
Calls `generatePDF()` in pdf-generator. Returns PDF blob. Timeout: 120s.

---

## Scanners: Current State

| Scanner | What it checks | Error handling | Notes |
|---|---|---|---|
| **ssl-check.js** | TLS socket on port 443: cert validity, expiry, TLS version (1.2+), cipher strength | `resolve()` on all paths — never rejects | ✅ Solid |
| **headers-check.js** | 6 HTTP security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | `try/catch` on axios — returns `status: 'error'` | ✅ Fixed |
| **dns-check.js** | SPF, DKIM (10 selectors), DMARC + policy level | Internal try/catch on DNS lookups | ✅ Solid |
| **subdomains.js** | crt.sh certificate transparency API | `try/catch` on axios — returns `status: 'error'` | ✅ Fixed (was causing score fluctuation) |
| **tech-detect.js** | 14 CMS/framework/analytics signatures in page body + response headers | `try/catch` on axios — returns `status: 'error'` | ✅ Fixed |
| **gdpr-check.js** | Privacy policy link, cookie consent banner, tracking scripts, data subject rights (also fetches policy page) | `try/catch` on `fetchPage` — returns `status: 'error'` | ✅ Fixed |
| **port-scan.js** | TCP probes on 8 ports | N/A — disabled | ⛔ Disabled: non-deterministic results caused score fluctuation. Kept as file for paid-tier use. |

### Scanner status values
`pass` / `warn` / `fail` / `error`

---

## Frontend: File Details

### Routing (`App.jsx`)
```
/           → <Landing />    full-page marketing, no app shell
/results    → <Results />    self-fetching, reads ?domain= from URL
/*          → <ScanApp />    legacy shell with header/footer
```

### `pages/Landing.jsx`
- Hero section with shield SVG, headline, trust signals
- CTA: domain input → navigates to `/results?domain=...`
- Footer: Privacy / Terms / Contact links
- All styles in inline `<style>` tag (`.lp-` namespace)

### `pages/Results.jsx`
Self-contained: reads `?domain=` from URL, calls `scanDomain()` on mount, manages its own fetch lifecycle.

States: `loading` → `ready` | `error`

**Gate flow:**
1. Scanner grid renders blurred with overlay ("View Full Report →")
2. Click → `<GateModal>` opens
3. Form submits → `submitGate({ domain, scanScore, scanResults, ...fields })`
4. Success → grid unblurs, toast fires, CTA changes to paid-tier options

**Score formula** (in `computeScore()`):
```js
const pts = { pass: 100, warn: 50, fail: 0, error: 0 };
score = Math.round(sum(pts[status] for each of 6 scanners) / 600 * 100)
// → 0–100
```

**Risk levels:**
```
80–100 → Low Risk      (green)
60–79  → Medium Risk   (yellow)
40–59  → High Risk     (orange)
0–39   → Critical Risk (red)
```

### `services/api.js`
```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
```
Three exported functions: `scanDomain(domain)`, `submitGate(payload)`, `downloadReport(payload)`.

### `components/ScannerCard.jsx`
Expandable accordion card. Derives all explanatory copy from internal `CARD_CONTENT` map (keyed by `module` + `status`). Parent only passes raw data — no copy lives in Results.jsx.

---

## Dependencies

### Backend (`backend/package.json`)

| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | HTTP server |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^16.3.1 | Env var loading |
| axios | ^1.6.0 | HTTP requests in scanners |
| socket.io | ^4.6.1 | WebSocket (wired up, not actively used) |
| puppeteer | ^21.5.0 | Headless Chrome for PDF generation |
| resend | ^6.12.4 | Transactional email (active) |
| nodemailer | ^8.0.10 | SMTP email (installed, not currently used) |
| mailgun.js | ^13.2.0 | Mailgun API (installed, not currently used) |
| form-data | ^4.0.5 | Peer dep for mailgun.js |
| csv-writer | ^1.6.0 | CSV export for gate submissions |
| nodemon | ^3.0.1 | Dev auto-restart |

> **Note:** `nodemailer` and `mailgun.js` are unused — they were trialled during SMTP debugging. Safe to remove.

### Frontend (`frontend/package.json`)

| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.6 | UI framework |
| react-dom | ^19.2.6 | DOM renderer |
| react-router-dom | (installed) | Client-side routing |
| axios | ^1.16.1 | API calls |
| socket.io-client | ^4.8.3 | WebSocket (installed, not used in UI) |
| vite | ^8.0.12 | Build tool |

---

## Environment Variables

### Backend (Railway)
```
# Required
RESEND_API_KEY    = re_...               # Resend transactional email
EMAIL_FROM        = Soterius Scanner <noreply@mail.soterius.co.uk>
ADMIN_TOKEN       = <strong-random>      # Protects /api/gate/submissions.csv

# CORS (defaults work if unset)
ALLOWED_ORIGINS   = https://soterius-frontend.vercel.app,https://soterius-*.vercel.app

# Auto-injected by Railway
PORT              = (set by Railway)
NODE_ENV          = production

# Dockerfile sets these — do not set manually
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true
PUPPETEER_EXECUTABLE_PATH        = /usr/bin/chromium
```

### Frontend (Vercel)
```
VITE_API_URL = https://soterius-backend-production.up.railway.app
```

---

## How to Run Locally

### Backend
```powershell
cd C:\Users\chris\Dev\soterius\backend
# Create .env from .env.example and fill in values
npm install
npm run dev      # nodemon server.js — restarts on changes
# Runs on http://localhost:3001
```

### Frontend
```powershell
cd C:\Users\chris\Dev\soterius\frontend
npm install
npm run dev      # vite dev server
# Runs on http://localhost:5173
```

With both running, visit `http://localhost:5173`. The frontend talks to `localhost:3001` by default (no `.env` needed for local dev).

### Test SMTP (diagnostic only)
```powershell
cd C:\Users\chris\Dev\soterius\backend
$env:RESEND_API_KEY="re_xxx"; node test-mailgun.js
```

---

## What's Working

| Feature | Status |
|---|---|
| Domain scanning (6 scanners) | ✅ Working |
| Score calculation (0–100) | ✅ Working |
| Risk level badges | ✅ Working |
| Scanner result cards (expandable) | ✅ Working |
| PDF report generation | ✅ Working |
| Gate modal (email capture) | ✅ Working |
| Gate form → backend submission | ✅ Working |
| CSV export of gate submissions | ✅ Working (ephemeral — lost on Railway redeploy) |
| Confirmation email via Resend | ✅ Working (requires `RESEND_API_KEY` set in Railway) |
| Admin CSV download endpoint | ✅ Working (requires `ADMIN_TOKEN` header) |
| CORS (Vercel → Railway) | ✅ Working |
| GPS location (separate Soteria React project) | N/A — different repo |

---

## Known Issues / TODOs

### Critical
- none

### Medium
- **CSV is ephemeral**: `submissions.csv` lives in Railway's container filesystem and is wiped on every redeploy. Phase 2: replace with S3/R2 or a database insert.
- **Gate submissions in-memory**: `gateSubmissions` Map in `routes/scan.js` resets on restart. Gate data is captured in CSV before restart risk, but cross-request lookup by `gateId` won't survive a restart.

### Low
- **Unused packages**: `nodemailer`, `mailgun.js`, `form-data` remain in `package.json` from SMTP/Mailgun trials. Should be removed to reduce Docker image size.
- **`socket.io` not used in frontend**: `socket.io-client` is in frontend deps and `socket.io` is wired up in the backend but no real-time events are emitted or consumed anywhere. Originally intended for streaming scan progress.
- **`Home.jsx` copy stale**: Still says "7 scanners... SSL, headers, DNS, ports, subdomains, tech, GDPR" — ports was removed.
- **ScanApp shell (`/*` route)**: The legacy scan flow (Home → Results via state) still works but is now superseded by the Landing → `/results?domain=` flow. Could be removed or redirected.
- **Debug logs in `routes/scan.js`**: `[GATE]` console.log statements were added for debugging and are still present.
- **`test-mailgun.js` / `test-smtp.js`**: Diagnostic scripts in backend root — not deployed (excluded by `.dockerignore`) but could be cleaned up.

### Hardcoded values
| Location | Value | Notes |
|---|---|---|
| `emailService.js` | `https://soterius-frontend.vercel.app` | In email HTML body — fine for now |
| `emailService.js` | `noreply@mail.soterius.co.uk` | Default `from` address, overridable via `EMAIL_FROM` env var |
| `csvExporter.js` | `../submissions.csv` | Relative to `utils/` — resolves to backend root |
| `frontend/src/pages/Landing.jsx` | `https://soterius-frontend.vercel.app` | In CTA button href |
| `App.css` | `'Inter', system-ui` | Font stack — Inter not loaded via CDN so falls back to system-ui |

---

## Deployment

| Service | URL | Trigger |
|---|---|---|
| Frontend — Vercel | `soterius-frontend.vercel.app` | Auto-deploy on push to `github.com/chriswatson6675/soterius-frontend` |
| Backend — Railway | `soterius-backend-production.up.railway.app` | Auto-deploy on push to `github.com/chriswatson6675/soterius-backend` |

Railway uses the `Dockerfile` in the backend root (node:18-slim + chromium for Puppeteer).
