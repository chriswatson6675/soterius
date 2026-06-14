import { useState, useEffect, useRef } from 'react';
import { quickScan, deleteProspect } from '../services/api';

const SECTORS = ['', 'solicitors', 'accountants', 'financial-advisers', 'surveyors', 'other'];
const SOURCES = ['manual', 'sra-register', 'icaew-register', 'fca-register'];

const BAND_COLOR = {
  'Excellent':     '#16a34a',
  'Good':          '#65a30d',
  'Moderate Risk': '#d97706',
  'High Risk':     '#ea580c',
  'Critical Risk': '#dc2626',
};

const BAND_BG = {
  'Excellent':     '#f0fdf4',
  'Good':          '#f7fee7',
  'Moderate Risk': '#fffbeb',
  'High Risk':     '#fff7ed',
  'Critical Risk': '#fef2f2',
};

function ratingFromPct(pct) {
  return Math.round((pct / 100) * 999);
}

// ── Token gate ────────────────────────────────────────────────────────────────

function TokenGate({ onToken }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '40px 48px', width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#0f2540', marginBottom: 4 }}>Soterius</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Research Mode</div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Admin token</label>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onToken(value.trim())}
          placeholder="Enter admin token"
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          onClick={() => value.trim() && onToken(value.trim())}
          style={{ marginTop: 16, width: '100%', padding: '11px 0', background: '#0f2540', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Scan result panel ─────────────────────────────────────────────────────────

function ResultPanel({ result, onDelete }) {
  const color = BAND_COLOR[result.riskLevel] || '#64748b';
  const bg    = BAND_BG[result.riskLevel]    || '#f8fafc';
  const rating = ratingFromPct(result.score);

  const failChecks = [];
  for (const scanner of (result.scanners || [])) {
    for (const check of (scanner.checks || [])) {
      if (check.status === 'FAIL') failChecks.push({ name: check.name, category: scanner.name });
    }
  }

  return (
    <div style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: 10, padding: '20px 24px', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color, fontFamily: 'Georgia, serif' }}>{rating}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{result.riskLevel}</span>
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{result.domain}</span>
        {result.created && <span style={{ fontSize: 11, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 99 }}>new prospect</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: failChecks.length ? 14 : 0 }}>
        {(result.scanners || []).map(s => {
          const c = s.score >= 75 ? '#16a34a' : s.score >= 50 ? '#d97706' : '#dc2626';
          return (
            <div key={s.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>{s.name.replace('GDPR / Cookie Compliance', 'GDPR').replace('SSL/TLS Encryption', 'SSL').replace('Vulnerable Components', 'VulnComp').replace('Security Headers', 'Headers').replace('Email Security', 'Email')}</span>
              <span style={{ fontWeight: 700, color: c, marginLeft: 6 }}>{s.score}%</span>
            </div>
          );
        })}
      </div>

      {failChecks.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {failChecks.map((c, i) => (
            <div key={i} style={{ fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span>✗</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      )}

      {onDelete && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={onDelete}
            style={{ fontSize: 12, color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
          >
            Delete this scan
          </button>
        </div>
      )}
    </div>
  );
}

// ── Session log ───────────────────────────────────────────────────────────────

function SessionLog({ scans, onDelete }) {
  if (!scans.length) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Recent scans — this session
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '4px 8px 8px 0', fontWeight: 600, color: '#64748b' }}>Domain</th>
            <th style={{ textAlign: 'right', padding: '4px 8px 8px', fontWeight: 600, color: '#64748b' }}>Score</th>
            <th style={{ textAlign: 'left', padding: '4px 8px 8px', fontWeight: 600, color: '#64748b' }}>Band</th>
            <th style={{ padding: '4px 0 8px', fontWeight: 600, color: '#64748b' }} />
          </tr>
        </thead>
        <tbody>
          {scans.map((s, i) => {
            const color = BAND_COLOR[s.riskLevel] || '#64748b';
            return (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '7px 8px 7px 0', color: '#0f2540' }}>{s.domain}</td>
                <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color }}>{ratingFromPct(s.score)}</td>
                <td style={{ padding: '7px 8px', color }}>{s.riskLevel}</td>
                <td style={{ padding: '7px 0', textAlign: 'right' }}>
                  <button
                    onClick={() => onDelete(s.prospectId, i)}
                    style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main research page ────────────────────────────────────────────────────────

export default function Research() {
  const [token, setToken]           = useState(() => localStorage.getItem('soterius_admin_token') || '');
  const [form, setForm]             = useState({ website: '', firm_name: '', sector: '', location: '', source: 'manual' });
  const [phase, setPhase]           = useState('idle');
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const [sessionScans, setSession]  = useState([]);
  const websiteRef = useRef(null);

  async function handleDelete(prospectId, sessionIndex) {
    if (!prospectId) return;
    try {
      await deleteProspect(token, prospectId);
      if (sessionIndex !== undefined) {
        setSession(prev => prev.filter((_, i) => i !== sessionIndex));
      }
      if (result?.prospectId === prospectId) setResult(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  useEffect(() => {
    if (token) setTimeout(() => websiteRef.current?.focus(), 50);
  }, [token]);

  function saveToken(t) {
    localStorage.setItem('soterius_admin_token', t);
    setToken(t);
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleScan(e) {
    e.preventDefault();
    if (!form.website.trim()) return;
    setPhase('scanning');
    setError('');
    setResult(null);
    try {
      const data = await quickScan(token, {
        website:   form.website.trim(),
        firm_name: form.firm_name.trim() || undefined,
        sector:    form.sector   || undefined,
        location:  form.location.trim() || undefined,
        source:    form.source,
      });
      setResult(data);
      setSession(prev => [data, ...prev].slice(0, 50));
      setForm(f => ({ ...f, website: '', firm_name: '' }));
      setPhase('done');
      setTimeout(() => websiteRef.current?.focus(), 50);
    } catch (err) {
      if (err.message === 'Invalid admin token') {
        localStorage.removeItem('soterius_admin_token');
        setToken('');
      }
      setError(err.message);
      setPhase('error');
    }
  }

  if (!token) return <TokenGate onToken={saveToken} />;

  const scanning = phase === 'scanning';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#0f2540' }}>Soterius</span>
            <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 10 }}>Research Mode</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {sessionScans.length > 0 && (
              <span style={{ fontSize: 13, color: '#64748b' }}>{sessionScans.length} scanned this session</span>
            )}
            <button
              onClick={() => { localStorage.removeItem('soterius_admin_token'); setToken(''); }}
              style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Scan form */}
        <form onSubmit={handleScan} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Website *</label>
              <input
                ref={websiteRef}
                type="text"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="smithpartners.co.uk"
                required
                disabled={scanning}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Firm name</label>
              <input
                type="text"
                value={form.firm_name}
                onChange={e => set('firm_name', e.target.value)}
                placeholder="Smith & Partners LLP"
                disabled={scanning}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Sector</label>
              <select value={form.sector} onChange={e => set('sector', e.target.value)} disabled={scanning} style={inputStyle}>
                {SECTORS.map(s => <option key={s} value={s}>{s || '— select —'}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="London"
                disabled={scanning}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Source</label>
              <select value={form.source} onChange={e => set('source', e.target.value)} disabled={scanning} style={inputStyle}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="submit"
              disabled={scanning || !form.website.trim()}
              style={{
                padding: '10px 28px',
                background: scanning ? '#94a3b8' : '#0f2540',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: scanning ? 'not-allowed' : 'pointer',
              }}
            >
              {scanning ? 'Scanning…' : 'Scan'}
            </button>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Sector and location persist between scans</span>
          </div>
        </form>

        {/* Error */}
        {phase === 'error' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && phase === 'done' && (
          <ResultPanel result={result} onDelete={() => handleDelete(result.prospectId)} />
        )}

        {/* Session log */}
        <SessionLog scans={sessionScans} onDelete={handleDelete} />

      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#0f2540',
};
