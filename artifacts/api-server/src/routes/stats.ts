import { Router } from "express";
import { db, ordersTable, productsTable, usersTable, orderItemsTable } from "@workspace/db";
import { eq, sql, desc, gte } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/summary", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenueResult] = await db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(sql`status != 'cancelled'`);
  const [totalOrdersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [totalProductsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [pendingOrdersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
  const [revenueThisMonthResult] = await db
    .select({ total: sql<number>`coalesce(sum(total::numeric), 0)` })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, startOfMonth));

  res.json({
    totalRevenue: parseFloat(String(totalRevenueResult?.total ?? 0)),
    totalOrders: totalOrdersResult?.count ?? 0,
    totalProducts: totalProductsResult?.count ?? 0,
    totalUsers: totalUsersResult?.count ?? 0,
    pendingOrders: pendingOrdersResult?.count ?? 0,
    revenueThisMonth: parseFloat(String(revenueThisMonthResult?.total ?? 0)),
  });
});

router.get("/top-products", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const topProducts = await db
    .select({
      productId: orderItemsTable.productId,
      productName: orderItemsTable.productName,
      productImageUrl: orderItemsTable.productImageUrl,
      totalSold: sql<number>`sum(${orderItemsTable.quantity})::int`,
      revenue: sql<number>`sum(${orderItemsTable.price}::numeric * ${orderItemsTable.quantity}::numeric)`,
    })
    .from(orderItemsTable)
    .groupBy(orderItemsTable.productId, orderItemsTable.productName, orderItemsTable.productImageUrl)
    .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
    .limit(5);

  res.json(topProducts.map((p) => ({ ...p, revenue: parseFloat(String(p.revenue)) })));
});

router.get("/recent-orders", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  res.json(orders.map((o) => ({ ...o, total: parseFloat(o.total), items: [], user: null })));
});

export default router;
