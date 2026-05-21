import { useState } from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import sellerService from "../../../services/seller/seller.service";
import type { SellerDto } from "../../../types/seller/dto";

interface Props {
  onCreated: (seller: SellerDto) => void;
}

export default function CreateSellerModal({ onCreated }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Vui lòng nhập tên doanh nghiệp.");
      return;
    }
    setLoading(true);
    try {
      const res = await sellerService.create({
        businessName: businessName.trim(),
        taxCode: taxCode.trim() || undefined,
      });
      if (res.status && res.data) {
        toast.success("Tạo hồ sơ Seller thành công!");
        onCreated(res.data);
      } else {
        toast.error(res.message ?? "Tạo thất bại.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-violet-500/15 rounded-xl">
              <UserCheck className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Thiết lập hồ sơ Seller</h2>
          </div>
          <p className="text-slate-400 text-sm mt-2 ml-11">
            Bạn cần tạo hồ sơ người bán trước khi có thể mở cửa hàng và bán hàng trên TamTuong.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tên doanh nghiệp / Tên cửa hàng <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="VD: Gỗ Tâm Tượng, Nội thất Minh Phát..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Mã số thuế{" "}
              <span className="text-slate-500 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              placeholder="VD: 0123456789"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {loading ? "Đang tạo..." : "Tạo hồ sơ Seller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
