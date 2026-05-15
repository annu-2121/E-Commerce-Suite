import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const conditions = [];
  if (params.categoryId) conditions.push(eq(productsTable.categoryId, params.categoryId));
  if (params.search) conditions.push(ilike(productsTable.name, `%${params.search}%`));
  if (params.minPrice !== undefined) conditions.push(gte(productsTable.price, String(params.minPrice)));
  if (params.maxPrice !== undefined) conditions.push(lte(productsTable.price, String(params.maxPrice)));
  if (params.inStock) conditions.push(gte(productsTable.stock, sql`1`));
  if (params.featured !== undefined) conditions.push(eq(productsTable.featured, params.featured));

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        comparePrice: productsTable.comparePrice,
        stock: productsTable.stock,
        imageUrl: productsTable.imageUrl,
        featured: productsTable.featured,
        categoryId: productsTable.categoryId,
        createdAt: productsTable.createdAt,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  res.json({
    products: products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
      category: p.categoryName
        ? { id: p.categoryId, name: p.categoryName, slug: p.categorySlug }
        : null,
    })),
    total,
    page,
    limit,
  });
});

router.post("/", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { price, comparePrice, ...rest } = parsed.data;
  const [product] = await db
    .insert(productsTable)
    .values({ ...rest, price: String(price), comparePrice: comparePrice ? String(comparePrice) : null })
    .returning();
  res.status(201).json({ ...product, price: parseFloat(product.price), comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null, category: null });
});

router.get("/:id", async (req, res): Promise<void> => {
  const parsed = GetProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [product] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      slug: productsTable.slug,
      description: productsTable.description,
      price: productsTable.price,
      comparePrice: productsTable.comparePrice,
      stock: productsTable.stock,
      imageUrl: productsTable.imageUrl,
      featured: productsTable.featured,
      categoryId: productsTable.categoryId,
      createdAt: productsTable.createdAt,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({
    ...product,
    price: parseFloat(product.price),
    comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
    category: product.categoryName ? { id: product.categoryId, name: product.categoryName, slug: product.categorySlug } : null,
  });
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const paramParsed = UpdateProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const { price, comparePrice, ...rest } = bodyParsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (price !== undefined) updateData.price = String(price);
  if (comparePrice !== undefined) updateData.comparePrice = String(comparePrice);

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, paramParsed.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ...product, price: parseFloat(product.price), comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null, category: null });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = DeleteProductParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  res.json({ message: "Product deleted" });
});

export default router;
