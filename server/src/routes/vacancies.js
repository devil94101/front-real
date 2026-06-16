import { Router } from "express";
import { all, insert, update, remove } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler, HttpError, uid } from "../util.js";
import { logActivity } from "../log.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("vacancies"));
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.propertyId) throw new HttpError(400, "propertyId is required");
  const record = { divisible: false, status: "Available", ...body, id: uid("v") };
  insert("vacancies", record, { prepend: true });
  logActivity("vacancy", `New vacancy listed: <b>${record.suite || "Suite"}</b>.`, req.user.name);
  res.status(201).json(record);
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const updated = update("vacancies", req.params.id, req.body || {});
  if (!updated) throw new HttpError(404, "Vacancy not found");
  res.json(updated);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const ok = remove("vacancies", req.params.id);
  if (!ok) throw new HttpError(404, "Vacancy not found");
  res.json({ id: req.params.id });
}));

export default router;
