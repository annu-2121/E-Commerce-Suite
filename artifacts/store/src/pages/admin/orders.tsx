import { useLocation } from "wouter";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, type ListOrdersParams } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = useListOrders({}, { query: { queryKey: getListOrdersQueryKey(), enabled: !!user && user.role === "admin" } });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  if (!user) { navigate("/sign-in"); return null; }
  if (user.role !== "admin") { navigate("/"); return null; }

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatus.mutateAsync({ id, data: { status: status as any } });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Orders</h1>

        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Items</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-3"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>
                ))
              ) : !orders || orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">#{order.id}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="p-3 text-muted-foreground">{order.user?.name ?? `User #${order.userId}`}</td>
                  <td className="p-3 text-muted-foreground">{order.items.length}</td>
                  <td className="p-3 font-semibold">${order.total.toFixed(2)}</td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-md border-0 cursor-pointer ${STATUS_STYLES[order.status] || ""}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground capitalize">{s}</option>
                      ))}
                    </select>
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
