import { Link } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Star } from "lucide-react";

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

export default function HomePage() {
  const { data: productsData } = useListProducts({ featured: true, limit: 4 });
  const { data: allProducts } = useListProducts({ limit: 8 });
  const { data: categories } = useListCategories();

  const featuredProducts = productsData?.products ?? [];
  const latestProducts = allProducts?.products ?? [];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/70 mb-6">
              New Collection — Spring 2026
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              Curated for the<br />discerning buyer.
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl">
              Premium products across electronics, fashion, home goods, and more. Discover pieces that earn a permanent place in your life.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Browse Catalog <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/products?featured=true" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg aspect-square bg-muted mb-2">
                    {cat.imageUrl && (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-3">
                      <span className="text-white font-semibold text-sm">{cat.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold">Featured Products</h2>
              <Link href="/products?featured=true" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On all orders over $75" },
              { icon: ShieldCheck, title: "Secure Payments", desc: "256-bit SSL encryption" },
              { icon: RefreshCcw, title: "30-Day Returns", desc: "No questions asked" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold">All Products</h2>
              <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Browse all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {latestProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="text-center mt-10">
              <Link href="/products">
                <Button variant="outline" size="lg">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
