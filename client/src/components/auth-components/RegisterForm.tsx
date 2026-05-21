import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import accountService from "../../services/account/account.service";

interface Props {
  onClose: () => void;
  onLoginClick: () => void;
}

export default function RegisterForm({ onLoginClick }: Props) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [roleName] = useState("Customer");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !password || !confirm) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await accountService.register({ userName, password, roleName });
      if (res.status) {
        toast.success("Đăng ký thành công! Hãy đăng nhập.");
        onLoginClick();
      } else {
        toast.error(res.message ?? "Đăng ký thất bại.");
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
        <h2 className="text-xl font-bold text-gray-900">Tạo tài khoản</h2>
        <p className="text-sm text-gray-500 mt-1">Tham gia TamTuong ngay hôm nay.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </button>
    </form>
  );
}
