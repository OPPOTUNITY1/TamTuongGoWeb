import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Package, ChevronDown, ChevronRight, ImageUp } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import type { ShopDto } from "../../../types/shop/dto";
import type { SellerDto } from "../../../types/seller/dto";
import type { ProductDto } from "../../../types/product/dto";
import type { ProductRequestDto } from "../../../types/product/request";
import type { CategoryDto } from "../../../types/category/dto";
import productService from "../../../services/product/product.service";
import axiosInstance from "../../../services/axiosInstance";
import categoryService from "../../../services/category/category.service";

interface Props {
  shop: ShopDto;
  seller: SellerDto | null;
}

const EMPTY: ProductRequestDto = {
  shopId: "",
  categoryId: "",
  productName: "",
  retailPrice: undefined,
  importPrice: undefined,
  quantity: undefined,
  imageUrl: "",
  thumbnailUrl: "",
  productImages: [],
  detail: "",
};

export default function ProductsPage({ shop }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<ProductRequestDto>({ ...EMPTY, shopId: shop.id ?? "" });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const catRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Revoke object URLs for previews to avoid memory leaks
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      productImagePreviews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    };
  }, [thumbnailPreview, productImagePreviews]);

  const load = () => {
    if (!shop.id) return;
    setLoading(true);
    productService
      .getByShop(shop.id)
      .then((res) => {
        if (res.status && res.data) {
          setProducts(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => toast.error("Không thể tải danh sách sản phẩm."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [shop.id]);

  useEffect(() => {
    if (!shop.id) return;
    categoryService.getData({ shopId: shop.id }).then((res) => {
      if (res.status && res.data) {
        const data = res.data as any;
        setCategories(Array.isArray(data) ? data : (data.items ?? data.Items ?? []));
      }
    });
  }, [shop.id]);

  const filtered = products.filter((p) =>
    (p.productName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm({ ...EMPTY, shopId: shop.id ?? "" });
    setExpandedParents(new Set());
    setCatOpen(false);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setProductImageFiles([]);
    setProductImagePreviews([]);
    setModal("create");
  };

  const openEdit = (p: ProductDto) => {
    // Pre-expand the parent of the selected category
    const existingCat = categories.find(c => c.id === p.categoryId);
    if (existingCat?.parentCategoryId) {
      setExpandedParents(new Set([existingCat.parentCategoryId]));
    } else {
      setExpandedParents(new Set());
    }
    setCatOpen(false);
    setForm({
      id: p.id,
      shopId: p.shopId ?? shop.id ?? "",
      categoryId: p.categoryId ?? "",
      productName: p.productName ?? "",
      retailPrice: p.retailPrice,
      importPrice: p.importPrice,
      quantity: p.quantity,
      imageUrl: p.imageUrl ?? "",
      thumbnailUrl: p.thumbnailUrl ?? "",
      productImages: p.productImages ?? [],
      detail: p.detail ?? "",
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setProductImageFiles([]);
    setProductImagePreviews([]);
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId) {
      toast.error("Vui lòng chọn danh mục.");
      return;
    }

    const hasAnyImage = !!form.thumbnailUrl || (form.productImages && form.productImages.length > 0) || !!form.imageUrl || !!thumbnailFile || productImageFiles.length > 0;
    if (!hasAnyImage) {
      toast.error("Vui lòng tải lên ít nhất một ảnh sản phẩm.");
      return;
    }

    setSaving(true);
    try {
      // Upload files first, then send JSON to the API
      let resolvedThumbnailUrl = form.thumbnailUrl ?? "";
      let resolvedProductImages = [...(form.productImages ?? [])];

      if (thumbnailFile) {
        const urls = await uploadImages([thumbnailFile]);
        if (urls.length > 0) resolvedThumbnailUrl = urls[0];
      }

      if (productImageFiles.length > 0) {
        const urls = await uploadImages(productImageFiles);
        const newImages = urls.map((url) => ({ imageUrl: url } as any));
        resolvedProductImages = [...resolvedProductImages, ...newImages];
      }

      const payload: ProductRequestDto = {
        ...form,
        thumbnailUrl: resolvedThumbnailUrl || resolvedProductImages[0]?.imageUrl || form.imageUrl || "",
        imageUrl: form.imageUrl || resolvedThumbnailUrl || resolvedProductImages[0]?.imageUrl || "",
        // Only send id + imageUrl — server creates/deletes based on these
        productImages: resolvedProductImages.map((img) => ({ id: img.id, imageUrl: img.imageUrl })),
      };

      const res = modal === "create" ? await productService.create(payload) : await productService.update(payload);
      if (res?.status === true) {
        toast.success(modal === "create" ? "Tạo sản phẩm thành công!" : "Cập nhật thành công!");
        setModal(null);
        // clear selected files
        setThumbnailFile(null);
        setThumbnailPreview("");
        productImagePreviews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
        setProductImageFiles([]);
        setProductImagePreviews([]);
        load();
      } else {
        toast.error(res?.message ?? "Thao tác thất bại.");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : "Đã xảy ra lỗi.";
      toast.error(message);
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;
    try {
      const res = await productService.delete(id);
      if (res.status) { toast.success("Đã xóa!"); load(); }
      else toast.error(res.message ?? "Xóa thất bại.");
    } catch { toast.error("Đã xảy ra lỗi."); }
  };

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return [] as string[];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const uploadRes = await axiosInstance.post("/api/File/Upload", formData);

    if (!uploadRes?.data?.status) {
      throw new Error(uploadRes?.data?.message ?? "Upload ảnh thất bại.");
    }

    const uploaded: Array<{ url?: string }> = Array.isArray(uploadRes.data.data) ? uploadRes.data.data : [];
    return uploaded.map((file) => file.url).filter((url: string | undefined): url is string => Boolean(url));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sản phẩm</h1>
          <p className="text-slate-400 text-sm mt-0.5">{shop.name}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Chờ chút đi...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="text-left px-5 py-3">Sản phẩm</th>
                <th className="text-right px-5 py-3">Giá bán</th>
                <th className="text-right px-5 py-3">Tồn kho</th>
                <th className="text-right px-5 py-3">Đã bán</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        {p.thumbnailUrl || p.imageUrl ? (
                          <img src={p.thumbnailUrl || p.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-600 m-auto mt-2.5" />
                        )}
                      </div>
                      <span className="text-white font-medium truncate max-w-[200px]">{p.productName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                    {p.retailPrice?.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-5 py-3 text-right text-slate-300">{p.quantity ?? 0}</td>
                  <td className="px-5 py-3 text-right text-slate-300">{p.soldCount ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => p.id && handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">
                {modal === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Tên sản phẩm *</label>
                <input value={form.productName ?? ""} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="Nhập tên sản phẩm" className="field" required />
              </div>
              {/* Category tree-dropdown */}
              {(() => {
                const selectedCat = categories.find(c => c.id === form.categoryId);
                const selectedLabel = selectedCat?.categoryName ?? "-- Chọn danh mục --";

                const renderNodes = (parentId: string | undefined, depth: number): React.ReactNode => {
                  const nodes = categories.filter(c =>
                    parentId === undefined ? !c.parentCategoryId : c.parentCategoryId === parentId
                  );
                  return nodes.map(node => {
                    const children = categories.filter(c => c.parentCategoryId === node.id);
                    const isExpanded = expandedParents.has(node.id!);
                    const isSelected = form.categoryId === node.id;
                    return (
                      <div key={node.id}>
                        <div
                          className={`flex items-center gap-1 py-2 pr-3 hover:bg-slate-700 transition-colors ${isSelected ? "bg-violet-600/30" : ""}`}
                          style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
                        >
                          <button
                            type="button"
                            className="flex-1 text-left text-sm text-white truncate"
                            onClick={() => { setForm(f => ({ ...f, categoryId: node.id ?? "" })); setCatOpen(false); }}
                          >
                            {node.categoryName}
                          </button>
                          {children.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedParents(prev => {
                                const next = new Set(prev);
                                next.has(node.id!) ? next.delete(node.id!) : next.add(node.id!);
                                return next;
                              })}
                              className="p-1 rounded text-slate-400 hover:text-white shrink-0"
                            >
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </div>
                        {isExpanded && renderNodes(node.id, depth + 1)}
                      </div>
                    );
                  });
                };

                return (
                  <div className="col-span-2 relative" ref={catRef}>
                    <label className="text-xs text-slate-400 mb-1 block">Danh mục</label>
                    <button
                      type="button"
                      onClick={() => setCatOpen(o => !o)}
                      className="field flex items-center justify-between text-left"
                    >
                      <span className={selectedCat ? "text-white" : "text-slate-500"}>{selectedLabel}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                    </button>
                    {catOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                        {categories.length === 0
                          ? <p className="px-4 py-3 text-sm text-slate-500">Chưa có danh mục nào.</p>
                          : renderNodes(undefined, 0)
                        }
                      </div>
                    )}
                  </div>
                );
              })()}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Giá bán (đ)</label>
                <input type="number" value={form.retailPrice ?? ""} onChange={(e) => setForm({ ...form, retailPrice: +e.target.value })}
                  placeholder="0" className="field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Giá nhập (đ)</label>
                <input type="number" value={form.importPrice ?? ""} onChange={(e) => setForm({ ...form, importPrice: +e.target.value })}
                  placeholder="0" className="field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Số lượng</label>
                <input type="number" value={form.quantity ?? ""} onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                  placeholder="0" className="field" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Ảnh đại diện (Thumbnail)</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded overflow-hidden bg-slate-800 shrink-0">
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : form.thumbnailUrl ? (
                      <img src={form.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-600 m-auto mt-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="relative inline-flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setThumbnailFile(file);
                          setThumbnailPreview(url);
                          e.currentTarget.value = "";
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-colors">
                        <ImageUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Tải thumbnail</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Ảnh sản phẩm</label>
                <div className="flex flex-wrap gap-3 items-start">
                  {(form.productImages ?? []).map((img, idx) => (
                    <div key={`existing-${img.id ?? idx}`} className="relative w-20 h-20 rounded overflow-hidden bg-slate-800">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, productImages: (f.productImages ?? []).filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 p-1 rounded bg-black/40 text-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {productImageFiles.map((_, idx) => (
                    <div key={`new-${idx}`} className="relative w-20 h-20 rounded overflow-hidden bg-slate-800">
                      <img src={productImagePreviews[idx]} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          // revoke preview URL
                          try { URL.revokeObjectURL(productImagePreviews[idx]); } catch {}
                          setProductImageFiles(prev => prev.filter((_, i) => i !== idx));
                          setProductImagePreviews(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 p-1 rounded bg-black/40 text-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="w-full">
                    <label className="relative inline-flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          const previews = files.map(f => URL.createObjectURL(f));
                          setProductImageFiles(prev => ([ ...prev, ...files ]));
                          setProductImagePreviews(prev => ([ ...prev, ...previews ]));
                          e.currentTarget.value = "";
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-600 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:border-slate-500 transition-colors">
                        <ImageUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Import ảnh sản phẩm</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Mô tả</label>
                <textarea value={form.detail ?? ""} onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  rows={3} placeholder="Mô tả sản phẩm..."
                  className="field resize-none" />
              </div>
              <div className="col-span-2 flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.field { width: 100%; padding: 0.5rem 0.875rem; border-radius: 0.75rem; background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.875rem; outline: none; } .field:focus { ring: 2px solid #7c3aed; border-color: #7c3aed; }`}</style>
    </div>
  );
}

