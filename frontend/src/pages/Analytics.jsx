import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api, BACKEND_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, TrendingUp, Users, Wallet, Utensils, AlertTriangle, Heart } from "lucide-react";

const fmt = (n) => "₹" + Number(n||0).toLocaleString("en-IN");

export default function Analytics() {
  const { active } = useWedding();
  const [a, setA] = useState(null);

  useEffect(() => {
    if (!active) return;
    api.get(`/weddings/${active.id}/analytics`).then(r => setA(r.data));
  }, [active]);

  const download = (path, name) => {
    const t = localStorage.getItem("shaadios_token");
    fetch(`${BACKEND_URL}/api${path}`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.blob()).then(b => {
        const url = URL.createObjectURL(b);
        const a = document.createElement("a"); a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
      });
  };

  if (!active || !a) return <p className="text-stone-500">Loading analytics…</p>;

  const sev = {
    high: "bg-rose-100 text-rose-800 border-rose-200",
    med: "bg-[#FCD34D]/30 text-stone-900 border-[#FCD34D]",
    low: "bg-stone-100 text-stone-700 border-stone-200",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">AI Analytics</p>
          <h1 className="font-serif text-4xl mt-2">Wedding <span className="italic text-[#881337]">Intelligence</span> Center</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={()=>download(`/weddings/${active.id}/export/guests.csv`, "guests.csv")} variant="outline" data-testid="export-csv-button" className="rounded-full"><FileSpreadsheet className="w-4 h-4 mr-2"/>Export CSV</Button>
          <Button onClick={()=>download(`/weddings/${active.id}/export/report.pdf`, "wedding-report.pdf")} data-testid="export-pdf-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full"><FileText className="w-4 h-4 mr-2"/>Export PDF</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-stone-900 text-white rounded-xl p-8 relative overflow-hidden" data-testid="health-score-card">
          <Heart className="w-6 h-6 text-[#FCD34D]" fill="#FCD34D"/>
          <p className="uppercase tracking-widest text-xs text-[#FCD34D] mt-4">Wedding Health Score</p>
          <p className="font-serif text-7xl mt-2">{a.health_score}<span className="text-2xl text-stone-400">/100</span></p>
          <div className="h-2 bg-stone-700 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-[#FCD34D]" style={{width: `${a.health_score}%`}}/>
          </div>
          <p className="text-sm text-stone-300 mt-3">{a.health_score >= 80 ? "Excellent — on track!" : a.health_score >= 60 ? "Good — minor risks" : "Needs attention"}</p>
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <Stat icon={Users} label="Attendance Forecast" value={a.attendance.forecast} sub={`${a.attendance.confirmed} confirmed, ${a.attendance.pending} pending`} testid="forecast-attendance"/>
          <Stat icon={Utensils} label="Food Forecast" value={`${a.food.forecast_kg} kg`} sub={`${a.food.meals} meals`} testid="forecast-food"/>
          <Stat icon={Wallet} label="Budget Used" value={`${a.budget.percent_used.toFixed(0)}%`} sub={`${fmt(a.budget.spent)} of ${fmt(a.budget.total)}`} testid="forecast-budget"/>
          <Stat icon={TrendingUp} label="Forecast Overrun" value={fmt(a.budget.forecast_overrun)} sub="based on trend" testid="forecast-overrun"/>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]"/>
          <h2 className="font-serif text-2xl">Risk Alerts</h2>
        </div>
        {a.risks.length === 0 ? (
          <p className="text-stone-500 text-sm">No risks detected. Everything's looking great!</p>
        ) : (
          <div className="space-y-2">
            {a.risks.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg border ${sev[r.severity]}`} data-testid={`risk-${i}`}>
                <span className="text-xs uppercase tracking-widest font-semibold mr-2">{r.severity}</span>{r.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, testid }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6" data-testid={testid}>
      <Icon className="w-5 h-5 text-[#881337]" strokeWidth={1.5}/>
      <p className="text-xs uppercase tracking-widest text-stone-500 mt-3">{label}</p>
      <p className="font-serif text-3xl mt-1">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{sub}</p>
    </div>
  );
}
