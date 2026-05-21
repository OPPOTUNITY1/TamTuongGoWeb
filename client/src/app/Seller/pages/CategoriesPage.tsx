import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Tag, X, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { ShopDto } from "../../../types/shop/dto";
import type { SellerDto } from "../../../types/seller/dto";
import type { CategoryDto } from "../../../types/category/dto";
import type { CategoryRequestDto } from "../../../types/category/request";
import categoryService from "../../../services/category/category.service";

interface Props {
  shop: ShopDto;
  seller: SellerDto | null;
}

const EMPTY_FORM: CategoryRequestDto = { shopId: "", sellersId: "", categoryName: "" };

export default function CategoriesPage({ shop, seller }: Props) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<CategoryRequestDto>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const load = () => {
    setLoading(true);
    categoryService
      .getData({ shopId: shop.id })
      .then((res) => { if (res.status && res.data) setCategories(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [shop.id]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, shopId: shop.id ?? "", sellersId: seller?.id ?? "" });
    setExpandedParents(new Set());
    setCatOpen(false);
    setModal("create");
  };

  const openEdit = (c: CategoryDto) => {
    if (c.parentCategoryId) setExpandedParents(new Set([c.parentCategoryId]));
    else setExpandedParents(new Set());
    setCatOpen(false);
    setForm({
      id: c.id,
      shopId: c.shopId ?? shop.id ?? "",
      sellersId: c.sellersId ?? seller?.id ?? "",
      categoryName: c.categoryName ?? "",
      parentCategoryId: c.parentCategoryId,
    });
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryName?.trim()) { toast.error("Vui lòng nhập tên danh mục."); return; }
    setSaving(true);
    try {
      const res = modal === "create"
        ? await categoryService.create(form)
        : await categoryService.update(form);
      if (res.status) {
        toast.success(modal === "create" ? "Tạo danh mục thành công!" : "Cập nhật thành công!");
        setModal(null);
        load();
      } else {
        toast.error(res.message ?? "Thao tác thất bại.");
      }
    } catch { toast.error("Đã xảy ra lỗi."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa danh mục này?")) return;
    try {
      const res = await categoryService.delete(id);
      if (res.status) { toast.success("Đã xóa!"); load(); }
      else toast.error(res.message ?? "Xóa thất bại.");
    } catch { toast.error("Đã xảy ra lỗi."); }
  };

  // Build parent name lookup
  const parentMap: Record<string, string> = {};
  categories.forEach((c) => {
    if (c.id) parentMap[c.id] = c.categoryName ?? "";
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Danh mục</h1>
          <p className="text-slate-400 text-sm mt-0.5">{shop.name}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Chưa có danh mục nào.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="text-left px-5 py-3">Tên danh mục</th>
                <th className="text-left px-5 py-3">Danh mục cha</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-white font-medium">{c.categoryName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {c.parentCategoryId ? (parentMap[c.parentCategoryId] ?? c.parentCategoryId) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => c.id && handleDelete(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
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

      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">
                {modal === "create" ? "Thêm danh mục" : "Sửa danh mục"}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Tên danh mục *</label>
                <input
                  value={form.categoryName ?? ""}
                  onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  placeholder="VD: Đồ nội thất, Điện tử..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Danh mục cha (tuỳ chọn)</label>
                {(() => {
                  const availableCats = categories.filter(c => c.id !== form.id);
                  const selectedCat = availableCats.find(c => c.id === form.parentCategoryId);
                  const selectedLabel = selectedCat?.categoryName ?? "— Không có cha —";

                  const renderNodes = (parentId: string | undefined, depth: number): React.ReactNode => {
                    const nodes = availableCats.filter(c =>
                      parentId === undefined ? !c.parentCategoryId : c.parentCategoryId === parentId
                    );
                    return nodes.map(node => {
                      const children = availableCats.filter(c => c.parentCategoryId === node.id);
                      const isExpanded = expandedParents.has(node.id!);
                      const isSelected = form.parentCategoryId === node.id;
                      return (
                        <div key={node.id}>
                          <div
                            className={`flex items-center gap-1 py-2 pr-3 hover:bg-slate-700 transition-colors ${isSelected ? "bg-violet-600/30" : ""}`}
                            style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
                          >
                            <button
                              type="button"
                              className="flex-1 text-left text-sm text-white truncate"
                              onClick={() => { setForm(f => ({ ...f, parentCategoryId: node.id })); setCatOpen(false); }}
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
                    <div className="relative" ref={catRef}>
                      <button
                        type="button"
                        onClick={() => setCatOpen(o => !o)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center justify-between text-left"
                      >
                        <span className={selectedCat ? "text-white" : "text-slate-500"}>{selectedLabel}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                      </button>
                      {catOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => { setForm(f => ({ ...f, parentCategoryId: undefined })); setCatOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${!form.parentCategoryId ? "bg-violet-600/30 text-violet-300" : "text-slate-400"}`}
                          >
                            — Không có cha —
                          </button>
                          {renderNodes(undefined, 0)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="flex gap-3 pt-1">
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
    </div>
  );
}
