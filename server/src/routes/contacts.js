import { Router } from "express";
import { all, insert, update, remove } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler, HttpError, uid, nowIso } from "../util.js";
import { logActivity } from "../log.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("contacts"));
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name?.trim()) throw new HttpError(400, "Contact name is required");
  const record = {
    propertyIds: [],
    isStarred: false,
    ...body,
    id: uid("c"),
    dateAdded: nowIso(),
  };
  insert("contacts", record, { prepend: true });
  logActivity("contact", `New contact <b>${record.name}</b> added.`, req.user.name);
  res.status(201).json(record);
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const updated = update("contacts", req.params.id, req.body || {});
  if (!updated) throw new HttpError(404, "Contact not found");
  res.json(updated);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  // Unlink this contact from any property that names it as owner.
  for (const p of all("properties")) {
    if (p.ownerId === req.params.id) p.ownerId = null;
  }
  const ok = remove("contacts", req.params.id);
  if (!ok) throw new HttpError(404, "Contact not found");
  res.json({ id: req.params.id });
}));

export default router;
