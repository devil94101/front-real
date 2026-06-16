import { Router } from "express";
import { all, getDb, save } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  signTokens,
  verifyRefresh,
  publicUser,
  requireAuth,
} from "../auth.js";
import { asyncHandler, HttpError, uid } from "../util.js";

const router = Router();

const COLORS = ["#2563eb", "#0d9488", "#7c3aed", "#db2777", "#ea580c", "#0891b2"];

// POST /auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, firmName } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      throw new HttpError(400, "Name, email and password are required");
    }
    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = all("users").some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) throw new HttpError(409, "An account with that email already exists");

    const id = uid("u");
    const user = {
      id,
      name: name.trim(),
      email: normalizedEmail,
      role: "Broker",
      color: COLORS[all("users").length % COLORS.length],
      firmId: firmName?.trim() ? uid("firm") : "firm_stackline",
      firmName: firmName?.trim() || "Stackline Commercial",
      passwordHash: await hashPassword(password),
    };
    all("users").push(user);

    // Surface the new user in the team directory so sharing works.
    all("team").push({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      color: user.color,
    });
    save();

    const tokens = signTokens(id);
    res.status(201).json({ ...tokens, user: publicUser(user) });
  })
);

// POST /auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) throw new HttpError(400, "Email and password are required");

    const normalizedEmail = email.trim().toLowerCase();
    const user = all("users").find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    const tokens = signTokens(user.id);
    res.json({ ...tokens, user: publicUser(user) });
  })
);

// GET /auth/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

// POST /auth/refresh
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) throw new HttpError(400, "Refresh token is required");

    let userId;
    try {
      userId = verifyRefresh(refreshToken);
    } catch {
      throw new HttpError(401, "Invalid or expired refresh token");
    }

    const user = getDb().users.find((u) => u.id === userId);
    if (!user) throw new HttpError(401, "User no longer exists");

    const tokens = signTokens(user.id);
    res.json({ ...tokens, user: publicUser(user) });
  })
);

export default router;
