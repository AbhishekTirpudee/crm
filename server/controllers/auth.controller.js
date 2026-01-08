import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const existing = await db.select().from(users).where(eq(users.email, req.body.email));
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);
    const [user] = await db.insert(users).values({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashed,
      role: req.body.role || 'user',
    }).returning();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const isSuperAdmin = (user) => user.role === 'super_admin' || user.email === 'tirpudeabhishek212@gmail.com';

export const login = async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, req.body.email));

    if (!user) return res.status(404).json({ message: "User not found" });

    // Super Admin Protection: Never lock, always reset attempts
    if (isSuperAdmin(user)) {
      if (user.isLocked || user.loginAttempts > 0) {
        await db.update(users).set({ isLocked: false, loginAttempts: 0 }).where(eq(users.id, user.id));
        user.isLocked = false;
      }
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "Account is locked. Please contact administrator." });
    }

    const ok = await bcrypt.compare(req.body.password, user.password);

    if (!ok) {
      // Increment login attempts (optional logic for auto-lock could go here)
      if (!isSuperAdmin(user)) {
        await db.update(users)
          .set({ loginAttempts: (user.loginAttempts || 0) + 1 })
          .where(eq(users.id, user.id));
      }
      return res.status(401).json({ message: "Wrong password" });
    }

    // Reset attempts on success
    await db.update(users).set({ loginAttempts: 0 }).where(eq(users.id, user.id));

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- User Management (Super Admin) ---

export const getUsers = async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    // exclude passwords
    const safeUsers = allUsers.map(({ password, ...u }) => u);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createUser = async (req, res) => {
  return register(req, res); // Reuse register logic but maybe add check for admin permissions in route
}

export const lockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if target is super admin
    const [targetUser] = await db.select().from(users).where(eq(users.id, id));
    if (targetUser && isSuperAdmin(targetUser)) {
      return res.status(403).json({ message: "Cannot lock Super Admin account" });
    }

    const [updated] = await db.update(users).set({ isLocked: true }).where(eq(users.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(users).set({ isLocked: false, loginAttempts: 0 }).where(eq(users.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashed }).where(eq(users.id, id));
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
