import { Router, type IRouter } from "express";
import { eq, sum, count } from "drizzle-orm";
import { db, filesTable, notesTable, foldersTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const [filesResult] = await db
    .select({ total: count(), totalSize: sum(filesTable.size) })
    .from(filesTable)
    .where(eq(filesTable.userId, userId));

  const [notesResult] = await db
    .select({ total: count() })
    .from(notesTable)
    .where(eq(notesTable.userId, userId));

  const [foldersResult] = await db
    .select({ total: count() })
    .from(foldersTable)
    .where(eq(foldersTable.userId, userId));

  const fileTypeResults = await db
    .select({ fileType: filesTable.fileType, cnt: count() })
    .from(filesTable)
    .where(eq(filesTable.userId, userId))
    .groupBy(filesTable.fileType);

  const filesByType = { image: 0, video: 0, document: 0, pdf: 0, other: 0 };
  for (const row of fileTypeResults) {
    const t = row.fileType as keyof typeof filesByType;
    if (t in filesByType) filesByType[t] = Number(row.cnt);
  }

  res.json({
    totalFiles: Number(filesResult?.total ?? 0),
    totalNotes: Number(notesResult?.total ?? 0),
    totalFolders: Number(foldersResult?.total ?? 0),
    storageUsedBytes: Number(filesResult?.totalSize ?? 0),
    filesByType,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const recentFiles = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.userId, userId))
    .orderBy(filesTable.updatedAt)
    .limit(5);

  const recentNotes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.userId, userId))
    .orderBy(notesTable.updatedAt)
    .limit(5);

  const activity = [
    ...recentFiles.map((f) => ({
      id: f.id,
      type: "file" as const,
      entityType: f.fileType,
      name: f.name,
      action: "created" as const,
      createdAt: f.createdAt.toISOString(),
    })),
    ...recentNotes.map((n) => ({
      id: n.id,
      type: "note" as const,
      entityType: "note",
      name: n.title,
      action: "created" as const,
      createdAt: n.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json(activity);
});

router.get("/dashboard/starred", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const files = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.userId, userId))
    .orderBy(filesTable.updatedAt);

  const starred = files.filter((f) => f.isStarred);

  res.json(starred);
});

export default router;
