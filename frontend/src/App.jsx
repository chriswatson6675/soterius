import { Routes, Route, Link } from 'react-router-dom';
import Landing  from './pages/Landing';
import Results  from './pages/Results';
import Research from './pages/Research';
import './App.css';

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', gap: 16 }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: '#0f2540' }}>404</h1>
      <p style={{ color: '#64748b', fontSize: 16 }}>Page not found.</p>
      <Link to="/" style={{ color: '#2563eb', fontSize: 15 }}>← Back to home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/results"   element={<Results />} />
      <Route path="/research"  element={<Research />} />
      <Route path="*"          element={<NotFound />} />
    </Routes>
  );
}
