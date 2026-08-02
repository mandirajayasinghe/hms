import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hms_access_token");
    if (!token) { setLoading(false); return; }
    authApi.me().then(setUser).catch(() => {
      localStorage.removeItem("hms_access_token");
      localStorage.removeItem("hms_refresh_token");
    }).finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem("hms_access_token", data.accessToken);
    localStorage.setItem("hms_refresh_token", data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("hms_access_token");
    localStorage.removeItem("hms_refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);