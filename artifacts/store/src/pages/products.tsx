import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, X } from "lucide-react";

function ProductCard({ product }: { product: any }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-muted aspect-square mb-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-medium text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
        <h3 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    params.get("categoryId") ? parseInt(params.get("categoryId")!) : undefined
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(params.get("featured") === "true");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({
    search: searchQuery || undefined,
    categoryId: selectedCategory,
    inStock: inStockOnly || undefined,
    featured: featuredOnly || undefined,
    limit: 20,
  });

  const products = productsData?.products ?? [];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    setInStockOnly(false);
    setFeaturedOnly(false);
  };

  const hasFilters = searchQuery || selectedCategory || inStockOnly || featuredOnly;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold">Product Catalog</h1>
            {productsData && (
              <p className="text-muted-foreground text-sm mt-1">{productsData.total} products</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
            <div className="space-y-6 sticky top-24">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block">Category</Label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold block">Options</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Featured Only</span>
                </label>
              </div>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg aspect-square mb-3" />
                    <div className="h-3 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
