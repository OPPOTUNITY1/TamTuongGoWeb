import type { PromotionDto } from "../../types/promotion/dto";
import { Check, Tag } from "lucide-react";

interface VoucherCardProps {
  promotion?: PromotionDto;
  selected: boolean;
  onSelect: () => void;
}

function formatPrice(price?: number) {
  if (price == null) return "—";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function getDiscountLabel(p?: PromotionDto) {
  if (!p) return "";
  const value = Number(p.discountValue ?? 0);
  const type = (p.discountType ?? "").toString().toLowerCase();
  if (type.includes("percent") || type.includes("%")) return `${value}%`;
  return formatPrice(value);
}

export default function VoucherCard({ promotion, selected, onSelect }: VoucherCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        selected ? "border-violet-600 bg-violet-50" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 text-sm font-semibold ${
            selected ? "bg-violet-600 text-white" : "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700"
          }`}
        >
          <Tag className="w-5 h-5" />
          <div className="leading-4 mt-0.5">{promotion ? getDiscountLabel(promotion) : "—"}</div>
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-black truncate">{promotion?.code ?? "Không dùng voucher"}</div>
          <div className="text-xs text-gray-500 truncate">{promotion?.description ?? (promotion ? "" : "Không áp dụng voucher")}</div>
          <div className="text-xs text-gray-400 mt-1">
            {promotion?.minPurchase ? `Đơn tối thiểu ${formatPrice(promotion.minPurchase)}` : "Áp dụng không cần điều kiện"}
            {promotion?.maxDiscount ? ` • Giảm tối đa ${formatPrice(promotion.maxDiscount)}` : ""}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={`ml-3 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          selected ? "bg-violet-600 text-white" : "border border-gray-200 text-gray-600 bg-white"
        }`}
      >
        {selected ? (
          <span className="inline-flex items-center gap-1">
            <Check className="w-4 h-4" />
            Đã chọn
          </span>
        ) : (
          "Áp dụng"
        )}
      </button>
    </div>
  );
}
