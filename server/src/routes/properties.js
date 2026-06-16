import { Router } from "express";
import { all, find, insert, update, remove } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler, HttpError, uid, nowIso } from "../util.js";
import { logActivity } from "../log.js";
import { planLimit, countListings } from "../billing.js";

const router = Router();
router.use(requireAuth);

// GET /properties
router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("properties"));
}));

// POST /properties
router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name?.trim()) throw new HttpError(400, "Property name is required");

  // Enforce the per-broker listing quota (free vs premium).
  const limit = planLimit(req.user);
  const used = countListings(req.user.id);
  if (used >= limit) {
    throw new HttpError(
      403,
      req.user.plan === "premium"
        ? `You have reached your Premium listing limit of ${limit} properties.`
        : `Free plan is limited to ${limit} listings. Upgrade to Premium to list more.`
    );
  }

  const record = {
    sharedWith: [],
    isStarred: false,
    amenities: [],
    tags: [],
    ...body,
    id: uid("p"),
    listedBy: req.user.id,
    dateAdded: nowIso(),
    lastUpdated: nowIso(),
  };
  insert("properties", record, { prepend: true });
  logActivity("property", `Added <b>${record.name}</b> to the database.`, req.user.name);
  res.status(201).json(record);
}));

// PUT /properties/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const updated = update("properties", req.params.id, {
    ...req.body,
    lastUpdated: nowIso(),
  });
  if (!updated) throw new HttpError(404, "Property not found");
  logActivity("property", "Updated property details.", req.user.name);
  res.json(updated);
}));

// DELETE /properties/:id  — cascade to vacancies, unlink from deals.
router.delete("/:id", asyncHandler(async (req, res) => {
  const property = find("properties", req.params.id);
  if (!property) throw new HttpError(404, "Property not found");

  for (const v of [...all("vacancies")]) {
    if (v.propertyId === property.id) remove("vacancies", v.id);
  }
  for (const d of all("deals")) {
    if (d.propertyId === property.id) d.propertyId = null;
  }
  remove("properties", property.id);
  logActivity("property", "Removed a property from the database.", req.user.name);
  res.json({ id: property.id });
}));

// POST /properties/:id/share
router.post("/:id/share", asyncHandler(async (req, res) => {
  const { memberIds } = req.body || {};
  if (!Array.isArray(memberIds)) throw new HttpError(400, "memberIds must be an array");
  const updated = update("properties", req.params.id, { sharedWith: memberIds });
  if (!updated) throw new HttpError(404, "Property not found");
  logActivity(
    "share",
    `Shared <b>${updated.name}</b> with ${memberIds.length} team member${memberIds.length === 1 ? "" : "s"}.`,
    req.user.name
  );
  res.json({ propertyId: updated.id, memberIds });
}));

export default router;
