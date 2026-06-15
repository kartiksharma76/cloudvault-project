import { mysqlTable, text, timestamp, int, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foldersTable = mysqlTable("folders", {
  id: int("id").autoincrement().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFolderSchema = createInsertSchema(foldersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof foldersTable.$inferSelect;

export const filesTable = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  objectPath: text("object_path").notNull(),
  size: int("size").notNull().default(0),
  mimeType: text("mime_type").notNull().default("application/octet-stream"),
  fileType: text("file_type").notNull().default("other"),
  folderId: int("folder_id").references(() => foldersTable.id, { onDelete: "set null" }),
  isStarred: boolean("is_starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof filesTable.$inferSelect;
