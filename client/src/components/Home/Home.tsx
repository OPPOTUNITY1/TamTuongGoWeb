import { useEffect, useState } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Star,
  TrendingUp,
  Shield,
  Truck,
  HeadphonesIcon,
  ChevronRight,
  Store,
} from "lucide-react";

import { useNavigate } from "react-router";
import { toast } from "sonner";
import productService from "../../services/product/product.service";
import cartService from "../../services/cart/cart.service";
import type { ProductDto } from "../../types/product/dto";
import { useAuthPopup } from "../auth-components/LoginPopupListener";
import { useAuth } from "../../app/AuthContext";
import NavBar from "../NavBar/NavBar";

const FALLBACK_IMG =
  "https://placehold.co/400x400?text=No+Image";

function formatPrice(price?: number) {
  if (price == null) return "—";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function Home() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productService
      .getData({ pageIndex: 1, pageSize: 8 })
      .then((res) => {
        if (res.status && res.data) setProducts(res.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    (p.productName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavBar search={search} onSearchChange={setSearch} />

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
              Khám phá ngay
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Mua sắm thông minh,{" "}
              <span className="text-yellow-300">tiết kiệm hơn</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Hàng ngàn sản phẩm chất lượng từ các cửa hàng uy tín. Giao hàng
              nhanh, giá tốt mỗi ngày.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-full transition-colors shadow-lg">
                Mua sắm ngay <ChevronRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 rounded-full font-medium transition-colors border border-white/30">
                Xem danh mục
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-2 gap-3 w-72">
              {[
                { icon: <TrendingUp className="w-6 h-6" />, label: "10K+ Sản phẩm" },
                { icon: <Star className="w-6 h-6" />, label: "4.9★ Đánh giá" },
                { icon: <Truck className="w-6 h-6" />, label: "Giao nhanh 2H" },
                { icon: <Shield className="w-6 h-6" />, label: "Bảo hành uy tín" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 bg-white/15 backdrop-blur rounded-2xl p-4 text-center border border-white/20"
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-5 h-5 text-violet-600" />, title: "Miễn phí vận chuyển", sub: "Đơn từ 299.000đ" },
            { icon: <Shield className="w-5 h-5 text-violet-600" />, title: "Bảo mật thanh toán", sub: "SSL & mã hóa" },
            { icon: <Star className="w-5 h-5 text-violet-600" />, title: "Sản phẩm chính hãng", sub: "100% authentic" },
            { icon: <HeadphonesIcon className="w-5 h-5 text-violet-600" />, title: "Hỗ trợ 24/7", sub: "Chat & gọi điện" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 rounded-xl shrink-0">{f.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{color:"black"}}>Sản phẩm nổi bật</h2>
            <p className="text-sm text-gray-500 mt-1">
              Khám phá bộ sưu tập mới nhất của chúng tôi
            </p>
          </div>
          <button className="hidden sm:inline-flex items-center gap-1 text-sm text-violet-600 font-medium hover:underline">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="bg-gray-200 aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner CTA ── */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-4">
          <h2 className="text-3xl font-extrabold">Bạn muốn bán hàng?</h2>
          <p className="text-white/80 max-w-lg mx-auto text-center">
            Mở cửa hàng ngay hôm nay — miễn phí, dễ dàng, tiếp cận hàng nghìn
            khách hàng.
          </p>
          <button className="inline-flex items-center gap-2 mt-2 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold rounded-full transition-colors shadow-lg">
            Đăng ký bán ngay <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              title: "TamTuong",
              links: ["Về chúng tôi", "Tuyển dụng", "Tin tức"],
            },
            { title: "Hỗ trợ", links: ["Trung tâm hỗ trợ", "Liên hệ", "FAQs"] },
            { title: "Chính sách", links: ["Bảo mật", "Điều khoản", "Cookie"] },
            { title: "Theo dõi", links: ["Facebook", "Instagram", "Zalo"] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-violet-400 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
          © {new Date().getFullYear()} TamTuong. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: ProductDto }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open: openAuth } = useAuthPopup();
  const mainImg = product.thumbnailUrl || product.imageUrl || FALLBACK_IMG;
  const hoverImg =
    (product.productImages ?? []).find((img) => img.imageUrl && img.imageUrl !== mainImg)?.imageUrl
    ?? null;

  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { openAuth(); return; }
    if (!product.id) return;
    setAdding(true);
    try {
      const res = await cartService.create({ userId: user.userId, productId: product.id, quantity: 1 });
      if (res.status) toast.success("Đã thêm vào giỏ hàng!");
      else toast.error(res.message ?? "Thêm vào giỏ thất bại.");
    } catch { toast.error("Lỗi khi thêm vào giỏ hàng."); }
    finally { setAdding(false); }
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Main image — fades out on hover when a hover image exists */}
        <img
          src={mainImg}
          alt={product.productName ?? "Sản phẩm"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${hovered ? "scale-105" : "scale-100"} ${hovered && hoverImg ? "opacity-0" : "opacity-100"}`}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
        />
        {/* Hover image — crossfades in on hover */}
        {hoverImg && (
          <img
            src={hoverImg}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${hovered ? "scale-105 opacity-100" : "scale-100 opacity-0"}`}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          />
        )}
        {(product.soldCount ?? 0) > 10 && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            HOT
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.productName ?? "Sản phẩm"}
        </p>
        {product.shopName && (
          <p className="text-xs text-violet-500 font-medium flex items-center gap-1 truncate">
            <Store className="w-3 h-3 shrink-0" />
            {product.shopName}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-auto">
          Đã bán: {product.soldCount ?? 0}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-violet-700">
            {formatPrice(product.retailPrice)}
          </span>
          <button
            className="p-1.5 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white transition-colors shadow"
            disabled={adding}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
