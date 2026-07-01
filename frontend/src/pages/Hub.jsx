import { useEffect, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, FileText, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const KINDS = [
  { id: "announcement", label: "Announcement", icon: Megaphone, color: "bg-[#FCD34D]/30 text-[#881337]" },
  { id: "note", label: "Note", icon: FileText, color: "bg-[#A3B18A]/20 text-[#3f5238]" },
  { id: "message", label: "Message", icon: MessageCircle, color: "bg-stone-100 text-stone-700" },
];

export default function Hub() {
  const { active } = useWedding();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ kind: "announcement", title: "", content: "" });

  const load = async () => {
    if (!active) return;
    const r = await api.get(`/weddings/${active.id}/hub`);
    setPosts(r.data);
  };
  useEffect(() => { load(); }, [active]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post(`/weddings/${active.id}/hub`, form);
    toast.success("Posted");
    setForm({ kind: "announcement", title: "", content: "" });
    load();
  };
  const del = async (id) => { await api.delete(`/weddings/${active.id}/hub/${id}`); load(); };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Family Collaboration Hub</p>
        <h1 className="font-serif text-4xl mt-2">One <span className="italic text-[#881337]">parivaar</span>, one channel.</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <form onSubmit={submit} className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-4 h-fit">
          <h2 className="font-serif text-2xl">New post</h2>
          <div className="space-y-2"><Label>Type</Label>
            <Select value={form.kind} onValueChange={v=>setForm({...form,kind:v})}>
              <SelectTrigger data-testid="hub-kind-select"><SelectValue/></SelectTrigger>
              <SelectContent>{KINDS.map(k=><SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Title</Label><Input data-testid="hub-title-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div className="space-y-2"><Label>Content</Label><Textarea data-testid="hub-content-input" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} required/></div>
          <Button type="submit" data-testid="hub-submit-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full">Post</Button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {posts.length === 0 && <div className="bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl p-10 text-center"><Megaphone className="w-8 h-8 text-stone-400 mx-auto mb-2"/><p className="text-stone-500">No posts yet.</p></div>}
          {posts.map(p => {
            const k = KINDS.find(x => x.id === p.kind) || KINDS[0];
            const Icon = k.icon;
            return (
              <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-5" data-testid={`post-${p.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${k.color}`}><Icon className="w-3 h-3"/>{k.label}</span>
                    <span className="text-xs text-stone-500">{p.author} · {new Date(p.created_at).toLocaleString("en-IN")}</span>
                  </div>
                  <button onClick={()=>del(p.id)} className="text-stone-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
                {p.title && <h3 className="font-serif text-xl mt-2">{p.title}</h3>}
                <p className="text-stone-700 whitespace-pre-line mt-2">{p.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
