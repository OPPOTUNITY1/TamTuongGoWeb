import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Package, Tag, ShoppingBag, TrendingUp } from "lucide-react";
import type { ShopDto } from "../../../types/shop/dto";
import productService from "../../../services/product/product.service";
import categoryService from "../../../services/category/category.service";

interface Props {
  shop: ShopDto;
}

// Fake monthly revenue data (replace with real API when available)
const generateRevenueData = () =>
  ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"].map(
    (month, i) => ({
      month,
      revenue: Math.floor(Math.random() * 15000000) + 2000000 * (i + 1),
      orders: Math.floor(Math.random() * 50) + 10,
    })
  );

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function OverviewPage({ shop }: Props) {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [revenueData] = useState(generateRevenueData);

  useEffect(() => {
    if (!shop.id) return;
    productService.getData({ shopId: shop.id, pageSize: 1000 }).then((res) => {
      if (res.status && res.data) setProductCount(res.data.items.length);
    });
    categoryService.getData({ shopId: shop.id }).then((res) => {
      if (res.status && res.data) setCategoryCount(res.data.length);
    });
  }, [shop.id]);

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
        <p className="text-slate-400 text-sm mt-1">Tổng quan hoạt động cửa hàng</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-violet-400" />}
          label="Sản phẩm"
          value={productCount}
          sub="đang kinh doanh"
          color="bg-violet-500/15"
        />
        <StatCard
          icon={<Tag className="w-5 h-5 text-blue-400" />}
          label="Danh mục"
          value={categoryCount}
          sub="danh mục"
          color="bg-blue-500/15"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-amber-400" />}
          label="Đơn hàng"
          value={totalOrders}
          sub="trong năm"
          color="bg-amber-500/15"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          label="Doanh thu"
          value={totalRevenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          sub="trong năm"
          color="bg-emerald-500/15"
        />
      </div>

      {/* Revenue area chart */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-4">Doanh thu theo tháng</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }), "Doanh thu"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders bar chart */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-4">Số đơn hàng theo tháng</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff" }}
              formatter={(v: any) => [v, "Đơn hàng"]}
            />
            <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
