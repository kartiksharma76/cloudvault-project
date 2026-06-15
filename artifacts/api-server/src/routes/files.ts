import { Router, type IRouter } from "express";
import { eq, and, like, isNull } from "drizzle-orm";
import { db, filesTable, foldersTable } from "@workspace/db";
import {
  ListFilesQueryParams,
  CreateFileBody,
  GetFileParams,
  UpdateFileParams,
  UpdateFileBody,
  DeleteFileParams,
  ToggleFileStarParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/files", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListFilesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const { folderId, search, type } = parsed.data;

  let query = db.select().from(filesTable).where(eq(filesTable.userId, userId));

  const conditions = [eq(filesTable.userId, userId)];

  if (folderId !== undefined && folderId !== null) {
    conditions.push(eq(filesTable.folderId, folderId));
  } else if (folderId === null) {
    conditions.push(isNull(filesTable.folderId));
  }

  if (search) {
    conditions.push(like(filesTable.name, `%${search}%`));
  }

  if (type) {
    conditions.push(eq(filesTable.fileType, type));
  }

  const files = await db
    .select()
    .from(filesTable)
    .where(and(...conditions))
    .orderBy(filesTable.createdAt);

  res.json(files);
});

router.post("/files", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const [result] = await db
    .insert(filesTable)
    .values({ ...parsed.data, userId });

  const [file] = await db.select().from(filesTable).where(eq(filesTable.id, result.insertId));

  res.status(201).json(file);
});

router.get("/files/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json(file);
});

router.patch("/files/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if ("folderId" in parsed.data) updateData.folderId = parsed.data.folderId;

  await db
    .update(filesTable)
    .set(updateData)
    .where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  const [file] = await db.select().from(filesTable).where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json(file);
});

router.delete("/files/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [file] = await db.select().from(filesTable).where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  await db
    .delete(filesTable)
    .where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/files/:id/star", requireAuth, async (req, res): Promise<void> => {
  const params = ToggleFileStarParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [existing] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  await db
    .update(filesTable)
    .set({ isStarred: !existing.isStarred })
    .where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  const [file] = await db.select().from(filesTable).where(and(eq(filesTable.id, params.data.id), eq(filesTable.userId, userId)));

  res.json(file);
});

export default router;
