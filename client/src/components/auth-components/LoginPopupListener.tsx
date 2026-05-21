import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import LoginFormPopup from "./LoginFormPopup";

export type AuthView = "login" | "register" | "forgot" | "reset";

interface AuthPopupCtx {
  open: (view?: AuthView) => void;
  close: () => void;
}

const AuthPopupContext = createContext<AuthPopupCtx>({
  open: () => {},
  close: () => {},
});

export function useAuthPopup() {
  return useContext(AuthPopupContext);
}

export default function LoginPopupListener({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AuthView | null>(null);

  return (
    <AuthPopupContext.Provider
      value={{ open: (v = "login") => setView(v), close: () => setView(null) }}
    >
      {children}
      {view && (
        <LoginFormPopup initialView={view} onClose={() => setView(null)} />
      )}
    </AuthPopupContext.Provider>
  );
}
