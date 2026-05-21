import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  email?: string;
  fullName?: string;
  imageUrl?: string;
  accessToken?: string;
  role?: string;
  userId?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Restore from localStorage on first load
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
    if (u.accessToken) localStorage.setItem("token", u.accessToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
