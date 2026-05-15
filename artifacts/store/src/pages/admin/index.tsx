import { Link, useLocation } from "wouter";
import { useGetStoreSummary, useGetTopProducts, useGetRecentOrders } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { TrendingUp, ShoppingCart, Package, Users, Clock, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: summary } = useGetStoreSummary();
  const { data: topProducts } = useGetTopProducts();
  const { data: recentOrders } = useGetRecentOrders();

  if (!user) { navigate("/sign-in"); return null; }
  if (user.role !== "admin") { navigate("/"); return null; }

  const statCards = [
    { label: "Total Revenue", value: summary ? `$${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—", icon: TrendingUp, sub: `$${summary?.revenueThisMonth?.toFixed(2) ?? "0.00"} this month` },
    { label: "Total Orders", value: summary?.totalOrders ?? "—", icon: ShoppingCart, sub: `${summary?.pendingOrders ?? 0} pending` },
    { label: "Products", value: summary?.totalProducts ?? "—", icon: Package, sub: "In catalog" },
    { label: "Users", value: summary?.totalUsers ?? "—", icon: Users, sub: "Registered accounts" },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/products">
              <button className="text-sm px-4 py-2 border rounded-lg hover:bg-muted transition-colors">Manage Products</button>
            </Link>
            <Link href="/admin/orders">
              <button className="text-sm px-4 py-2 border rounded-lg hover:bg-muted transition-colors">Manage Orders</button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="border rounded-xl p-5 bg-card">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold">Top Selling Products</h2>
              <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                All products <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y">
              {topProducts && topProducts.length > 0 ? topProducts.map((p, i) => (
                <div key={p.productId ?? i} className="flex items-center gap-3 p-4">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <img src={p.productImageUrl} alt={p.productName} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.productName}</p>
                    <p className="text-xs text-muted-foreground">{p.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-semibold">${p.revenue.toFixed(2)}</span>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No sales data yet</div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-semibold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                All orders <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y">
              {recentOrders && recentOrders.length > 0 ? recentOrders.map((o) => (
                <Link key={o.id} href={`/admin/orders`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[o.status] || ""}`}>{o.status}</span>
                    <span className="text-sm font-semibold">${o.total.toFixed(2)}</span>
                  </div>
                </Link>
              )) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No orders yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { href: "/admin/products", label: "Product Management", desc: "Add, edit, and manage products" },
            { href: "/admin/orders", label: "Order Management", desc: "View and update order statuses" },
            { href: "/admin/users", label: "User Management", desc: "View all registered users" },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href}>
              <div className="border rounded-xl p-5 bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <h3 className="font-semibold mb-1">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
