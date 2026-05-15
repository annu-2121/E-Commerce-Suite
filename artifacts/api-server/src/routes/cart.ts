import { Router } from "express";
import { db, cartItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddCartItemBody, UpdateCartItemBody, UpdateCartItemParams, RemoveCartItemParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function buildCart(userId: number) {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      productDescription: productsTable.description,
      productPrice: productsTable.price,
      productComparePrice: productsTable.comparePrice,
      productStock: productsTable.stock,
      productImageUrl: productsTable.imageUrl,
      productFeatured: productsTable.featured,
      productCategoryId: productsTable.categoryId,
      productCreatedAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    product: {
      id: i.productId,
      name: i.productName,
      slug: i.productSlug,
      description: i.productDescription,
      price: parseFloat(i.productPrice),
      comparePrice: i.productComparePrice ? parseFloat(i.productComparePrice) : null,
      stock: i.productStock,
      imageUrl: i.productImageUrl,
      featured: i.productFeatured,
      categoryId: i.productCategoryId,
      createdAt: i.productCreatedAt,
      category: i.categoryName ? { id: i.productCategoryId, name: i.categoryName, slug: i.categorySlug } : null,
    },
  }));

  const total = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return { items: cartItems, total: Math.round(total * 100) / 100, itemCount };
}

router.get("/", requireAuth, async (req, res): Promise<void> => {
  const cart = await buildCart(req.jwtPayload!.userId);
  res.json(cart);
});

router.post("/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { productId, quantity } = parsed.data;
  const userId = req.jwtPayload!.userId;

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }

  const cart = await buildCart(userId);
  res.status(201).json(cart);
});

router.patch("/items/:productId", requireAuth, async (req, res): Promise<void> => {
  const paramParsed = UpdateCartItemParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid productId" });
    return;
  }
  const bodyParsed = UpdateCartItemBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const userId = req.jwtPayload!.userId;
  const { productId } = paramParsed.data;
  const { quantity } = bodyParsed.data;

  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  }

  const cart = await buildCart(userId);
  res.json(cart);
});

router.delete("/items/:productId", requireAuth, async (req, res): Promise<void> => {
  const parsed = RemoveCartItemParams.safeParse({ productId: parseInt(req.params.productId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid productId" });
    return;
  }
  const userId = req.jwtPayload!.userId;
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, parsed.data.productId)));
  const cart = await buildCart(userId);
  res.json(cart);
});

router.delete("/", requireAuth, async (req, res): Promise<void> => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.jwtPayload!.userId));
  res.json({ message: "Cart cleared" });
});

export default router;
