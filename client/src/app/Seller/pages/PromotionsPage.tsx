import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Tag, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { ShopDto } from "../../../types/shop/dto";
import type { PromotionDto } from "../../../types/promotion/dto";
import type { PromotionRequest } from "../../../types/promotion/request";
import promotionService from "../../../services/promotion/promotion.service";

interface Props {
  shop: ShopDto;
}

const DISCOUNT_TYPES = [
  { value: "Percent", label: "Phần trăm (%)" },
  { value: "Fixed", label: "Cố định (đ)" },
];

const EMPTY: PromotionRequest = {
  shopId: "",
  code: "",
  description: "",
  discountType: "Percent",
  discountValue: undefined,
  startDate: "",
  endDate: "",
  usageLimit: undefined,
  scope: "All",
  minPurchase: undefined,
  maxDiscount: undefined,
};

function toDateInput(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function toIso(dateStr: string) {
  if (!dateStr) return undefined;
  return new Date(dateStr).toISOString();
}

function getStatus(p: PromotionDto): "active" | "upcoming" | "expired" {
  const now = Date.now();
  const start = p.startDate ? new Date(p.startDate).getTime() : 0;
  const end = p.endDate ? new Date(p.endDate).getTime() : Infinity;
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

const STATUS_BADGE = {
  active: "bg-emerald-500/15 text-emerald-400",
  upcoming: "bg-blue-500/15 text-blue-400",
  expired: "bg-slate-600/40 text-slate-400",
} as const;

const STATUS_LABEL = {
  active: "Đang hoạt động",
  upcoming: "Sắp diễn ra",
  expired: "Đã kết thúc",
} as const;

export default function PromotionsPage({ shop }: Props) {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<PromotionRequest>({ ...EMPTY, shopId: shop.id ?? "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!shop.id) return;
    setLoading(true);
    promotionService
      .getData({ shopId: shop.id })
      .then((res) => {
        if (res.status && res.data) {
          const d = res.data as any;
          setPromotions(Array.isArray(d) ? d : (d.items ?? d.Items ?? []));
        }
      })
      .catch(() => toast.error("Không thể tải danh sách khuyến mãi."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [shop.id]);

  const filtered = promotions.filter((p) =>
    (p.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ ...EMPTY, shopId: shop.id ?? "" });
    setModal("create");
  };

  const openEdit = (p: PromotionDto) => {
    setForm({
      id: p.id,
      shopId: p.shopId ?? shop.id ?? "",
      code: p.code ?? "",
      description: p.description ?? "",
      discountType: p.discountType ?? "Percent",
      discountValue: p.discountValue,
      startDate: toDateInput(p.startDate),
      endDate: toDateInput(p.endDate),
      usageLimit: p.usageLimit,
      usedCount: p.usedCount,
      scope: p.scope ?? "All",
      minPurchase: p.minPurchase,
      maxDiscount: p.maxDiscount,
    });
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: PromotionRequest = {
        ...form,
        startDate: form.startDate ? toIso(form.startDate) : undefined,
        endDate: form.endDate ? toIso(form.endDate) : undefined,
      };
      const res = modal === "create"
        ? await promotionService.create(payload)
        : await promotionService.update(payload);

      if (res?.status === true) {
        toast.success(modal === "create" ? "Tạo khuyến mãi thành công!" : "Cập nhật thành công!");
        setModal(null);
        load();
      } else {
        toast.error(res?.message ?? "Thao tác thất bại.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa khuyến mãi này?")) return;
    try {
      const res = await promotionService.delete(id);
      if (res.status) { toast.success("Đã xóa!"); load(); }
      else toast.error(res.message ?? "Xóa thất bại.");
    } catch { toast.error("Đã xảy ra lỗi."); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Khuyến mãi</h1>
          <p className="text-slate-400 text-sm mt-0.5">{shop.name}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm khuyến mãi
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã hoặc mô tả..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Chờ chút đi...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Chưa có khuyến mãi nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="text-left px-5 py-3">Mã</th>
                  <th className="text-left px-5 py-3">Loại</th>
                  <th className="text-right px-5 py-3">Giảm</th>
                  <th className="text-left px-5 py-3">Thời gian</th>
                  <th className="text-right px-5 py-3">Đã dùng</th>
                  <th className="text-left px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStatus(p);
                  return (
                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-white font-mono font-semibold tracking-wide">{p.code}</span>
                          {p.description && (
                            <span className="text-xs text-slate-400 truncate max-w-[180px]">{p.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-slate-300">
                          {p.discountType === "Percent"
                            ? <Percent className="w-3.5 h-3.5 text-violet-400" />
                            : <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                          {p.discountType === "Percent" ? "Phần trăm" : "Cố định"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-violet-300">
                        {p.discountType === "Percent"
                          ? `${p.discountValue ?? 0}%`
                          : `${(p.discountValue ?? 0).toLocaleString("vi-VN")}đ`}
                      </td>
                      <td className="px-5 py-3 text-slate-300 text-xs whitespace-nowrap">
                        <div>{p.startDate ? new Date(p.startDate).toLocaleDateString("vi-VN") : "—"}</div>
                        <div className="text-slate-500">→ {p.endDate ? new Date(p.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-300">
                        {p.usedCount ?? 0}
                        {p.usageLimit != null && (
                          <span className="text-slate-500">/{p.usageLimit}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => p.id && handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">
                {modal === "create" ? "Thêm khuyến mãi" : "Sửa khuyến mãi"}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 grid grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              {/* Code */}
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Mã khuyến mãi *</label>
                <input
                  value={form.code ?? ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SALE50"
                  className="field font-mono tracking-widest"
                  required
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Mô tả</label>
                <input
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả chương trình khuyến mãi..."
                  className="field"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Loại giảm giá *</label>
                <select
                  value={form.discountType ?? "Percent"}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value, maxDiscount: undefined })}
                  className="field"
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Giá trị giảm {form.discountType === "Percent" ? "(%)" : "(đ)"} *
                </label>
                <input
                  type="number"
                  min={0}
                  max={form.discountType === "Percent" ? 100 : undefined}
                  value={form.discountValue ?? ""}
                  onChange={(e) => setForm({ ...form, discountValue: +e.target.value })}
                  placeholder={form.discountType === "Percent" ? "0 - 100" : "0"}
                  className="field"
                  required
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.startDate ?? ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="field"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Ngày kết thúc</label>
                <input
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="field"
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  min={0}
                  value={form.usageLimit ?? ""}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? +e.target.value : undefined })}
                  placeholder="Không giới hạn"
                  className="field"
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Đơn tối thiểu (đ)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minPurchase ?? ""}
                  onChange={(e) => setForm({ ...form, minPurchase: e.target.value ? +e.target.value : undefined })}
                  placeholder="0"
                  className="field"
                />
              </div>

              {/* Max Discount — only for Percent */}
              {form.discountType === "Percent" && (
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Giảm tối đa (đ)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscount ?? ""}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? +e.target.value : undefined })}
                    placeholder="Không giới hạn"
                    className="field"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="col-span-2 flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.field { width: 100%; padding: 0.5rem 0.875rem; border-radius: 0.75rem; background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.875rem; outline: none; } .field:focus { border-color: #7c3aed; } select.field option { background: #1e293b; }`}</style>
    </div>
  );
}
