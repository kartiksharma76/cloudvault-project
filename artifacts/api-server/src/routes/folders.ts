import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, foldersTable, filesTable } from "@workspace/db";
import {
  CreateFolderBody,
  UpdateFolderParams,
  UpdateFolderBody,
  DeleteFolderParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/folders", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const folders = await db
    .select()
    .from(foldersTable)
    .where(eq(foldersTable.userId, userId))
    .orderBy(foldersTable.name);

  const foldersWithCount = await Promise.all(
    folders.map(async (folder) => {
      const [result] = await db
        .select({ count: count() })
        .from(filesTable)
        .where(eq(filesTable.folderId, folder.id));
      return { ...folder, fileCount: result?.count ?? 0 };
    }),
  );

  res.json(foldersWithCount);
});

router.post("/folders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateFolderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const [result] = await db
    .insert(foldersTable)
    .values({ ...parsed.data, userId });

  const [folder] = await db.select().from(foldersTable).where(eq(foldersTable.id, result.insertId));

  res.status(201).json({ ...folder, fileCount: 0 });
});

router.patch("/folders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateFolderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFolderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  await db
    .update(foldersTable)
    .set({ name: parsed.data.name })
    .where(and(eq(foldersTable.id, params.data.id), eq(foldersTable.userId, userId)));

  const [folder] = await db.select().from(foldersTable).where(and(eq(foldersTable.id, params.data.id), eq(foldersTable.userId, userId)));

  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  const [result] = await db
    .select({ count: count() })
    .from(filesTable)
    .where(eq(filesTable.folderId, folder.id));

  res.json({ ...folder, fileCount: result?.count ?? 0 });
});

router.delete("/folders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteFolderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [folder] = await db.select().from(foldersTable).where(and(eq(foldersTable.id, params.data.id), eq(foldersTable.userId, userId)));
  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  await db
    .delete(foldersTable)
    .where(and(eq(foldersTable.id, params.data.id), eq(foldersTable.userId, userId)));

  if (!folder) {
    res.status(404).json({ error: "Folder not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
