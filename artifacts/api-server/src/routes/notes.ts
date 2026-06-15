import { Router, type IRouter } from "express";
import { eq, and, like } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import {
  ListNotesQueryParams,
  CreateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
  ToggleNotePinParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/notes", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListNotesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const { search } = parsed.data;

  const conditions = [eq(notesTable.userId, userId)];
  if (search) {
    conditions.push(like(notesTable.title, `%${search}%`));
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(and(...conditions))
    .orderBy(notesTable.updatedAt);

  res.json(notes);
});

router.post("/notes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const [result] = await db
    .insert(notesTable)
    .values({ ...parsed.data, userId });

  const [note] = await db.select().from(notesTable).where(eq(notesTable.id, result.insertId));

  res.status(201).json(note);
});

router.get("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(note);
});

router.patch("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getUserId(req);
  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content;

  await db
    .update(notesTable)
    .set(updateData)
    .where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  const [note] = await db.select().from(notesTable).where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.json(note);
});

router.delete("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [note] = await db.select().from(notesTable).where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  await db
    .delete(notesTable)
    .where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/notes/:id/pin", requireAuth, async (req, res): Promise<void> => {
  const params = ToggleNotePinParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getUserId(req);
  const [existing] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  await db
    .update(notesTable)
    .set({ isPinned: !existing.isPinned })
    .where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  const [note] = await db.select().from(notesTable).where(and(eq(notesTable.id, params.data.id), eq(notesTable.userId, userId)));

  res.json(note);
});

export default router;
