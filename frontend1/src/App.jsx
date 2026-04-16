// import { useState } from 'react';
// import axios from 'axios';
// import { Activity, MapPin, Download, Table, BarChart3 } from 'lucide-react';

// const App = () => {
//   const [loading, setLoading] = useState(false);
//   const [report, setReport] = useState(null);
//   const [formData, setFormData] = useState({ lat: '21.8', lon: '75.6' });

//   const API_URL = "http://127.0.0.1:5000/analyze";

//   const handleAnalyze = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await axios.post(API_URL, {
//         latitude: parseFloat(formData.lat),
//         longitude: parseFloat(formData.lon)
//       });

//       if (response.data.status === "success") {
//         setReport(response.data);
//       } else {
//         alert("Error: " + response.data.message);
//       }
//     } catch (error) {
//       alert("Could not connect to Flask server. Make sure it's running on port 5000.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (report) return <ReportView data={report} onReset={() => setReport(null)} />;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMmEzZSIgb3BhY2l0eT0iLjIiLz48L2c+PC9zdmc+')] opacity-30"></div>

//       <div className="max-w-xl w-full relative z-10">
//         <header className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
//             <Activity className="text-white" size={40} strokeWidth={2.5} />
//           </div>
//           <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
//             SEISMIC ANALYZER
//           </h1>
//           <p className="text-blue-200 text-lg">Advanced earthquake data analysis platform</p>
//         </header>

//         <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
//           <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
//             <MapPin className="text-blue-600" size={24} />
//             <div>
//               <h2 className="text-lg font-bold text-gray-900">Location Coordinates</h2>
//               <p className="text-sm text-gray-500">Enter precise latitude and longitude values</p>
//             </div>
//           </div>

//           <form onSubmit={handleAnalyze} className="space-y-6">
//             <div className="grid grid-cols-2 gap-6">
//               <div className="flex flex-col">
//                 <label className="text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">Latitude</label>
//                 <input
//                   type="number" step="any" value={formData.lat} required
//                   className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 font-semibold text-gray-900"
//                   onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">Longitude</label>
//                 <input
//                   type="number" step="any" value={formData.lon} required
//                   className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 font-semibold text-gray-900"
//                   onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
//                 />
//               </div>
//             </div>

//             <button
//               disabled={loading}
//               className="w-full py-5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 text-lg font-bold hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <Activity className="animate-spin" size={20} />
//                   Running Analysis...
//                 </span>
//               ) : (
//                 "Start Analysis"
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ReportView = ({ data, onReset }) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-4xl font-black text-gray-900 mb-2">Analysis Results</h2>
//             <p className="text-gray-600">Comprehensive seismic data report</p>
//           </div>
//           <button
//             onClick={onReset}
//             className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all transform hover:scale-105"
//           >
//             ← New Analysis
//           </button>
//         </div>

//         <div className="grid md:grid-cols-4 gap-6">
//           <StatCard label="A-Value" value={data.a_value} />
//           <StatCard label="B-Value" value={data.b_value} />
//           <StatCard label="R²" value={data.r2} />
//           <StatCard label="Total EQ" value={data.number_of_earthquakes} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-blue-900 p-8 rounded-3xl shadow-2xl">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="font-bold text-2xl flex items-center gap-3 text-white">
//                 <BarChart3 className="text-cyan-400" size={28} /> Gutenberg–Richter Relation
//               </h3>
//               <span className="text-xs bg-white/10 px-4 py-2 rounded-full text-blue-200 font-bold tracking-wide backdrop-blur-sm">
//                 LOG10(N) vs MAGNITUDE
//               </span>
//             </div>

//             <div className="bg-slate-950/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex justify-center items-center min-h-[450px]">
//               {data.graph ? (
//                 <img
//                   src={`data:image/png;base64,${data.graph}`}
//                   alt="Seismic Analysis Graph"
//                   className="max-w-full h-auto rounded-xl shadow-2xl"
//                 />
//               ) : (
//                 <div className="flex flex-col items-center gap-4 text-slate-400">
//                   <Activity className="animate-pulse" size={56} />
//                   <p className="font-semibold text-lg">Processing Visual Data...</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
//             <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-900">
//               <Table size={24} className="text-blue-600" /> Fault Data Preview
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b-2 border-gray-300">
//                     {data.fault_preview && data.fault_preview.length > 0 && Object.keys(data.fault_preview[0]).map(key => (
//                       <th key={key} className="p-3 text-xs font-black uppercase text-gray-600 tracking-wider">{key}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.fault_preview && data.fault_preview.map((row, i) => (
//                     <tr key={i} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
//                       {Object.values(row).map((val, j) => (
//                         <td key={j} className="p-3 text-sm font-medium text-gray-700">
//                           {typeof val === 'number' ? val.toFixed(3) : String(val)}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-center">
//           <a
//             href={data.download_excel}
//             className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-600 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:scale-105 active:scale-95"
//           >
//             <Download size={24} /> Download Full Excel Report
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ label, value }) => (
//   <div className="bg-white p-8 rounded-2xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all transform hover:scale-105 group">
//     <p className="text-gray-600 text-xs uppercase font-black tracking-wider mb-2">{label}</p>
//     <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-cyan-600 transition-all">
//       {value}
//     </p>
//   </div>
// );

// export default App;

import { useState, useRef } from 'react';
import axios from 'axios';
import {
  Activity, MapPin, Download, BarChart3, Upload,
  FileSpreadsheet, Layers, GitBranch, Zap, TrendingDown,
  Table2, AlertTriangle, ChevronRight, X
} from 'lucide-react';

const API_URL = "http://127.0.0.1:5000/analyze";

// ─── Sidebar nav items — each maps to a key in the response ──────────────────
const NAV_SECTIONS = [
  { key: "overview",        label: "Overview",               icon: BarChart3,    desc: "Key stats & GR curve" },
  { key: "gr_curve",        label: "GR Curve",               icon: TrendingDown, desc: "Gutenberg–Richter plot" },
  { key: "compiled",        label: "Compiled catalog",       icon: Table2,       desc: "Raw deduplicated events" },
  { key: "filtered",        label: "Filtered catalog",       icon: Layers,       desc: "Events after fault filter" },
  { key: "declustered",     label: "Declustered catalog",    icon: GitBranch,    desc: "Mainshocks only" },
  { key: "yearly_mag",      label: "Yearly magnitude",       icon: Table2,       desc: "Event count per year/band" },
  { key: "cumulative",      label: "Cumulative counts",      icon: Table2,       desc: "Cumulative G-R table" },
  { key: "ab_table",        label: "A-B PSHA table",         icon: Table2,       desc: "logN vs magnitude" },
  { key: "completeness",    label: "Completeness",           icon: Table2,       desc: "Stepp completeness table" },
  { key: "faults",          label: "Fault metrics",          icon: GitBranch,    desc: "Fault lengths, weights, α" },
  { key: "psha_summary",    label: "PSHA summary",           icon: Zap,          desc: "µ(z) vs PGA table" },
  { key: "mare",            label: "MARE table",             icon: Zap,          desc: "Return period PGA values" },
  { key: "hazard_curve",    label: "Hazard curve",           icon: TrendingDown, desc: "PGA exceedance curve" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [report, setReport] = useState(null);
  if (report) return <ReportView data={report} onReset={() => setReport(null)} />;
  return <InputView onSuccess={setReport} />;
}

// ─── Input form ───────────────────────────────────────────────────────────────
function InputView({ onSuccess }) {
  const [loading, setLoading]   = useState(false);
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm]         = useState({
    lat: '', lon: '', radius: '300', decluster: '50', buffer: '15',
    x_coord: '', y_coord: '', start_year: '2020'
  });
  const fileRef = useRef();

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) setFile(f);
    else alert('Please upload an Excel file (.xlsx or .xls)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { alert('Please upload your earthquake Excel file.'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('latitude',      parseFloat(form.lat));
    fd.append('longitude',     parseFloat(form.lon));
    fd.append('radius',        parseFloat(form.radius));
    fd.append('decluster_km',  parseFloat(form.decluster));
    fd.append('buffer_km',     parseFloat(form.buffer));
    fd.append('x_coord',       parseFloat(form.x_coord || form.lat));
    fd.append('y_coord',       parseFloat(form.y_coord || form.lon));
    fd.append('start_year',    parseInt(form.start_year));
    try {
      const res = await axios.post(API_URL, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.status === 'success') onSuccess(res.data);
      else alert('Error: ' + res.data.message);
    } catch {
      alert('Could not connect to Flask server. Make sure it is running on port 5000.');
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
        value={form[key]}
        placeholder={opts.placeholder || ''}
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
          <p style={{ color: '#93c5fd', fontSize: 15, margin: 0 }}>
            Earthquake PSHA &amp; hazard analysis platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 24, padding: 36,
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
        }}>

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
                background: dragOver ? '#eff6ff' : file ? '#f0fdf4' : '#f8fafc',
                transition: 'all 0.2s'
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
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Must contain a "Compiled" sheet</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                <MapPin size={14} /> Site coordinates
              </div>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {F('lat',  'Center latitude',  { required: true, placeholder: 'e.g. 22.62' })}
              {F('lon',  'Center longitude', { required: true, placeholder: 'e.g. 75.69' })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              {F('radius',   'Radius (km)',   { placeholder: '300' })}
              {F('decluster','Decluster (km)',{ placeholder: '50'  })}
              {F('buffer',   'Fault buffer (km)', { placeholder: '15' })}
            </div>

            {/* PSHA site divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                <Zap size={14} /> PSHA site point (x_coord / y_coord)
              </div>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

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
                color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <><Activity size={18} style={{ animation: 'spin 1s linear infinite' }} /> Running analysis…</> : 'Run analysis'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Report view with sidebar ─────────────────────────────────────────────────
function ReportView({ data, onReset }) {
  const [active, setActive] = useState('overview');

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

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
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
    </div>
  );
}

// ─── Panel router ─────────────────────────────────────────────────────────────
function PanelContent({ section, data }) {
  switch (section) {
    case 'overview':    return <OverviewPanel data={data} />;
    case 'gr_curve':    return <GraphPanel title="Gutenberg–Richter relation" b64={data.graph} subtitle="log₁₀(N) vs Magnitude" />;
    case 'hazard_curve':return <GraphPanel title="Seismic hazard curve" b64={data.hazard_curve} subtitle="Mean annual rate of exceedance vs PGA (g)" />;
    case 'compiled':    return <TablePanel title="Compiled catalog" subtitle="All events after deduplication" rows={data.compiled_preview} />;
    case 'filtered':    return <TablePanel title="Filtered catalog" subtitle="Events within fault buffer zone" rows={data.filtered_preview} />;
    case 'declustered': return <TablePanel title="Declustered catalog" subtitle="Mainshocks only after Gardner–Knopoff declustering" rows={data.declustered_preview} />;
    case 'yearly_mag':  return <TablePanel title="Yearly magnitude counts" subtitle="Number of events per year per magnitude band" rows={data.yearly_mag} />;
    case 'cumulative':  return <TablePanel title="Cumulative counts" subtitle="Cumulative G–R table" rows={data.cumulative} />;
    case 'ab_table':    return <TablePanel title="A–B PSHA table" subtitle="logN vs magnitude — Gutenberg–Richter regression inputs" rows={data.ab_table} />;
    case 'completeness':return <TablePanel title="Completeness analysis" subtitle="Stepp method — λ and σ per period per magnitude band" rows={data.completeness} />;
    case 'faults':      return <TablePanel title="Fault metrics" subtitle="Fault lengths, earthquake counts, weights, and revised α" rows={data.fault_metrics} />;
    case 'psha_summary':return <TablePanel title="PSHA summary" subtitle="Total µ(z) and return period for each PGA value" rows={data.psha_summary} />;
    case 'mare':        return <MarePanel data={data} />;
    default:            return null;
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
    <div>
      <PageHeader title={title} sub={subtitle} />
      <EmptyState />
    </div>
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

// ─── MARE panel (special layout) ─────────────────────────────────────────────
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
                    ? r['Mean Annual Rate of Exceedance'].toExponential(4) : r['Mean Annual Rate of Exceedance']}
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

// ─── Shared components ────────────────────────────────────────────────────────
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
    <div style={{
      background: 'white', borderRadius: 12, padding: '16px 18px',
      border: '0.5px solid #e2e8f0'
    }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1e40af' }}>
        {value ?? '—'}
      </div>
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