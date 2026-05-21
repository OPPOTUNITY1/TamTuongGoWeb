import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Store,
  Package,
  CheckSquare,
  Check,
  Square,
  MapPin,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import cartService from "../../services/cart/cart.service";
import productService from "../../services/product/product.service";
import orderService from "../../services/order/order.service";
import orderItemService from "../../services/orderItem/orderItem.service";
import userInformationService from "../../services/userInformation/userInformation.service";
// import promotionService from "../../services/promotion/promotion.service";
import orderPromotionService from "../../services/orderPromotion/orderPromotion.service";
import type { CartDto } from "../../types/cart/dto";
import type { ProductDto } from "../../types/product/dto";
import type { UserInformationDto } from "../../types/userInformation/dto";
import type { PromotionDto } from "../../types/promotion/dto";
import NavBar from "../../components/NavBar/NavBar";
import VoucherCard from "../../components/VoucherCard/VoucherCard";
import { useVnAddress } from "../../hooks/useVnAddress";

const FALLBACK_IMG = "https://placehold.co/100x100?text=No+Image";

function formatPrice(price?: number) {
  if (price == null) return "—";
  return price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

const BLANK_ADDR: UserInformationDto = {
  fullName: "",
  phoneNumber: "",
  city: "",
  district: "",
  ward: "",
  streetAddress: "",
  buildingInfo: "",
  email: "",
};

interface CartItemWithProduct extends CartDto {
  product?: ProductDto;
}

interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItemWithProduct[];
}

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Order modal state
  const [orderModal, setOrderModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState<UserInformationDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses] = useState(false);

  // Promotions & payment
  const [promotionsByShop] = useState<Record<string, PromotionDto[]>>({});
  const [selectedPromotionByShop, setSelectedPromotionByShop] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD');

  // Inline add-address modal state
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState<UserInformationDto>({ ...BLANK_ADDR, userId: user?.userId });
  const [savingAddr, setSavingAddr] = useState(false);
  const vnAddr = useVnAddress(showAddrModal ? addrForm.city : undefined, showAddrModal ? addrForm.district : undefined);

  // ── Fetch cart ──────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await cartService.getData({ userId: user.userId });
      if (!res.status || !res.data) {
        setCartItems([]);
        return;
      }
      const items: CartDto[] = res.data.items ?? [];

      // Fetch product details for each unique productId
      const uniqueProductIds = [...new Set(items.map((i) => i.productId).filter(Boolean) as string[])];
      const productMap: Record<string, ProductDto> = {};
      await Promise.all(
        uniqueProductIds.map(async (pid) => {
          try {
            const pr = await productService.get(pid);
            if (pr.status && pr.data) productMap[pid] = pr.data;
          } catch {
            // ignore individual failures
          }
        })
      );

      const enriched: CartItemWithProduct[] = items.map((item) => ({
        ...item,
        product: item.productId ? productMap[item.productId] : undefined,
      }));
      setCartItems(enriched);
    } catch {
      toast.error("Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchCart();
  }, [user, fetchCart, navigate]);

  // ── Group by shop ───────────────────────────────────────────────────────────
  const shopGroups: ShopGroup[] = cartItems.reduce<ShopGroup[]>((acc, item) => {
    const shopId = item.product?.shopId ?? "unknown";
    const shopName = item.product?.shopName ?? "Cửa hàng không xác định";
    const existing = acc.find((g) => g.shopId === shopId);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ shopId, shopName, items: [item] });
    }
    return acc;
  }, []);

  // ── Checkbox helpers ────────────────────────────────────────────────────────
  const allIds = cartItems.map((i) => i.id!).filter(Boolean);
  const allChecked = allIds.length > 0 && allIds.every((id) => checkedIds.has(id));

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(allIds));
    }
  };

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleShop = (group: ShopGroup) => {
    const groupIds = group.items.map((i) => i.id!).filter(Boolean);
    const allGroupChecked = groupIds.every((id) => checkedIds.has(id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (allGroupChecked) {
        groupIds.forEach((id) => next.delete(id));
      } else {
        groupIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // ── Quantity update ─────────────────────────────────────────────────────────
  const handleQtyChange = async (item: CartItemWithProduct, delta: number) => {
    if (!item.id) return;
    const newQty = Math.max(1, (item.quantity ?? 1) + delta);
    if (newQty === item.quantity) return;
    const maxQty = item.product?.quantity ?? 999;
    if (newQty > maxQty) {
      toast.error("Vượt quá số lượng tồn kho.");
      return;
    }
    setUpdatingId(item.id);
    try {
      const res = await cartService.update({ id: item.id, quantity: newQty });
      if (res.status) {
        setCartItems((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, quantity: newQty } : c))
        );
      } else {
        toast.error(res.message ?? "Cập nhật thất bại.");
      }
    } catch {
      toast.error("Lỗi khi cập nhật số lượng.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Remove item ─────────────────────────────────────────────────────────────
  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const res = await cartService.remove(id);
      if (res.status) {
        setCartItems((prev) => prev.filter((c) => c.id !== id));
        setCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
      } else {
        toast.error(res.message ?? "Xóa thất bại.");
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm.");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Total price ─────────────────────────────────────────────────────────────
  const selectedItems = cartItems.filter((i) => i.id && checkedIds.has(i.id));
  const totalPrice = selectedItems.reduce((sum, item) => {
    return sum + (item.product?.retailPrice ?? 0) * (item.quantity ?? 1);
  }, 0);
  const selectedShopIds = Array.from(new Set(selectedItems.map((i) => i.product?.shopId).filter(Boolean) as string[]));

  // ── Open order modal ────────────────────────────────────────────────────────
  const openOrderModal = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
      return;
    }
    const payload = { selectedItems, selectedPromotionByShop };
    try {
      sessionStorage.setItem("checkout_state", JSON.stringify(payload));
    } catch {}
    navigate("/checkout", { state: payload });
  };

  // ── Inline add-address handlers ───────────────────────────────────────────
  const openAddAddressModal = () => {
    setAddrForm({ ...BLANK_ADDR, userId: user?.userId });
    vnAddr.resetCodes();
    setShowAddrModal(true);
  };

  const handleSaveAddress = async (e: any) => {
    e?.preventDefault?.();
    if (!addrForm.fullName?.trim()) { toast.error("Vui lòng nhập họ tên người nhận."); return; }
    if (!addrForm.phoneNumber?.trim()) { toast.error("Vui lòng nhập số điện thoại."); return; }
    if (!addrForm.city?.trim()) { toast.error("Vui lòng chọn tỉnh/thành phố."); return; }
    if (!addrForm.district?.trim()) { toast.error("Vui lòng chọn quận/huyện."); return; }
    if (!addrForm.streetAddress?.trim()) { toast.error("Vui lòng nhập địa chỉ cụ thể."); return; }
    setSavingAddr(true);
    try {
      const res = await userInformationService.create({ ...addrForm, userId: user?.userId });
      if (res.status && res.data?.id) {
        // reload addresses
        const listRes = await userInformationService.getData({ userId: user!.userId });
        if (listRes.status && listRes.data) setAddresses(listRes.data);
        else setAddresses((prev) => [res.data!, ...prev]);
        setSelectedAddressId(res.data.id);
        setShowAddrModal(false);
        toast.success("Thêm địa chỉ thành công!");
      } else {
        toast.error(res.message ?? "Thêm địa chỉ thất bại.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi thêm địa chỉ.");
    } finally {
      setSavingAddr(false);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;
    setPlacingOrder(true);
    try {
      // Compute shop subtotals for selected items
      const shopSubtotals: Record<string, number> = {};
      selectedItems.forEach((item) => {
        const shopId = item.product?.shopId ?? "unknown";
        shopSubtotals[shopId] = (shopSubtotals[shopId] ?? 0) + ((item.product?.retailPrice ?? 0) * (item.quantity ?? 1));
      });

      // Compute discounts per shop based on selected promotions
      const shopDiscounts: Record<string, number> = {};
      let totalDiscount = 0;
      for (const shopId of Object.keys(selectedPromotionByShop)) {
        const promoId = selectedPromotionByShop[shopId];
        if (!promoId) continue;
        const promos = promotionsByShop[shopId] ?? [];
        const promo = promos.find((p) => p.id === promoId);
        const subtotal = shopSubtotals[shopId] ?? 0;
        if (!promo) continue;
        if (promo.minPurchase && subtotal < (promo.minPurchase ?? 0)) continue;
        let disc = 0;
        const type = (promo.discountType ?? "").toString().toLowerCase();
        const value = Number(promo.discountValue ?? 0);
        if (value > 0) {
          if (type.includes("percent") || type.includes("%")) {
            disc = subtotal * (value / 100);
            if (promo.maxDiscount) disc = Math.min(disc, promo.maxDiscount ?? disc);
          } else {
            disc = value;
            if (promo.maxDiscount) disc = Math.min(disc, promo.maxDiscount ?? disc);
          }
        }
        const rounded = Math.round(disc);
        shopDiscounts[shopId] = rounded;
        totalDiscount += rounded;
      }

      // 1. Create the order (include discount amount and payment method)
      const orderReq: any = {
        userId: user!.userId,
        userInformationId: selectedAddressId || undefined,
        orderDate: new Date().toISOString(),
        totalAmount: totalPrice,
        status: "Pending",
      };
      if (totalDiscount > 0) orderReq.discountAmount = totalDiscount;
      if (paymentMethod) orderReq.paymentMethod = paymentMethod;

      const orderRes = await orderService.create(orderReq);
      if (!orderRes.status || !orderRes.data?.id) {
        toast.error(orderRes.message ?? "Tạo đơn hàng thất bại.");
        return;
      }
      const orderId = orderRes.data.id;

      // 2. Create order items
      await Promise.all(
        selectedItems.map((item) =>
          orderItemService.create({
            orderId,
            shopId: item.product?.shopId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product?.retailPrice,
          })
        )
      );

      // 3. Remove selected cart items
      await Promise.all(
        selectedItems.map((item) => cartService.remove(item.id!))
      );

      // 4. Create order promotions records (if any)
      try {
        await Promise.all(
          Object.keys(shopDiscounts).map(async (shopId) => {
            const promoId = selectedPromotionByShop[shopId];
            const discountAmount = shopDiscounts[shopId];
            if (!promoId) return;
            try {
              await orderPromotionService.create({ orderId, promotionId: promoId, shopId, discountAmount });
            } catch {
              // ignore individual failures
            }
          })
        );
      } catch {
        // ignore
      }

      // 5. Update local state
      const removedIds = new Set(selectedItems.map((i) => i.id!));
      setCartItems((prev) => prev.filter((c) => !removedIds.has(c.id!)));
      setCheckedIds(new Set());
      setOrderModal(false);
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
    } catch {
      toast.error("Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <ShoppingBag className="w-4 h-4 text-violet-600" />
          <span className="text-violet-700 font-medium">Giỏ hàng</span>
        </div>
        {cartItems.length === 0 ? (
          // ── Empty state
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <ShoppingCart className="w-20 h-20 text-gray-300" />
            <p className="text-gray-400 text-lg">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left: item list */}
            <div className="flex-1 space-y-4">
              {/* Select all row */}
              <div className="bg-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium text-black">
                  {allChecked ? (
                    <CheckSquare className="w-5 h-5 text-violet-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                  Chọn tất cả ({allIds.length} sản phẩm)
                </button>
              </div>

              {shopGroups.map((group) => {
                const groupIds = group.items.map((i) => i.id!).filter(Boolean);
                const groupAllChecked = groupIds.length > 0 && groupIds.every((id) => checkedIds.has(id));

                return (
                  <div key={group.shopId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Shop header */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
                      <button onClick={() => toggleShop(group)} className="flex items-center gap-2">
                        {groupAllChecked ? (
                          <CheckSquare className="w-4 h-4 text-violet-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <Store className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-semibold text-black">{group.shopName}</span>
                    </div>

                    {/* Items */}
                    {group.items.map((item) => {
                      const isChecked = item.id ? checkedIds.has(item.id) : false;
                      const isUpdating = item.id === updatingId;
                      const isRemoving = item.id === removingId;
                      const product = item.product;
                      const imgSrc = product?.thumbnailUrl || product?.imageUrl || FALLBACK_IMG;

                      return (
                        <div
                          key={item.id}
                          className={`flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-b-0 transition-colors ${
                            isChecked ? "bg-violet-50/40" : "bg-white"
                          } ${isRemoving ? "opacity-50" : ""}`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => item.id && toggleItem(item.id)}
                            className="mt-1 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-violet-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>

                          {/* Product image */}
                          <img
                            src={imgSrc}
                            alt={product?.productName ?? ""}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMG;
                            }}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold text-black truncate cursor-pointer hover:text-violet-700"
                              onClick={() => product?.id && navigate(`/product/${product.id}`)}
                            >
                              {product?.productName ?? "Sản phẩm"}
                            </p>
                            <p className="text-base font-bold text-violet-700 mt-1">
                              {formatPrice(product?.retailPrice)}
                            </p>
                            {/* Stock warning */}
                            {product && (product.quantity ?? 0) < 5 && (product.quantity ?? 0) > 0 && (
                              <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                Chỉ còn {product.quantity} sản phẩm
                              </p>
                            )}
                            {/* Qty controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  disabled={isUpdating || (item.quantity ?? 1) <= 1}
                                  onClick={() => handleQtyChange(item, -1)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                                >
                                  <Minus className="w-3 h-3 text-black" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-black">
                                  {isUpdating ? "…" : item.quantity ?? 1}
                                </span>
                                <button
                                  disabled={isUpdating || (item.quantity ?? 1) >= (product?.quantity ?? 999)}
                                  onClick={() => handleQtyChange(item, 1)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                                >
                                  <Plus className="w-3 h-3 text-black" />
                                </button>
                              </div>
                              <button
                                disabled={isRemoving}
                                onClick={() => item.id && handleRemove(item.id)}
                                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-black">
                              {formatPrice((product?.retailPrice ?? 0) * (item.quantity ?? 1))}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ── Right: summary */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 space-y-4">
                <h2 className="text-base font-bold text-black" style={{color:"black"}}>Chi tiết đơn hàng</h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Sản phẩm đã chọn</span>
                    <span className="font-medium text-black">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng</span>
                    <span className="font-medium text-black">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-base font-bold text-black">
                    <span>Tổng thanh toán</span>
                    <span className="text-violet-700">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={openOrderModal}
                  disabled={selectedItems.length === 0}
                  className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-100"
                >
                  Đặt hàng ({selectedItems.length})
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full py-2 rounded-2xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Order confirmation modal */}
      {orderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Xác nhận đặt hàng</h3>
              <button
                onClick={() => setOrderModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Order items summary */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product?.thumbnailUrl || item.product?.imageUrl || FALLBACK_IMG}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-black truncate">{item.product?.productName}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-violet-700 shrink-0">
                    {formatPrice((item.product?.retailPrice ?? 0) * (item.quantity ?? 1))}
                  </p>
                </div>
              ))}
            </div>

            {/* Voucher selection (per shop) */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-black">
                <Store className="w-4 h-4 text-violet-500" />
                Voucher của cửa hàng
              </label>
              {selectedShopIds.length === 0 ? (
                <p className="text-sm text-gray-400">Không có voucher áp dụng</p>
              ) : (
                <div className="space-y-3">
                  {selectedShopIds.map((shopId) => {
                    const group = shopGroups.find((g) => g.shopId === shopId);
                    const shopPromos = promotionsByShop[shopId] ?? [];
                    return (
                      <div key={shopId} className="space-y-2">
                        <div className="text-sm text-gray-700 font-medium">{group?.shopName}</div>
                        <div className="grid gap-2">
                          <VoucherCard
                            promotion={undefined}
                            selected={(selectedPromotionByShop[shopId] ?? "") === ""}
                            onSelect={() => setSelectedPromotionByShop((prev) => ({ ...prev, [shopId]: "" }))}
                          />
                          {shopPromos.map((p) => (
                            <VoucherCard
                              key={p.id}
                              promotion={p}
                              selected={selectedPromotionByShop[shopId] === p.id}
                              onSelect={() => setSelectedPromotionByShop((prev) => ({ ...prev, [shopId]: p.id ?? "" }))}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Address selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-black">
                <MapPin className="w-4 h-4 text-violet-500" />
                Địa chỉ giao hàng
              </label>
              {loadingAddresses ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
              ) : addresses.length > 0 ? (
                <ul className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    const addrText = [addr.streetAddress, addr.buildingInfo, addr.ward, addr.district, addr.city].filter(Boolean).join(", ");
                    return (
                      <li key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id ?? "")}
                        className={`cursor-pointer rounded-xl border-2 px-3 py-2.5 transition-colors ${
                          isSelected ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-violet-600" : "border-gray-300"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-gray-900">{addr.fullName}</span>
                              <span className="text-xs text-gray-500">{addr.phoneNumber}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{addrText}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  <li>
                    <button type="button"
                      onClick={() => { openAddAddressModal(); }}
                      className="w-full text-xs text-violet-600 hover:text-violet-800 font-medium py-1.5 hover:bg-violet-50 rounded-lg transition-colors">
                      + Thêm địa chỉ mới
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-gray-400">Chưa có địa chỉ giao hàng.</p>
                  <button
                    onClick={() => { openAddAddressModal(); }}
                    className="text-sm text-violet-600 underline font-medium"
                  >
                    Thêm địa chỉ trong hồ sơ cá nhân
                  </button>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Phương thức thanh toán</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaymentMethod('COD')}
                  className={`flex-1 py-2 text-sm rounded-lg border ${paymentMethod === 'COD' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-gray-200'}`}>
                  Thanh toán khi nhận hàng
                </button>
                <button type="button" onClick={() => setPaymentMethod('MOMO')}
                  className={`flex-1 py-2 text-sm rounded-lg border ${paymentMethod === 'MOMO' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-gray-200'}`}>
                  Thanh toán qua Momo
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-600">Tổng thanh toán</span>
              <span className="text-xl font-black text-violet-700">{formatPrice(totalPrice)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOrderModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="flex-1 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white font-semibold text-sm transition-colors"
              >
                {placingOrder ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline add-address modal (opened from order modal) */}
      {showAddrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-600" /> Thêm địa chỉ mới
              </h4>
              <button onClick={() => setShowAddrModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Họ tên người nhận *</label>
                  <input autoFocus value={addrForm.fullName ?? ""}
                    onChange={(e) => setAddrForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="Nguyễn Văn A" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Số điện thoại *</label>
                  <input type="tel" value={addrForm.phoneNumber ?? ""}
                    onChange={(e) => setAddrForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="0901 234 567" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tỉnh / Thành phố *</label>
                  <select
                    value={vnAddr.provinceCode ?? ""}
                    onChange={(e) => {
                      const code = e.target.value ? Number(e.target.value) : null;
                      vnAddr.setProvinceCode(code);
                      vnAddr.setDistrictCode(null);
                      const name = code
                        ? vnAddr.provinces.find((p) => p.code === code)?.name ?? ""
                        : "";
                      setAddrForm((f) => ({ ...f, city: name, district: "", ward: "" }));
                    }}
                    className="input-field"
                    disabled={vnAddr.loadingProvinces}
                  >
                    <option value="">{vnAddr.loadingProvinces ? "Đang tải..." : "-- Chọn tỉnh/thành --"}</option>
                    {vnAddr.provinces.map((p) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Quận / Huyện *</label>
                  <select
                    value={vnAddr.districtCode ?? ""}
                    onChange={(e) => {
                      const code = e.target.value ? Number(e.target.value) : null;
                      vnAddr.setDistrictCode(code);
                      const name = code
                        ? vnAddr.districts.find((d) => d.code === code)?.name ?? ""
                        : "";
                      setAddrForm((f) => ({ ...f, district: name, ward: "" }));
                    }}
                    className="input-field"
                    disabled={!vnAddr.provinceCode || vnAddr.loadingDistricts}
                  >
                    <option value="">{vnAddr.loadingDistricts ? "Đang tải..." : "-- Chọn quận/huyện --"}</option>
                    {vnAddr.districts.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phường / Xã *</label>
                <select
                  value={addrForm.ward ?? ""}
                  onChange={(e) => setAddrForm((f) => ({ ...f, ward: e.target.value }))}
                  className="input-field"
                  disabled={!vnAddr.districtCode || vnAddr.loadingWards}
                >
                  <option value="">{vnAddr.loadingWards ? "Đang tải..." : "-- Chọn phường/xã --"}</option>
                  {vnAddr.wards.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Địa chỉ cụ thể (số nhà, tên đường) *</label>
                <input value={addrForm.streetAddress ?? ""}
                  onChange={(e) => setAddrForm((f) => ({ ...f, streetAddress: e.target.value }))}
                  placeholder="123 Đường Lê Lợi" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tòa nhà / Căn hộ (tuỳ chọn)</label>
                <input value={addrForm.buildingInfo ?? ""}
                  onChange={(e) => setAddrForm((f) => ({ ...f, buildingInfo: e.target.value }))}
                  placeholder="Tòa A, Tầng 5, Căn 502" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email (tuỳ chọn)</label>
                <input type="email" value={addrForm.email ?? ""}
                  onChange={(e) => setAddrForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="nguyen@email.com" className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddrModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Huỷ
                </button>
                <button type="submit" disabled={savingAddr}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                  <Check className="w-4 h-4" />
                  {savingAddr ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-field:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
          background: #fff;
        }
        .input-field::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  );
}
