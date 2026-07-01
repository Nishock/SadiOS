import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

const RSVP_COLORS = { confirmed: "bg-[#A3B18A]/20 text-[#3f5238]", rejected: "bg-rose-100 text-rose-800", pending: "bg-stone-100 text-stone-700" };
const RSVP_ICONS = { confirmed: Check, rejected: X, pending: Clock };

export default function Guests() {
  const { active } = useWedding();
  const [guests, setGuests] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", side: "bride", family: "", mobile: "", rsvp_status: "pending", plus_ones: 0 });

  const load = async () => {
    if (!active) return;
    const r = await api.get(`/weddings/${active.id}/guests`);
    setGuests(r.data);
  };
  useEffect(() => { load(); }, [active]);

  const add = async (e) => {
    e.preventDefault();
    await api.post(`/weddings/${active.id}/guests`, { ...form, plus_ones: Number(form.plus_ones) });
    toast.success(`${form.name} added`);
    setOpen(false);
    setForm({ name: "", relation: "", side: "bride", family: "", mobile: "", rsvp_status: "pending", plus_ones: 0 });
    load();
  };

  const updateRsvp = async (g, status) => {
    await api.patch(`/weddings/${active.id}/guests/${g.id}`, { rsvp_status: status, plus_ones: g.plus_ones || 0 });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/weddings/${active.id}/guests/${id}`);
    load();
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp_status === "confirmed").length,
    pending: guests.filter(g => g.rsvp_status === "pending").length,
    rejected: guests.filter(g => g.rsvp_status === "rejected").length,
  };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Guest Management</p>
          <h1 className="font-serif text-4xl mt-2">The Mehfil</h1>
          <p className="text-stone-500 mt-1">Manage your guest list and track RSVPs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-guest-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-2xl">Add a guest</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input data-testid="guest-name-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Relation</Label><Input data-testid="guest-relation-input" value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})} placeholder="Uncle, Cousin"/></div>
                <div className="space-y-2"><Label>Family</Label><Input data-testid="guest-family-input" value={form.family} onChange={e=>setForm({...form,family:e.target.value})} placeholder="Sharma Family"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Side</Label>
                  <Select value={form.side} onValueChange={v=>setForm({...form,side:v})}>
                    <SelectTrigger data-testid="guest-side-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bride">Bride</SelectItem>
                      <SelectItem value="groom">Groom</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Mobile</Label><Input data-testid="guest-mobile-input" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>RSVP</Label>
                  <Select value={form.rsvp_status} onValueChange={v=>setForm({...form,rsvp_status:v})}>
                    <SelectTrigger data-testid="guest-rsvp-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Plus ones</Label><Input data-testid="guest-plus-input" type="number" value={form.plus_ones} onChange={e=>setForm({...form,plus_ones:e.target.value})}/></div>
              </div>
              <Button type="submit" data-testid="guest-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Add guest</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Invited","total","stone"],["Confirmed","confirmed","[#A3B18A]"],["Pending","pending","[#F59E0B]"],["Declined","rejected","rose"]].map(([l,k,c]) => (
          <div key={k} className="bg-white border border-stone-200 rounded-xl p-5" data-testid={`guest-stat-${k}`}>
            <p className="text-xs uppercase tracking-widest text-stone-500">{l}</p>
            <p className="font-serif text-3xl mt-1">{stats[k]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
            <tr><th className="p-4">Name</th><th className="p-4">Relation</th><th className="p-4">Side</th><th className="p-4">+1s</th><th className="p-4">RSVP</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {guests.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-stone-400">No guests yet. Add your first one above.</td></tr>}
            {guests.map(g => {
              const Icon = RSVP_ICONS[g.rsvp_status];
              return (
                <tr key={g.id} className="border-t border-stone-100" data-testid={`guest-row-${g.id}`}>
                  <td className="p-4 font-medium">{g.name}<div className="text-xs text-stone-500">{g.family}</div></td>
                  <td className="p-4 text-stone-600">{g.relation || "—"}</td>
                  <td className="p-4"><Badge variant="outline" className="capitalize">{g.side}</Badge></td>
                  <td className="p-4">{g.plus_ones || 0}</td>
                  <td className="p-4">
                    <Select value={g.rsvp_status} onValueChange={v => updateRsvp(g, v)}>
                      <SelectTrigger data-testid={`rsvp-select-${g.id}`} className={`h-8 w-32 ${RSVP_COLORS[g.rsvp_status]}`}>
                        <Icon className="w-3.5 h-3.5 mr-1" /><SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="rejected">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={()=>remove(g.id)} data-testid={`delete-guest-${g.id}`} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
