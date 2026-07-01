import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Calendar, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TEMPLATES = {
  marigold: { bg: "#FFF7E6", accent: "#F59E0B", text: "#1C1917" },
  royal: { bg: "#FAF9F6", accent: "#881337", text: "#1C1917" },
  modern: { bg: "#F2EFE9", accent: "#3f5238", text: "#1C1917" },
};

export default function PublicInvite() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [rsvp, setRsvp] = useState({ name: "", mobile: "", rsvp_status: "confirmed", plus_ones: 0, message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/public/invitations/${slug}`).then(r => setData(r.data)).catch(()=>{});
  }, [slug]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/public/invitations/${slug}/rsvp`, { ...rsvp, plus_ones: Number(rsvp.plus_ones) });
      setSubmitted(true);
      toast.success("Thank you for your RSVP!");
    } catch (err) {
      toast.error("Failed to submit");
    } finally { setLoading(false); }
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading invitation…</div>;
  const t = TEMPLATES[data.invitation.template] || TEMPLATES.marigold;
  const w = data.wedding;
  const date = new Date(w.wedding_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen relative" style={{ background: t.bg, color: t.text }}>
      <div className="absolute inset-0 grain opacity-50 pointer-events-none"/>
      <div className="max-w-2xl mx-auto px-6 py-16 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          <Heart className="w-10 h-10 mx-auto mb-6" fill={t.accent} stroke={t.accent} strokeWidth={1}/>
          <p className="uppercase tracking-[0.3em] text-xs font-semibold" style={{ color: t.accent }}>{data.invitation.title}</p>
          <h1 className="font-serif text-6xl sm:text-7xl mt-6 leading-tight">{w.bride_name}</h1>
          <p className="font-serif italic text-3xl my-3" style={{ color: t.accent }}>weds</p>
          <h1 className="font-serif text-6xl sm:text-7xl leading-tight">{w.groom_name}</h1>

          <div className="divider-dots my-10 max-w-xs mx-auto"><Heart className="w-3 h-3" fill={t.accent} stroke={t.accent}/></div>

          <p className="font-serif text-xl whitespace-pre-line max-w-lg mx-auto leading-relaxed">{data.invitation.message}</p>

          <div className="mt-12 space-y-3">
            <div className="flex items-center justify-center gap-2 font-serif text-2xl"><Calendar className="w-5 h-5" style={{color:t.accent}}/>{date}</div>
            {w.venue && <div className="flex items-center justify-center gap-2 text-base"><MapPin className="w-4 h-4" style={{color:t.accent}}/>{w.venue}, {w.city}</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-16 bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
          {submitted ? (
            <div className="text-center py-6">
              <Check className="w-12 h-12 mx-auto mb-3" style={{ color: t.accent }}/>
              <p className="font-serif text-3xl">Thank you!</p>
              <p className="text-stone-500 mt-2">Your RSVP has been recorded. See you on the big day!</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="text-center mb-4">
                <p className="uppercase tracking-[0.25em] text-xs font-semibold" style={{ color: t.accent }}>RSVP</p>
                <h3 className="font-serif text-3xl mt-2">Will you join us?</h3>
              </div>
              <div className="space-y-2"><Label>Your name</Label><Input data-testid="public-rsvp-name" value={rsvp.name} onChange={e=>setRsvp({...rsvp,name:e.target.value})} required/></div>
              <div className="space-y-2"><Label>Mobile</Label><Input data-testid="public-rsvp-mobile" value={rsvp.mobile} onChange={e=>setRsvp({...rsvp,mobile:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={()=>setRsvp({...rsvp, rsvp_status: "confirmed"})} data-testid="public-rsvp-confirm"
                  className={`p-4 rounded-lg border-2 transition ${rsvp.rsvp_status === "confirmed" ? "border-[#A3B18A] bg-[#A3B18A]/10" : "border-stone-200"}`}>
                  <Check className="w-5 h-5 mx-auto mb-1 text-[#3f5238]"/><p className="text-sm font-medium">Joyfully accept</p>
                </button>
                <button type="button" onClick={()=>setRsvp({...rsvp, rsvp_status: "rejected"})} data-testid="public-rsvp-decline"
                  className={`p-4 rounded-lg border-2 transition ${rsvp.rsvp_status === "rejected" ? "border-rose-400 bg-rose-50" : "border-stone-200"}`}>
                  <X className="w-5 h-5 mx-auto mb-1 text-rose-700"/><p className="text-sm font-medium">Regretfully decline</p>
                </button>
              </div>
              {rsvp.rsvp_status === "confirmed" && (
                <div className="space-y-2"><Label>Bringing guests?</Label><Input data-testid="public-rsvp-plus" type="number" min="0" max="10" value={rsvp.plus_ones} onChange={e=>setRsvp({...rsvp,plus_ones:e.target.value})}/></div>
              )}
              <Button type="submit" disabled={loading} data-testid="public-rsvp-submit" className="w-full rounded-full py-6 text-white" style={{ background: t.accent }}>
                {loading ? "Sending…" : "Submit RSVP"}
              </Button>
            </form>
          )}
        </motion.div>

        <p className="text-center text-xs text-stone-400 mt-10">Powered by SHAADIOS</p>
      </div>
    </div>
  );
}
