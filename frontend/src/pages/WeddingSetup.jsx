import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function WeddingSetup() {
  const nav = useNavigate();
  const [d, setD] = useState({ bride_name: "", groom_name: "", wedding_date: "", venue: "", city: "", total_budget: 1500000, tradition: "Hindu" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/weddings", { ...d, total_budget: Number(d.total_budget) });
      localStorage.setItem("shaadios_active_wid", r.data.id);
      toast.success("Wedding created! Let's start planning.");
      nav("/app");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8">
      <form onSubmit={submit} className="w-full max-w-2xl bg-white p-10 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-[#881337]" fill="#881337" />
          <span className="font-serif text-xl">SHAADIOS</span>
        </div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Step 1 of 1</p>
        <h1 className="font-serif text-4xl mt-2 mb-2">Tell us about the shaadi</h1>
        <p className="text-stone-500 text-sm mb-8">We'll set up everything in seconds.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2"><Label>Bride's name</Label><Input data-testid="setup-bride-input" value={d.bride_name} onChange={e=>setD({...d,bride_name:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Groom's name</Label><Input data-testid="setup-groom-input" value={d.groom_name} onChange={e=>setD({...d,groom_name:e.target.value})} required/></div>
          <div className="space-y-2"><Label>Wedding date</Label><Input data-testid="setup-date-input" type="date" value={d.wedding_date} onChange={e=>setD({...d,wedding_date:e.target.value})} required/></div>
          <div className="space-y-2"><Label>City</Label><Input data-testid="setup-city-input" value={d.city} onChange={e=>setD({...d,city:e.target.value})} placeholder="Mumbai" required/></div>
          <div className="space-y-2 sm:col-span-2"><Label>Venue</Label><Input data-testid="setup-venue-input" value={d.venue} onChange={e=>setD({...d,venue:e.target.value})} placeholder="The Leela Palace"/></div>
          <div className="space-y-2"><Label>Total budget (₹)</Label><Input data-testid="setup-budget-input" type="number" value={d.total_budget} onChange={e=>setD({...d,total_budget:e.target.value})}/></div>
          <div className="space-y-2"><Label>Wedding tradition</Label>
            <select data-testid="setup-tradition-select" value={d.tradition} onChange={e=>setD({...d,tradition:e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {["Hindu","Muslim","Sikh","Christian","Jain","Buddhist","Parsi","Interfaith","Custom"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <Button type="submit" disabled={loading} data-testid="setup-submit-button" className="w-full mt-8 bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6">
          {loading ? "Creating..." : "Create wedding"}
        </Button>
      </form>
    </div>
  );
}
