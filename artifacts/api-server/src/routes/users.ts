import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(users);
});

export default router;
