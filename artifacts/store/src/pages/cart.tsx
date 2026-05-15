import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveCartItem, useUpdateCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cart, isLoading } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const handleRemove = async (productId: number) => {
    await removeItem.mutateAsync({ productId });
    invalidate();
  };

  const handleUpdate = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem.mutateAsync({ productId });
    } else {
      await updateItem.mutateAsync({ productId, data: { quantity } });
    }
    invalidate();
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
          <p className="text-muted-foreground mb-6">Your cart is saved when you're signed in.</p>
          <Link href="/sign-in"><Button>Sign In</Button></Link>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 border rounded-xl bg-card">
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-medium text-sm hover:underline line-clamp-2">{item.product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">${item.product.price.toFixed(2)} each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="border rounded-xl p-6 bg-card sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart?.itemCount} items)</span>
                  <span>${cart?.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">{(cart?.total ?? 0) >= 75 ? "Free" : "$9.99"}</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${((cart?.total ?? 0) + ((cart?.total ?? 0) < 75 ? 9.99 : 0)).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Link href="/products" className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
