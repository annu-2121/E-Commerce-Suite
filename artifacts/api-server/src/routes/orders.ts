import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, UpdateOrderStatusBody, UpdateOrderStatusParams, GetOrderParams, ListOrdersQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  const [user] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, createdAt: usersTable.createdAt }).from(usersTable).where(eq(usersTable.id, order.userId)).limit(1);

  return {
    ...order,
    total: parseFloat(order.total),
    items: items.map((i) => ({ ...i, price: parseFloat(i.price) })),
    user: user ?? null,
  };
}

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { userId, role } = req.jwtPayload!;

  let query = db.select().from(ordersTable).$dynamic();
  if (role !== "admin") {
    query = query.where(eq(ordersTable.userId, userId));
  }
  const orders = await query.orderBy(desc(ordersTable.createdAt)).limit(params.limit ?? 50).offset(((params.page ?? 1) - 1) * (params.limit ?? 50));

  const ordersWithItems = await Promise.all(orders.map((o) => getOrderWithItems(o.id)));
  res.json(ordersWithItems.filter(Boolean));
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.jwtPayload!.userId;
  const { shippingAddress } = parsed.data;

  const cartItems = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      price: productsTable.price,
      name: productsTable.name,
      imageUrl: productsTable.imageUrl,
      stock: productsTable.stock,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  const [order] = await db.insert(ordersTable).values({ userId, total: String(Math.round(total * 100) / 100), shippingAddress }).returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.name,
      productImageUrl: i.imageUrl,
      quantity: i.quantity,
      price: i.price,
    }))
  );

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  const fullOrder = await getOrderWithItems(order.id);
  res.status(201).json(fullOrder);
});

router.get("/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetOrderParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const order = await getOrderWithItems(parsed.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const { userId, role } = req.jwtPayload!;
  if (role !== "admin" && order.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.json(order);
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = UpdateOrderStatusParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const bodyParsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const [updated] = await db.update(ordersTable).set({ status: bodyParsed.data.status }).where(eq(ordersTable.id, paramParsed.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const order = await getOrderWithItems(updated.id);
  res.json(order);
});

export default router;
