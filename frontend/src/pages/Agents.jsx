import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sparkles, ClipboardCheck, Users, Wallet, Utensils, Store, ShieldAlert, Loader2, AlertCircle } from "lucide-react";

const AGENTS = [
  { id: "planner", name: "Wedding Planner", desc: "Prioritized planning actions", icon: ClipboardCheck },
  { id: "guest", name: "Guest Intelligence", desc: "RSVP patterns & next steps", icon: Users },
  { id: "budget", name: "Budget Intelligence", desc: "Saving tips & overspend alerts", icon: Wallet },
  { id: "catering", name: "Catering Intelligence", desc: "Menu & portion optimisation", icon: Utensils },
  { id: "vendor", name: "Vendor Recommendation", desc: "What to book next", icon: Store },
  { id: "risk", name: "Risk Analysis", desc: "Critical wedding risks", icon: ShieldAlert },
];

const SEV = {
  high: "border-rose-200 bg-rose-50 text-rose-900",
  med: "border-[#FCD34D] bg-[#FCD34D]/20 text-stone-900",
  low: "border-stone-200 bg-stone-50 text-stone-700",
};

function Pretty({ result, agent }) {
  if (!result) return null;
  if (result.raw) {
    return <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{result.raw}</p>;
  }
  if (agent === "planner" && result.recommendations) {
    return <div className="space-y-2">{result.recommendations.map((r,i)=>(
      <div key={i} className={`p-3 rounded-lg border ${SEV[r.priority]||SEV.low}`}>
        <p className="text-xs uppercase tracking-widest font-semibold">{r.priority}</p>
        <p className="font-medium mt-1">{r.title}</p>
        <p className="text-sm text-stone-600 mt-1">{r.action}</p>
      </div>))}</div>;
  }
  if (agent === "guest") {
    return <div className="space-y-3">
      {(result.insights||[]).map((x,i)=>(<div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-200"><p className="font-medium text-sm">{x.title}</p><p className="text-sm text-stone-600 mt-1">{x.detail}</p></div>))}
      {result.actions?.length>0 && <ul className="text-sm space-y-1 pl-4 list-disc">{result.actions.map((a,i)=><li key={i}>{a}</li>)}</ul>}
    </div>;
  }
  if (agent === "budget") {
    return <div className="space-y-2">
      {(result.warnings||[]).map((w,i)=>(<div key={i} className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm flex gap-2"><AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 flex-shrink-0"/>{w}</div>))}
      {(result.saving_tips||[]).map((t,i)=>(<div key={i} className="p-3 rounded-lg bg-[#A3B18A]/10 border border-[#A3B18A]/30"><p className="text-xs uppercase tracking-widest font-semibold text-[#3f5238]">{t.category} · save ~₹{Number(t.est_saving_inr||0).toLocaleString("en-IN")}</p><p className="text-sm mt-1">{t.tip}</p></div>))}
    </div>;
  }
  if (agent === "catering") {
    return <div className="space-y-3 text-sm">
      {result.menu_suggestions?.length>0 && <div><p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Menu</p><ul className="space-y-1 pl-4 list-disc">{result.menu_suggestions.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
      {result.portion_tips?.length>0 && <div><p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Portions</p><ul className="space-y-1 pl-4 list-disc">{result.portion_tips.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
      {result.wastage_reduction?.length>0 && <div><p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Wastage</p><ul className="space-y-1 pl-4 list-disc">{result.wastage_reduction.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    </div>;
  }
  if (agent === "vendor") {
    return <div className="space-y-3 text-sm">
      {result.missing_categories?.length>0 && <div><p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Still to book</p><div className="flex flex-wrap gap-2">{result.missing_categories.map((c,i)=><span key={i} className="px-3 py-1 rounded-full bg-[#881337] text-white text-xs">{c}</span>)}</div></div>}
      {(result.selection_tips||[]).map((t,i)=>(<div key={i} className="p-3 rounded-lg bg-stone-50 border border-stone-200"><p className="font-medium">{t.category}</p><p className="text-stone-600 mt-1">{t.tip}</p></div>))}
    </div>;
  }
  if (agent === "risk") {
    return <div className="space-y-2">
      {typeof result.risk_score === "number" && <div className="p-4 rounded-lg bg-stone-900 text-white"><p className="text-xs uppercase tracking-widest text-[#FCD34D]">Risk score</p><p className="font-serif text-4xl mt-1">{result.risk_score}<span className="text-base text-stone-400">/100</span></p></div>}
      {(result.risks||[]).map((r,i)=>(<div key={i} className={`p-3 rounded-lg border ${SEV[r.severity]||SEV.low}`}><p className="text-xs uppercase tracking-widest font-semibold">{r.severity}</p><p className="font-medium mt-1">{r.title}</p><p className="text-sm text-stone-600 mt-1">{r.mitigation}</p></div>))}
    </div>;
  }
  return <p className="text-sm text-stone-500">No result.</p>;
}

export default function Agents() {
  const { active } = useWedding();
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});

  const run = async (id) => {
    setRunning(id);
    try {
      const r = await api.post(`/weddings/${active.id}/agents/${id}`);
      setResults(s => ({ ...s, [id]: r.data.result }));
    } finally { setRunning(null); }
  };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">AI Intelligence Center</p>
        <h1 className="font-serif text-4xl mt-2">Six specialist <span className="italic text-[#881337]">AI agents</span>.</h1>
        <p className="text-stone-500 mt-2">Each agent analyzes your wedding from a different angle and returns actionable recommendations — not generic chat.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {AGENTS.map(a => {
          const Icon = a.icon;
          const r = results[a.id];
          return (
            <div key={a.id} className="bg-white border border-stone-200 rounded-xl p-6" data-testid={`agent-${a.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#881337]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#881337]" strokeWidth={1.5}/>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl">{a.name} Agent</h3>
                  <p className="text-sm text-stone-500 mt-1">{a.desc}</p>
                </div>
                <Button onClick={()=>run(a.id)} disabled={running === a.id} data-testid={`run-agent-${a.id}`} className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">
                  {running === a.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Sparkles className="w-4 h-4 mr-1"/>Run</>}
                </Button>
              </div>
              {r && <div className="mt-5" data-testid={`agent-result-${a.id}`}><Pretty result={r} agent={a.id}/></div>}
              {!r && running !== a.id && <p className="mt-5 text-xs text-stone-400">Click <b>Run</b> to get actionable recommendations.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
