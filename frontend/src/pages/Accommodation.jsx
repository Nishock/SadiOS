import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Hotel, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function Accommodation() {
  const { active } = useWedding();
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ hotel_name: "", room_number: "", capacity: 2 });

  const load = async () => {
    if (!active) return;
    const [r, g] = await Promise.all([
      api.get(`/weddings/${active.id}/rooms`),
      api.get(`/weddings/${active.id}/guests`),
    ]);
    setRooms(r.data); setGuests(g.data);
  };
  useEffect(() => { load(); }, [active]);

  const add = async (e) => { e.preventDefault(); await api.post(`/weddings/${active.id}/rooms`, { ...form, capacity: Number(form.capacity) }); toast.success("Room added"); setOpen(false); setForm({hotel_name:"",room_number:"",capacity:2}); load(); };
  const assign = async (id, gid) => { await api.patch(`/weddings/${active.id}/rooms/${id}`, { guest_id: gid || null }); load(); };
  const del = async (id) => { await api.delete(`/weddings/${active.id}/rooms/${id}`); load(); };
  const auto = async () => { const r = await api.post(`/weddings/${active.id}/rooms/auto-allocate`); toast.success(`AI assigned ${r.data.assigned} rooms`); load(); };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Accommodation</p>
          <h1 className="font-serif text-4xl mt-2">Where everyone <span className="italic text-[#881337]">stays</span>.</h1>
          <p className="text-stone-500 mt-1">Manage hotel rooms and let AI allocate them by VIP & elderly priority.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={auto} variant="outline" data-testid="auto-allocate-button" className="rounded-full"><Wand2 className="w-4 h-4 mr-2"/>AI Auto-allocate</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button data-testid="add-room-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full"><Plus className="w-4 h-4 mr-2"/>Add room</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-2xl">New room</DialogTitle></DialogHeader>
              <form onSubmit={add} className="space-y-4">
                <div className="space-y-2"><Label>Hotel</Label><Input data-testid="room-hotel-input" value={form.hotel_name} onChange={e=>setForm({...form,hotel_name:e.target.value})} required/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Room number</Label><Input data-testid="room-number-input" value={form.room_number} onChange={e=>setForm({...form,room_number:e.target.value})} required/></div>
                  <div className="space-y-2"><Label>Capacity</Label><Input data-testid="room-capacity-input" type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/></div>
                </div>
                <Button type="submit" data-testid="room-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Add room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
            <tr><th className="p-4">Hotel</th><th className="p-4">Room</th><th className="p-4">Capacity</th><th className="p-4">Assigned guest</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {rooms.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-stone-400"><Hotel className="w-8 h-8 mx-auto mb-2"/>No rooms yet.</td></tr>}
            {rooms.map(r => (
              <tr key={r.id} className="border-t border-stone-100" data-testid={`room-${r.id}`}>
                <td className="p-4 font-medium">{r.hotel_name}</td>
                <td className="p-4">{r.room_number}</td>
                <td className="p-4">{r.capacity}</td>
                <td className="p-4">
                  <Select value={r.guest_id || "none"} onValueChange={v => assign(r.id, v === "none" ? null : v)}>
                    <SelectTrigger data-testid={`assign-${r.id}`} className="h-8 w-52"><SelectValue placeholder="Unassigned"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Unassigned —</SelectItem>
                      {guests.map(g => <SelectItem key={g.id} value={g.id}>{g.name}{g.is_vip ? " ⭐" : ""}{g.is_elderly ? " 👴" : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-right"><button onClick={()=>del(r.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
