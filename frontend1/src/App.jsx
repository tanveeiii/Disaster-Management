import { useState } from 'react';
import axios from 'axios';
import { Activity, MapPin, Download, Table, BarChart3 } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState({ lat: '21.8', lon: '75.6' });

  const API_URL = "http://127.0.0.1:5000/analyze";

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        latitude: parseFloat(formData.lat),
        longitude: parseFloat(formData.lon)
      });

      if (response.data.status === "success") {
        setReport(response.data);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      alert("Could not connect to Flask server. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  if (report) return <ReportView data={report} onReset={() => setReport(null)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMmEzZSIgb3BhY2l0eT0iLjIiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="max-w-xl w-full relative z-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
            <Activity className="text-white" size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
            SEISMIC ANALYZER
          </h1>
          <p className="text-blue-200 text-lg">Advanced earthquake data analysis platform</p>
        </header>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
            <MapPin className="text-blue-600" size={24} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Location Coordinates</h2>
              <p className="text-sm text-gray-500">Enter precise latitude and longitude values</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">Latitude</label>
                <input
                  type="number" step="any" value={formData.lat} required
                  className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 font-semibold text-gray-900"
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">Longitude</label>
                <input
                  type="number" step="any" value={formData.lon} required
                  className="p-4 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 font-semibold text-gray-900"
                  onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 text-lg font-bold hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity className="animate-spin" size={20} />
                  Running Analysis...
                </span>
              ) : (
                "Start Analysis"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReportView = ({ data, onReset }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Analysis Results</h2>
            <p className="text-gray-600">Comprehensive seismic data report</p>
          </div>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all transform hover:scale-105"
          >
            ← New Analysis
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="A-Value" value={data.a_value} />
          <StatCard label="B-Value" value={data.b_value} />
          <StatCard label="R²" value={data.r2} />
          <StatCard label="Total EQ" value={data.number_of_earthquakes} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-blue-900 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl flex items-center gap-3 text-white">
                <BarChart3 className="text-cyan-400" size={28} /> Gutenberg–Richter Relation
              </h3>
              <span className="text-xs bg-white/10 px-4 py-2 rounded-full text-blue-200 font-bold tracking-wide backdrop-blur-sm">
                LOG10(N) vs MAGNITUDE
              </span>
            </div>

            <div className="bg-slate-950/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex justify-center items-center min-h-[450px]">
              {data.graph ? (
                <img
                  src={`data:image/png;base64,${data.graph}`}
                  alt="Seismic Analysis Graph"
                  className="max-w-full h-auto rounded-xl shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <Activity className="animate-pulse" size={56} />
                  <p className="font-semibold text-lg">Processing Visual Data...</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-gray-900">
              <Table size={24} className="text-blue-600" /> Fault Data Preview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    {data.fault_preview && data.fault_preview.length > 0 && Object.keys(data.fault_preview[0]).map(key => (
                      <th key={key} className="p-3 text-xs font-black uppercase text-gray-600 tracking-wider">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.fault_preview && data.fault_preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-3 text-sm font-medium text-gray-700">
                          {typeof val === 'number' ? val.toFixed(3) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <a
            href={data.download_excel}
            className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-600 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:scale-105 active:scale-95"
          >
            <Download size={24} /> Download Full Excel Report
          </a>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all transform hover:scale-105 group">
    <p className="text-gray-600 text-xs uppercase font-black tracking-wider mb-2">{label}</p>
    <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-cyan-600 transition-all">
      {value}
    </p>
  </div>
);

export default App;