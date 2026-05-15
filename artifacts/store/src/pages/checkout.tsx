import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<number | null>(null);

  const [form, setForm] = useState({
    fullName: user?.name ?? "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const shippingAddress = `${form.fullName}, ${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`;
  const items = cart?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const order = await createOrder.mutateAsync({ data: { shippingAddress } });
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    setSuccess(order.id);
  };

  if (!user) {
    navigate("/sign-in");
    return null;
  }

  if (success) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Order #{success} has been placed successfully.</p>
          <p className="text-muted-foreground mb-8">We'll send you updates as your order ships.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(`/orders/${success}`)}>View Order Details</Button>
            <Button variant="outline" onClick={() => navigate("/products")}>Continue Shopping</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const shipping = (cart?.total ?? 0) >= 75 ? 0 : 9.99;
  const total = (cart?.total ?? 0) + shipping;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required className="mt-1"
                />
              </div>
              <div>
                <Label>Street Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St"
                  required className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required className="mt-1"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="CA"
                    required className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ZIP Code</Label>
                  <Input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required className="mt-1"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    required className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-4">Payment</h2>
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                  This is a demo store — no real payment is processed.
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={createOrder.isPending}>
                {createOrder.isPending ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="border rounded-xl overflow-hidden">
              <div className="divide-y max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted/50 space-y-2 text-sm border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart?.total?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
