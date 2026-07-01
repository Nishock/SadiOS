import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("shaadios_token");
    if (!t) { setLoading(false); return; }
    api.get("/auth/me").then(r => setUser(r.data)).catch(() => {
      localStorage.removeItem("shaadios_token");
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("shaadios_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const register = async (data) => {
    const r = await api.post("/auth/register", data);
    localStorage.setItem("shaadios_token", r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem("shaadios_token");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}
