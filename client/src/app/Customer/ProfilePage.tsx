import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Camera,
  Eye,
  EyeOff,
  Store,
  Briefcase,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  MapPin,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import accountService from "../../services/account/account.service";
import axiosInstance, { extractApiError } from "../../services/axiosInstance";
import sellerService from "../../services/seller/seller.service";
import shopService from "../../services/shop/shop.service";
import userInformationService from "../../services/userInformation/userInformation.service";
import type { SellerDto } from "../../types/seller/dto";
import type { ShopDto } from "../../types/shop/dto";
import type { UserInformationDto } from "../../types/userInformation/dto";
import NavBar from "../../components/NavBar/NavBar";
import { useVnAddress } from "../../hooks/useVnAddress";

function formatAddress(addr: UserInformationDto) {
  return [addr.streetAddress, addr.buildingInfo, addr.ward, addr.district, addr.city]
    .filter(Boolean)
    .join(", ");
}
function getDefaultAddrKey(userId: string) {
  return `defaultAddressId_${userId}`;
}
const BLANK_ADDR: UserInformationDto = { fullName: "", phoneNumber: "", city: "", district: "", ward: "", streetAddress: "", buildingInfo: "" };

export default function ProfilePage() {
  const { user, login: setAuth, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState(user?.imageUrl ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seller state
  const [seller, setSeller] = useState<SellerDto | null>(null);
  const [sellerBusinessName, setSellerBusinessName] = useState("");
  const [sellerTaxCode, setSellerTaxCode] = useState("");
  const [savingSeller, setSavingSeller] = useState(false);

  // Shop state
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [shopModal, setShopModal] = useState<{ open: boolean; shop: ShopDto | null }>({ open: false, shop: null });
  const [shopName, setShopName] = useState("");
  const [savingShop, setSavingShop] = useState(false);
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<UserInformationDto[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [defaultAddrId, setDefaultAddrId] = useState<string>("");
  const [addrModal, setAddrModal] = useState<{ open: boolean; addr: UserInformationDto | null }>({ open: false, addr: null });
  const [addrForm, setAddrForm] = useState<UserInformationDto>(BLANK_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);
  const [deletingAddrId, setDeletingAddrId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Load seller + shops if role is Seller
  useEffect(() => {
    if (user?.role !== "Seller") return;
    sellerService.getMe().then((res) => {
      if (res.status && res.data) {
        setSeller(res.data);
        setSellerBusinessName(res.data.businessName ?? "");
        setSellerTaxCode(res.data.taxCode ?? "");
        // load shops for this seller
        if (res.data.id) {
          shopService.getData({ sellerId: res.data.id, pageIndex: 1, pageSize: 50 }).then((sr) => {
            if (sr.status && sr.data) setShops(sr.data.items);
          });
        }
      }
    });
  }, [user]);

  // Load addresses
  useEffect(() => {
    if (!user?.userId) return;
    setLoadingAddresses(true);
    userInformationService.getData({ userId: user.userId }).then((res) => {
      if (res.status && res.data) setAddresses(res.data);
    }).finally(() => setLoadingAddresses(false));
    const saved = localStorage.getItem(getDefaultAddrKey(user.userId));
    if (saved) setDefaultAddrId(saved);
  }, [user?.userId]);

  const avatarSrc = imageUrl
    ? imageUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName || "U"
      )}&background=7c3aed&color=fff&bold=true&size=128`;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await axiosInstance.post("/api/File/Upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.status && Array.isArray(res.data.data)) {
        const url: string = res.data.data[0]?.url ?? "";
        if (url) {
          setImageUrl(url);
          toast.success("Tải ảnh lên thành công!");
        }
      } else {
        toast.error("Tải ảnh lên thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err, "Đã xảy ra lỗi khi tải ảnh."));
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ tên.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await accountService.updateProfile({
        fullName,
        email,
        phoneNumber: phone,
        imageUrl,
      });
      if (res.status) {
        // update local auth state so navbar reflects changes immediately
        setAuth({
          ...user!,
          fullName,
          email,
          imageUrl,
        });
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(res.message ?? "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Mật khẩu mới không khớp.");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    setSavingPw(true);
    try {
      const res = await accountService.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      if (res.status) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setTimeout(() => {
          logout();
          navigate("/");
        }, 1500);
      } else {
        toast.error(res.message ?? "Đổi mật khẩu thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSavingPw(false);
    }
  };

  // ── Seller handlers ────────────────────────────────────────
  const handleSaveSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller?.id) return;
    setSavingSeller(true);
    try {
      const res = await sellerService.update({
        id: seller.id,
        userId: seller.userId,
        businessName: sellerBusinessName,
        taxCode: sellerTaxCode,
      });
      if (res.status) {
        setSeller(res.data ?? seller);
        toast.success("Cập nhật thông tin Seller thành công!");
      } else {
        toast.error(res.message ?? "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSavingSeller(false);
    }
  };

  // ── Shop handlers ──────────────────────────────────────────
  const loadShops = async (sellerId: string) => {
    const sr = await shopService.getData({ sellerId, pageIndex: 1, pageSize: 50 });
    if (sr.status && sr.data) setShops(sr.data.items);
  };

  const openAddShop = () => {
    setShopName("");
    setShopModal({ open: true, shop: null });
  };

  const openEditShop = (shop: ShopDto) => {
    setShopName(shop.name ?? "");
    setShopModal({ open: true, shop });
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) { toast.error("Vui lòng nhập tên cửa hàng."); return; }
    if (!seller?.id) return;
    setSavingShop(true);
    try {
      let res;
      if (shopModal.shop?.id) {
        res = await shopService.update({ id: shopModal.shop.id, sellerId: seller.id, name: shopName });
      } else {
        res = await shopService.create({ sellerId: seller.id, name: shopName });
      }
      if (res.status) {
        toast.success(shopModal.shop ? "Cập nhật cửa hàng thành công!" : "Tạo cửa hàng thành công!");
        setShopModal({ open: false, shop: null });
        await loadShops(seller.id);
      } else {
        toast.error(res.message ?? "Thao tác thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSavingShop(false);
    }
  };

  const handleDeleteShop = async (shop: ShopDto) => {
    if (!shop.id) return;
    if (!confirm(`Xoá cửa hàng "${shop.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingShopId(shop.id);
    try {
      const res = await shopService.delete(shop.id);
      if (res.status) {
        toast.success("Đã xoá cửa hàng.");
        setShops((prev) => prev.filter((s) => s.id !== shop.id));
      } else {
        toast.error(res.message ?? "Xoá thất bại.");
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDeletingShopId(null);
    }
  };

  // ── Address handlers ─────────────────────────────────────────────────────
  // VN cascading address data (declared here so handlers below can use it)
  const vnAddr = useVnAddress(
    addrModal.open ? addrForm.city : undefined,
    addrModal.open ? addrForm.district : undefined
  );

  const loadAddresses = async () => {
    if (!user?.userId) return;
    const res = await userInformationService.getData({ userId: user.userId });
    if (res.status && res.data) setAddresses(res.data);
  };

  const openAddAddr = () => {
    setAddrForm({ ...BLANK_ADDR, userId: user?.userId });
    vnAddr.resetCodes();
    setAddrModal({ open: true, addr: null });
  };

  const openEditAddr = (addr: UserInformationDto) => {
    setAddrForm({ ...addr });
    // Reset codes; the hook will auto-pre-select based on city/district names
    vnAddr.resetCodes();
    setAddrModal({ open: true, addr });
  };

  const handleSaveAddr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.fullName?.trim()) { toast.error("Vui lòng nhập họ tên người nhận."); return; }
    if (!addrForm.phoneNumber?.trim()) { toast.error("Vui lòng nhập số điện thoại."); return; }
    if (!addrForm.city?.trim()) { toast.error("Vui lòng chọn tỉnh/thành phố."); return; }
    if (!addrForm.district?.trim()) { toast.error("Vui lòng chọn quận/huyện."); return; }
    if (!addrForm.streetAddress?.trim()) { toast.error("Vui lòng nhập địa chỉ cụ thể."); return; }
    setSavingAddr(true);
    try {
      let res;
      if (addrModal.addr?.id) {
        res = await userInformationService.update({ ...addrForm, id: addrModal.addr.id });
      } else {
        res = await userInformationService.create({ ...addrForm, userId: user?.userId });
      }
      if (res.status) {
        toast.success(addrModal.addr ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");
        setAddrModal({ open: false, addr: null });
        await loadAddresses();
        if (!addrModal.addr && res.data?.id && !defaultAddrId) {
          handleSetDefault(res.data.id);
        }
      } else { toast.error(res.message ?? "Thao tác thất bại."); }
    } catch (err) { toast.error(extractApiError(err, "Lỗi khi lưu địa chỉ.")); }
    finally { setSavingAddr(false); }
  };

  const handleDeleteAddr = async (addr: UserInformationDto) => {
    if (!addr.id) return;
    if (!confirm("Xoá địa chỉ này? Hành động này không thể hoàn tác.")) return;
    setDeletingAddrId(addr.id);
    try {
      const res = await userInformationService.delete(addr.id);
      if (res.status) {
        toast.success("Đã xoá địa chỉ.");
        setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
        if (defaultAddrId === addr.id) {
          setDefaultAddrId("");
          if (user?.userId) localStorage.removeItem(getDefaultAddrKey(user.userId));
        }
      } else { toast.error(res.message ?? "Xoá thất bại."); }
    } catch (err) { toast.error(extractApiError(err, "Lỗi khi xoá địa chỉ.")); }
    finally { setDeletingAddrId(null); }
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddrId(id);
    if (user?.userId) localStorage.setItem(getDefaultAddrKey(user.userId), id);
    toast.success("Đã đặt làm địa chỉ mặc định.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
          <div className="relative group">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-200"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.fullName ?? "—"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email ?? ""}</p>
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
              {user?.role ?? "Customer"}
            </span>
          </div>
          {uploadingAvatar && (
            <span className="ml-auto text-xs text-violet-500 animate-pulse">
              Đang tải ảnh...
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile info form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
          >
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-600" />
              Thông tin cá nhân
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Họ và tên
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Đức Trung"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Số điện thoại
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </form>

          {/* Change password form */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
          >
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-600" />
              Đổi mật khẩu
            </h3>

            {[
              {
                label: "Mật khẩu hiện tại",
                value: currentPw,
                set: setCurrentPw,
                show: showCurrent,
                toggle: () => setShowCurrent((v) => !v),
              },
              {
                label: "Mật khẩu mới",
                value: newPw,
                set: setNewPw,
                show: showNew,
                toggle: () => setShowNew((v) => !v),
              },
              {
                label: "Xác nhận mật khẩu mới",
                value: confirmPw,
                set: setConfirmPw,
                show: showConfirm,
                toggle: () => setShowConfirm((v) => !v),
              },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {field.show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={savingPw}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
            >
              <Lock className="w-4 h-4" />
              {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>

        {/* ── Địa chỉ giao hàng ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-600" />
              Địa chỉ giao hàng
              <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                {addresses.length}
              </span>
            </h3>
            <button
              onClick={openAddAddr}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ
            </button>
          </div>

          {loadingAddresses ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
              <MapPin className="w-10 h-10 opacity-30" />
              <p className="text-sm">Chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng đầu tiên!</p>
              <button onClick={openAddAddr}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">
                + Thêm địa chỉ
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {addresses.map((addr) => {
                const isDefault = addr.id === defaultAddrId;
                return (
                  <li key={addr.id}
                    className={`relative rounded-xl border-2 px-4 py-4 transition-colors ${
                      isDefault ? "border-violet-500 bg-violet-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    {isDefault && (
                      <span className="absolute top-3 right-14 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-white" /> Mặc định
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <button onClick={() => addr.id && handleSetDefault(addr.id)}
                        className="mt-0.5 shrink-0" title="Đặt làm mặc định">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isDefault ? "border-violet-600" : "border-gray-300 hover:border-violet-400"
                        }`}>
                          {isDefault && <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{addr.fullName || "—"}</span>
                          <span className="h-3.5 w-px bg-gray-300" />
                          <span className="text-sm text-gray-500">{addr.phoneNumber || "—"}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                          {formatAddress(addr) || "Chưa có địa chỉ cụ thể"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEditAddr(addr)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-100 transition-colors" title="Sửa">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteAddr(addr)} disabled={deletingAddrId === addr.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" title="Xoá">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── SELLER SECTIONS (only for role = Seller) ─────── */}
        {user?.role === "Seller" && seller && (
          <>
            {/* Seller info form */}
            <form
              onSubmit={handleSaveSeller}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
            >
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600" />
                Thông tin Seller
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Tên doanh nghiệp
                  </span>
                </label>
                <input
                  value={sellerBusinessName}
                  onChange={(e) => setSellerBusinessName(e.target.value)}
                  placeholder="Tên công ty / hộ kinh doanh"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Mã số thuế
                  </span>
                </label>
                <input
                  value={sellerTaxCode}
                  onChange={(e) => setSellerTaxCode(e.target.value)}
                  placeholder="0123456789"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={savingSeller}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                <Save className="w-4 h-4" />
                {savingSeller ? "Đang lưu..." : "Lưu thông tin Seller"}
              </button>
            </form>

            {/* Shops management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-violet-600" />
                  Cửa hàng của tôi
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                    {shops.length}
                  </span>
                </h3>
                <button
                  onClick={openAddShop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm cửa hàng
                </button>
              </div>

              {shops.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Chưa có cửa hàng nào. Hãy tạo cửa hàng đầu tiên!
                </p>
              ) : (
                <ul className="space-y-2">
                  {shops.map((shop) => (
                    <li
                      key={shop.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-violet-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Store className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{shop.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditShop(shop)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-100 transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop)}
                          disabled={deletingShopId === shop.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Xoá"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Address modal ─────────────────────────────────────────────────── */}
      {addrModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-600" />
                {addrModal.addr ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h4>
              <button onClick={() => setAddrModal({ open: false, addr: null })}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAddr} className="space-y-4">
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
                <button type="button" onClick={() => setAddrModal({ open: false, addr: null })}
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

      {/* ── Shop modal ───────────────────────────────────────── */}
      {shopModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-base font-semibold text-gray-900">
                {shopModal.shop ? "Sửa cửa hàng" : "Thêm cửa hàng"}
              </h4>
              <button
                onClick={() => setShopModal({ open: false, shop: null })}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveShop} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Tên cửa hàng
                </label>
                <input
                  autoFocus
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Nhập tên cửa hàng..."
                  className="input-field"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShopModal({ open: false, shop: null })}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={savingShop}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {savingShop ? "Đang lưu..." : "Lưu"}
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
