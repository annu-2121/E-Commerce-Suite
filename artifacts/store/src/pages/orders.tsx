import { Link, useLocation } from "wouter";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = useListOrders({}, { query: { queryKey: getListOrdersQueryKey(), enabled: !!user } });

  if (!user) {
    navigate("/sign-in");
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-4 h-24 bg-muted" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Your orders will appear here once you place one.</p>
            <Link href="/products"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block">
                <div className="border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold">Order #{order.id}</span>
                      <span className="text-sm text-muted-foreground ml-3">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <Badge className={`border text-xs font-medium capitalize ${STATUS_STYLES[order.status] || ""}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
