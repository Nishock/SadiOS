import { useEffect, useState } from "react";
import { api, BACKEND_URL } from "@/lib/api";
import { useWedding } from "@/context/WeddingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "marigold", name: "Marigold", color: "#F59E0B" },
  { id: "royal", name: "Royal Crimson", color: "#881337" },
  { id: "modern", name: "Modern Ivory", color: "#A3B18A" },
];

export default function Invitations() {
  const { active } = useWedding();
  const [invs, setInvs] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", template: "marigold" });

  const load = async () => {
    if (!active) return;
    const r = await api.get(`/weddings/${active.id}/invitations`);
    setInvs(r.data);
  };
  useEffect(() => { load(); }, [active]);

  const create = async (e) => {
    e.preventDefault();
    await api.post(`/weddings/${active.id}/invitations`, form);
    toast.success("Invitation created!");
    setForm({ title: "", message: "", template: "marigold" });
    load();
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const shareWA = (slug, title) => {
    const url = `${window.location.origin}/invite/${slug}`;
    const text = `${title}\n\nView our wedding invitation: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!active) return null;
  return (
    <div className="space-y-8">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Digital Invitations</p>
        <h1 className="font-serif text-4xl mt-2">Send <span className="italic text-[#881337]">love</span>, not paper.</h1>
        <p className="text-stone-500 mt-2">Create beautiful e-invites. Share on WhatsApp. Collect RSVPs in real-time.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <form onSubmit={create} className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-8 space-y-5 h-fit">
          <h2 className="font-serif text-2xl">Create invitation</h2>
          <div className="space-y-2"><Label>Title</Label><Input data-testid="inv-title-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="You are invited to our wedding" required/></div>
          <div className="space-y-2"><Label>Message</Label><Textarea data-testid="inv-message-input" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="With the blessings of our families…" rows={5} required/></div>
          <div className="space-y-2"><Label>Template</Label>
            <Select value={form.template} onValueChange={v=>setForm({...form,template:v})}>
              <SelectTrigger data-testid="inv-template-select"><SelectValue/></SelectTrigger>
              <SelectContent>{TEMPLATES.map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="submit" data-testid="inv-create-button" className="w-full bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full py-6">
            <Mail className="w-4 h-4 mr-2"/>Create invitation
          </Button>
        </form>

        <div className="lg:col-span-7 space-y-4">
          {invs.length === 0 && (
            <div className="bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl p-12 text-center">
              <Mail className="w-10 h-10 text-stone-400 mx-auto mb-3" strokeWidth={1.5}/>
              <p className="font-serif text-2xl">No invitations yet</p>
              <p className="text-stone-500 text-sm mt-1">Create your first beautiful e-invite.</p>
            </div>
          )}
          {invs.map(inv => {
            const tpl = TEMPLATES.find(t => t.id === inv.template) || TEMPLATES[0];
            const url = `${window.location.origin}/invite/${inv.slug}`;
            return (
              <div key={inv.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden" data-testid={`inv-card-${inv.id}`}>
                <div className="p-6 flex items-start gap-4 border-l-4" style={{borderColor: tpl.color}}>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-stone-500">{tpl.name} template</p>
                    <h3 className="font-serif text-2xl mt-1">{inv.title}</h3>
                    <p className="text-stone-600 text-sm mt-2 line-clamp-2">{inv.message}</p>
                    <p className="text-xs text-stone-400 mt-3 truncate">{url}</p>
                  </div>
                </div>
                <div className="bg-stone-50 px-6 py-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={()=>copyLink(inv.slug)} data-testid={`inv-copy-${inv.id}`}><Copy className="w-3.5 h-3.5 mr-1"/>Copy link</Button>
                  <Button size="sm" variant="outline" onClick={()=>shareWA(inv.slug, inv.title)} data-testid={`inv-whatsapp-${inv.id}`}><Share2 className="w-3.5 h-3.5 mr-1"/>WhatsApp</Button>
                  <a href={`/invite/${inv.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" data-testid={`inv-preview-${inv.id}`}><ExternalLink className="w-3.5 h-3.5 mr-1"/>Preview</Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
