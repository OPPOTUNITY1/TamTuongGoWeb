import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Package,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
  HeadphonesIcon,
} from "lucide-react";
import { toast } from "sonner";
import productService from "../../services/product/product.service";
import cartService from "../../services/cart/cart.service";
import { useAuth } from "../AuthContext";
import type { ProductDto } from "../../types/product/dto";

const FALLBACK_IMG = "https://placehold.co/600x600?text=No+Image";

function formatPrice(price?: number) {
  if (price == null) return "—";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService
      .get(id)
      .then((res) => {
        if (res.status && res.data) setProduct(res.data);
        else toast.error("Không tìm thấy sản phẩm.");
      })
      .catch(() => toast.error("Đã xảy ra lỗi khi tải sản phẩm."))
      .finally(() => setLoading(false));
  }, [id]);

  // Build gallery: thumbnail first, then productImages
  const gallery = product
    ? [
        product.thumbnailUrl || product.imageUrl || FALLBACK_IMG,
        ...(product.productImages ?? [])
          .map((img) => img.imageUrl)
          .filter((url): url is string => !!url),
      ].filter((url, i, arr) => arr.indexOf(url) === i) // dedupe
    : [];

  const prev = () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActiveIdx((i) => (i + 1) % gallery.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-black">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="w-16 h-16 text-black" />
        <p className="text-black text-lg">Không tìm thấy sản phẩm</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm hover:bg-violet-700 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-violet-600 w-6 h-6" />
            <span className="text-lg font-bold text-violet-700">TamTuong</span>
          </div>
          <span className="text-black text-sm ml-1 truncate hidden sm:block" style={{ color: "#000" }}>
            / {product.categoryName ?? "Sản phẩm"} / {product.productName}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 group">
              <img
                src={gallery[activeIdx] ?? FALLBACK_IMG}
                alt={product.productName ?? "Sản phẩm"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMG;
                }}
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-black" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === activeIdx ? "w-5 h-2 bg-violet-600" : "w-2 h-2 bg-white/70 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === activeIdx
                        ? "border-violet-500 scale-105 shadow-md"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col gap-5">
            {/* Category badge */}
            {product.categoryName && (
              <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                <Tag className="w-3 h-3" />
                {product.categoryName}
              </span>
            )}

            {/* Title */}
            <h5 className="text-2xl md:text-3xl font-extrabold text-black leading-tight" style={{ color: "#000" }}>
              {product.productName}
            </h5>

            {/* Rating placeholder */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-black">
                Đã bán: <span className="font-medium text-black">{product.soldCount ?? 0}</span>
              </span>
            </div>

            {/* Price block */}
            <div className="bg-violet-50 rounded-2xl px-5 py-4">
              <p className="text-3xl font-black text-violet-700">
                {formatPrice(product.retailPrice)}
              </p>
              {product.importPrice != null && product.importPrice < (product.retailPrice ?? 0) && (
                <p className="text-sm text-black line-through mt-0.5">
                  {formatPrice(product.importPrice)}
                </p>
              )}
            </div>

            {/* Shop */}
            {product.shopName && (
              <div className="flex items-center gap-2 text-sm text-black">
                <Store className="w-4 h-4 text-violet-500 shrink-0" />
                <span>Bởi <span className="font-semibold text-black">{product.shopName}</span></span>
              </div>
            )}

            {/* Stock */}
              <div className="flex items-center gap-2 text-sm text-black">
              <Package className="w-4 h-4 text-violet-500 shrink-0" />
              <span>
                Còn hàng:{" "}
                <span className={`font-semibold ${(product.quantity ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                  {(product.quantity ?? 0) > 0 ? `${product.quantity} sản phẩm` : "Hết hàng"}
                </span>
              </span>
            </div>

            {/* Quantity picker */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-black">Số lượng:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-black text-lg font-medium"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-black">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity ?? 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-black text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={addingToCart || (product.quantity ?? 0) === 0}
                onClick={async () => {
                  if (!user) { toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng."); return; }
                  setAddingToCart(true);
                  try {
                    const res = await cartService.create({ userId: user.userId, productId: product.id, quantity: qty });
                    if (res.status) toast.success("Đã thêm vào giỏ hàng!");
                    else toast.error(res.message ?? "Thêm vào giỏ thất bại.");
                  } catch { toast.error("Lỗi khi thêm vào giỏ hàng."); }
                  finally { setAddingToCart(false); }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-violet-600 text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
              </button>
              <button
                disabled={addingToCart || (product.quantity ?? 0) === 0}
                onClick={async () => {
                  if (!user) { toast.error("Vui lòng đăng nhập để mua hàng."); return; }
                  setAddingToCart(true);
                  try {
                    const res = await cartService.create({ userId: user.userId, productId: product.id, quantity: qty });
                    if (res.status) { toast.success("Đã thêm vào giỏ hàng!"); navigate("/cart"); }
                    else toast.error(res.message ?? "Thêm vào giỏ thất bại.");
                  } catch { toast.error("Lỗi khi mua ngay."); }
                  finally { setAddingToCart(false); }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-200"
              >
                Mua ngay
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: <Truck className="w-4 h-4 text-violet-600" />, text: "Miễn phí vận chuyển" },
                { icon: <Shield className="w-4 h-4 text-violet-600" />, text: "Bảo mật thanh toán" },
                { icon: <RotateCcw className="w-4 h-4 text-violet-600" />, text: "Đổi trả dễ dàng" },
                { icon: <HeadphonesIcon className="w-4 h-4 text-violet-600" />, text: "Hỗ trợ 24/7" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-xs text-black">
                  <div className="p-1.5 bg-violet-50 rounded-lg shrink-0">{b.icon}</div>
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product Detail / Description ── */}
        {product.detail && (
          <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-black mb-4" style={{ color: "#000" }}>Mô tả sản phẩm</h2>
            <div
              className="prose prose-sm max-w-none text-black leading-relaxed whitespace-pre-line"
              style={{ color: "#000" }}
              dangerouslySetInnerHTML={{ __html: product.detail }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
