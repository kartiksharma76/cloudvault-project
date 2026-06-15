import { Router, type IRouter } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";
import crypto from "crypto";

const router: IRouter = Router();

const AuthBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const parsed = AuthBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, password } = parsed.data;

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(usersTable).values({
      id,
      email,
      passwordHash,
    });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const parsed = AuthBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, password } = parsed.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  try {
    const userId = getUserId(req);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
