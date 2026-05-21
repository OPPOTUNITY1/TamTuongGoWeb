import { useState } from "react";
import { X } from "lucide-react";
import type { AuthView } from "./LoginPopupListener";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotForm from "./ForgotForm";
import ResetPassword from "./ResetPassword";

interface Props {
  initialView: AuthView;
  onClose: () => void;
}

export default function LoginFormPopup({ initialView, onClose }: Props) {
  const [view, setView] = useState<AuthView>(initialView);
  const [resetEmail, setResetEmail] = useState("");

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tabs — only for login/register */}
        {(view === "login" || view === "register") && (
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setView("login")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                view === "login"
                  ? "text-violet-700 border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setView("register")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                view === "register"
                  ? "text-violet-700 border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* View content */}
        <div className="p-6">
          {view === "login" && (
            <LoginForm
              onClose={onClose}
              onForgot={() => setView("forgot")}
            />
          )}
          {view === "register" && (
            <RegisterForm
              onClose={onClose}
              onLoginClick={() => setView("login")}
            />
          )}
          {view === "forgot" && (
            <ForgotForm
              onBack={() => setView("login")}
              onSuccess={(email) => {
                setResetEmail(email);
                setView("reset");
              }}
            />
          )}
          {view === "reset" && (
            <ResetPassword
              email={resetEmail}
              onSuccess={() => setView("login")}
              onBack={() => setView("forgot")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
