import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  ChevronRight,
  Plus,
  Store,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../app/AuthContext";
import { useNavigate } from "react-router";
import sellerService from "../../services/seller/seller.service";
import shopService from "../../services/shop/shop.service";
import type { SellerDto } from "../../types/seller/dto";
import type { ShopDto } from "../../types/shop/dto";
import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import PromotionsPage from "./pages/PromotionsPage";
import CreateShopModal from "./modals/CreateShopModal";
import CreateSellerModal from "./modals/CreateSellerModal";

export type SellerPage = "overview" | "products" | "categories" | "orders" | "promotions";

const NAV_ITEMS: { key: SellerPage; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Tổng quan", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "products", label: "Sản phẩm", icon: <Package className="w-4 h-4" /> },
  { key: "categories", label: "Danh mục", icon: <Tag className="w-4 h-4" /> },
  { key: "orders", label: "Đơn hàng", icon: <ClipboardList className="w-4 h-4" /> },
  { key: "promotions", label: "Khuyến mãi", icon: <Tag className="w-4 h-4" /> },
];

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerDto | null>(null);
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopDto | null>(null);
  const [page, setPage] = useState<SellerPage>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [hasSeller, setHasSeller] = useState(true);

  // Guard: only seller role
  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role !== "Seller") { navigate("/"); return; }
  }, [user, navigate]);

  // Load seller info
  useEffect(() => {
    if (!user) return;
    sellerService.getMe().then((res) => {
      if (res.status && res.data) {
        // Đã có seller
        setSeller(res.data);
        setHasSeller(true);
      } else if (!res.status && res.message === "Chưa có hồ sơ Seller.") {
        // Chưa có seller → hiện modal tạo
        setHasSeller(false);
      } else {
        // Lỗi auth / không đọc được userId → không hiện modal nhầm
        setHasSeller(true);
      }
    }).catch(() => {
      // Network error / 401 → không hiện modal nhầm
      setHasSeller(true);
    }).finally(() => setLoadingSeller(false));
  }, [user]);

  // Load shops when seller is loaded
  useEffect(() => {
    if (!seller?.id) return;
    shopService.getData({ sellerId: seller.id, pageSize: 100 }).then((res) => {
      if (res.status && res.data) {
        const d = res.data as any;
        const items = Array.isArray(d) ? d : (d.items ?? d.Items ?? []);
        setShops(items);
        if (items.length > 0) setSelectedShop(items[0]);
      }
    });
  }, [seller]);

  const handleShopCreated = (shop: ShopDto) => {
    setShops((prev) => [...prev, shop]);
    setSelectedShop(shop);
    setShowCreateShop(false);
  };

  if (loadingSeller) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white/60 text-sm animate-pulse">Chờ chút đi...</div>
      </div>
    );
  }

  if (!hasSeller) {
    return (
      <div className="min-h-screen bg-slate-950">
        <CreateSellerModal
          onCreated={(s) => {
            setSeller(s);
            setHasSeller(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* ── Sidebar ── */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        } transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-800">
          <ShoppingBag className="w-6 h-6 text-violet-400" />
          <span className="text-white font-bold text-lg tracking-tight">TamTuong</span>
          <span className="ml-auto text-xs text-violet-400 font-semibold bg-violet-500/15 px-2 py-0.5 rounded-full">
            Seller
          </span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-violet-500/50 shrink-0">
              <img
                src={
                  user?.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? user?.email ?? "S")}&background=7c3aed&color=fff&bold=true`
                }
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName ?? user?.email}</p>
              <p className="text-xs text-slate-400 truncate">{seller?.businessName ?? "Seller"}</p>
            </div>
          </div>
        </div>

        {/* Shops list */}
        <div className="px-3 py-3 border-b border-slate-800">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Cửa hàng của bạn
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {shops.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-1">Chưa có cửa hàng nào.</p>
            ) : (
              shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => { setSelectedShop(shop); setPage("overview"); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedShop?.id === shop.id
                      ? "bg-violet-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span className="truncate">{shop.name}</span>
                  {selectedShop?.id === shop.id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  )}
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => setShowCreateShop(true)}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-violet-400 hover:bg-violet-500/10 transition-colors border border-dashed border-violet-500/30"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm cửa hàng
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Quản lý
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              disabled={!selectedShop}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                page === item.key && selectedShop
                  ? "bg-violet-600/20 text-violet-300 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Về trang mua sắm
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Store className="w-4 h-4" />
            <span className="text-white font-medium">
              {selectedShop?.name ?? "Chọn cửa hàng"}
            </span>
            {selectedShop && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-violet-400 capitalize">
                  {NAV_ITEMS.find((n) => n.key === page)?.label}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {!selectedShop ? (
            <EmptyShopState onAdd={() => setShowCreateShop(true)} />
          ) : (
            <>
              {page === "overview" && <OverviewPage shop={selectedShop} />}
              {page === "products" && <ProductsPage shop={selectedShop} seller={seller} />}
              {page === "categories" && <CategoriesPage shop={selectedShop} seller={seller} />}
              {page === "orders" && <OrdersPage shop={selectedShop} />}
              {page === "promotions" && <PromotionsPage shop={selectedShop} />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateShop && seller && (
        <CreateShopModal
          sellerId={seller.id!}
          onClose={() => setShowCreateShop(false)}
          onCreated={handleShopCreated}
        />
      )}
      {!hasSeller && (
        <CreateSellerModal
          onCreated={(s) => {
            setSeller(s);
            setHasSeller(true);
          }}
        />
      )}
    </div>
  );
}

function EmptyShopState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="p-5 bg-slate-800 rounded-2xl mb-4">
        <Store className="w-12 h-12 text-violet-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Bạn chưa có cửa hàng nào</h2>
      <p className="text-slate-400 mb-6 max-w-sm">
        Tạo cửa hàng đầu tiên để bắt đầu bán hàng và quản lý sản phẩm của bạn.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" /> Tạo cửa hàng ngay
      </button>
    </div>
  );
}
