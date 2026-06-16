import { Router } from "express";
import { all, update, remove } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler, HttpError, uid, nowIso } from "../util.js";
import { logActivity } from "../log.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("deals"));
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.title?.trim()) throw new HttpError(400, "Deal title is required");
  const record = {
    contactIds: [],
    keyDates: [],
    probability: 0,
    stage: "Sourcing",
    ...body,
    id: uid("d"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  all("deals").unshift(record);
  logActivity("deal", `Created deal <b>${record.title}</b>.`, req.user.name);
  res.status(201).json(record);
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const updated = update("deals", req.params.id, { ...req.body, updatedAt: nowIso() });
  if (!updated) throw new HttpError(404, "Deal not found");
  res.json(updated);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const ok = remove("deals", req.params.id);
  if (!ok) throw new HttpError(404, "Deal not found");
  res.json({ id: req.params.id });
}));

// PATCH /deals/:id/stage
router.patch("/:id/stage", asyncHandler(async (req, res) => {
  const { stage } = req.body || {};
  if (!stage) throw new HttpError(400, "stage is required");
  const updated = update("deals", req.params.id, { stage, updatedAt: nowIso() });
  if (!updated) throw new HttpError(404, "Deal not found");
  logActivity("deal", `Moved a deal to <b>${stage}</b>.`, req.user.name);
  res.json({ id: updated.id, stage });
}));

export default router;
