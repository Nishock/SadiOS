import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useWedding } from "@/context/WeddingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CATEGORIES = ["Venue","Catering","Photography","Decoration","Jewelry","Outfits","Transport","Gifts","Music","Miscellaneous"];
const COLORS = ["#881337","#F59E0B","#A3B18A","#FCD34D","#57534E","#9F1239","#78716C","#1C1917","#E11D48","#A8A29E"];
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Budget() {
  const { active } = useWedding();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total_budget: 0, total_spent: 0, remaining: 0, percent_used: 0, by_category: {}, alert: "ok" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Venue", description: "", amount: "", vendor_name: "" });

  const load = async () => {
    if (!active) return;
    const [e, s] = await Promise.all([
      api.get(`/weddings/${active.id}/expenses`),
      api.get(`/weddings/${active.id}/budget/summary`),
    ]);
    setExpenses(e.data);
    setSummary(s.data);
  };
  useEffect(() => { load(); }, [active]);

  const add = async (ev) => {
    ev.preventDefault();
    await api.post(`/weddings/${active.id}/expenses`, { ...form, amount: Number(form.amount) });
    toast.success("Expense added");
    setOpen(false);
    setForm({ category: "Venue", description: "", amount: "", vendor_name: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/weddings/${active.id}/expenses/${id}`);
    load();
  };

  const chartData = Object.entries(summary.by_category).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Smart Budget</p>
          <h1 className="font-serif text-4xl mt-2">Every <span className="italic text-[#881337]">rupee</span>, accounted for.</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button data-testid="add-expense-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full"><Plus className="w-4 h-4 mr-2"/>Add expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-2xl">New expense</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="space-y-2"><Label>Category</Label>
                <Select value={form.category} onValueChange={v=>setForm({...form,category:v})}>
                  <SelectTrigger data-testid="expense-category-select"><SelectValue/></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input data-testid="expense-desc-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></div>
              <div className="space-y-2"><Label>Vendor (optional)</Label><Input data-testid="expense-vendor-input" value={form.vendor_name} onChange={e=>setForm({...form,vendor_name:e.target.value})}/></div>
              <div className="space-y-2"><Label>Amount (₹)</Label><Input data-testid="expense-amount-input" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></div>
              <Button type="submit" data-testid="expense-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Add expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-8" data-testid="budget-summary">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">Total spent</p>
              <p className="font-serif text-5xl">{fmt(summary.total_spent)}</p>
              <p className="text-stone-500 text-sm mt-1">of {fmt(summary.total_budget)} budget</p>
            </div>
            {summary.alert === "overspending" ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-100 text-rose-800 rounded-full text-sm" data-testid="overspend-alert">
                <AlertTriangle className="w-4 h-4"/>Overspending alert
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#A3B18A]/20 text-[#3f5238] rounded-full text-sm">
                <TrendingUp className="w-4 h-4"/>On track
              </div>
            )}
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#881337]" style={{width: `${Math.min(summary.percent_used, 100)}%`}}/>
          </div>
          <p className="text-sm text-stone-500 mt-2">{summary.percent_used.toFixed(1)}% used · {fmt(summary.remaining)} remaining</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">By category</p>
          {chartData.length === 0 ? <p className="text-stone-400 text-sm py-12 text-center">Add expenses to see chart</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                </Pie>
                <Tooltip formatter={(v)=>fmt(v)}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
            <tr><th className="p-4">Category</th><th className="p-4">Description</th><th className="p-4">Vendor</th><th className="p-4 text-right">Amount</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {expenses.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-stone-400">No expenses yet.</td></tr>}
            {expenses.map(e => (
              <tr key={e.id} className="border-t border-stone-100" data-testid={`expense-row-${e.id}`}>
                <td className="p-4"><span className="text-xs px-2 py-1 rounded-full bg-stone-100">{e.category}</span></td>
                <td className="p-4 font-medium">{e.description}</td>
                <td className="p-4 text-stone-600">{e.vendor_name || "—"}</td>
                <td className="p-4 text-right font-serif text-lg">{fmt(e.amount)}</td>
                <td className="p-4 text-right"><button onClick={()=>remove(e.id)} data-testid={`delete-expense-${e.id}`} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
