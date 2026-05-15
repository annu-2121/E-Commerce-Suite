import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListProducts, useListCategories, useCreateProduct,
  useUpdateProduct, useDeleteProduct, getListProductsQueryKey
} from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type ProductForm = {
  name: string; slug: string; description: string; price: string;
  comparePrice: string; stock: string; imageUrl: string;
  featured: boolean; categoryId: string;
};

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "",
  comparePrice: "", stock: "0", imageUrl: "", featured: false, categoryId: ""
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading } = useListProducts({ search: search || undefined, limit: 50 });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  if (!user) { navigate("/sign-in"); return null; }
  if (user.role !== "admin") { navigate("/"); return null; }

  const products = productsData?.products ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock), imageUrl: p.imageUrl,
      featured: p.featured, categoryId: p.categoryId ? String(p.categoryId) : ""
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name, slug: form.slug, description: form.description,
      price: parseFloat(form.price), comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
      stock: parseInt(form.stock), imageUrl: form.imageUrl,
      featured: form.featured, categoryId: form.categoryId ? parseInt(form.categoryId) : undefined
    };
    if (editingId) {
      await updateProduct.mutateAsync({ id: editingId, data });
    } else {
      await createProduct.mutateAsync({ data: data as any });
    }
    invalidate();
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct.mutateAsync({ id });
    invalidate();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif font-bold">Products</h1>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold">{editingId ? "Edit Product" : "New Product"}</h2>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-background resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Compare Price</Label>
                    <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-background">
                      <option value="">None</option>
                      {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                      <span className="text-sm">Featured Product</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="flex-1">
                    {editingId ? "Save Changes" : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Featured</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-3"><div className="h-8 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category?.name ?? "—"}</td>
                  <td className="p-3 font-medium">${p.price.toFixed(2)}</td>
                  <td className="p-3">
                    <Badge variant={p.stock === 0 ? "destructive" : p.stock < 10 ? "outline" : "secondary"}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="p-3">{p.featured ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-muted-foreground" />}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
