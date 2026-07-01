import { useEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { BACKEND_URL, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";

const STARTERS = [
  "Mere paas 300 guests hain, kitna khaana order karu?",
  "What's a realistic budget for a Delhi wedding?",
  "Suggest a Sangeet timeline for 4 hours",
  "Punjabi wedding ke liye DJ playlist ideas?",
];

export default function Assistant() {
  const { active } = useWedding();
  const [sessionId] = useState(() => {
    const k = "shaadios_chat_sid";
    let v = localStorage.getItem(k);
    if (!v) { v = `s_${Math.random().toString(36).slice(2,10)}`; localStorage.setItem(k, v); }
    return v;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get(`/assistant/history/${sessionId}`).then(r => setMessages(r.data));
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text) => {
    if (!text.trim() || streaming) return;
    const userMsg = { id: `u_${Date.now()}`, role: "user", content: text };
    setMessages(m => [...m, userMsg, { id: `a_${Date.now()}`, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const token = localStorage.getItem("shaadios_token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: sessionId, message: text, wedding_id: active?.id }),
      });
      if (!res.ok || !res.body) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          try {
            const j = JSON.parse(ev.slice(6));
            if (j.delta) {
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + j.delta };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Sorry, I couldn't reach the AI right now. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <p className="uppercase tracking-[0.25em] text-xs font-semibold text-[#881337]">Shaadi Saheli</p>
        <h1 className="font-serif text-4xl mt-2">Your AI wedding <span className="italic text-[#881337]">sakhi</span></h1>
        <p className="text-stone-500 mt-1">Ask in Hindi, English, ya Hinglish.</p>
      </div>

      <div ref={scrollRef} className="flex-1 mt-6 bg-white border border-stone-200 rounded-xl p-6 overflow-y-auto space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-[#881337] mx-auto flex items-center justify-center text-white"><Bot className="w-7 h-7"/></div>
            <p className="font-serif text-2xl mt-4">Namaste! I'm Saheli.</p>
            <p className="text-stone-500 text-sm mt-1">Try one of these to get started:</p>
            <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto mt-5">
              {STARTERS.map((s, i) => (
                <button key={i} onClick={()=>send(s)} data-testid={`starter-${i}`} className="text-left p-3 border border-stone-200 rounded-lg hover:border-[#881337] hover:bg-stone-50 transition text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`} data-testid={`msg-${m.role}-${i}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-stone-900 text-white" : "bg-[#881337] text-white"}`}>
              {m.role === "user" ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
            </div>
            <div className={`max-w-[75%] p-4 rounded-2xl ${m.role === "user" ? "bg-stone-900 text-white" : "bg-stone-50 text-stone-900"}`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.content || (streaming ? "…" : "")}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={e=>{e.preventDefault(); send(input);}} className="mt-4 flex gap-2">
        <Input data-testid="chat-input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Saheli anything…" disabled={streaming} className="flex-1"/>
        <Button type="submit" disabled={streaming || !input.trim()} data-testid="chat-send-button" className="bg-[#881337] hover:bg-[#6f0f2d] text-white rounded-full px-6">
          <Send className="w-4 h-4"/>
        </Button>
      </form>
    </div>
  );
}
