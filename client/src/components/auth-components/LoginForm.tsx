import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import accountService from "../../services/account/account.service";
import { useAuth } from "../../app/AuthContext";
import { parseJwtRole, parseJwtUserId } from "../../app/utils/jwt";

interface Props {
  onClose: () => void;
  onForgot: () => void;
}

export default function LoginForm({ onClose, onForgot }: Props) {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const res = await accountService.login({ username, password });
      if (res.status && res.data?.accessToken) {
        const token = res.data.accessToken;
        const role = parseJwtRole(token) ?? undefined;
        setAuth({
          email: res.data.email,
          fullName: res.data.fullName,
          imageUrl: res.data.imageUrl,
          accessToken: token,
          role,
          userId: parseJwtUserId(token) ?? undefined,
        });
        toast.success("Đăng nhập thành công!");
        onClose();
        if (role === "Seller") navigate("/seller");
      } else {
        toast.error(res.message ?? "Đăng nhập thất bại.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-black-900" style={{color: "#000"}}>Chào mừng bạn đến với Tâm Tượng Gỗ</h2>
        <p className="text-sm text-gray-500 mt-1">Đăng nhập để tiếp tục mua sắm.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgot}
          className="text-xs text-violet-600 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        <LogIn className="w-4 h-4" />
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
