import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function cleanDomain(raw) {
  return raw.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

const DOMAIN_RE =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/* ── Inline SVG Icons ─────────────────────────────────────────── */
function IconLock() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a52"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a52"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a52"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconHeroShield() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1a3a52"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

/* ── CSS ──────────────────────────────────────────────────────── */
const css = `
  .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    color: #1f2937;
    font-size: 16px;
    line-height: 1.75;
    background: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Nav ── */
  .lp-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e2e8f0;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lp-nav-brand {
    font-size: 20px;
    font-weight: 700;
    color: #0f2540;
    letter-spacing: -0.02em;
  }
  .lp-nav-cta {
    padding: 10px 20px;
    background: #0f2540;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    min-height: 40px;
    transition: background 0.15s;
  }
  .lp-nav-cta:hover { background: #1a3a52; }
  @media (max-width: 479px) { .lp-nav-cta { font-size: 13px; padding: 9px 14px; } }

  /* ── Container ── */
  .lp-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  @media (min-width: 640px)  { .lp-container { padding: 0 40px; } }
  @media (min-width: 1024px) { .lp-container { padding: 0 64px; } }

  /* ── Sections ── */
  .lp-section        { padding: 88px 0; }
  .lp-section--grey  { background: #f8fafc; }
  .lp-section--blue  { background: #f8fafc; }
  .lp-section--navy  { background: #0f2540; }
  @media (max-width: 639px) { .lp-section { padding: 56px 0; } }

  /* eyebrow label */
  .lp-section-label {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 12px;
  }
  .lp-section-label--light { color: rgba(255,255,255,0.5); }

  /* section headings */
  .lp-h2 {
    font-size: 40px;
    font-weight: 600;
    color: #0f2540;
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: 24px;
  }
  .lp-h2--light { color: #fff; }
  @media (max-width: 639px) { .lp-h2 { font-size: 30px; } }

  /* lead paragraph */
  .lp-lead {
    font-size: 18px;
    line-height: 1.8;
    color: #64748b;
    max-width: 580px;
    margin-bottom: 48px;
  }
  .lp-lead--light { color: rgba(255,255,255,0.65); }

  /* ── Hero ── */
  .lp-hero {
    padding: 120px 0 96px;
    background: #0f2540;
    text-align: center;
  }
  /* Icon visible on dark background */
  .lp-hero-icon svg { stroke: rgba(255,255,255,0.4); }
  .lp-hero-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }
  .lp-hero h1 {
    font-size: 64px;
    font-weight: 700;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 28px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  @media (max-width: 767px)  { .lp-hero h1 { font-size: 44px; letter-spacing: -0.02em; } }
  @media (max-width: 479px)  { .lp-hero h1 { font-size: 36px; } }
  @media (min-width: 1024px) { .lp-hero h1 { font-size: 72px; } }
  @media (max-width: 639px)  { .lp-hero { padding: 80px 0 64px; } }

  .lp-hero-sub {
    font-size: 20px;
    font-weight: 400;
    line-height: 1.7;
    color: rgba(255,255,255,0.7);
    max-width: 560px;
    margin: 0 auto 44px;
  }
  @media (max-width: 639px) { .lp-hero-sub { font-size: 17px; } }

  /* ── Scan form ── */
  .lp-scan-form { max-width: 540px; margin: 0 auto; }
  .lp-input-row  { display: flex; }
  .lp-input {
    flex: 1;
    min-width: 0;
    height: 52px;
    padding: 0 18px;
    font-size: 16px;
    font-family: inherit;
    color: #0f2540;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-right: none;
    border-radius: 6px 0 0 6px;
    outline: none;
    transition: border-color 0.15s;
  }
  .lp-input:focus { border-color: #0f2540; }
  .lp-input::placeholder { color: #94a3b8; font-size: 15px; }

  /* Hero: white button — visible on dark background */
  .lp-btn-primary {
    height: 52px;
    padding: 0 26px;
    font-size: 15px;
    font-family: inherit;
    font-weight: 600;
    color: #0f2540;
    background: #fff;
    border: 1.5px solid #fff;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.01em;
    transition: background 0.15s;
  }
  .lp-btn-primary:hover { background: #f1f5f9; border-color: #f1f5f9; }

  /* Final CTA section: flip to navy button on white background */
  .lp-final-scan-form .lp-btn-primary {
    background: #0f2540;
    color: #fff;
    border-color: #0f2540;
  }
  .lp-final-scan-form .lp-btn-primary:hover {
    background: #1a3a52;
    border-color: #1a3a52;
  }

  /* Pricing card buttons */
  .lp-btn-full {
    display: block;
    width: 100%;
    padding: 14px 28px;
    font-size: 15px;
    font-family: inherit;
    font-weight: 600;
    color: #fff;
    background: #0f2540;
    border: 1.5px solid #0f2540;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;
    min-height: 48px;
  }
  .lp-btn-full:hover { background: #1a3a52; border-color: #1a3a52; }

  .lp-btn-secondary {
    display: block;
    width: 100%;
    padding: 14px 28px;
    font-size: 15px;
    font-family: inherit;
    font-weight: 600;
    color: #0f2540;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, background 0.15s;
    min-height: 48px;
  }
  .lp-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

  .lp-error-slot { min-height: 26px; margin-top: 10px; }
  .lp-error { font-size: 14px; color: #dc2626; }
  .lp-hero-note { margin-top: 16px; font-size: 14px; color: rgba(255,255,255,0.45); }

  @media (max-width: 479px) {
    .lp-input-row   { flex-direction: column; }
    .lp-input       { border-right: 1.5px solid #e2e8f0; border-bottom: none;
                      border-radius: 6px 6px 0 0; }
    .lp-input:focus { border-color: #0f2540; }
    .lp-btn-primary { border-radius: 0 0 6px 6px; width: 100%; }
  }

  /* ── Problem bullets ── */
  .lp-problem-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 680px;
    margin-top: 40px;
  }
  .lp-problem-item {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding: 24px 28px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #dc2626;
  }
  .lp-problem-bullet {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #dc2626;
    margin-top: 8px;
  }
  .lp-problem-text { font-size: 16px; line-height: 1.65; color: #0f2540; font-weight: 500; }

  /* ── 3-card grid ── */
  .lp-grid-3 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 48px;
  }
  @media (min-width: 768px)  { .lp-grid-3 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .lp-grid-3 { grid-template-columns: repeat(3, 1fr); } }

  .lp-card {
    background: #fff;
    border-radius: 6px;
    padding: 40px 36px;
    border: 1px solid #e2e8f0;
    transition: box-shadow 0.2s ease;
  }
  .lp-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .lp-card--grey { background: #f8fafc; }

  .lp-card-icon { margin-bottom: 24px; }
  .lp-card-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
    background: #f1f5f9;
    border-radius: 4px;
    padding: 3px 9px;
    margin-bottom: 14px;
  }
  .lp-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0f2540;
    margin-bottom: 12px;
    line-height: 1.35;
  }
  .lp-card-desc {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 22px;
    font-style: italic;
    line-height: 1.65;
  }
  .lp-card-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .lp-card-list li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.6;
    color: #1f2937;
  }
  .lp-card-list li svg { flex-shrink: 0; margin-top: 2px; }

  /* ── 2-col layout ── */
  .lp-grid-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 56px;
    align-items: center;
  }
  @media (min-width: 768px) { .lp-grid-2 { grid-template-columns: 1fr 1fr; } }

  /* ── Report mock-up ── */
  .lp-report-placeholder {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 40px 36px;
    text-align: center;
  }
  .lp-report-placeholder-title {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .lp-score-demo {
    font-size: 72px;
    font-weight: 700;
    color: #f59e0b;
    line-height: 1;
    margin-bottom: 6px;
    letter-spacing: -0.03em;
  }
  .lp-score-label { font-size: 13px; color: #94a3b8; margin-bottom: 28px; }
  .lp-score-bars  { display: flex; flex-direction: column; gap: 12px; text-align: left; }
  .lp-score-bar-row { display: flex; align-items: center; gap: 12px; font-size: 13px; }
  .lp-score-bar-label { width: 56px; color: #64748b; flex-shrink: 0; font-weight: 500; }
  .lp-score-bar-track {
    flex: 1;
    height: 6px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
  }
  .lp-score-bar-fill  { height: 100%; border-radius: 999px; }
  .lp-score-bar-val   { width: 28px; text-align: right; font-weight: 600; flex-shrink: 0; }

  .lp-benefits-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 28px;
  }
  .lp-benefit-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.65;
    color: #1f2937;
  }
  .lp-benefit-item svg { flex-shrink: 0; margin-top: 3px; }

  /* ── Steps ── */
  .lp-steps {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 48px;
  }
  @media (min-width: 768px) { .lp-steps { grid-template-columns: repeat(3, 1fr); } }

  .lp-step {
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    padding: 40px 32px;
    text-align: center;
    transition: box-shadow 0.2s ease;
  }
  .lp-step:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .lp-step-num {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #0f2540;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .lp-step h3 {
    font-size: 17px;
    font-weight: 600;
    color: #0f2540;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }

  /* ── Pricing ── */
  .lp-pricing-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 48px;
  }
  @media (min-width: 768px) { .lp-pricing-grid { grid-template-columns: repeat(3, 1fr); } }

  .lp-price-card {
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: box-shadow 0.2s ease;
  }
  .lp-price-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .lp-price-card--featured { border: 2px solid #0f2540; }
  .lp-price-badge {
    position: absolute;
    top: -13px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f2540;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .lp-price-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0f2540;
    margin-bottom: 4px;
  }
  .lp-price-amount {
    font-size: 42px;
    font-weight: 700;
    color: #0f2540;
    margin: 16px 0 4px;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .lp-price-period {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
  }
  .lp-price-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 13px;
    flex: 1;
    margin-bottom: 28px;
  }
  .lp-price-list li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.6;
    color: #1f2937;
  }
  .lp-price-list li svg { flex-shrink: 0; margin-top: 2px; }

  /* ── FAQ ── */
  .lp-faq { margin-top: 48px; max-width: 720px; }
  .lp-faq-item { border-bottom: 1px solid #e2e8f0; }
  .lp-faq-q {
    width: 100%;
    background: none;
    border: none;
    padding: 22px 0;
    text-align: left;
    font-size: 16px;
    font-weight: 600;
    color: #0f2540;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    line-height: 1.5;
    transition: color 0.15s;
    letter-spacing: -0.01em;
  }
  .lp-faq-q:hover { color: #1a3a52; }
  .lp-faq-a {
    font-size: 15px;
    font-weight: 400;
    color: #64748b;
    padding-bottom: 22px;
    line-height: 1.8;
    max-width: 640px;
  }

  /* ── Who it's for ── */
  .lp-who-content { max-width: 680px; }
  .lp-who-content p { font-size: 17px; line-height: 1.8; margin-bottom: 24px; color: #1f2937; }
  .lp-who-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 8px;
  }
  .lp-who-list li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.65;
    color: #1f2937;
  }
  .lp-who-list li svg { flex-shrink: 0; margin-top: 3px; }

  /* ── Final CTA ── */
  .lp-final-cta {
    padding: 104px 0;
    background: #fff;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }
  @media (max-width: 639px) { .lp-final-cta { padding: 64px 0; } }
  .lp-final-cta .lp-h2 { margin-bottom: 16px; }
  .lp-final-cta-sub {
    font-size: 18px;
    color: #64748b;
    margin-bottom: 40px;
    line-height: 1.7;
  }
  .lp-final-scan-form { max-width: 540px; margin: 0 auto; }

  /* ── Footer ── */
  .lp-footer {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 32px 24px;
    text-align: center;
  }
  .lp-footer-links {
    list-style: none;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px 20px;
    margin-bottom: 12px;
  }
  .lp-footer-links a { font-size: 14px; color: #64748b; text-decoration: none; }
  .lp-footer-links a:hover { color: #0f2540; text-decoration: underline; }
  .lp-footer-copy { font-size: 13px; color: #94a3b8; }

  /* ── Focus ── */
  .lp *:focus-visible {
    outline: 2px solid #0f2540;
    outline-offset: 3px;
    border-radius: 3px;
  }
`;

/* ── FAQ data ─────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Is this a penetration test?',
    a: 'No. We scan for known vulnerabilities and misconfigurations using non-invasive checks. A penetration test is an authorized attack simulation (typically £3–5k, requires written permission). We\'re more like a security X-ray — both are useful, but different tools for different purposes.',
  },
  {
    q: 'What if my score is really low?',
    a: 'That\'s exactly what the report is for. Most phishing vulnerabilities are fixable in 30 minutes to a few hours. The report shows you precisely how to fix each issue, step-by-step, in plain English.',
  },
  {
    q: 'Can I share this with my cyber insurance company?',
    a: 'Absolutely. It demonstrates you\'re actively managing phishing risk. Many insurers request security assessments as part of their application process or to justify lower premiums.',
  },
  {
    q: 'Is my data safe during the scan?',
    a: 'Yes. We run non-invasive checks only — we never access your backend systems, admin panels, or databases. Scan results are encrypted in transit and deleted after 24 hours.',
  },
  {
    q: 'Do you offer help fixing these issues?',
    a: 'Yes. Every report includes specific step-by-step fixes you or your IT team can implement. We also offer separate remediation services if you\'d prefer hands-on help.',
  },
  {
    q: 'What happens after I get my score?',
    a: 'You decide. You can fix things yourself, pass the report to your IT provider, or engage us for hands-on remediation. No pressure, no follow-up calls. Your report, your choice.',
  },
];

/* ── ScanForm shared component ───────────────────────────────── */
function ScanForm({ inputId }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setDomain(e.target.value);
    if (error) setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = cleanDomain(domain);
    if (!cleaned || !DOMAIN_RE.test(cleaned)) {
      setError('Please enter a valid domain, e.g. yourfirm.co.uk');
      return;
    }
    navigate(`/results?domain=${encodeURIComponent(cleaned)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Scan your domain">
      <div className="lp-input-row">
        <input
          id={inputId}
          className="lp-input"
          type="text"
          value={domain}
          onChange={handleChange}
          placeholder="e.g. yourfirm.co.uk"
          aria-label="Your website domain"
          aria-describedby={`${inputId}-error`}
          autoComplete="off"
          spellCheck="false"
          inputMode="url"
        />
        <button className="lp-btn-primary" type="submit">
          Scan My Website Free
        </button>
      </div>
      <div className="lp-error-slot" aria-live="polite">
        {error && (
          <p id={`${inputId}-error`} className="lp-error" role="alert">{error}</p>
        )}
      </div>
    </form>
  );
}

/* ── FAQ Item ─────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lp-faq-item">
      <button
        className="lp-faq-q"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {q}
        <IconChevron open={open} />
      </button>
      {open && <p className="lp-faq-a">{a}</p>}
    </div>
  );
}

/* ── Landing ──────────────────────────────────────────────────── */
export default function Landing() {
  function scrollToScan() {
    document.getElementById('hero-scan')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <style>{css}</style>
      <div className="lp">

        {/* 1. Nav */}
        <nav className="lp-nav" aria-label="Site navigation">
          <span className="lp-nav-brand">Soterius</span>
          <button className="lp-nav-cta" onClick={scrollToScan}>
            Scan Your Website Free
          </button>
        </nav>

        {/* 2. Hero */}
        <section className="lp-hero lp-section" aria-labelledby="hero-heading">
          <div className="lp-container" style={{ textAlign: 'center' }}>
            <div className="lp-hero-icon">
              <IconHeroShield />
            </div>
            <h1 id="hero-heading">Is Your Firm a Phishing Target?</h1>
            <p className="lp-hero-sub">
              In 90 seconds, discover how attackers could spoof your domain,
              target your staff, and impersonate you to your clients.
            </p>
            <div className="lp-scan-form" id="hero-scan" style={{ textAlign: 'left' }}>
              <ScanForm inputId="hero-domain-input" />
              <p className="lp-hero-note">Free scan. No account. No credit card.</p>
            </div>
          </div>
        </section>

        {/* 3. The Problem */}
        <section className="lp-section lp-section--grey" aria-labelledby="problem-heading">
          <div className="lp-container">
            <p className="lp-section-label">Why this matters</p>
            <h2 id="problem-heading" className="lp-h2">
              Phishing is the #1 Attack on Professional Services
            </h2>
            <p className="lp-lead" style={{ marginBottom: 0 }}>
              Solicitors, accountants, and financial advisors hold client funds and sensitive data.
              That makes your firm a high-value target.
            </p>
            <ul className="lp-problem-list" aria-label="Key statistics">
              <li className="lp-problem-item">
                <span className="lp-problem-bullet" aria-hidden="true" />
                <span className="lp-problem-text">
                  <strong>£2M+</strong> average annual cost from misdirected client funds following email fraud
                </span>
              </li>
              <li className="lp-problem-item">
                <span className="lp-problem-bullet" aria-hidden="true" />
                <span className="lp-problem-text">
                  <strong>47 SRA interventions</strong> in 2024–25 linked to IT and cybersecurity failures
                </span>
              </li>
              <li className="lp-problem-item">
                <span className="lp-problem-bullet" aria-hidden="true" />
                <span className="lp-problem-text">
                  Attackers send spear-phishing emails from <strong>spoofed versions of your domain</strong>, targeting your staff and clients
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. What You'll Discover */}
        <section className="lp-section" aria-labelledby="discover-heading">
          <div className="lp-container">
            <p className="lp-section-label">What we check</p>
            <h2 id="discover-heading" className="lp-h2">Your Phishing Risk Report</h2>
            <p className="lp-lead">
              Three layers of risk — domain, staff, and client trust — assessed in under two minutes.
            </p>
            <div className="lp-grid-3" role="list">

              <article className="lp-card" role="listitem">
                <div className="lp-card-icon"><IconLock /></div>
                <span className="lp-card-badge">Layer 1</span>
                <h3>Domain Spoofability</h3>
                <p className="lp-card-desc">Can attackers send email appearing from your domain?</p>
                <ul className="lp-card-list">
                  <li><IconCheck /><span>SPF, DKIM and DMARC authentication checks</span></li>
                  <li><IconCheck /><span>BIMI visual trust signal verification</span></li>
                  <li><IconCheck /><span>Domain lookalike and subdomain security</span></li>
                  <li><IconCheck /><span>Registrar account security assessment</span></li>
                </ul>
              </article>

              <article className="lp-card" role="listitem">
                <div className="lp-card-icon"><IconUsers /></div>
                <span className="lp-card-badge">Layer 2</span>
                <h3>Staff Targeting Risk</h3>
                <p className="lp-card-desc">Are your team vulnerable to phishing attacks?</p>
                <ul className="lp-card-list">
                  <li><IconCheck /><span>Email exposure — publicly listed addresses</span></li>
                  <li><IconCheck /><span>Known data breach database checks</span></li>
                  <li><IconCheck /><span>Password policy strength assessment</span></li>
                  <li><IconCheck /><span>Login form security and 2FA analysis</span></li>
                </ul>
              </article>

              <article className="lp-card" role="listitem">
                <div className="lp-card-icon"><IconShield /></div>
                <span className="lp-card-badge">Layer 3</span>
                <h3>Client Trust Signals</h3>
                <p className="lp-card-desc">Will your clients believe it is really you?</p>
                <ul className="lp-card-list">
                  <li><IconCheck /><span>Professional trust badges and certifications</span></li>
                  <li><IconCheck /><span>Contact information visibility</span></li>
                  <li><IconCheck /><span>Website content freshness and quality</span></li>
                  <li><IconCheck /><span>HTTPS and security indicators</span></li>
                </ul>
              </article>

            </div>
          </div>
        </section>

        {/* 5. Sample Report */}
        <section className="lp-section lp-section--blue" aria-labelledby="sample-heading">
          <div className="lp-container">
            <div className="lp-grid-2">
              <div>
                <div
                  className="lp-report-placeholder"
                  role="img"
                  aria-label="Sample phishing risk report showing an overall score of 42 out of 100 with domain, staff and trust breakdown"
                >
                  <p className="lp-report-placeholder-title">Sample Report</p>
                  <div className="lp-score-demo" aria-hidden="true">42</div>
                  <p className="lp-score-label">Overall Phishing Risk Score</p>
                  <div className="lp-score-bars" aria-hidden="true">
                    <div className="lp-score-bar-row">
                      <span className="lp-score-bar-label">Domain</span>
                      <div className="lp-score-bar-track">
                        <div className="lp-score-bar-fill" style={{ width: '35%', background: '#dc2626' }} />
                      </div>
                      <span className="lp-score-bar-val" style={{ color: '#dc2626' }}>35</span>
                    </div>
                    <div className="lp-score-bar-row">
                      <span className="lp-score-bar-label">Staff</span>
                      <div className="lp-score-bar-track">
                        <div className="lp-score-bar-fill" style={{ width: '48%', background: '#f59e0b' }} />
                      </div>
                      <span className="lp-score-bar-val" style={{ color: '#f59e0b' }}>48</span>
                    </div>
                    <div className="lp-score-bar-row">
                      <span className="lp-score-bar-label">Trust</span>
                      <div className="lp-score-bar-track">
                        <div className="lp-score-bar-fill" style={{ width: '71%', background: '#10b981' }} />
                      </div>
                      <span className="lp-score-bar-val" style={{ color: '#10b981' }}>71</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="lp-section-label">What you receive</p>
                <h2 id="sample-heading" className="lp-h2">Plain English. Instant Download.</h2>
                <ul className="lp-benefits-list">
                  <li className="lp-benefit-item"><IconCheck /><span>Instant PDF download — no waiting, no email queue</span></li>
                  <li className="lp-benefit-item"><IconCheck /><span>Plain-English findings — no jargon, no acronym soup</span></li>
                  <li className="lp-benefit-item"><IconCheck /><span>Specific, actionable fixes for each vulnerability</span></li>
                  <li className="lp-benefit-item"><IconCheck /><span>Prioritised by severity — fix the critical items first</span></li>
                  <li className="lp-benefit-item"><IconCheck /><span>No credit card required — completely free to start</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6. How It Works */}
        <section className="lp-section lp-section--grey" aria-labelledby="how-heading">
          <div className="lp-container">
            <p className="lp-section-label">The process</p>
            <h2 id="how-heading" className="lp-h2">3 Simple Steps</h2>
            <div className="lp-steps">
              <div className="lp-step">
                <div className="lp-step-num" aria-hidden="true">1</div>
                <h3>Enter your website URL</h3>
                <p style={{ fontSize: '15px', marginTop: '10px', color: '#475569' }}>
                  Type your firm's domain — no account or login needed.
                </p>
              </div>
              <div className="lp-step">
                <div className="lp-step-num" aria-hidden="true">2</div>
                <h3>We scan for phishing vulnerabilities</h3>
                <p style={{ fontSize: '15px', marginTop: '10px', color: '#475569' }}>
                  Non-invasive checks across all three risk layers. Takes around 2 minutes.
                </p>
              </div>
              <div className="lp-step">
                <div className="lp-step-num" aria-hidden="true">3</div>
                <h3>Download your report and next steps</h3>
                <p style={{ fontSize: '15px', marginTop: '10px', color: '#475569' }}>
                  Get your full PDF with prioritised fixes you can act on immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Pricing */}
        <section className="lp-section" aria-labelledby="pricing-heading">
          <div className="lp-container">
            <p className="lp-section-label">Pricing</p>
            <h2 id="pricing-heading" className="lp-h2">Simple Pricing</h2>
            <p className="lp-lead">Start free. Upgrade only if you need deeper support.</p>
            <div className="lp-pricing-grid">

              <div className="lp-price-card">
                <h3>Free Scan</h3>
                <div className="lp-price-amount">£0</div>
                <p className="lp-price-period">One-time, no account needed</p>
                <ul className="lp-price-list">
                  <li><IconCheck /><span>One-time phishing scan</span></li>
                  <li><IconCheck /><span>Full 3-layer risk assessment</span></li>
                  <li><IconCheck /><span>PDF report download</span></li>
                  <li><IconCheck /><span>Email delivery</span></li>
                  <li><IconCheck /><span>No account required</span></li>
                  <li><IconCheck /><span>No credit card required</span></li>
                </ul>
                <button className="lp-btn-full" onClick={scrollToScan}>
                  Start Free Scan
                </button>
              </div>

              <div className="lp-price-card lp-price-card--featured">
                <span className="lp-price-badge">Most popular</span>
                <h3>Detailed Report</h3>
                <div className="lp-price-amount">£500</div>
                <p className="lp-price-period">One-time payment</p>
                <ul className="lp-price-list">
                  <li><IconCheck /><span>Everything in Free, plus:</span></li>
                  <li><IconCheck /><span>Detailed remediation steps per finding</span></li>
                  <li><IconCheck /><span>Priority email support (5 business days)</span></li>
                  <li><IconCheck /><span>Cyber insurance guidance</span></li>
                  <li><IconCheck /><span>Actionable fix timeline included</span></li>
                </ul>
                <button className="lp-btn-full" onClick={scrollToScan}>
                  Get Detailed Report
                </button>
              </div>

              <div className="lp-price-card">
                <h3>Quarterly Monitoring</h3>
                <div className="lp-price-amount">£150</div>
                <p className="lp-price-period">per month, or £1,500/year</p>
                <ul className="lp-price-list">
                  <li><IconCheck /><span>Everything in Detailed, plus:</span></li>
                  <li><IconCheck /><span>Quarterly phishing rescans</span></li>
                  <li><IconCheck /><span>Vulnerability trend tracking</span></li>
                  <li><IconCheck /><span>Security alerts and notifications</span></li>
                  <li><IconCheck /><span>Monthly check-in consultation</span></li>
                </ul>
                <button className="lp-btn-secondary" onClick={scrollToScan}>
                  Start Monitoring
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="lp-section lp-section--grey" aria-labelledby="faq-heading">
          <div className="lp-container">
            <p className="lp-section-label">Questions</p>
            <h2 id="faq-heading" className="lp-h2">Common Questions About Phishing Risk</h2>
            <div className="lp-faq" role="list">
              {FAQS.map(({ q, a }) => (
                <div key={q} role="listitem">
                  <FaqItem q={q} a={a} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Who This Is For */}
        <section className="lp-section" aria-labelledby="who-heading">
          <div className="lp-container">
            <p className="lp-section-label">Who it's for</p>
            <h2 id="who-heading" className="lp-h2">Built for Professional Services</h2>
            <div className="lp-who-content">
              <p>
                Solicitors, accountants, financial advisors, insurance brokers — firms that hold
                client data and funds but do not have dedicated IT or security staff.
              </p>
              <p>This scan is designed for you:</p>
              <ul className="lp-who-list">
                <li><IconCheck /><span>No technical knowledge needed — results in plain English</span></li>
                <li><IconCheck /><span>Fast results — full report in under 2 minutes</span></li>
                <li><IconCheck /><span>Real security insights, not compliance checklists</span></li>
                <li><IconCheck /><span>Fixes you can implement yourself or hand to your IT provider</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Credibility */}
        <section className="lp-section lp-section--navy" aria-labelledby="credibility-heading">
          <div className="lp-container">
            <p className="lp-section-label lp-section-label--light">About Soterius</p>
            <h2 id="credibility-heading" className="lp-h2 lp-h2--light">
              Built by Security Professionals
            </h2>
            <p className="lp-lead lp-lead--light">
              Soterius was built to solve a real problem: professional services firms should not
              need a CTO just to know if they are a phishing target.
            </p>
            <div className="lp-grid-3" style={{ marginTop: '0' }}>
              {[
                ['Real scans on real firms', 'We test the same things attackers actually look for — not theoretical checklists.'],
                ['No hype, no fear-mongering', 'Straight findings. If something is fine, we say so. If it is broken, we show you exactly how to fix it.'],
                ['Plain-English guidance', 'Every finding is explained in terms your team can understand and act on without a security background.'],
              ].map(([title, body]) => (
                <div key={title} style={{ color: '#cbd5e1' }}>
                  <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7' }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11. Final CTA */}
        <section className="lp-final-cta" aria-labelledby="final-cta-heading">
          <div className="lp-container">
            <h2 id="final-cta-heading" className="lp-h2" style={{ textAlign: 'center' }}>
              Know Your Phishing Risk
            </h2>
            <p className="lp-final-cta-sub">
              Free scan. No credit card. 90 seconds. Completely confidential.
            </p>
            <div className="lp-final-scan-form" style={{ textAlign: 'left' }}>
              <ScanForm inputId="footer-domain-input" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <ul className="lp-footer-links">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="mailto:hello@soterius.co.uk">hello@soterius.co.uk</a></li>
          </ul>
          <p className="lp-footer-copy">© 2026 Soterius Ltd. All rights reserved.</p>
        </footer>

      </div>
    </>
  );
}
