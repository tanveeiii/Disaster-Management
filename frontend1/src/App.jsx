import React, { useState } from 'react';
import axios from 'axios';
import { Activity, MapPin, Download, Table, BarChart3 } from 'lucide-react';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState({ lat: 21.8, lon: 75.6 });

  // BACKEND URL
  const API_URL = "http://127.0.0.1:5000/analyze";

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sending JSON as your Flask backend expects data = request.json
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
    <div className="min-h-screen bg-[#DFE5F3] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#272401]">SEISMIC ANALYZER</h1>
          <p className="text-gray-500 mt-2">Enter coordinates to run full analysis</p>
        </header>

        <div className="bg-[#F2EFEA] rounded-3xl p-8 shadow-xl border border-white/30">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Latitude</label>
                <input
                  type="number" step="any" value={formData.lat} required
                  className="p-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#557373]/30"
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">Longitude</label>
                <input
                  type="number" step="any" value={formData.lon} required
                  className="p-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#557373]/30"
                  onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white bg-[#557373] text-lg font-semibold hover:bg-[#445d5d] transition disabled:opacity-50"
            >
              {loading ? "Running Analysis..." : "Start Analysis"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReportView = ({ data, onReset }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#272401]">Analysis Results</h2>
        <button onClick={onReset} className="text-[#557373] font-bold">← New Analysis</button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="A-Value" value={data.a_value} />
        <StatCard label="B-Value" value={data.b_value} />
        <StatCard label="R²" value={data.r2} />
        <StatCard label="Total EQ" value={data.number_of_earthquakes} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THE GRAPH CARD */}
        <div className="lg:col-span-2 bg-[#161B22] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-3 text-white">
              <BarChart3 className="text-red-500" size={24} /> Gutenberg–Richter Relation
            </h3>
            <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-slate-400 font-mono tracking-tighter">
              LOG10(N) vs MAGNITUDE
            </span>
          </div>

          <div className="bg-[#0B0F1A] rounded-2xl p-4 border border-white/5 flex justify-center items-center min-h-[400px]">
            {data.graph ? (
              <img
                src={`data:image/png;base64,${data.graph}`}
                alt="Seismic Analysis Graph"
                className="max-w-full h-auto rounded-lg shadow-2xl filter brightness-95 contrast-110"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-600">
                <Activity className="animate-pulse" size={48} />
                <p className="font-medium tracking-tight">Processing Visual Data...</p>
              </div>
            )}
          </div>
        </div>
        {/* Fault Preview Table */}
        <div className="bg-[#F2EFEA] p-6 rounded-2xl shadow-sm overflow-hidden">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-[#272401]">
            <Table size={18} /> Fault Table Preview (Top 5)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  {data.fault_preview.length > 0 && Object.keys(data.fault_preview[0]).map(key => (
                    <th key={key} className="p-2 text-xs font-bold uppercase text-gray-600">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.fault_preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-white/50 transition">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-2 text-sm">{typeof val === 'number' ? val.toFixed(3) : val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href={data.download_excel}
            className="flex-1 py-4 bg-[#272401] text-white rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] transition"
          >
            <Download size={20} /> Download Full Excel Report
          </a>
        </div>
      </div>
      </div>
      );
};

      const StatCard = ({label, value}) => (
      <div className="bg-[#F2EFEA] p-6 rounded-2xl shadow-sm text-center border border-black/5">
        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#557373] mt-1">{value}</p>
      </div>
      );

      export default App;