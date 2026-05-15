import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetProduct, useAddCartItem, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { ShoppingBag, Minus, Plus, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { data: product, isLoading } = useGetProduct(parseInt(id!), { query: { queryKey: getGetProductQueryKey(parseInt(id!)), enabled: !!id } });
  const addToCart = useAddCartItem();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    await addToCart.mutateAsync({ data: { productId: product!.id, quantity: qty } });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="bg-muted rounded-xl aspect-square" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate("/products")} variant="outline">Back to Catalog</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                -{discount}% OFF
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <p className="text-sm text-muted-foreground mb-2">{product.category.name}</p>
            )}
            <h1 className="text-3xl font-serif font-bold mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-xl text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock ({product.stock} available)</Badge>
              ) : product.stock > 0 ? (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Low Stock — Only {product.stock} left</Badge>
              ) : (
                <Badge variant="outline" className="text-destructive border-destructive/20">Out of Stock</Badge>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={product.stock === 0 || addToCart.isPending}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 w-5 h-5" />
              {added ? "Added to Cart!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                You'll be asked to sign in before adding to cart.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
