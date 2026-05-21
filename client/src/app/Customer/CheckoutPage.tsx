import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Store, MapPin, X, Check } from "lucide-react";
import { useVnAddress } from "../../hooks/useVnAddress";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import orderService from "../../services/order/order.service";
import orderItemService from "../../services/orderItem/orderItem.service";
import orderPromotionService from "../../services/orderPromotion/orderPromotion.service";
import cartService from "../../services/cart/cart.service";
import promotionService from "../../services/promotion/promotion.service";
import userInformationService from "../../services/userInformation/userInformation.service";
import type { CartDto } from "../../types/cart/dto";
import type { ProductDto } from "../../types/product/dto";
import type { PromotionDto } from "../../types/promotion/dto";
import type { UserInformationDto } from "../../types/userInformation/dto";
import NavBar from "../../components/NavBar/NavBar";
import VoucherCard from "../../components/VoucherCard/VoucherCard";

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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navState = (location.state as any) || null;
  const stored = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("checkout_state") || "null");
    } catch {
      return null;
    }
  })();

  const initialSelectedItems: CartItemWithProduct[] = navState?.selectedItems ?? stored?.selectedItems ?? [];
  const initialSelectedPromotionByShop = navState?.selectedPromotionByShop ?? stored?.selectedPromotionByShop ?? {};

  const [selectedItems] = useState<CartItemWithProduct[]>(initialSelectedItems);
  const [promotionsByShop, setPromotionsByShop] = useState<Record<string, PromotionDto[]>>({});
  const [selectedPromotionByShop, setSelectedPromotionByShop] = useState<Record<string, string>>(initialSelectedPromotionByShop);
  const [addresses, setAddresses] = useState<UserInformationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  // Inline add-address modal state
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState<UserInformationDto>({ ...BLANK_ADDR, userId: user?.userId });
  const [savingAddr, setSavingAddr] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD');
  const vnAddr = useVnAddress(showAddrModal ? addrForm.city : undefined, showAddrModal ? addrForm.district : undefined);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (!selectedItems || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để đặt hàng.");
      navigate("/cart");
      return;
    }

    try {
      sessionStorage.setItem("checkout_state", JSON.stringify({ selectedItems, selectedPromotionByShop }));
    } catch {}

    const shopIds = Array.from(new Set(selectedItems.map((i) => i.product?.shopId).filter(Boolean) as string[]));

    const load = async () => {
      setLoading(true);
      try {
        const promosByShop: Record<string, PromotionDto[]> = {};
        await Promise.all(
          shopIds.map(async (s) => {
            try {
              const pRes = await promotionService.getData({ shopId: s });
              promosByShop[s] = pRes.status && pRes.data?.items ? pRes.data.items : [];
            } catch {
              promosByShop[s] = [];
            }
          })
        );
        setPromotionsByShop(promosByShop);

        setLoadingAddresses(true);
        if (user?.userId) {
          const aRes = await userInformationService.getData({ userId: user.userId });
          if (aRes.status && aRes.data) {
            setAddresses(aRes.data);
            const savedDefault = localStorage.getItem(`defaultAddressId_${user.userId}`);
            const hasDefault = savedDefault && aRes.data.some((a: any) => a.id === savedDefault);
            if (hasDefault) setSelectedAddressId(savedDefault!);
            else if (aRes.data.length > 0) setSelectedAddressId(aRes.data[0].id ?? "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingAddresses(false);
      }
    };

    load();
  }, [user]);

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

  const totalPrice = selectedItems.reduce((sum, item) => {
    return sum + (item.product?.retailPrice ?? 0) * (item.quantity ?? 1);
  }, 0);

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;
    setPlacingOrder(true);
    try {
      const shopSubtotals: Record<string, number> = {};
      selectedItems.forEach((item) => {
        const shopId = item.product?.shopId ?? "unknown";
        shopSubtotals[shopId] = (shopSubtotals[shopId] ?? 0) + ((item.product?.retailPrice ?? 0) * (item.quantity ?? 1));
      });

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

      await Promise.all(selectedItems.map((item) => cartService.remove(item.id!)));

      try {
        await Promise.all(
          Object.keys(shopDiscounts).map(async (shopId) => {
            const promoId = selectedPromotionByShop[shopId];
            const discountAmount = shopDiscounts[shopId];
            if (!promoId) return;
            try {
              await orderPromotionService.create({ orderId, promotionId: promoId, shopId, discountAmount });
            } catch {
              // ignore
            }
          })
        );
      } catch {
        // ignore
      }

      sessionStorage.removeItem("checkout_state");
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-gray-500">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  const selectedShopIds = Array.from(new Set(selectedItems.map((i) => i.product?.shopId).filter(Boolean) as string[]));

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-black mb-4" style={{color:"black"}}>Thanh toán</h2>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sản phẩm</h3>
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product?.thumbnailUrl || item.product?.imageUrl || "https://placehold.co/80x80"}
                      alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black truncate">{item.product?.productName}</div>
                      <div className="text-xs text-gray-500">x{item.quantity}</div>
                    </div>
                    <div className="text-sm font-bold text-violet-700">{formatPrice((item.product?.retailPrice ?? 0) * (item.quantity ?? 1))}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Store className="w-4 h-4 text-violet-500" /> Voucher của cửa hàng</h3>
              {selectedShopIds.length === 0 ? (
                <p className="text-sm text-gray-400">Không có voucher áp dụng</p>
              ) : (
                <div className="space-y-3">
                  {selectedShopIds.map((shopId) => (
                    <div key={shopId} className="space-y-2">
                      <div className="text-sm text-gray-700 font-medium">{selectedItems.find(i => i.product?.shopId === shopId)?.product?.shopName}</div>
                      <div className="grid gap-2">
                        <VoucherCard
                          promotion={undefined}
                          selected={(selectedPromotionByShop[shopId] ?? "") === ""}
                          onSelect={() => setSelectedPromotionByShop((prev) => ({ ...prev, [shopId]: "" }))}
                        />
                        {(promotionsByShop[shopId] ?? []).map((p) => (
                          <VoucherCard
                            key={p.id}
                            promotion={p}
                            selected={selectedPromotionByShop[shopId] === p.id}
                            onSelect={() => setSelectedPromotionByShop((prev) => ({ ...prev, [shopId]: p.id ?? "" }))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 sticky top-24">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Sản phẩm</span>
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

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-500" /> Địa chỉ giao hàng</div>
                  {loadingAddresses ? (
                    <p className="text-sm text-gray-400">Đang tải địa chỉ...</p>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {addresses.map((addr) => {
                        const isSelected = addr.id === selectedAddressId;
                        const addrText = [addr.streetAddress, addr.buildingInfo, addr.ward, addr.district, addr.city].filter(Boolean).join(", ");
                        return (
                          <button key={addr.id} onClick={() => setSelectedAddressId(addr.id ?? "")}
                            className={`w-full text-left rounded-xl border px-3 py-2 transition-colors ${isSelected ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-start gap-2">
                              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-violet-600' : 'border-gray-300'}`}>
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
                          </button>
                        );
                      })}
                      <div>
                        <button type="button" onClick={() => openAddAddressModal()} className="w-full text-xs text-violet-600 hover:text-violet-800 font-medium py-1.5 hover:bg-violet-50 rounded-lg transition-colors">
                          + Thêm địa chỉ mới
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-sm text-gray-400">Chưa có địa chỉ giao hàng.</p>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openAddAddressModal()} className="text-sm text-violet-600 underline font-medium">Thêm địa chỉ mới</button>
                        <button onClick={() => navigate('/profile')} className="text-sm text-violet-600 underline font-medium">Thêm trong hồ sơ</button>
                      </div>
                    </div>
                  )}
                </div>

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

                <button onClick={handlePlaceOrder} disabled={placingOrder} className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white font-semibold text-sm transition-colors">
                  {placingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline add-address modal (opened from checkout) */}
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
