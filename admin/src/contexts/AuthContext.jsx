import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth } from "../services/adminApi";
import { clearTokens, getAccessToken, setTokens } from "../utils/tokens";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await auth.me();
      setUser(data);
      return data;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    loadMe().finally(() => setLoading(false));
  }, [loadMe]);

  const login = useCallback(
    async (username, password, remember = true) => {
      const { data } = await auth.login(username, password);
      setTokens(data.access, data.refresh, remember);
      await loadMe();
      return data;
    },
    [loadMe]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
