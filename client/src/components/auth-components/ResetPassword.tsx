import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import accountService from "../../services/account/account.service";

interface Props {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function ResetPassword({ email, onSuccess, onBack }: Props) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirm) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const res = await accountService.resetPassword({ email, token, newPassword });
      if (res.status) {
        toast.success("Đặt lại mật khẩu thành công! Hãy đăng nhập.");
        onSuccess();
      } else {
        toast.error(res.message ?? "Mã xác nhận không hợp lệ.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
        <p className="text-sm text-gray-500 mt-1">
          Nhập mã xác nhận đã gửi tới <span className="font-medium text-violet-600">{email}</span>
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác nhận</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Nhập mã xác nhận"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50 tracking-widest"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
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
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        <KeyRound className="w-4 h-4" />
        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}
