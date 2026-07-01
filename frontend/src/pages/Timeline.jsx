import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Check, CalendarDays, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TYPES = ["Roka","Engagement","Haldi","Mehendi","Sangeet","Wedding","Reception","Custom"];

export default function Timeline() {
  const { active } = useWedding();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [evOpen, setEvOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [ev, setEv] = useState({ title: "", event_type: "Haldi", event_date: "", venue: "", notes: "" });
  const [task, setTask] = useState({ title: "", due_date: "", assigned_to: "", event_id: "" });

  const load = async () => {
    if (!active) return;
    const [e, t] = await Promise.all([
      api.get(`/weddings/${active.id}/events`),
      api.get(`/weddings/${active.id}/tasks`),
    ]);
    setEvents(e.data); setTasks(t.data);
  };
  useEffect(() => { load(); }, [active]);

  const addEvent = async (e) => { e.preventDefault(); await api.post(`/weddings/${active.id}/events`, ev); toast.success("Event added"); setEvOpen(false); setEv({title:"",event_type:"Haldi",event_date:"",venue:"",notes:""}); load(); };
  const addTask = async (e) => { e.preventDefault(); await api.post(`/weddings/${active.id}/tasks`, task); toast.success("Task added"); setTaskOpen(false); setTask({title:"",due_date:"",assigned_to:"",event_id:""}); load(); };
  const toggle = async (t) => { await api.patch(`/weddings/${active.id}/tasks/${t.id}`, { done: !t.done }); load(); };
  const delEv = async (id) => { await api.delete(`/weddings/${active.id}/events/${id}`); load(); };
  const delTask = async (id) => { await api.delete(`/weddings/${active.id}/tasks/${id}`); load(); };

  const generatePlan = async () => {
    const r = await api.post(`/weddings/${active.id}/smart-plan`);
    const baseDate = new Date(active.wedding_date);
    const total = r.data.suggested_events.length;
    for (let i = 0; i < total; i++) {
      const offset = i - (total - 2);
      const dt = new Date(baseDate); dt.setDate(dt.getDate() + offset);
      await api.post(`/weddings/${active.id}/events`, {
        title: r.data.suggested_events[i],
        event_type: "Custom",
        event_date: dt.toISOString().slice(0, 16),
        venue: "",
        notes: `Auto-generated from ${r.data.tradition} tradition template — edit freely.`
      });
    }
    const t = await api.post(`/weddings/${active.id}/smart-plan/apply`);
    toast.success(`Created ${total} ceremonies + ${t.data.tasks_created} tasks for ${r.data.tradition} — all editable`);
    load();
  };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Wedding Timeline</p>
          <h1 className="font-serif text-4xl mt-2">Every <span className="italic text-[#881337]">ceremony</span>, planned.</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={generatePlan} variant="outline" data-testid="smart-plan-button" className="rounded-full border-[#881337] text-[#881337] hover:bg-[#881337] hover:text-white">
            <Sparkles className="w-4 h-4 mr-2"/>Auto-create from {active.tradition || "Hindu"} tradition
          </Button>
          <Dialog open={evOpen} onOpenChange={setEvOpen}>
            <DialogTrigger asChild><Button data-testid="add-event-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full"><Plus className="w-4 h-4 mr-2"/>Add event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-2xl">New event</DialogTitle></DialogHeader>
              <form onSubmit={addEvent} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input data-testid="event-title-input" value={ev.title} onChange={e=>setEv({...ev,title:e.target.value})} required/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Type</Label><Select value={ev.event_type} onValueChange={v=>setEv({...ev,event_type:v})}><SelectTrigger data-testid="event-type-select"><SelectValue/></SelectTrigger><SelectContent>{TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Date & time</Label><Input data-testid="event-date-input" type="datetime-local" value={ev.event_date} onChange={e=>setEv({...ev,event_date:e.target.value})} required/></div>
                </div>
                <div className="space-y-2"><Label>Venue</Label><Input data-testid="event-venue-input" value={ev.venue} onChange={e=>setEv({...ev,venue:e.target.value})}/></div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={ev.notes} onChange={e=>setEv({...ev,notes:e.target.value})}/></div>
                <Button type="submit" data-testid="event-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Add</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild><Button data-testid="add-task-button" variant="outline" className="rounded-full"><Plus className="w-4 h-4 mr-2"/>Add task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-2xl">New task</DialogTitle></DialogHeader>
              <form onSubmit={addTask} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input data-testid="task-title-input" value={task.title} onChange={e=>setTask({...task,title:e.target.value})} required/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Due</Label><Input data-testid="task-due-input" type="date" value={task.due_date} onChange={e=>setTask({...task,due_date:e.target.value})}/></div>
                  <div className="space-y-2"><Label>Assigned to</Label><Input data-testid="task-assigned-input" value={task.assigned_to} onChange={e=>setTask({...task,assigned_to:e.target.value})} placeholder="Mom"/></div>
                </div>
                <Button type="submit" data-testid="task-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Add</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-serif text-2xl mb-2">Events</h2>
          {events.length === 0 && <div className="bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl p-10 text-center"><CalendarDays className="w-8 h-8 text-stone-400 mx-auto mb-2"/><p className="text-stone-500">No events yet — start with Roka or Haldi.</p></div>}
          {events.map(e => (
            <div key={e.id} className="bg-white border border-stone-200 rounded-xl p-5 flex items-start gap-4" data-testid={`event-${e.id}`}>
              <div className="w-14 h-14 rounded-lg bg-[#FCD34D]/30 flex flex-col items-center justify-center flex-shrink-0">
                <p className="text-xs uppercase font-semibold text-[#881337]">{new Date(e.event_date).toLocaleString("en-IN",{month:"short"})}</p>
                <p className="font-serif text-xl leading-none">{new Date(e.event_date).getDate()}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-stone-500">{e.event_type}</p>
                <h3 className="font-serif text-xl">{e.title}</h3>
                {e.venue && <p className="text-sm text-stone-600">{e.venue}</p>}
                <p className="text-xs text-stone-500 mt-1">{new Date(e.event_date).toLocaleString("en-IN")}</p>
              </div>
              <button onClick={()=>delEv(e.id)} data-testid={`del-event-${e.id}`} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-serif text-2xl mb-2">Tasks</h2>
          <div className="space-y-2">
            {tasks.length === 0 && <p className="text-stone-400 text-sm p-4 bg-white border border-stone-200 rounded-xl">No tasks yet.</p>}
            {tasks.map(t => (
              <div key={t.id} className="bg-white border border-stone-200 rounded-lg p-3 flex items-center gap-3" data-testid={`task-${t.id}`}>
                <button onClick={()=>toggle(t)} data-testid={`toggle-task-${t.id}`} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${t.done ? "bg-[#881337] border-[#881337]" : "border-stone-300"}`}>
                  {t.done && <Check className="w-3 h-3 text-white"/>}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${t.done ? "line-through text-stone-400" : ""}`}>{t.title}</p>
                  {t.assigned_to && <p className="text-xs text-stone-500">@{t.assigned_to}{t.due_date && ` · ${t.due_date}`}</p>}
                </div>
                <button onClick={()=>delTask(t.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
