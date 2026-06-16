import { randomBytes } from "node:crypto";

// Short, collision-resistant id with a type prefix (matches the frontend's uid scheme).
export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`;
}

export const nowIso = () => new Date().toISOString();

// Wrap async route handlers so thrown errors reach the Express error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Throwable HTTP error carrying a status code.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
