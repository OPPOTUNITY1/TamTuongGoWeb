import { useEffect, useRef, useState } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  User,
  LogOut,
  UserCircle,
  ClipboardList,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../app/AuthContext";
import { useAuthPopup } from "../auth-components/LoginPopupListener";

interface NavBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
}

export default function NavBar({ search, onSearchChange }: NavBarProps) {
  const { user, logout } = useAuth();
  const { open: openAuth } = useAuthPopup();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = onSearchChange !== undefined;
  const searchValue = isControlled ? (search ?? "") : internalSearch;

  const handleSearchChange = (value: string) => {
    if (isControlled) {
      onSearchChange!(value);
    } else {
      setInternalSearch(value);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isControlled && e.key === "Enter" && internalSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(internalSearch.trim())}`);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <ShoppingBag className="text-violet-600 w-7 h-7" />
          <span className="text-xl font-bold text-violet-700 tracking-tight">
            TamTuong
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
          />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <button onClick={() => navigate("/")} className="hover:text-violet-600 transition-colors">Trang chủ</button>
          <button onClick={() => navigate("/")} className="hover:text-violet-600 transition-colors">Sản phẩm</button>
          <button onClick={() => navigate("/")} className="hover:text-violet-600 transition-colors">Cửa hàng</button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full hover:bg-violet-50 transition-colors"
            title="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === "Seller" && (
                <button
                  onClick={() => navigate("/seller")}
                  title="Bảng điều khiển bán hàng"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold hover:bg-violet-200 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Quản lý
                </button>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-violet-400 shrink-0">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName ?? "avatar"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName ?? "U")}&background=7c3aed&color=fff&bold=true`;
                        }}
                      />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName ?? "U")}&background=7c3aed&color=fff&bold=true`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden md:block">
                    {user.fullName ?? ""}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName ?? ""}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email ?? ""}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 shrink-0" />
                        Thông tin cá nhân
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate("/orders"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 shrink-0" />
                        Lịch sử đơn hàng
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuth("login")}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <User className="w-4 h-4" />
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
