import { useState } from "react";
import { X, Store } from "lucide-react";
import { toast } from "sonner";
import shopService from "../../../services/shop/shop.service";
import type { ShopDto } from "../../../types/shop/dto";

interface Props {
  sellerId: string;
  onClose: () => void;
  onCreated: (shop: ShopDto) => void;
}

export default function CreateShopModal({ sellerId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Vui lòng nhập tên cửa hàng."); return; }
    setLoading(true);
    try {
      const res = await shopService.create({ sellerId, name: name.trim() });
      if (res.status && res.data) {
        toast.success("Tạo cửa hàng thành công!");
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Store className="w-4 h-4 text-violet-400" />
            Tạo cửa hàng mới
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên cửa hàng</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cửa hàng gỗ Minh Phát"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
              {loading ? "Đang tạo..." : "Tạo cửa hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
