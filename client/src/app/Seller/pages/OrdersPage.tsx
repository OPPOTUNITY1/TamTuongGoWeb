import { ClipboardList } from "lucide-react";
import type { ShopDto } from "../../../types/shop/dto";

interface Props {
  shop: ShopDto;
}

export default function OrdersPage({ shop }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Đơn hàng</h1>
        <p className="text-slate-400 text-sm mt-0.5">{shop.name}</p>
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-16 text-center">
        <div className="p-5 bg-slate-800 rounded-2xl inline-block mb-4">
          <ClipboardList className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Sắp ra mắt</h2>
        <p className="text-slate-400 max-w-sm mx-auto text-sm">
          Tính năng quản lý đơn hàng đang được phát triển. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}
