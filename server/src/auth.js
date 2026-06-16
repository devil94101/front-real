import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { find } from "./db.js";
import { HttpError } from "./util.js";

const ACCESS_SECRET = process.env.JWT_SECRET || "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";
const ACCESS_TTL = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash);

export function signTokens(userId) {
  const token = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ sub: userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
  return { token, refreshToken };
}

export function verifyRefresh(token) {
  const payload = jwt.verify(token, REFRESH_SECRET);
  if (payload.type !== "refresh") throw new Error("Not a refresh token");
  return payload.sub;
}

// Strip the password hash before sending a user to the client.
export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

// Express middleware: require a valid access token, attach req.user.
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Authentication required"));

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = find("users", payload.sub);
    if (!user) return next(new HttpError(401, "User no longer exists"));
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
