import "dotenv/config";
import express from "express";
import cors from "cors";

import { initDb } from "./db.js";
import { HttpError } from "./util.js";

import authRoutes from "./routes/auth.js";
import propertiesRoutes from "./routes/properties.js";
import contactsRoutes from "./routes/contacts.js";
import vacanciesRoutes from "./routes/vacancies.js";
import dealsRoutes from "./routes/deals.js";
import teamRoutes from "./routes/team.js";
import activityRoutes from "./routes/activity.js";
import billingRoutes, { webhookHandler } from "./routes/billing.js";
import { isLive } from "./billing.js";

const PORT = process.env.PORT || 3001;
const PREFIX = process.env.API_PREFIX || "/api";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((s) => s.trim()),
  })
);
// Razorpay webhook needs the raw body to verify the signature — register it
// BEFORE the JSON parser.
app.post(`${PREFIX}/billing/webhook`, express.raw({ type: "*/*" }), webhookHandler);

app.use(express.json({ limit: "2mb" }));

// Health check
app.get(`${PREFIX}/health`, (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Resource routes
app.use(`${PREFIX}/auth`, authRoutes);
app.use(`${PREFIX}/properties`, propertiesRoutes);
app.use(`${PREFIX}/contacts`, contactsRoutes);
app.use(`${PREFIX}/vacancies`, vacanciesRoutes);
app.use(`${PREFIX}/deals`, dealsRoutes);
app.use(`${PREFIX}/team`, teamRoutes);
app.use(`${PREFIX}/activity`, activityRoutes);
app.use(`${PREFIX}/billing`, billingRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

// Error handler — shapes errors as { message } to match the frontend's expectations.
app.use((err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: err.message || "Internal server error" });
});

await initDb();
app.listen(PORT, () => {
  console.log(`Stackline API listening on http://localhost:${PORT}${PREFIX}`);
  console.log(`Billing mode: ${isLive() ? "LIVE (Razorpay)" : "MOCK (no keys — upgrades auto-complete)"}`);
});
