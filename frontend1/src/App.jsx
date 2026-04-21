import { useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Activity, MapPin, Download, BarChart3, Upload,
  FileSpreadsheet, Layers, GitBranch, Zap, TrendingDown,
  Table2, AlertTriangle, ChevronRight, X, Map
} from 'lucide-react';

const API_URL = "http://127.0.0.1:5000/analyze";
const MAP_URL = "http://127.0.0.1:5000/map";

// ─── Sidebar nav items — each maps to a key in the response ──────────────────
const NAV_SECTIONS = [
  { key: "overview",     label: "Overview",          icon: BarChart3,    desc: "Key stats & GR curve" },
  { key: "gr_curve",     label: "GR Curve",          icon: TrendingDown, desc: "Gutenberg–Richter plot" },
  { key: "compiled",     label: "Compiled catalog",  icon: Table2,       desc: "Raw deduplicated events" },
  { key: "filtered",     label: "Filtered catalog",  icon: Layers,       desc: "Events after fault filter" },
  { key: "declustered",  label: "Declustered",       icon: GitBranch,    desc: "Mainshocks only" },
  { key: "yearly_mag",   label: "Yearly magnitude",  icon: Table2,       desc: "Event count per year/band" },
  { key: "cumulative",   label: "Cumulative counts", icon: Table2,       desc: "Cumulative G-R table" },
  { key: "ab_table",     label: "A-B PSHA table",    icon: Table2,       desc: "logN vs magnitude" },
  { key: "completeness", label: "Completeness",      icon: Table2,       desc: "Stepp completeness table" },
  { key: "faults",       label: "Fault metrics",     icon: GitBranch,    desc: "Fault lengths, weights, α" },
  { key: "psha_summary", label: "PSHA summary",      icon: Zap,          desc: "µ(z) vs PGA table" },
  { key: "mare",         label: "MARE table",        icon: Zap,          desc: "Return period PGA values" },
  { key: "hazard_curve", label: "Hazard curve",      icon: TrendingDown, desc: "PGA exceedance curve" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  // "home" | "map" | "report"
  const [view, setView]     = useState('home');
  const [report, setReport] = useState(null);

  if (view === 'map') {
    return (
      <>
        <FaultMapView onBack={() => setView('home')} />
        <ToastContainer position="bottom-right" autoClose={4000} theme="light" />
      </>
    );
  }

  if (view === 'report' && report) {
    return (
      <>
        <ReportView data={report} onReset={() => { setReport(null); setView('home'); }} />
        <ToastContainer position="bottom-right" autoClose={4000} theme="light" />
      </>
    );
  }

  return (
    <>
      <InputView
        onSuccess={(data) => { setReport(data); setView('report'); }}
        onShowMap={() => setView('map')}
      />
      <ToastContainer position="bottom-right" autoClose={4000} theme="light" />
    </>
  );
}

// ─── India Fault Map full-screen view ────────────────────────────────────────
function FaultMapView({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px', background: '#0f172a',
        borderBottom: '1px solid #1e293b', flexShrink: 0
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1e293b', border: 'none', borderRadius: 8,
            color: '#94a3b8', fontSize: 13, fontWeight: 500,
            padding: '7px 14px', cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Map color="white" size={16} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              India Fault Map
            </div>
            <div style={{ color: '#475569', fontSize: 11 }}>
              Interactive — hover faults to view details
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16,
          background: '#1e293b', borderRadius: 10, padding: '7px 16px'
        }}>
          {[
            { color: '#ef4444', label: 'Neotectonic' },
            { color: '#f97316', label: 'Cover' },
            { color: '#3b82f6', label: 'Basement & Cover' },
            { color: '#6b7280', label: 'Sub-surface' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 3, background: color, borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading && !error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0f172a', zIndex: 10, gap: 16
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '3px solid #1e293b', borderTopColor: '#3b82f6',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Loading fault map…</p>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0f172a', zIndex: 10, gap: 12, padding: 32, textAlign: 'center'
          }}>
            <AlertTriangle size={40} color="#f59e0b" />
            <p style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, margin: 0 }}>
              Map not available
            </p>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0, maxWidth: 420 }}>
              Make sure your Flask server is running on port 5000 and that you have generated
              the map by running <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, color: '#60a5fa' }}>plotMap.py</code> first.
            </p>
            <button
              onClick={() => { setError(false); setLoading(true); }}
              style={{
                marginTop: 8, padding: '9px 20px', background: '#2563eb',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        <iframe
          key={loading}          // remounts on retry
          src={MAP_URL}
          title="India Fault Map"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Input form ───────────────────────────────────────────────────────────────
function InputView({ onSuccess, onShowMap }) {
  const [loading,  setLoading]  = useState(false);
  const [file,     setFile]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    lat: '', lon: '', radius: '300', decluster: '50', buffer: '15',
    x_coord: '', y_coord: '', start_year: '2020'
  });
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
      if (f.size > 50 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 50 MB.', { icon: '📁' });
        return;
      }
      setFile(f);
      toast.success(`File selected: ${f.name}`, { icon: '✅', autoClose: 2000 });
    } else {
      toast.error('Please upload an Excel file (.xlsx or .xls)', { icon: '📁' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload your earthquake Excel file.', { position: 'top-center', icon: '📁' });
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('latitude',    parseFloat(form.lat));
    fd.append('longitude',   parseFloat(form.lon));
    fd.append('radius',      parseFloat(form.radius));
    fd.append('decluster_km', parseFloat(form.decluster));
    fd.append('buffer_km',   parseFloat(form.buffer));
    fd.append('x_coord',     parseFloat(form.x_coord || form.lat));
    fd.append('y_coord',     parseFloat(form.y_coord || form.lon));
    fd.append('start_year',  parseInt(form.start_year));

    let loadingToastId = null;
    try {
      loadingToastId = toast.loading('🔄 Running analysis… (this may take a few minutes)', { position: 'bottom-right' });
      const res = await axios.post(API_URL, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000
      });
      toast.dismiss(loadingToastId);

      if (res.data.status === 'success') {
        toast.success('✅ Analysis completed successfully!', { autoClose: 3000 });
        onSuccess(res.data);
      } else {
        const errorMsg  = res.data.message  || 'Unknown error occurred';
        const errorType = res.data.type     || 'error';
        const icons = { column_error: '📋', file_error: '📁', parameter_error: '⚙️', data_error: '📊', analysis_error: '❌' };
        toast.error(errorMsg, { icon: icons[errorType] || '⚠️', autoClose: 5000, position: 'top-center' });
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      let msg  = 'Could not connect to Flask server. Make sure it is running on port 5000.';
      let icon = '🔌';
      if (error.response?.status === 400) { msg = error.response.data.message || 'Bad request'; icon = '⚠️'; }
      else if (error.response?.status === 500) { msg = error.response.data.message || 'Server error'; icon = '❌'; }
      else if (error.code === 'ECONNABORTED') { msg = 'Request timed out. Try reducing radius or buffer distance.'; icon = '⏱️'; }
      else if (error.message === 'Network Error') { msg = 'Network error — check your connection.'; icon = '📡'; }
      toast.error(msg, { icon, autoClose: 5000, position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const F = (key, label, opts = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type="number" step="any" required={opts.required !== false}
        value={form[key]} placeholder={opts.placeholder || ''}
        style={{
          padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
          fontSize: 14, fontWeight: 500, color: '#0f172a', background: '#f8fafc',
          outline: 'none', width: '100%', boxSizing: 'border-box'
        }}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
      {opts.hint && <span style={{ fontSize: 11, color: '#94a3b8' }}>{opts.hint}</span>}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ maxWidth: 640, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            borderRadius: 20, marginBottom: 20
          }}>
            <Activity color="white" size={36} />
          </div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Seismic Analyzer
          </h1>
          <p style={{ color: '#93c5fd', fontSize: 15, margin: '0 0 20px' }}>
            Earthquake PSHA &amp; hazard analysis platform
          </p>

          {/* ── View Fault Map button ── */}
          <button
            onClick={onShowMap}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10, border: '1.5px solid #334155',
              background: 'rgba(255,255,255,0.05)', color: '#93c5fd',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#334155'; }}
          >
            <Map size={15} />
            View India Fault Map
          </button>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 36, boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>

          {/* File upload */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
              Earthquake catalog (Excel)
            </label>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${dragOver ? '#3b82f6' : file ? '#22c55e' : '#cbd5e1'}`,
                borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#f8fafc', transition: 'all 0.2s'
              }}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <FileSpreadsheet size={22} color="#16a34a" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#15803d' }}>{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                    Drop your <strong>.xlsx</strong> file here or <span style={{ color: '#3b82f6' }}>browse</span>
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    Must contain: year, month, date, hours, minutes, latitude, longitude, magnitude, mag type
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Divider icon={<MapPin size={14} />} label="Site coordinates" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {F('lat', 'Center latitude',  { required: true, placeholder: 'e.g. 22.62' })}
              {F('lon', 'Center longitude', { required: true, placeholder: 'e.g. 75.69' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              {F('radius',   'Radius (km)',      { placeholder: '300' })}
              {F('decluster','Decluster (km)',   { placeholder: '50' })}
              {F('buffer',   'Fault buffer (km)',{ placeholder: '15' })}
            </div>

            <Divider icon={<Zap size={14} />} label="PSHA site point (x_coord / y_coord)" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
              {F('x_coord',    'Site latitude',  { required: false, placeholder: 'defaults to center lat', hint: 'Leave blank to use center lat' })}
              {F('y_coord',    'Site longitude', { required: false, placeholder: 'defaults to center lon', hint: 'Leave blank to use center lon' })}
              {F('start_year', 'End year',       { placeholder: '2020', hint: 'Year analysis ends at' })}
            </div>

            <button
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#2563eb,#0891b2)',
                color: 'white', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading
                ? <><Activity size={18} style={{ animation: 'spin 1s linear infinite' }} /> Running analysis…</>
                : 'Run analysis'
              }
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Divider({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
        {icon} {label}
      </div>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  );
}

// ─── Report view with sidebar ─────────────────────────────────────────────────
function ReportView({ data, onReset }) {
  const [active, setActive] = useState('overview');
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity color="white" size={18} />
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Seismic</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>Analyzer</div>
            </div>
          </div>
        </div>

        {/* ── Fault Map button in sidebar ── */}
        <div style={{ padding: '12px 10px 0' }}>
          <button
            onClick={() => setMapOpen(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#1e3a5f', marginBottom: 4, textAlign: 'left',
            }}
          >
            <Map size={15} color="#60a5fa" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
                India Fault Map
              </div>
              <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.2 }}>Interactive fault viewer</div>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 10px' }}>
          {NAV_SECTIONS.map(({ key, label, icon: Icon, desc }) => {
            const isActive = active === key;
            return (
              <button key={key} onClick={() => setActive(key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: isActive ? '#1e3a5f' : 'transparent',
                marginBottom: 2, textAlign: 'left', transition: 'background 0.15s'
              }}>
                <Icon size={15} color={isActive ? '#60a5fa' : '#475569'} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#e2e8f0' : '#94a3b8', lineHeight: 1.3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {desc}
                  </div>
                </div>
                {isActive && <ChevronRight size={12} color="#60a5fa" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.download_excel && (
            <a href={data.download_excel} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              background: '#14532d', borderRadius: 8, color: '#86efac', fontSize: 12,
              fontWeight: 600, textDecoration: 'none'
            }}>
              <Download size={14} /> Download Excel
            </a>
          )}
          <button onClick={onReset} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
            background: '#1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 12,
            fontWeight: 500, border: 'none', cursor: 'pointer', width: '100%'
          }}>
            ← New analysis
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflowX: 'auto' }}>
        <PanelContent section={active} data={data} />
      </main>

      {/* ── Fault Map modal overlay ── */}
      {mapOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column'
        }}>
          {/* Modal header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
            background: '#0f172a', borderBottom: '1px solid #1e293b', flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Map color="white" size={16} />
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>India Fault Map</div>
                <div style={{ color: '#475569', fontSize: 11 }}>Interactive — hover faults to view details</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16,
              background: '#1e293b', borderRadius: 10, padding: '7px 16px'
            }}>
              {[
                { color: '#ef4444', label: 'Neotectonic' },
                { color: '#f97316', label: 'Cover' },
                { color: '#3b82f6', label: 'Basement & Cover' },
                { color: '#6b7280', label: 'Sub-surface' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 3, background: color, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMapOpen(false)}
              style={{
                background: '#1e293b', border: 'none', borderRadius: 8,
                color: '#94a3b8', padding: '7px 14px', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <X size={14} /> Close
            </button>
          </div>

          {/* Map iframe inside modal */}
          <iframe
            src={MAP_URL}
            title="India Fault Map"
            style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Panel router ─────────────────────────────────────────────────────────────
function PanelContent({ section, data }) {
  switch (section) {
    case 'overview':     return <OverviewPanel data={data} />;
    case 'gr_curve':     return <GraphPanel title="Gutenberg–Richter relation" b64={data.graph} subtitle="log₁₀(N) vs Magnitude" />;
    case 'hazard_curve': return <GraphPanel title="Seismic hazard curve" b64={data.hazard_curve} subtitle="Mean annual rate of exceedance vs PGA (g)" />;
    case 'compiled':     return <TablePanel title="Compiled catalog" subtitle="All events after deduplication" rows={data.compiled_preview} />;
    case 'filtered':     return <TablePanel title="Filtered catalog" subtitle="Events within fault buffer zone" rows={data.filtered_preview} />;
    case 'declustered':  return <TablePanel title="Declustered catalog" subtitle="Mainshocks only after Gardner–Knopoff declustering" rows={data.declustered_preview} />;
    case 'yearly_mag':   return <TablePanel title="Yearly magnitude counts" subtitle="Number of events per year per magnitude band" rows={data.yearly_mag} />;
    case 'cumulative':   return <TablePanel title="Cumulative counts" subtitle="Cumulative G–R table" rows={data.cumulative} />;
    case 'ab_table':     return <TablePanel title="A–B PSHA table" subtitle="logN vs magnitude — Gutenberg–Richter regression inputs" rows={data.ab_table} />;
    case 'completeness': return <TablePanel title="Completeness analysis" subtitle="Stepp method — λ and σ per period per magnitude band" rows={data.completeness} />;
    case 'faults':       return <TablePanel title="Fault metrics" subtitle="Fault lengths, earthquake counts, weights, and revised α" rows={data.fault_metrics} />;
    case 'psha_summary': return <TablePanel title="PSHA summary" subtitle="Total µ(z) and return period for each PGA value" rows={data.psha_summary} />;
    case 'mare':         return <MarePanel data={data} />;
    default:             return null;
  }
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewPanel({ data }) {
  const stats = [
    { label: 'a-value',         value: typeof data.a_value === 'number' ? data.a_value.toFixed(4) : data.a_value },
    { label: 'b-value',         value: typeof data.b_value === 'number' ? data.b_value.toFixed(4) : data.b_value },
    { label: 'R²',              value: typeof data.r2 === 'number' ? data.r2.toFixed(4) : data.r2 },
    { label: 'Total events',    value: data.number_of_earthquakes },
    { label: 'After dedup',     value: data.dedup_count ?? '—' },
    { label: 'After filter',    value: data.filtered_count ?? '—' },
    { label: 'After decluster', value: data.declustered_count ?? '—' },
    { label: 'Faults found',    value: data.fault_count ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Overview" sub="Key statistics from the analysis run" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map(s => <StatCard key={s.label} label={s.label} value={s.value} />)}
      </div>
      {data.graph && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Gutenberg–Richter relation</h3>
          <img src={`data:image/png;base64,${data.graph}`} alt="GR plot" style={{ maxWidth: '100%', borderRadius: 10 }} />
        </div>
      )}
    </div>
  );
}

// ─── Graph panel ──────────────────────────────────────────────────────────────
function GraphPanel({ title, subtitle, b64 }) {
  return (
    <div>
      <PageHeader title={title} sub={subtitle} />
      <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '0.5px solid #e2e8f0' }}>
        {b64 ? (
          <img src={`data:image/png;base64,${b64}`} alt={title} style={{ maxWidth: '100%', borderRadius: 10 }} />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <AlertTriangle size={32} style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No image data returned from the server for this section.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generic table panel ──────────────────────────────────────────────────────
function TablePanel({ title, subtitle, rows }) {
  if (!rows || rows.length === 0) return (
    <div><PageHeader title={title} sub={subtitle} /><EmptyState /></div>
  );
  const cols = Object.keys(rows[0]);
  return (
    <div>
      <PageHeader title={title} sub={subtitle} />
      <div style={{ background: 'white', borderRadius: 16, border: '0.5px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {cols.map(c => (
                  <th key={c} style={{
                    padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap'
                  }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  {cols.map(c => {
                    const v = row[c];
                    const display = typeof v === 'number'
                      ? (Number.isInteger(v) ? v : parseFloat(v.toFixed(5)))
                      : (v === null || v === undefined ? '—' : String(v));
                    return (
                      <td key={c} style={{
                        padding: '9px 14px', borderBottom: '0.5px solid #e2e8f0',
                        color: '#1e293b', fontFamily: typeof v === 'number' ? 'monospace' : 'inherit',
                        fontSize: typeof v === 'number' ? 12 : 13, whiteSpace: 'nowrap'
                      }}>{display}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '0.5px solid #e2e8f0', color: '#94a3b8', fontSize: 12 }}>
          {rows.length} rows
        </div>
      </div>
    </div>
  );
}

// ─── MARE panel ───────────────────────────────────────────────────────────────
function MarePanel({ data }) {
  const rows = data.mare ?? [];
  return (
    <div>
      <PageHeader title="MARE table" sub="Mean annual rate of exceedance — return period PGA values" />
      {rows.length === 0 ? <EmptyState /> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 12, padding: '16px 20px',
              border: '0.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20
            }}>
              <div style={{ flex: 1, fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{r.Scenario}</div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>MARE</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>
                  {typeof r['Mean Annual Rate of Exceedance'] === 'number'
                    ? r['Mean Annual Rate of Exceedance'].toExponential(4)
                    : r['Mean Annual Rate of Exceedance']}
                </div>
              </div>
              <div style={{
                textAlign: 'center', flexShrink: 0, background: '#eff6ff',
                borderRadius: 8, padding: '8px 16px', minWidth: 80
              }}>
                <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600, marginBottom: 2 }}>PGA</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8' }}>
                  {typeof r['PGA (g)'] === 'number' ? r['PGA (g)'].toFixed(3) : r['PGA (g)']}g
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{sub}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px 18px', border: '0.5px solid #e2e8f0' }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1e40af' }}>{value ?? '—'}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '60px 24px', textAlign: 'center',
      border: '0.5px solid #e2e8f0', color: '#94a3b8'
    }}>
      <AlertTriangle size={32} style={{ marginBottom: 12 }} />
      <p style={{ margin: 0, fontSize: 14 }}>No data returned from the server for this section.</p>
      <p style={{ margin: '6px 0 0', fontSize: 12 }}>Check that your Flask API returns this key in the response.</p>
    </div>
  );
}