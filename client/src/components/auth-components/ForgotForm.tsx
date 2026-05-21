import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import accountService from "../../services/account/account.service";

interface Props {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export default function ForgotForm({ onBack, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    try {
      const res = await accountService.forgotPassword({ email });
      if (res.status) {
        toast.success("Đã gửi mã xác nhận về email của bạn.");
        onSuccess(email);
      } else {
        toast.error(res.message ?? "Không tìm thấy tài khoản.");
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
        <h2 className="text-xl font-bold text-gray-900">Quên mật khẩu</h2>
        <p className="text-sm text-gray-500 mt-1">
          Nhập email tài khoản, chúng tôi sẽ gửi mã xác nhận cho bạn.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
      </button>
    </form>
  );
}
