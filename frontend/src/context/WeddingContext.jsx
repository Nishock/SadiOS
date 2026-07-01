import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const WCtx = createContext(null);
export const useWedding = () => useContext(WCtx);

export function WeddingProvider({ children }) {
  const [weddings, setWeddings] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/weddings");
      setWeddings(r.data);
      const lastId = localStorage.getItem("shaadios_active_wid");
      const cur = r.data.find(w => w.id === lastId) || r.data[0] || null;
      setActive(cur);
      if (cur) localStorage.setItem("shaadios_active_wid", cur.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const selectWedding = (w) => {
    setActive(w);
    localStorage.setItem("shaadios_active_wid", w.id);
  };

  return (
    <WCtx.Provider value={{ weddings, active, loading, refresh, selectWedding }}>
      {children}
    </WCtx.Provider>
  );
}
