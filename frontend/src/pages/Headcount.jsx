import { useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Users, Utensils, ParkingSquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Headcount() {
  const { active } = useWedding();
  const [region, setRegion] = useState("North India");
  const [cuisine, setCuisine] = useState("North Indian");
  const [vegRatio, setVegRatio] = useState([70]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await api.post(`/weddings/${active.id}/headcount`, { wedding_id: active.id, region, cuisine, veg_ratio: vegRatio[0] / 100 });
      setResult(r.data);
    } finally { setLoading(false); }
  };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">AI Headcount Predictor</p>
        <h1 className="font-serif text-4xl mt-2">How many will <span className="italic text-[#881337]">actually</span> come?</h1>
        <p className="text-stone-500 mt-2 max-w-xl">Stop over-ordering food. Stop running out of chairs. Our AI predicts attendance based on your RSVP data and Indian wedding patterns.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger data-testid="region-select"><SelectValue/></SelectTrigger>
              <SelectContent>
                {["North India","South India","West India","East India","Punjab","Gujarat","Maharashtra","Bengal","Rajasthan"].map(x=>(
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cuisine</Label>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger data-testid="cuisine-select"><SelectValue/></SelectTrigger>
              <SelectContent>
                {["North Indian","South Indian","Mughlai","Gujarati","Bengali","Marathi","Punjabi","Multi-Cuisine"].map(x=>(
                  <SelectItem key={x} value={x}>{x}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><Label>Veg ratio</Label><span className="text-sm font-medium">{vegRatio[0]}% veg / {100-vegRatio[0]}% non-veg</span></div>
            <Slider data-testid="veg-ratio-slider" value={vegRatio} onValueChange={setVegRatio} min={0} max={100} step={5}/>
          </div>
          <Button onClick={run} disabled={loading} data-testid="run-prediction-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Calculating…</> : <><Calculator className="w-4 h-4 mr-2"/>Run AI Prediction</>}
          </Button>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {!result && (
            <div className="bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl p-12 text-center">
              <Calculator className="w-10 h-10 text-stone-400 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="font-serif text-2xl">Run a prediction to see results</p>
              <p className="text-stone-500 text-sm mt-1">Add guests first for accurate predictions.</p>
            </div>
          )}

          {result && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
              <div className="bg-stone-900 text-white rounded-xl p-8" data-testid="prediction-result">
                <p className="uppercase tracking-widest text-xs text-[#FCD34D]">Predicted attendance</p>
                <p className="font-serif text-6xl mt-2">{result.predicted_attendance}</p>
                <p className="text-stone-300 mt-1">people will attend ({result.predicted_low}–{result.predicted_high} range)</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FCD34D]" style={{width: `${result.confidence}%`}}/>
                  </div>
                  <span className="text-sm">{result.confidence}% confidence</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card icon={Utensils} label="Food (total)" value={`${result.food_kg} kg`} sub={`${result.veg_count} veg + ${result.non_veg_count} non-veg meals`} testid="result-food"/>
                <Card icon={Users} label="Seating" value={result.seating_required} sub="chairs needed" testid="result-seating"/>
                <Card icon={ParkingSquare} label="Parking" value={result.parking_required} sub="car spots" testid="result-parking"/>
                <Card icon={Utensils} label="Staff & counters" value={`${result.staff_required} / ${result.counters_required}`} sub="servers / food counters" testid="result-staff"/>
              </div>

              <div className="bg-[#A3B18A]/10 border border-[#A3B18A]/30 rounded-xl p-5" data-testid="wastage-tip">
                <p className="font-serif text-xl text-stone-900">Wastage estimate: {result.wastage_estimate_kg} kg</p>
                <p className="text-sm text-stone-600 mt-1">SHAADIOS recommends ordering 8% above predicted to handle walk-ins while minimizing waste.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, sub, testid }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6" data-testid={testid}>
      <Icon className="w-5 h-5 text-[#881337]" strokeWidth={1.5}/>
      <p className="text-xs uppercase tracking-widest text-stone-500 mt-3">{label}</p>
      <p className="font-serif text-3xl mt-1">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{sub}</p>
    </div>
  );
}
