import { useParams, useLocation } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: order, isLoading } = useGetOrder(parseInt(id!), { query: { queryKey: getGetOrderQueryKey(parseInt(id!)), enabled: !!id && !!user } });

  if (!user) {
    navigate("/sign-in");
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold mb-4">Order not found</h2>
          <Button variant="outline" onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
      </MainLayout>
    );
  }

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Order #{order.id}</h1>
            <p className="text-muted-foreground mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Badge className={`border text-sm font-medium capitalize ${STATUS_STYLES[order.status] || ""}`}>
            {order.status}
          </Badge>
        </div>

        {/* Progress Tracker */}
        {order.status !== "cancelled" && (
          <div className="border rounded-xl p-6 bg-card mb-6">
            <h2 className="font-semibold mb-4">Order Progress</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i <= stepIdx ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-muted"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 mx-1 last:hidden">
                    <div className={`h-1 rounded ${i < stepIdx ? "bg-primary" : "bg-muted"}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STATUS_STEPS.map((step) => (
                <span key={step} className="text-xs text-muted-foreground capitalize">{step}</span>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div className="border rounded-xl p-5 bg-card mb-6">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
        </div>

        {/* Order Items */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Items ({order.items.length})</h2>
          </div>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                <img
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <span className="font-semibold text-sm">${(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="p-5 bg-muted/50 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
